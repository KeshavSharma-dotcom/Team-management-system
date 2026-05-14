# Resume Checker Workflow

The resume checker uses the React app, Express API, MongoDB, and a separate FastAPI service.

## Flow

1. React submits a PDF as base64 or sends pasted resume text.
2. Express creates an authenticated analysis job and returns `202 Accepted` with a `jobId`.
3. Express sends the resume content and requirements to the analysis service.
4. The analysis service extracts PDF text when needed, maps resume skills, compares them with project requirements, and returns JSON.
5. Express stores the result in MongoDB.
6. React polls `GET /api/v1/resume/:jobId` until the job is `completed` or `failed`.

The backend includes a Socket.io completion hook in `resumeService.emitCompletion`. It emits `analysis-complete` only if an `io` instance is attached to the Express app later.

## Backend API

All routes require the existing JWT middleware.

```text
POST /api/v1/resume/analyze
GET  /api/v1/resume/:jobId
GET  /api/v1/resume/history?limit=5
```

`POST /api/v1/resume/analyze` body:

```json
{
  "candidateName": "Candidate Name",
  "teamId": "optional-team-id",
  "requirements": "React, Node.js, MongoDB, JWT, REST API",
  "resumeText": "Plain resume text",
  "pdfBase64": "optional base64 PDF",
  "fileName": "resume.pdf"
}
```

Use either `resumeText` or `pdfBase64`.

## Analysis Service

Run from `ai-service/`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Express calls `http://localhost:8000/analyze` by default. Set `RESUME_ANALYSIS_SERVICE_URL` to override it.

## Frontend

The React page is available at:

```text
/resume-checker
```

It supports:

- PDF upload
- pasted resume text
- team context selection
- project requirements input
- async job progress
- recent analysis history
- score, matched skills, missing skills, summary, and recommendations
