# St. Isidore Parish Information System

React and Tailwind frontend with a Python FastAPI REST backend and MySQL database. The frontend is based on the supplied `st-isidore-parish` project. The API replaces its prototype-only authentication and in-memory records.

## Start the backend

Follow [backend/README.md](backend/README.md). Start MySQL, configure `backend/.env`, create the first administrator, then run the API on port 8000.

## Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

By default, the frontend calls `http://localhost:8000/api/v1`. Set `VITE_API_URL` in `frontend/.env.local` if the API is hosted elsewhere.

## Data and migration

The legacy PHP archive has no database schema dump. The API creates a fresh schema only when explicitly configured for development. Do not point it at the old production database and assume the models are compatible; export and review the actual schema and data before preparing a migration.

