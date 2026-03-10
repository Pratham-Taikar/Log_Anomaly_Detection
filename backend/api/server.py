"""
FastAPI backend for Log Anomaly Detection.
Endpoints: POST /analyze-log, GET /logs, GET /stats, GET /recent-anomalies
"""
import sys
from pathlib import Path

# Ensure backend is on path (backend_root = backend folder)
backend_root = Path(__file__).resolve().parent.parent
project_root = backend_root.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Backend imports (run from project root: uvicorn backend.api.server:app)
from backend.parser.log_parser import parse_logs
from backend.preprocessing.log_processor import process_logs, clean_message
from backend.ml.anomaly_model import predict
from backend.rules.rule_engine import run_rules_single, combine_with_ml

app = FastAPI(title="Log Anomaly Detection API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for processed logs (for GET /logs, /stats, /recent-anomalies)
_stored_logs: list[dict] = []
_stored_predictions: list[dict] = []


# Attempt to ensure an ML model is present when the app starts. If the
# serialized model/vectorizer files are missing or broken we fall back to
# training on whatever dataset files are available. This prevents the API
# from returning all-"Normal" predictions simply because there is no model.
@app.on_event("startup")
async def ensure_ml_model():
    from backend.train import load_messages
    from backend.ml.anomaly_model import train as train_model
    # load existing components; _get_ml_components returns (None,None) if missing
    model, vectorizer = _get_ml_components()
    if model is None or vectorizer is None:
        msgs = load_messages()
        if msgs:
            train_model(msgs)
            print(f"[startup] auto-trained ML model on {len(msgs)} messages")
        else:
            print("[startup] no training messages found; ML backend will use rule-only fallback")


class AnalyzeRequest(BaseModel):
    message: str


class AnalyzeResponse(BaseModel):
    message: str
    prediction: str
    confidence: float
    source: str


def _get_ml_components():
    """Lazy load model and vectorizer."""
    model_path = backend_root / "models" / "anomaly_model.pkl"
    vec_path = backend_root / "models" / "tfidf_vectorizer.pkl"
    if not model_path.exists():
        return None, None
    try:
        import joblib
        model = joblib.load(model_path)
        vectorizer = joblib.load(vec_path)
        return model, vectorizer
    except Exception:
        return None, None


@app.post("/analyze-log", response_model=AnalyzeResponse)
async def analyze_log(req: AnalyzeRequest):
    """Analyze a single log message and return prediction."""
    model, vectorizer = _get_ml_components()
    if model is None or vectorizer is None:
        raise HTTPException(500, "ML model not trained. Run: python backend/train.py")
    # Preprocess
    cleaned = clean_message(req.message)
    if not cleaned:
        cleaned = req.message[:500]
    # ML prediction
    ml_results = predict([cleaned], model, vectorizer)
    ml_pred = ml_results[0]
    # Rule check (single log, no context)
    parsed = parse_logs(req.message)
    log_dict = parsed[0] if parsed else {"message": req.message, "raw": req.message}
    rule_result = run_rules_single(log_dict, [log_dict], 0)
    final_pred, source, reason = combine_with_ml(rule_result, ml_pred["prediction"])
    confidence = ml_pred["confidence"]
    return AnalyzeResponse(
        message=req.message[:500],
        prediction=final_pred,
        confidence=confidence,
        source=source,
    )


@app.get("/logs")
async def get_logs():
    """Return processed logs with predictions and detection reasons."""
    logs_with_pred = []
    for log, pred in zip(_stored_logs, _stored_predictions):
        logs_with_pred.append({
            **log,
            "prediction": pred.get("prediction", "Normal"),
            "confidence": pred.get("confidence", 0),
            "source": pred.get("source", "ML"),
            "detection_reason": pred.get("detection_reason", ""),
        })
    return {"logs": logs_with_pred}


@app.get("/stats")
async def get_stats():
    """Dashboard statistics."""
    total = len(_stored_logs)
    anomalies = sum(1 for p in _stored_predictions if p.get("prediction") == "Anomaly")
    normal = total - anomalies
    pct = round(100.0 * anomalies / total, 1) if total else 0
    return {
        "total_logs": total,
        "anomaly_count": anomalies,
        "normal_count": normal,
        "anomaly_percentage": pct,
    }


@app.get("/recent-anomalies")
async def get_recent_anomalies():
    """Return last detected anomalies."""
    recent = [
        {
            "message": log.get("message", log.get("raw", ""))[:300],
            "prediction": pred.get("prediction", "Anomaly"),
            "confidence": pred.get("confidence", 0),
            "source": pred.get("source", "ML"),
            "timestamp": log.get("timestamp", ""),
            "detection_reason": pred.get("detection_reason", ""),
            "service": log.get("service", ""),
            "log_level": log.get("log_level", ""),
        }
        for log, pred in zip(_stored_logs, _stored_predictions)
        if pred.get("prediction") == "Anomaly"
    ]
    return {"anomalies": recent[-50:]}


class IngestRequest(BaseModel):
    content: str


@app.post("/ingest")
async def ingest_logs(req: IngestRequest):
    """Ingest and process a batch of logs. Used by upload flow."""
    content = req.content
    global _stored_logs, _stored_predictions
    parsed = parse_logs(content)
    if not parsed:
        return {"message": "No parseable logs", "count": 0}
    processed = process_logs(parsed)
    messages = [p.get("cleaned_message") or p.get("message", "") for p in processed]

    model, vectorizer = _get_ml_components()
    if model is None or vectorizer is None:
        # Attempt on-the-fly training using available datasets so that incoming
        # ingest requests still benefit from ML. This is slow but better than
        # failing silently with all-Normal results.
        try:
            from backend.train import load_messages, train as train_model
            msgs = load_messages()
            if msgs:
                train_model(msgs)
                model, vectorizer = _get_ml_components()
        except Exception:
            pass

    if model is None or vectorizer is None:
        # Fallback: mark all as Normal if still no model
        ml_preds = [{"prediction": "Normal", "confidence": 0.5} for _ in messages]
    else:
        ml_preds = predict(messages, model, vectorizer)
    results = []
    for i, (log, mp) in enumerate(zip(processed, ml_preds)):
        rule_res = run_rules_single(log, processed, i)
        final, source, reason = combine_with_ml(rule_res, mp["prediction"])
        results.append({
            "prediction": final,
            "confidence": mp["confidence"],
            "source": source,
            "detection_reason": reason,
            "rule_triggered": rule_res.triggered if rule_res else False,
        })
    _stored_logs = processed
    _stored_predictions = results
    return {"message": "OK", "count": len(processed), "anomalies": sum(1 for r in results if r["prediction"] == "Anomaly")}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
