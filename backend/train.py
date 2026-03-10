"""
ML Training pipeline:
1. Load logs dataset
2. Preprocess messages
3. Convert to TF-IDF vectors
4. Train Isolation Forest
5. Save model as anomaly_model.pkl
"""
import sys
from pathlib import Path

# Ensure project root is on sys.path when the script is run directly or imported
project_root = Path(__file__).resolve().parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

# use full package paths so the module works when imported
from backend.parser.log_parser import parse_logs
from backend.preprocessing.log_processor import process_logs
from backend.ml.anomaly_model import train

DATASET_PATHS = [
    project_root / "datasets" / "logs_dataset.csv",
    project_root / "datasets" / "log_example.txt",
    project_root / "datasets" / "log_example_2.txt",
]


def load_messages() -> list[str]:
    """Load and preprocess log messages from datasets."""
    all_messages = []
    for path in DATASET_PATHS:
        if not path.exists():
            continue
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        parsed = parse_logs(content)
        processed = process_logs(parsed)
        for p in processed:
            msg = p.get("cleaned_message") or p.get("message", "")
            if msg and len(msg) > 3:
                all_messages.append(msg)
    return all_messages


def main():
    messages = load_messages()
    if not messages:
        print("No log messages found. Ensure datasets/logs_dataset.csv or log_example.txt exists.")
        sys.exit(1)
    print(f"Training on {len(messages)} log messages...")
    train(messages)
    print("Training complete. Model saved to backend/models/anomaly_model.pkl")


if __name__ == "__main__":
    main()
