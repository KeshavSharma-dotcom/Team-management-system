# TeamControl

TeamControl is a team workspace application for managing teams, tasks, discussions, profiles, and resume checks.

## Project Structure

```text
backend/
  config/          Runtime configuration and database connection
  controllers/     HTTP request handlers
  middlewares/     Auth, validation, 404, and error handling
  models/          Mongoose schemas
  routes/          Versioned API routes
  services/        Business logic and integrations
  utils/           Logging, email, response, and error helpers

frontend/
  src/components/  Shared UI components
  src/pages/       Route-level screens
  src/utils/       API, session, and formatting helpers

ai-service/
  app.py           Resume analysis API
  requirements.txt Python dependencies

docs/
  resume-checker.md Resume checker workflow
```

## Runtime Overview

- React/Vite serves the browser app.
- Express exposes the `/api/v1` API.
- MongoDB stores users, teams, tasks, messages, and resume analysis results.
- The resume analysis service runs separately and receives resume text or PDF content from Express.
- Gemini is used for discussion summaries and task suggestions.

## Main Workflows

### Authentication

Users register with email and password, verify an OTP, then sign in. The frontend stores the session token and user summary through `frontend/src/utils/session.js`.

### Teams

Users can create teams, join public teams by code, request access to private teams, and manage members based on team role.

### Tasks

Team members can view task boards. Owners and sub-admins can create tasks, and team members can update task status and assignment.

### Discussions

Team members can post messages. The team detail page can request a short discussion summary.

### Resume Checker

The browser submits resume text or a PDF to Express. Express creates an authenticated job, calls the resume analysis service, stores the result in MongoDB, and the browser polls for completion.

## Local Setup

Install Node dependencies from the repository root and frontend directory if they are not already installed:

```bash
npm install
cd frontend
npm install
```

Run the Express API from the repository root:

```bash
npm run dev:api
```

Run the frontend:

```bash
cd frontend
npm run dev
```

Run the resume analysis service:

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

## Configuration

The application reads configuration from environment variables. Do not commit environment files.

Common variables:

```text
PORT
MONGO_URL
JWT_SECRET
JWT_DURATION
ALLOWED_ORIGIN
EMAIL_SERVICE
EMAIL_NAME
EMAIL_PASSWORD
API_KEY
RESUME_ANALYSIS_SERVICE_URL
RESUME_ANALYSIS_TIMEOUT_MS
JSON_LIMIT
```

Frontend API URL:

```text
VITE_API_BASE_URL
```

If `VITE_API_BASE_URL` is not set, the frontend uses `http://localhost:5000/api/v1`.

## API Route Groups

```text
/api/v1/auth
/api/v1/teams
/api/v1/tasks
/api/v1/user
/api/v1/resume
/api/health
```

## Notes

- Do not store resumes or environment secrets in source control.
- Resume PDF content is kept in process memory only while the job is running.
- The resume checker currently uses polling. A Socket.io completion hook exists in the backend service for a later push-based flow.
