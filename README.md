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

## Run the app with Docker Desktop

Docker runs the React frontend, FastAPI backend, and MySQL in containers. The MySQL data is kept in a named Docker volume; XAMPP is not needed to run the app.

1. Make sure Docker Desktop is running and that `backend/.env` exists with your valid `JWT_SECRET_KEY` and other settings. Do not put secrets in the Docker images.
2. A private `.env.docker` file is already configured in this project. On a fresh copy of the project, create it only if it does not exist:

   ```powershell
   Copy-Item .env.docker.example .env.docker
   ```

   `.env.docker` contains the password for the Docker MySQL container. Keep it private. It is ignored by Git.
3. In PowerShell at the project root, start the app:

   ```powershell
   docker compose --env-file .env.docker up --build
   ```

   Open `http://localhost:5173` for the site, `http://localhost:8000/docs` for the API, and `http://localhost:8000/health` for the API health response. Keep Docker Desktop running while you use the app.
4. To stop the containers, press **Ctrl+C**, then run:

   ```powershell
   docker compose --env-file .env.docker down
   ```

   This stops and removes the containers but keeps your Docker MySQL database and uploaded files. **Do not run `docker compose down -v`** unless you intend to delete the Docker database volume.

If PowerShell says `docker` is not recognized after installing Docker Desktop, close and reopen PowerShell (or restart Windows) so the updated PATH is loaded, then verify with `docker --version` and `docker compose version`.

The Docker MySQL database starts empty and is separate from any previous XAMPP database. To move existing records, export the database from phpMyAdmin to a SQL backup and import it into the Docker MySQL database before relying on the new setup. Do not delete the old database until you have verified the backup and imported data.

## Data and migration

The legacy PHP archive has no database schema dump. The API creates a fresh schema only when explicitly configured for development. Do not point it at the old production database and assume the models are compatible; export and review the actual schema and data before preparing a migration.

