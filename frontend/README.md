# Frontend

React 18 application built with Vite, React Router, Tailwind CSS, and lucide-react. It connects to the FastAPI service; authenticated data is loaded through the shared data and auth contexts.

## Run locally

From this `frontend` directory:

```powershell
npm install
npm run dev
```

The development server is at <http://localhost:5173>. By default, API requests go to `http://localhost:8000/api/v1`. If the API is hosted elsewhere, create `frontend/.env.local` with:

```text
VITE_API_URL=http://localhost:8000/api/v1
```

The backend must also be running and configured; see [the project README](../README.md) and [backend setup](../backend/README.md).

Build the production frontend with `npm run build`. Preview that build locally with `npm run preview`.

## Main routes

- Public: `/`, `/about`, `/sacraments`, `/schedule`, `/events`, `/announcements`, `/announcements/:id`, `/contact`
- Account: `/login`, `/register`, `/forgot-password`, `/admin/login`
- Parishioner: `/portal`, `/portal/requests`, `/portal/requests/new`, `/portal/appointments`, `/portal/messages`, `/portal/certificates`, `/portal/profile`
- Admin: `/admin/dashboard`, `/admin/requests`, `/admin/requests/:id`, `/admin/appointments`, `/admin/parishioners`, `/admin/events`, `/admin/records`, `/admin/certificates`, `/admin/priests`, `/admin/messages`, `/admin/reports`, `/admin/users`, `/admin/profile`

## Code map

```text
src/
  api/                    HTTP client and token handling
  components/             Shared UI, navigation, tables, and certificate preview
  context/                API-backed data, auth, toast, and admin page state
  data/                   Navigation, labels, certificate fields, and permissions
  layouts/                Public, admin, parishioner, and account layouts
  pages/                  Public, account, parishioner, and admin screens
  routes/                 Route definitions and access guards
```

Certificate form fields are configured in `src/data/certificates.js`. The PDF background images and text positioning are maintained in the backend; details are in the [project README](../README.md#certificate-workflow-and-templates).
