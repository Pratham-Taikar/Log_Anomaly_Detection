# Setup and Run Guide - Log Anomaly Detection System

This guide covers the complete setup and execution of the SEAPM (Security & Event Anomaly Protection Monitor) system.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Project](#running-the-project)
6. [Testing the System](#testing-the-system)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Ensure you have the following installed:
- **Python 3.10 or higher** (`python --version`)
- **Node.js 18+ and npm** (`node --version` and `npm --version`)
- **Git** (optional, for version control)

### Verify Installations

```bash
python --version
node --version
npm --version
```

---

## Project Structure

```
E:\SEAPM_CP/
├── backend/                      # Python FastAPI backend
│   ├── api/                      # API server endpoints
│   │   ├── server.py            # FastAPI application
│   │   └── __init__.py
│   ├── parser/                   # Multi-format log parser
│   │   ├── log_parser.py        # Parse JSON, CSV, Apache, plain logs
│   │   └── __init__.py
│   ├── preprocessing/            # Log preprocessing pipeline
│   │   ├── log_processor.py     # Clean, normalize, tokenize logs
│   │   └── __init__.py
│   ├── ml/                       # Machine Learning components
│   │   ├── anomaly_model.py     # Isolation Forest model
│   │   ├── vectorizer.py        # TF-IDF vectorizer
│   │   └── __init__.py
│   ├── rules/                    # Rule-based anomaly detection
│   │   ├── rule_engine.py       # Brute force, DB failures, auth rules
│   │   └── __init__.py
│   ├── models/                   # Saved ML models (created at runtime)
│   │   ├── anomaly_model.pkl
│   │   └── tfidf_vectorizer.pkl
│   ├── train.py                  # ML training script
│   └── requirements.txt          # Python dependencies
├── src/                          # React frontend (Vite + TypeScript)
│   ├── pages/
│   │   └── Index.tsx            # Main dashboard page
│   ├── components/
│   │   ├── dashboard/           # Dashboard-specific components
│   │   │   ├── AnomalyDetection.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── LogViewer.tsx
│   │   │   └── ...
│   │   └── ui/                  # shadcn/ui components
│   ├── api/
│   │   └── logApi.ts            # API client
│   ├── lib/
│   │   ├── logParser.ts         # Client-side log parsing
│   │   └── utils.ts
│   └── main.tsx
├── datasets/                     # Sample log files
│   ├── logs_dataset.csv
│   ├── log_example.txt
│   ├── log_example_2.txt
│   └── test_logs_1500.txt       # Generated test data
├── public/                       # Static assets
├── package.json                  # Node.js dependencies
├── vite.config.ts               # Vite configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── RUN_INSTRUCTIONS.md          # Original run guide

```

---

## Backend Setup

### Step 1: Navigate to Project Root

```bash
cd E:\SEAPM_CP
```

### Step 2: Create Python Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Python Dependencies

```bash
pip install -r backend/requirements.txt
```

**Required packages:**
- FastAPI (~0.100.0)
- Uvicorn (~0.23.0)
- scikit-learn (~1.6.0)
- joblib (~1.4.0)
- python-multipart (~0.0.6)
- pydantic (~2.0.0)

### Step 4: Train the ML Model

Before starting the server for the first time, train the Isolation Forest model:

```bash
python backend/train.py
```

**Output:** This will create two files in `backend/models/`:
- `anomaly_model.pkl` (trained Isolation Forest)
- `tfidf_vectorizer.pkl` (TF-IDF vectorizer)

### Step 5: Start the Backend Server

```bash
python -m uvicorn backend.api.server:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

The backend will be available at `http://localhost:8000`

---

## Frontend Setup

### Step 1: Open a New Terminal

Keep the backend running in the first terminal, open a second terminal in the project root.

### Step 2: Install Node Dependencies

```bash
npm install
```

This installs all packages from `package.json` including:
- React 18
- Vite (build tool)
- TypeScript
- Tailwind CSS
- shadcn/ui components

### Step 3: Start the Development Server

```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.4.19  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

The frontend will be available at `http://localhost:5173` (or similar port if 5173 is busy)

**Note:** By default, the frontend looks for the backend at `http://localhost:8000`.

---

## Running the Project

### Complete Startup Sequence

1. **Terminal 1 - Backend:**
   ```bash
   cd E:\SEAPM_CP
   venv\Scripts\activate
   python backend/train.py  # Only needed first time or if models are missing
   python -m uvicorn backend.api.server:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd E:\SEAPM_CP
   npm run dev
   ```

3. **Open Browser:**
   - Go to `http://localhost:5173` (or the port shown in terminal 2)
   - Dashboard will load with menu on the left

### Accessing the System

Once both services are running:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs

---

## Testing the System

### Upload Test Logs

1. **Using UI:**
   - Click "Upload" tab in the left sidebar
   - Drag & drop or select a log file from `datasets/test_logs_1500.txt`
   - Wait for processing (shows pipeline stages)

2. **Using API (cURL):**
   ```bash
   curl -X POST http://localhost:8000/ingest \
     -H "Content-Type: application/json" \
     -d '{"content":"2026-02-17 08:00:10 INFO Block 1023 replicated successfully\n2026-02-17 08:06:19 WARN Connection timeout after 12000ms\n2026-02-17 08:08:22 ERROR Block 453 failed due to timeout"}'
   ```

### Explore Dashboard Tabs

| Tab | Purpose | What You'll See |
|-----|---------|-----------------|
| **Upload** | Upload & process logs | File stats, parsed count, errors, warnings |
| **Overview** | System summary | Total logs, anomaly rate, timeline chart |
| **Log Viewer** | All processed logs | Each log with prediction (Normal/Anomaly), confidence score |
| **Pipeline** | Processing steps | Client-side pipeline visualization |
| **Anomalies** | Flagged anomalies | Time-window anomalies with ML scores |
| **Features** | Feature vectors | 6-dimensional feature space (errors, response time, etc.) |

### Switch Between Data Sources

In the header, use the **Uploaded** and **ML Backend** buttons:
- **Uploaded:** Uses client-side Isolation Forest simulation
- **ML Backend:** Uses the real ML model from the Python backend

---

## API Endpoints

### GET /stats
Returns dashboard statistics.

```bash
curl http://localhost:8000/stats
```

**Response:**
```json
{
  "total_logs": 1500,
  "anomaly_count": 110,
  "normal_count": 1390,
  "anomaly_percentage": 7.3
}
```

### POST /ingest
Ingest a batch of logs for ML analysis.

```bash
curl -X POST http://localhost:8000/ingest \
  -H "Content-Type: application/json" \
  -d '{"content":"<log content here>"}'
```

**Response:**
```json
{
  "message": "OK",
  "count": 1500,
  "anomalies": 110
}
```

### GET /logs
Get all processed logs with predictions.

```bash
curl http://localhost:8000/logs
```

### GET /recent-anomalies
Get last 50 detected anomalies.

```bash
curl http://localhost:8000/recent-anomalies
```

### POST /analyze-log
Analyze a single log message.

```bash
curl -X POST http://localhost:8000/analyze-log \
  -H "Content-Type: application/json" \
  -d '{"message":"Database connection failed: timeout"}'
```

**Response:**
```json
{
  "message": "Database connection failed: timeout",
  "prediction": "Anomaly",
  "confidence": 0.85,
  "source": "Rules"
}
```

---

## Troubleshooting

### Problem: Port 8000 Already in Use

```bash
# Find and kill process using port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use a different port
python -m uvicorn backend.api.server:app --port 8001
```

### Problem: "ML model not trained"

```bash
# Train the model
python backend/train.py

# Then restart the server
```

### Problem: CORS Error in Browser

The backend is configured to allow requests from:
- `http://localhost:5173`
- `http://localhost:8080`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:8080`

If you're using a different URL, add it to `backend/api/server.py` line 29:
```python
allow_origins=["http://your-url:port", ...]
```

### Problem: Frontend Can't Connect to Backend

1. Ensure backend is running on port 8000
2. Check that `VITE_API_URL` is set correctly in `.env` (default: `http://localhost:8000`)
3. Verify no firewall is blocking the connection

### Problem: Python Module Not Found

```bash
# Ensure you're in the virtual environment
venv\Scripts\activate

# Reinstall dependencies
pip install -r backend/requirements.txt
```

### Problem: npm install fails

```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install
```

---

## Development Commands

### Frontend

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run test      # Run tests with Vitest
npm run test:watch # Run tests in watch mode
```

### Backend

```bash
python backend/train.py                                    # Train ML model
python -m uvicorn backend.api.server:app --reload         # Dev server with hot reload
python -m uvicorn backend.api.server:app --host 0.0.0.0   # Run on all interfaces
```

---

## Production Deployment

### Build Frontend

```bash
npm run build
# Output: dist/ folder with static files
```

### Run Backend for Production

```bash
python -m uvicorn backend.api.server:app --host 0.0.0.0 --port 8000
# Without --reload flag for performance
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=https://api.yourdomain.com
```

---

## Project Statistics

- **Backend Lines:** ~600 (Python)
- **Frontend Lines:** ~2500 (TypeScript/React)
- **ML Model:** Isolation Forest with TF-IDF vectorizer
- **Rules:** 6 rule-based detection patterns
- **UI Components:** 30+ shadcn/ui components
- **Test Data:** 1500 synthetic logs included

---

## Key Features

✅ Multi-format log parsing (JSON, CSV, Apache, plain text)  
✅ Unsupervised anomaly detection (Isolation Forest)  
✅ Rule-based pattern detection  
✅ Hybrid ML + Rules decision logic  
✅ Client-side and server-side processing  
✅ Real-time dashboard with charts  
✅ Feature extraction and visualization  
✅ Hot reload for development  

---

## Support

For issues or questions:
1. Check the **Troubleshooting** section above
2. Review the [RUN_INSTRUCTIONS.md](RUN_INSTRUCTIONS.md) for additional details
3. Ensure all prerequisites are installed
4. Check that both backend and frontend services are running

---

**Last Updated:** March 10, 2026  
**System Status:** ✅ All services operational
