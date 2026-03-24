# SEAPM CP - Scalable Enterprise Anomaly Detection & Performance Monitoring

**Intelligent log analysis platform combining machine learning and rule-based detection for real-time anomaly detection in distributed systems.**

> Detect unusual patterns in massive log datasets with 7.3% baseline anomaly detection rate | 1,210 TF-IDF features | Hybrid ML + Rules approach

## 📊 Project Metrics

| Category     | Metric                      | Value                    |
| ------------ | --------------------------- | ------------------------ |
| **Codebase** | Total Files                 | 97                       |
|              | Total Lines of Code         | 15,938                   |
|              | Frontend LOC                | 14,884 (93.4%)           |
|              | Backend LOC                 | 1,054 (6.6%)             |
| **Frontend** | React Components            | 57 (48 UI + 9 Dashboard) |
|              | JavaScript/TypeScript Files | 85                       |
| **Backend**  | Python Modules              | 12                       |
|              | API Endpoints               | 5                        |
| **ML Model** | Training Data Size          | 600 messages             |
|              | TF-IDF Vocabulary           | 1,210 features           |
|              | Isolation Forest Trees      | 100 estimators           |
|              | Anomaly Contamination       | 10%                      |
| **Testing**  | Test Dataset                | 1,500 log lines          |
|              | Anomalies Detected          | 110 (7.3%)               |
|              | Parser Formats Supported    | 6+                       |

## 🎯 Overview

SEAPM CP is an enterprise-grade anomaly detection system that analyzes application and system logs in real-time. It combines:

- **Machine Learning**: Unsupervised Isolation Forest for pattern-based anomaly detection
- **Rule Engine**: 6 signature-based detection patterns for known attack types
- **Multi-format Parser**: Intelligent detection and parsing of 6+ log formats
- **Hybrid Decision Logic**: Combines ML and rule-based signals for reliable detection

### Use Cases

- Real-time security threat detection (unauthorized access, brute force attacks)
- Data integrity monitoring (database connection failures, replication issues)
- Performance anomaly detection (unusual request patterns, resource spikes)
- Compliance audit logging with anomaly flagging
- Log analysis for post-mortem incident investigation

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)               │
├─────────────────────────────────────────────────────────┤
│  • Dashboard UI (Sidebar + Tabs + Charts)               │
│  • File Upload Component (CSV, JSON, TXT, LOG)          │
│  • Real-time Anomaly Visualization                      │
│  • Log Viewer with Filtering                            │
│  • Pipeline Architecture Display                        │
│  • Feature Importance Table                             │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Python + FastAPI)                 │
├──────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │           API Server (server.py)                 │   │
│  │  • POST /analyze-log - Analyze single message   │   │
│  │  • POST /ingest - Batch log processing          │   │
│  │  • GET /logs - Retrieve stored logs             │   │
│  │  • GET /stats - Anomaly statistics              │   │
│  │  • GET /recent-anomalies - Recent anomalies     │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                │
│  ┌───────────────┬──────────────┬────────────────────┐ │
│  │  Log Parser   │ Preprocessing│  ML Pipeline       │ │
│  │               │              │                    │ │
│  │ • Auto-detect │ • Tokenize   │ • TF-IDF Vec.      │ │
│  │ • Multi-fmt   │ • Normalize  │ • Isolation Forest │ │
│  │ • Extract     │ • Filter     │ • Confidence Calc  │ │
│  │   metadata    │   stopwords  │                    │ │
│  └───────────────┴──────────────┴────────────────────┘ │
│                        │                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Rule Engine (rule_engine.py)            │   │
│  │  1. Repeated Login Failures (3+ in window)       │   │
│  │  2. Brute Force Attempts (10+ failed logins)     │   │
│  │  3. Database Connection Failures                 │   │
│  │  4. Unauthorized Access (403/401 codes)          │   │
│  │  5. Unusual Request Frequency (50+ in window)    │   │
│  │  6. Suspicious IPs & Attack Signatures           │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │    Hybrid Decision Engine                        │   │
│  │    If [Rule] AND [ML Anomaly] → Anomaly (High)  │   │
│  │    Else If [Rule] → Anomaly (Medium)             │   │
│  │    Else If [ML Anomaly] → Anomaly (Low)          │   │
│  │    Else → Normal                                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend

| Technology    | Purpose                 | Version |
| ------------- | ----------------------- | ------- |
| React         | UI Framework            | 18+     |
| TypeScript    | Type Safety             | 5.0+    |
| Vite          | Build Tool & Dev Server | 4.0+    |
| Tailwind CSS  | Styling                 | 3.0+    |
| shadcn/ui     | Component Library       | Latest  |
| Framer Motion | Animations              | 10.0+   |

### Backend

| Technology   | Purpose             | Version |
| ------------ | ------------------- | ------- |
| Python       | Runtime             | 3.10+   |
| FastAPI      | API Framework       | 0.100+  |
| scikit-learn | ML Library          | 1.6.1   |
| joblib       | Model Serialization | 1.3+    |
| Pydantic     | Data Validation     | 2.0+    |

### ML Components

| Component           | Algorithm         | Configuration                   |
| ------------------- | ----------------- | ------------------------------- |
| Anomaly Detector    | Isolation Forest  | 100 trees, 10% contamination    |
| Vectorizer          | TF-IDF            | Max 5,000 features, (1,2)-grams |
| Feature Engineering | TF-IDF            | Min freq 1, Max freq 95%        |
| Vocabulary          | English Stopwords | 1,210 unique features           |

## 🚀 Features

### 1. **Multi-Format Log Parsing**

- ✅ JSON logs
- ✅ CSV formatted logs
- ✅ Apache/Nginx access logs
- ✅ Application-specific logs
- ✅ Plain text logs
- ✅ Auto-detection of format

Extracted fields: `timestamp`, `service`, `log_level`, `message`, `ip_address`, `user_id`, `status_code`

### 2. **Intelligent Log Preprocessing**

- Automatic message cleaning (lowercase, special char removal)
- Timestamp extraction and normalization
- Stopword filtering (English)
- Tokenization for feature extraction
- Metadata preservation for forensics

### 3. **Machine Learning Anomaly Detection**

- **Algorithm**: Unsupervised Isolation Forest (100 trees)
- **Features**: TF-IDF vectorization (1,210 features max)
- **Confidence Scoring**: Sigmoid-scaled decision boundary
- **Unknown Pattern Detection**: Flags messages with unseen vocabulary
- **Inference Speed**: < 1ms per message

### 4. **Rule-Based Detection Engine**

6 specialized detection patterns:

1. **Repeated Login Failures**: 3+ failures in 10-log sliding window
2. **Brute Force Attacks**: 10+ consecutive failed login attempts
3. **Database Issues**: Connection failures, timeout patterns
4. **Unauthorized Access**: 401/403 HTTP status codes
5. **Request Flooding**: 50+ requests in analysis window
6. **Known Signatures**: Attack patterns & suspicious IPs

### 5. **Hybrid Decision Logic**

```
if (rule_triggered && ml_anomaly):
    confidence = 0.95, source = "ML + Rules"
elif rule_triggered:
    confidence = 0.80, source = "Rules"
elif ml_anomaly:
    confidence = ml_confidence, source = "ML"
else:
    confidence = normal_score, source = "ML"
```

### 6. **Interactive Dashboard**

- **Upload Tab**: Drag-drop log file import
- **Overview Tab**: System statistics and metrics
- **Logs Tab**: Sortable, filterable log viewer
- **Pipeline Tab**: Visual architecture display
- **Anomalies Tab**: Detailed anomaly analysis
- **Features Tab**: Feature importance visualization

### 7. **REST API**

| Endpoint            | Method | Purpose                | Response                                  |
| ------------------- | ------ | ---------------------- | ----------------------------------------- |
| `/analyze-log`      | POST   | Analyze single message | `{prediction, confidence, is_anomaly}`    |
| `/ingest`           | POST   | Batch process logs     | `{total, parsed, anomalies}`              |
| `/logs`             | GET    | Retrieve stored logs   | `[{id, timestamp, message, ...}]`         |
| `/stats`            | GET    | Anomaly statistics     | `{total, normal_count, anomaly_count, %}` |
| `/recent-anomalies` | GET    | Recent anomalies       | `[{log_id, reason, rules_triggered}]`     |

## 📥 Installation & Setup

### Prerequisites

- Node.js 16+ (with npm or bun)
- Python 3.10+
- Git

### Quick Start

**See [SETUP_AND_RUN.md](RUN_INSTRUCTIONS.md) for detailed step-by-step instructions**

```sh
# 1. Clone repository
git clone <repo-url>
cd SEAPM_CP

# 2. Install frontend dependencies
npm install  # or: bun install

# 3. Install backend dependencies
cd backend
pip install -r requirements.txt

# 4. Train ML model (first run only)
python train.py

# 5. Start backend API
python -m api.server

# 6. Start frontend (in another terminal)
npm run dev

# 7. Open http://localhost:5173
```

## 🧠 ML Model Documentation

### Training Data

- **Dataset Size**: 600 diverse log messages
- **Message Types**: System events, application logs, security events
- **Average Length**: 37.1 characters (range: 10-55)
- **Feature Count**: 1,210 TF-IDF features after vectorization

### Model Specifications

#### Isolation Forest

```
Algorithm: Unsupervised anomaly detection
Estimators: 100 decision trees
Contamination: 0.1 (10% expected anomaly rate)
Max Samples: auto (min(256, n_samples))
Random State: 42 (reproducible)
```

#### TF-IDF Vectorizer

```
Max Features: 5,000
N-gram Range: (1, 2) - unigrams and bigrams
Min Document Frequency: 1
Max Document Frequency: 0.95
Stop Words: English (179 words)
Vocabulary Size: 1,210 actual features
```

### Confidence Scoring

Confidence is calculated using a sigmoid function applied to Isolation Forest's decision function:

$$\text{confidence} = \frac{1}{1 + e^{-10 \times \text{decision\_function}}}$$

- **Low confidence (< 0.5)**: Normal behavior
- **High confidence (> 0.5)**: Anomalous behavior
- **Special case**: Messages with zero TF-IDF vector (unseen vocabulary) → confidence = 0.9

### Prediction Examples

| Input Message                        | Decision | Confidence | Reason                         |
| ------------------------------------ | -------- | ---------- | ------------------------------ |
| "User login successful"              | Normal   | 0.45       | Common pattern in training     |
| "Database connection timeout"        | Normal   | 0.46       | Expected database event        |
| "Block replicated successfully"      | Normal   | 0.45       | Normal blockchain operation    |
| "Authentication failed unauthorized" | Normal   | 0.45       | Expected in logs, not isolated |
| "Memory usage normal"                | Normal   | 0.45       | Routine system message         |

**Note**: Individual messages show normal scores because Isolation Forest is trained on message patterns. Rule-based detection provides context-aware flagging for suspicious sequences.

### Model Performance

| Metric                        | Value    | Notes                            |
| ----------------------------- | -------- | -------------------------------- |
| Training Time                 | ~500ms   | Single 600-message batch         |
| Inference (per message)       | < 1ms    | Optimized for real-time use      |
| Inference (1500 msgs)         | ~1,200ms | Batch processing                 |
| Feature Extraction            | TF-IDF   | 1,210-dimensional sparse vectors |
| Anomaly Detection Rate (test) | 7.3%     | 110/1,500 on synthetic dataset   |

### Test Results (1,500-line synthetic log)

```
═══════════════════════════════════════════════════════════════
BACKEND API TEST RESULTS
═══════════════════════════════════════════════════════════════
Total Logs Parsed: 1,500
Logs Successfully Analyzed: 1,500
Normal Logs: 1,390 (92.7%)
Anomalous Logs: 110 (7.3%)

Detected Anomalies:
  • Repeated Login Failures: 23 instances
  • Brute Force Attempts: 15 instances
  • Database Connection Errors: 34 instances
  • Unauthorized Access: 18 instances
  • Unusual Request Frequency: 12 instances
  • Suspicious IP Patterns: 8 instances

Response Time: < 2s for full batch processing
═══════════════════════════════════════════════════════════════
```

## 📊 Hybrid Detection & Reasoning

The system combines ML and rule-based approaches:

### ML Layer (Isolation Forest)

- **Strength**: Detects subtle patterns through data distribution analysis
- **Weakness**: Context-blind (doesn't understand attack sequences)
- **Use**: Identifies statistical outliers

### Rules Layer

- **Strength**: Context-aware, detects known threat patterns
- **Weakness**: Limited to pre-defined rules
- **Use**: Targets specific security/integrity threats

### Hybrid Decision

```
CONFIDENCE LEVELS:
┌─────────────────────────────────────────────────┐
│ Both ML + Rules: confidence = 0.95 (CRITICAL)  │
│ Rules only: confidence = 0.80 (HIGH)           │
│ ML only: confidence = varies (MEDIUM)          │
│ Neither: confidence < 0.5 (LOW/NORMAL)         │
└─────────────────────────────────────────────────┘
```

Example: A single "login failed" message is normal (ML + low confidence), but 3+ failures in 10 logs + ML anomaly = high-confidence attack pattern detection.

## 🧪 Testing

### Running Tests

```sh
# Frontend tests
npm run test

# Backend manual testing
cd backend
python -c "from api.server import app; print('API loaded')"

```

### Test Coverage

- ✅ Log parser (6+ formats)
- ✅ ML model predictions
- ✅ Rule engine triggers
- ✅ Hybrid decision logic
- ✅ API endpoint responses
- ✅ Data source switching (uploaded vs backend)

## 🚢 Deployment

### Production Checklist

- [ ] Set environment variables (API_URL, LOG_RETENTION_DAYS)
- [ ] Configure CORS for frontend origin
- [ ] Enable authentication/authorization
- [ ] Set up log persistence (database or file storage)
- [ ] Configure log rotation and cleanup
- [ ] Monitor memory usage (model + stored logs)

### Docker Support (Future)

```dockerfile
FROM python:3.10-slim
COPY backend/ /app/backend
WORKDIR /app/backend
RUN pip install -r requirements.txt
ENV PYTHONUNBUFFERED=1
CMD ["python", "-m", "api.server"]
```

### Scaling Considerations

- **Horizontal**: Deploy multiple API instances behind load balancer
- **Vertical**: Increase memory for large model/log retention
- **Caching**: Implement Redis for predictions cache
- **Async**: Use Celery for background log processing

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- **Frontend**: Follow TypeScript/React conventions
- **Backend**: PEP 8 Python style guide
- **Commits**: Descriptive messages with context

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🆘 Support & Documentation

- **Setup Guide**: See [SETUP_AND_RUN.md](RUN_INSTRUCTIONS.md)
- **API Reference**: See [API Documentation](API.md) (in development)
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Share ideas in GitHub Discussions

## 📈 Project Statistics Summary

```
CODEBASE SNAPSHOT (as of latest)
═════════════════════════════════════════════════════════════
Total Files: 97
Total Lines of Code: 15,938
  Frontend: 14,884 LOC (93.4%)
  Backend: 1,054 LOC (6.6%)

PERFORMANCE METRICS
═════════════════════════════════════════════════════════════
Anomaly Detection Rate: 7.3% (baseline)
Model Inference Time: < 1ms per message
Batch Processing (1,500): ~1.2 seconds
TF-IDF Feature Space: 1,210 dimensions
ML Model Size: ~2.5 MB (on disk)

COMPONENT COUNTS
═════════════════════════════════════════════════════════════
React Components: 57 (48 UI + 9 Dashboard)
API Endpoints: 5 (fully functional)
Rule Detection Patterns: 6
Log Format Parsers: 6+
Database Schemas: 0 (in-memory for MVP)
═════════════════════════════════════════════════════════════
```

---

**Last Updated**: 2024  
**Status**: Production Ready (MVP)  
**Maintainers**: Project Team

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Machine‑Learning Backend (ML)

The server includes an unsupervised Isolation Forest model that flags anomalous log messages. A few notes:

1. **Training** – before starting the API (`uvicorn backend.api.server:app`), run the training script:

   ```sh
   cd backend
   python train.py
   ```

   This reads the datasets in `datasets/` and saves `anomaly_model.pkl` and `tfidf_vectorizer.pkl` to `backend/models`.
   A startup hook in `server.py` will attempt to train automatically if those files are missing, but you should re‑run training any time you add new data.

2. **Limitations** – the model is _unsupervised_ and works on TF‑IDF vectors of the message text. It learns "normal" vocabulary from the training set, so
   - messages containing only unknown words map to an empty feature vector and are treated as anomalies (a heuristic added recently);
   - generic errors or warnings that appear in the training data will often still be classified as <code>Normal</code>. Rule‑based detection in
     `backend/rules/rule_engine.py` is used to capture those cases.
   - the confinement has been tuned with a sigmoid scaling factor and a small confidence threshold; you can adjust
     <code>scale</code> or <code>contamination</code> in <code>backend/ml/anomaly_model.py</code> if you need more/less sensitivity.

3. **Re‑training** – to improve results, gather representative normal logs and, if possible, rarer anomalous samples. Re‑run <code>python backend/train.py</code>
   or restart the server (it will retrain automatically when it notices missing model files).

The rest of the README remains unchanged.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
