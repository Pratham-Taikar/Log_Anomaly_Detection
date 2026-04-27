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


def create_model(contamination: float = 0.15, random_state: int = 42) -> IsolationForest:
    return IsolationForest(
        contamination=contamination,
        random_state=random_state,
        n_estimators=150,
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

    # --- Confidence Scoring (improved) ---
    # Isolation Forest decision scores: negative = more anomalous, positive = more normal
    # We want: high confidence for strong anomalies (strong negative scores)
    #         low confidence for normal logs (positive scores)
    
    # Transform decision scores to confidence
    # Negative scores (anomalies) should have high confidence
    # Positive scores (normal) should have low confidence
    
    # First, normalize scores to a more meaningful range
    # Use a fixed reference range based on typical Isolation Forest behavior
    score_min, score_max = -0.3, 0.2  # Typical range for Isolation Forest
    normalized_scores = (scores - score_min) / (score_max - score_min)
    normalized_scores = np.clip(normalized_scores, 0, 1)
    
    # For anomalies (pred = -1), we want high confidence when scores are low (more negative)
    # For normal (pred = 1), we want low confidence when scores are high (more positive)
    confidences = np.where(
        preds == -1,  # Anomaly
        1 - normalized_scores,  # Invert: low normalized score = high confidence
        normalized_scores * 0.6 + 0.1  # Normal: keep confidence low, add baseline
    )
    
    # Apply final sigmoid to smooth the distribution
    scale_factor = 4.0  # Moderate scaling
    confidences = 1 / (1 + np.exp(-scale_factor * (confidences - 0.5)))
    
    # Clip to ensure valid range
    confidences = np.clip(confidences, 0.1, 0.9)

    # Keywords and patterns that strongly indicate anomalies
    STRONG_ANOMALY_KEYWORDS = {
        'failed', 'failure', 'timeout', 'error', 'exception', 'critical',
        'fatal', 'refused', 'unauthorized', 'forbidden', 'injection',
        'attack', 'breach', 'overflow', 'crash', 'panic', 'abort'
    }
    
    results = []
    for idx, (pred, score, conf) in enumerate(zip(preds, scores, confidences)):
        is_anomaly = pred == -1
        message_lower = messages[idx].lower()
        
        # Force anomaly + high confidence for unseen vocabulary (zero TF-IDF vector)
        if empty_rows[idx]:
            is_anomaly = True
            conf = max(conf, 0.92)
        # Boost confidence for messages containing strong anomaly keywords
        elif any(keyword in message_lower for keyword in STRONG_ANOMALY_KEYWORDS):
            if not is_anomaly:  # If model didn't catch it, override prediction
                is_anomaly = True
            # Calculate confidence boost based on number of anomaly keywords found
            keyword_count = sum(1 for keyword in STRONG_ANOMALY_KEYWORDS if keyword in message_lower)
            boost = min(0.15 + (keyword_count * 0.1), 0.4)  # Up to 40% boost
            conf = min(max(conf, 0.6) + boost, 0.95)  # Ensure high confidence but cap at 95%
        
        results.append({
            'prediction': 'Anomaly' if is_anomaly else 'Normal',
            'confidence': round(float(conf), 2),
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
