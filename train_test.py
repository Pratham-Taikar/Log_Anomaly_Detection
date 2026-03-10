import sys
sys.path.append('.')
from backend.train import load_messages
from backend.ml.anomaly_model import train, predict

msgs = load_messages()
print('Loaded training messages count:', len(msgs))
model, vectorizer = train(msgs, model_path='backend/models/test_model.pkl', vectorizer_path='backend/models/test_vec.pkl')
print('Training done. Model type:', type(model))
# evaluate training dataset
preds = predict(msgs[:20], model, vectorizer)
print('First 20 predictions on training data:', preds)

sample = [
    'User alice logged in successfully',
    'Database connection failed: timeout after 5000ms',
    'Random heart beat ok',
    'Authentication failed for user bob from IP 10.0.0.1',
]
print('Predictions on sample:', predict(sample, model, vectorizer))
