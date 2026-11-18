# St. Isidore Parish API

FastAPI REST service for the React parish information system. MySQL is the intended database. The PHP project supplied for reference does not include a schema export, so this service defines a new schema; it does not silently alter or import an existing church database.

## Run locally

1. Create a **new** MySQL database named `st_isidore_api` and a least-privilege application user. Keep it separate from the legacy PHP database.
2. Create a virtual environment and install dependencies:

   ```powershell
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   Copy-Item .env.example .env
   ```

3. Edit `.env`. Set `DATABASE_URL` to the database you created, provide a random `JWT_SECRET_KEY` of at least 32 characters, and set `AUTO_CREATE_TABLES=true` for local development. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL` to enable verification and password-reset emails. The verification link points to `FRONTEND_BASE_URL` and expires after 24 hours. Never commit `.env` or share the SMTP password.
4. Create the first staff account interactively (the password is not saved in a file). For password-reset email, also configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, and `SMTP_FROM_EMAIL` in `.env`:

   ```powershell
   $env:PYTHONPATH = (Get-Location).Path
   python scripts/create_admin.py
   ```

5. Start the API:

   ```powershell
   uvicorn app.main:app --reload
   ```

The API docs are at `http://localhost:8000/docs`; health check is `http://localhost:8000/health`. `AUTO_CREATE_TABLES` is a development convenience for a new database. Use reviewed, versioned migrations before production upgrades.

## API areas

- `POST /api/v1/auth/register`, `POST /api/v1/auth/verify-email`, `POST /api/v1/auth/verification/resend`, `POST /api/v1/auth/login`, `GET|PATCH|DELETE /api/v1/auth/me`
- `GET|POST|PATCH /api/v1/requests` and request cancellation
- `GET|POST|PATCH|DELETE /api/v1/events`
- `GET|POST|PATCH /api/v1/appointments`
- `GET|POST|PATCH /api/v1/priests`
- `GET|POST|PATCH /api/v1/records` and `DELETE /api/v1/records/{id}`
- `GET|POST|PATCH /api/v1/certificates`, including the parishioner certificate-request endpoint
- `GET|POST /api/v1/messages`, message contacts, users, and dashboard summary

Protected endpoints require `Authorization: Bearer <access_token>`. Staff permissions are checked on the API; the React route guards are only a user-interface convenience.

New parishioner registrations remain unable to sign in until their email is verified. Existing accounts without a verification record, including staff accounts, remain usable. The development table-creation setting adds the verification table to an existing database without changing existing user rows.

Parishioners can delete their own account after confirming their current password. This deactivates sign-in and removes their profile/contact data while retaining parish request and appointment history, with the account anonymized as `Deleted account`. Staff accounts cannot use this self-service endpoint.

## Supporting document uploads

Request submission accepts PDF, JPG, and PNG attachments up to 5 MB each (20 MB total). Files are stored under `backend/storage/request-documents`, outside the public web directory, and are available only to the requesting parishioner and authorized office staff through the API. Back up this folder separately from MySQL; it is excluded from Git because it may contain private documents.

## Existing PHP database

The old application archive contains PHP queries but no SQL schema or migration export. The model fields here therefore represent the new API contract, not a verified one-to-one mapping of every legacy column. Before importing live records, export the old MySQL schema and data, map each sacrament and status, and review a migration against a backup. Uploaded files and SMTP secrets from the archive are intentionally not copied into this project.
