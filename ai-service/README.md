# Resume Analysis Service

FastAPI service used by the Express API for resume checks.

## Run

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

The Express API expects this service at `http://localhost:8000` unless `RESUME_ANALYSIS_SERVICE_URL` is configured.

## API

- `GET /health`
- `POST /analyze`

`POST /analyze` accepts either plain `text` or `pdf_base64`, plus `requirements`. It returns a score, matched skills, missing skills, extracted skills, summary, and recommendations.
