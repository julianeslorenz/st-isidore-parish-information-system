# St. Isidore Parish Information System

A parish records and service system for parishioners and office staff. The web app uses React and Vite; the API uses FastAPI and SQLAlchemy; MySQL stores application data. Docker Compose runs the frontend, API, and database together.

## Features

- Parishioner accounts, email verification, profiles, sacramental requests, appointments, and document uploads.
- Parish records for Baptism, Confirmation, Marriage, and Funeral.
- Certificate preparation and pickup tracking on the parish's pre-signed paper.
- Office messaging, events, priests, reports, and staff account management.
- Role-based page access in the frontend and API permissions in the backend.

## Run with Docker Desktop

### Requirements and configuration

- Install and start Docker Desktop.
- Ensure `backend/.env` exists and contains a private `JWT_SECRET_KEY` at least 32 characters long. Keep secrets out of Git. For a fresh copy, create a random local key with PowerShell:

  ```powershell
  @("JWT_SECRET_KEY=" + [guid]::NewGuid().ToString() + [guid]::NewGuid().ToString(), "AUTO_CREATE_TABLES=true") | Set-Content backend/.env
  ```

  Docker Compose supplies the MySQL `DATABASE_URL` and local CORS configuration. SMTP settings in `backend/.env` are optional for local email verification and password reset.

- If `.env.docker` does not exist, copy the example and change its MySQL password:

  ```powershell
  Copy-Item .env.docker.example .env.docker
  ```

  `.env.docker` is private and ignored by Git.

### Start the system

Run these commands from the project root:

```powershell
docker compose --env-file .env.docker up --build
```

Open:

- Web app: <http://localhost:5173>
- API health: <http://localhost:8000/health>
- API documentation: <http://localhost:8000/docs>

Create the first administrator in a second PowerShell window:

```powershell
docker compose --env-file .env.docker exec backend python -m scripts.create_admin
```

Enter the admin email, name, and password when prompted, then sign in at `/admin/login`. The password is entered interactively and is not saved in a project file.

### Stop, start, rebuild, and logs

Stop the foreground services with **Ctrl+C**. Start already-built services with:

```powershell
docker compose --env-file .env.docker up -d
```

After changing backend API/Python code, rebuild the backend container:

```powershell
docker compose --env-file .env.docker up -d --build backend
```

After changing frontend code or dependencies, rebuild the frontend container:

```powershell
docker compose --env-file .env.docker up -d --build frontend
```

View service logs:

```powershell
docker compose --env-file .env.docker logs -f backend
docker compose --env-file .env.docker logs -f frontend
```

Stop and remove containers without deleting persistent data:

```powershell
docker compose --env-file .env.docker down
```

The MySQL database is stored in Docker's `mysql_data` named volume. Uploaded files are stored under `backend/storage`. `docker compose down` preserves these. Do not use `docker compose down -v` unless you intend to erase the database volume and its contents. The Docker database is separate from XAMPP or the old PHP system; the old schema has not been verified for direct reuse.

## Certificate workflow

Parishioners submit a certificate request with its **type** and **purpose**. Office staff verifies the relevant historical sacramental record and prepares the certificate details. The workflow is:

1. **Processing:** office staff verifies the register and prepares the certificate text.
2. **Ready for pickup:** office staff prints on the parish's supplied paper, which already has the priest's signature, and marks it ready.
3. **Released:** office staff releases it at the parish office.

Parishioners can track status and pickup details in **My certificates**, but cannot sign or print the official certificate from the portal. Admin and Parish Secretary can prepare, print, mark ready, and release certificates. Only Admin can revoke a certificate, and a reason is required.

### Certificate templates and print alignment

- Scanned certificate background images: `backend/app/assets/certificates/` (`Baptism.jpg`, `Confirmation.jpg`, `Marriage.jpg`, `Funeral.jpg`). Keep each paper's page size and orientation when replacing an image.
- Text placement, font sizes, field mapping, and PDF generation: `backend/app/services/certificate_pdf.py`. The per-type drawing functions control alignment; adjust their coordinates if the scan or printed paper changes.
- Fields displayed to office staff: `frontend/src/data/certificates.js`, under `CERTIFICATE_FORM_FIELDS`.
- Required data validation: `backend/app/services/certificate_pdf.py`.

The **Report copy** includes the background for previewing/checking the full form. The **Text only** copy omits the image and is for printing on the physical pre-printed parish paper. Use a demo record to check alignment before printing an official certificate.

## Notifications

The bell menu is shared across admin and parishioner pages and uses current API data. Admin alerts cover requests needing review, certificates being prepared or ready, pending appointments/reschedules, and unread parishioner messages. Parishioner alerts cover updates to their own requests, certificates ready for pickup, appointment status, and unread office messages. Selecting an alert opens its related record or conversation. Read markers for record alerts are kept in browser storage per account; message alerts are marked read through the API when opened or when all are marked read.

## Roles

| Role | Main access |
|---|---|
| Admin | All admin pages, user accounts, reports, certificate workflow, and certificate revocation |
| Parish Secretary | Requests, appointments, parishioners, records, certificates, priests, and messages |
| Parish Staff | Requests, appointments, events, and messages; no certificate workflow |
| Priest | Own appointments and profile |
| Parishioner | Own profile, requests, appointments, certificates, and messages |

API permissions are enforced on the backend as well as by frontend route guards.

## Optional demo records

Add clearly marked `DEMO-` sacramental records and matching certificate drafts for layout checks:

```powershell
docker compose --env-file .env.docker up -d --build backend
docker compose --env-file .env.docker exec backend python -m scripts.seed_demo_records
```

The seed script can be re-run without duplicating the demo entries. Remove them from **Sacramental records** and **Certificates** when finished.

## Project structure

```text
backend/
  app/api/                  API routes and permission checks
  app/models.py             Database models
  app/services/             Certificate PDF generation
  app/assets/certificates/  Parish certificate backgrounds
  scripts/                  Admin creation and demo seeding
  storage/                  Private request document uploads
  tests/                    Backend tests
frontend/
  src/components/           Shared UI, navigation, and certificate preview
  src/context/               API-backed data and authentication state
  src/data/                  Navigation, certificate fields, labels, permissions
  src/pages/                 Public, parishioner, and admin pages
  src/routes/                Routes and access guards
docker-compose.yml           Frontend, API, and MySQL services
.env.docker.example          Docker database password example
```

## Local development without Docker

See [backend/README.md](backend/README.md) for backend dependencies, MySQL, and email configuration. See [frontend/README.md](frontend/README.md) for Vite commands and routes. If the API is not at `http://localhost:8000/api/v1`, configure `VITE_API_URL` in `frontend/.env.local`.

## Security and data

- Never commit `backend/.env`, `.env.docker`, SMTP credentials, JWT secrets, or parishioner documents.
- Back up MySQL and `backend/storage` separately.
- `AUTO_CREATE_TABLES=true` is for development with a new database. Use reviewed migrations for production upgrades.
- The project does not include a verified migration from the legacy PHP database. Export and inspect the existing schema and records before migrating.
