# NUVORA Backend

Django REST Framework foundation for the NUVORA marketplace.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

## Health check

```bash
curl http://localhost:8000/api/health/
```

## Tests

```bash
python manage.py test
```

## Notes

- Default database is SQLite. Set `DATABASE_URL` to use PostgreSQL.
- Frontend runs on `http://localhost:5173` by default.
- Do not commit real `.env` values.
