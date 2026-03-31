"""
Training + evaluation pipeline for SEAPM anomaly detection.

This script:
1) Loads all supported datasets under datasets/
2) Builds weak (silver) anomaly labels for evaluation
3) Trains an Isolation Forest model and evaluates ML-only + Hybrid (ML+Rules)
4) Saves metrics to backend/models/evaluation_metrics.json
5) Retrains final model on full corpus and saves artifacts
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from sklearn.model_selection import train_test_split

# Ensure project root is on sys.path when the script is run directly or imported
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

from backend.ml.anomaly_model import train, predict
from backend.ml.evaluation import (
    evaluate_gold,
    build_hybrid_predictions,
    build_silver_labels,
    evaluate_binary,
    load_gold_labels_csv,
    save_metrics,
)
from backend.parser.log_parser import parse_logs
from backend.preprocessing.log_processor import process_logs

DATASET_DIR = project_root / "datasets"
SUPPORTED_SUFFIXES = {".txt", ".log", ".csv", ".json"}
METRICS_PATH = project_root / "backend" / "models" / "evaluation_metrics.json"
RANDOM_STATE = 42
GOLD_CSV_PATH = project_root / "datasets" / "labeled_eval.csv"
EXCLUDED_DATASET_FILENAMES = {GOLD_CSV_PATH.name}


def discover_dataset_paths() -> list[Path]:
    """Discover dataset files from datasets/ folder."""
    if not DATASET_DIR.exists():
        return []
    paths = [
        p for p in sorted(DATASET_DIR.iterdir())
        if p.is_file() and p.suffix.lower() in SUPPORTED_SUFFIXES
        and p.name not in EXCLUDED_DATASET_FILENAMES
    ]
    return paths


def load_processed_logs() -> tuple[list[dict], list[str]]:
    """Load, parse and preprocess logs from all dataset files."""
    records: list[dict] = []
    sources: list[str] = []
    for path in discover_dataset_paths():
        content = path.read_text(encoding="utf-8", errors="ignore")
        parsed = parse_logs(content)
        processed = process_logs(parsed)
        valid = [p for p in processed if (p.get("cleaned_message") or p.get("message", ""))]
        records.extend(valid)
        sources.append(path.name)
    return records, sources


def load_messages() -> list[str]:
    """
    Backward-compatible helper used by API startup fallback.
    Returns cleaned messages from all discovered dataset files.
    """
    records, _ = load_processed_logs()
    msgs = [(r.get("cleaned_message") or r.get("message", "")).strip() for r in records]
    return [m for m in msgs if len(m) > 3]


def _records_to_messages(records: list[dict]) -> list[str]:
    return [
        (r.get("cleaned_message") or r.get("message", "")).strip()
        for r in records
        if (r.get("cleaned_message") or r.get("message", "")).strip()
    ]


def _record_message(record: dict) -> str:
    return (record.get("cleaned_message") or record.get("message", "")).strip()


def main():
    records, sources = load_processed_logs()
    if not records:
        print("No parseable logs found under datasets/.")
        sys.exit(1)

    messages = _records_to_messages(records)
    labels = build_silver_labels(records)
    positives = sum(labels)
    negatives = len(labels) - positives

    if positives > 0 and negatives > 0:
        train_idx, test_idx = train_test_split(
            list(range(len(records))),
            test_size=0.2,
            random_state=RANDOM_STATE,
            stratify=labels,
        )
    else:
        train_idx, test_idx = train_test_split(
            list(range(len(records))),
            test_size=0.2,
            random_state=RANDOM_STATE,
        )

    train_messages = [_record_message(records[i]) for i in train_idx]
    test_logs = [records[i] for i in test_idx]
    test_messages = [_record_message(records[i]) for i in test_idx]
    y_test = [labels[i] for i in test_idx]

    print(f"Datasets used: {', '.join(sources)}")
    print(f"Total parsed records: {len(records)}")
    print(f"Train split: {len(train_messages)} | Test split: {len(test_messages)}")
    print(f"Silver labels -> normal: {negatives}, anomaly: {positives}")

    model, vectorizer = train(train_messages)
    ml_output = predict(test_messages, model, vectorizer)
    y_ml = [1 if o["prediction"] == "Anomaly" else 0 for o in ml_output]
    y_hybrid = build_hybrid_predictions(test_logs, y_ml)

    ml_metrics = evaluate_binary(y_test, y_ml)
    hybrid_metrics = evaluate_binary(y_test, y_hybrid)

    # Optional: gold-label evaluation (if user provides labeled_eval.csv)
    used_labeling = "silver"
    silver_metrics = {
        "ml_only": ml_metrics,
        "hybrid_ml_rules": hybrid_metrics,
    }
    gold_metrics = None
    if GOLD_CSV_PATH.exists():
        gold_logs_for_rules, gold_ml_messages, y_gold = load_gold_labels_csv(GOLD_CSV_PATH)
        if len(y_gold) >= 5:
            # Require both classes to make metrics meaningful
            if len(set(y_gold)) >= 2:
                ml_gold, hybrid_gold = evaluate_gold(
                    gold_logs_for_rules,
                    gold_ml_messages,
                    y_gold,
                    model=model,
                    vectorizer=vectorizer,
                )
                gold_metrics = {
                    "ml_only": ml_gold,
                    "hybrid_ml_rules": hybrid_gold,
                }
                used_labeling = "gold"

    # Train final production model on full corpus
    full_model, full_vectorizer = train(messages)

    payload = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "dataset": {
            "files": sources,
            "total_records": len(records),
            "train_records": len(train_messages),
            "test_records": len(test_messages),
            "silver_label_distribution": {
                "normal": negatives,
                "anomaly": positives,
            },
        },
        "model": {
            "algorithm": "IsolationForest",
            "parameters": {
                "n_estimators": int(full_model.n_estimators),
                "contamination": float(full_model.contamination),
                "max_samples": str(full_model.max_samples),
                "random_state": int(full_model.random_state),
            },
            "vectorizer": {
                "type": "TfidfVectorizer",
                "max_features": int(full_vectorizer.max_features),
                "ngram_range": list(full_vectorizer.ngram_range),
                "vocabulary_size": int(len(full_vectorizer.vocabulary_)),
            },
        },
        "metrics": {
            "used_labeling": used_labeling,
            "silver_metrics": silver_metrics,
            "gold_metrics": gold_metrics,
            "ml_only": (gold_metrics["ml_only"] if gold_metrics else ml_metrics),
            "hybrid_ml_rules": (gold_metrics["hybrid_ml_rules"] if gold_metrics else hybrid_metrics),
        },
        "notes": [
            "If datasets/labeled_eval.csv exists and contains enough labeled rows for both classes, metrics use gold labels.",
            "Otherwise metrics use silver labels (rule/heuristic-derived) aligned with this project's anomaly scope.",
        ],
    }
    out = save_metrics(METRICS_PATH, payload)

    print("\nML-only metrics:")
    print(json.dumps(ml_metrics, indent=2))
    print("\nHybrid (ML + Rules) metrics:")
    print(json.dumps(hybrid_metrics, indent=2))
    print(f"\nSaved metrics: {out}")
    print("Training complete. Model saved to backend/models/anomaly_model.pkl")


if __name__ == "__main__":
    main()
