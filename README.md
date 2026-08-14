# AI Resume Builder

Production-ready web application for building resumes using AI.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Django + Django REST Framework + PostgreSQL
- **AI**: Abstracted LLM integration
- **Documents**: DOCX generation and PDF conversion

## Development

### Local Setup
1. Backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/Scripts/activate # Windows
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```
2. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Production & Docker Testing

This project includes Docker support for production and production-like local testing.

1. Configure Environment:
   ```bash
   cp .env.example .env
   # Edit .env with your secrets
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up --build -d
   ```

3. View Logs:
   ```bash
   docker-compose logs -f
   ```

4. Run Migrations (if not auto-run by entrypoint):
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

## Testing

Backend:
```bash
cd backend
venv\Scripts\python manage.py test
```

Frontend:
```bash
cd frontend
npm run test
```

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Node.js (for local frontend dev)
- Python 3.10+ (for local backend dev)

### Getting Started (Docker)
1. Copy `.env.example` to `.env` and fill in values.
2. Run `docker-compose up --build`
3. Access frontend at `http://localhost:5173`
4. Access backend at `http://localhost:8000`

### Phase 1 Features
- Basic project structure
- Health endpoint (`GET /api/health/`)
