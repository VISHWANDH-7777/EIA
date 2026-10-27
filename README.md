# Smart EIA — Environmental Impact Assessment and Monitoring System

**Smart EIA** is a comprehensive, deterministic, rule-based environmental monitoring and impact assessment platform. It tracks construction and infrastructure projects against statutory environmental thresholds (air quality, water quality, and acoustic limits) without black-box machine learning or probabilistic AI models.

---

## Key Features

1. **Executive Dashboard**: Live summaries of registered projects, real-time sensor & manual readings, threshold breach alerts, pending mitigations, and compliance breakdown.
2. **Project Management**: Project registration with geographic coordinates (lat/lng), environmental classification, lifecycle statuses, and station links.
3. **Environmental Monitoring**:
   - Multi-parameter readings across **Air Quality** (PM2.5, PM10, NO2, SO2), **Water Quality** (pH, Turbidity, DO), and **Acoustics** (Daytime & Nighttime Leq).
   - Clear distinction between **Manual entries**, **Sensor readings**, and **Simulated feeds**.
   - Chronological trend visualizations against statutory thresholds.
4. **Interactive GIS Environmental Map**:
   - Powered by Leaflet & OpenStreetMap.
   - Interactive markers for project corridors and monitoring stations with real-time status popups and coordinate inspection.
5. **Deterministic Rule-Based Risk Engine**:
   - Evaluates active parameters against documented statutory standards (e.g. NAAQS, Clean Water Act, Acoustic Ordinances).
   - Risk classification: **Low**, **Medium**, **High**, or **Insufficient Data**.
   - Detailed breach attribution showing exact percent deviations, regulatory citations, and predefined actionable mitigation steps.
6. **Mitigation Task Tracker**:
   - Assignable tasks with due dates, SLA tracking, overdue calculation, and audit trail history.
   - Supporting file evidence upload and preview.
7. **Inspections & Stakeholder Feedback**:
   - Field inspection logs with compliance verdicts and photo uploads.
   - Citizen and stakeholder complaint logging and response tracking.
8. **Statutory Alerts & Compliance**:
   - Instant threshold breach alert generation with de-duplication.
   - Compliance register tracking: Compliant, Non-Compliant, Pending Review, Insufficient Data.

---

## Local Setup & Quick Start

### Option A: Full-Stack Web Application (Node.js + Express + React + Leaflet)

The root workspace includes an integrated Express backend serving the complete REST API with SQLite/JSON persistence and Vite React frontend on port `3000`.

```bash
# Install dependencies
npm install

# Run unit tests (Node built-in test runner via tsx)
npm test

# Run development server (serves frontend & backend on port 3000)
npm run dev

# Build for production
npm run build
```

Open `http://localhost:3000` in your browser.

---

### Option B: Standalone Python FastAPI Backend

The `backend/` directory contains a complete Python 3.11+ FastAPI service with SQLAlchemy, SQLite, Pydantic, and Pytest.

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Copy configuration
cp .env.example .env

# 5. Run the FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 6. Run Pytest test suite
pytest tests/ -v
```

Interactive API documentation (Swagger UI) is available at:
`http://localhost:8000/docs`

---

## REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Live database metrics and summaries |
| `GET` | `/api/projects` | List all registered EIA projects |
| `POST` | `/api/projects` | Register a new project with coordinates |
| `GET` | `/api/projects/{id}` | Retrieve project details |
| `PATCH` | `/api/projects/{id}` | Update project metadata or status |
| `GET` | `/api/monitoring/readings` | Query environmental measurements |
| `POST` | `/api/monitoring/readings` | Submit manual or sensor measurement |
| `GET` | `/api/monitoring/latest` | Retrieve latest reading per parameter |
| `GET` | `/api/monitoring/history` | Chronological reading trend data |
| `GET` | `/api/monitoring/stations` | Query monitoring stations |
| `POST` | `/api/monitoring/stations` | Register a new monitoring station |
| `POST` | `/api/risk/assess` | Run rule-based risk evaluation |
| `GET` | `/api/risk/history` | Historical risk assessment records |
| `GET` | `/api/mitigation` | List mitigation actions |
| `POST` | `/api/mitigation` | Create mitigation task |
| `PATCH` | `/api/mitigation/{id}` | Update mitigation status or assignee |
| `POST` | `/api/mitigation/{id}/evidence` | Upload supporting evidence document |
| `GET` | `/api/inspections` | List field inspections |
| `POST` | `/api/inspections` | Submit field inspection record |
| `POST` | `/api/inspections/{id}/photo` | Upload inspection site photograph |
| `GET` | `/api/feedback` | List public feedback entries |
| `POST` | `/api/feedback` | Submit public stakeholder feedback |
| `PATCH` | `/api/feedback/{id}` | Review stakeholder feedback |
| `GET` | `/api/alerts` | Query active and historical alerts |
| `PATCH` | `/api/alerts/{id}/read` | Mark alert as reviewed |
| `PATCH` | `/api/alerts/read-all` | Mark all alerts as reviewed |
| `GET` | `/api/compliance` | Query statutory compliance records |
| `PATCH` | `/api/compliance/{id}` | Update compliance status |
| `GET` | `/api/maps/projects` | GeoJSON/coordinate feed for projects |
| `GET` | `/api/maps/stations` | GeoJSON/coordinate feed for stations |

---

## Environmental Thresholds (Configurable)

- **PM2.5**: 35.0 µg/m³ (NAAQS 24-hr standard)
- **PM10**: 150.0 µg/m³ (Clean Air Act)
- **NO2**: 100.0 µg/m³ (WHO Ambient Guideline)
- **SO2**: 75.0 µg/m³ (Industrial Emissions Directive)
- **Water pH**: 6.5 – 8.5 (Clean Water Act Standard)
- **Turbidity**: 5.0 NTU (Surface Water Class II)
- **Dissolved Oxygen (DO)**: Min 5.0 mg/L (Aquatic Life Criterion)
- **Daytime Noise (Leq)**: 65.0 dBA (Acoustic Boundary Limit)
- **Nighttime Noise (Leq)**: 55.0 dBA (Sensitive Receptor Limit)
