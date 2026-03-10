"""
Isolation Forest anomaly detection for log messages.
Uses TF-IDF vectors as input. contamination=0.1, random_state=42.
"""
from pathlib import Path

from sklearn.ensemble import IsolationForest
import joblib
import numpy as np

from .vectorizer import load_vectorizer, fit_vectorizer, transform

MODEL_DIR = Path(__file__).resolve().parent.parent / 'models'
DEFAULT_MODEL_PATH = MODEL_DIR / 'anomaly_model.pkl'


def create_model(contamination: float = 0.1, random_state: int = 42) -> IsolationForest:
    return IsolationForest(
        contamination=contamination,
        random_state=random_state,
        n_estimators=100,
        max_samples='auto',
    )


def train(
    messages: list[str],
    model_path: str | Path | None = None,
    vectorizer_path: str | Path | None = None,
) -> tuple[IsolationForest, "TfidfVectorizer"]:
    """
    Training pipeline:
    1. Fit TF-IDF vectorizer on messages
    2. Transform messages to vectors
    3. Train Isolation Forest
    4. Save model
    """
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    vectorizer = fit_vectorizer(messages, vectorizer_path)
    X = vectorizer.transform(messages)
    model = create_model()
    model.fit(X)
    path = Path(model_path) if model_path else DEFAULT_MODEL_PATH
    joblib.dump(model, path)
    return model, vectorizer


def load_model(path: str | Path | None = None) -> IsolationForest:
    """Load trained Isolation Forest from disk."""
    p = Path(path) if path else DEFAULT_MODEL_PATH
    if not p.exists():
        raise FileNotFoundError(f"Model not found at {p}. Run training first.")
    return joblib.load(p)


def predict(
    messages: list[str],
    model: IsolationForest | None = None,
    vectorizer=None,
) -> list[dict]:
    """
    Predict anomaly for each message.
    Returns list of {prediction: 'Normal'|'Anomaly', confidence: float}
    """
    if model is None:
        model = load_model()
    if vectorizer is None:
        vectorizer = load_vectorizer()
    X = vectorizer.transform(messages)
    preds = model.predict(X)  # 1 = normal, -1 = anomaly
    scores = model.decision_function(X)  # lower (<0) = more anomalous

    # treat rows with no recognized tokens as anomalies (unseen vocabulary)
    empty_rows = (X.sum(axis=1) == 0).A1  # boolean array

    # convert raw decision scores to a 0-1 confidence using a scaled sigmoid
    scale = 10.0
    raw_conf = 1 / (1 + np.exp(scores * scale))
    confidences = np.clip(raw_conf, 0.01, 0.99)

    results = []
    for idx, (pred, score, conf) in enumerate(zip(preds, scores, confidences)):
        is_anomaly = pred == -1
        # force anomaly if vector was empty or confidence very high
        if empty_rows[idx]:
            is_anomaly = True
            conf = max(conf, 0.9)
        elif not is_anomaly and conf > 0.75:
            is_anomaly = True
        results.append({
            'prediction': 'Anomaly' if is_anomaly else 'Normal',
            'confidence': round(conf, 2),
        })
    return results


def predict_single(message: str, model=None, vectorizer=None) -> dict:
    """Predict for a single log message."""
    return predict([message], model, vectorizer)[0]


if __name__ == '__main__':
    from backend.parser import parse_logs
    from backend.preprocessing import process_logs

    with open('datasets/log_example.txt', 'r') as f:
        content = f.read()
    parsed = parse_logs(content)
    processed = process_logs(parsed)
    messages = [p.get('cleaned_message') or p.get('message', '') for p in processed]
    messages = [m for m in messages if m]
    if messages:
        train(messages)
        print("Trained. Sample predict:", predict_single(messages[0]))
