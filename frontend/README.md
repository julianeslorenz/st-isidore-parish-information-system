# St. Isidore Parish Information System (React prototype)

React + Vite + Tailwind CSS v3 + React Router + lucide-react. JavaScript only, no backend.
It is a conversion of the "St. Isidore Parish Information System – Design Prototype" HTML file.
All data is mock data held in memory (`src/data`, `src/context/DataContext.jsx`).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## Demo accounts

Admin sign in: `/admin/login` (any password works; pick a role with the demo buttons).

| Role | Email | Can open | Notable actions |
|---|---|---|---|
| Parish Secretary | secretary@stisidore.example | dashboard, requests, appointments, events, parishioners, certificates, priests, messages | prepare, print, release certificates |
| Admin | admin@stisidore.example | everything incl. reports and user accounts | also revoke certificates |
| Parish Staff | grace@stisidore.example | dashboard, requests, appointments, events, messages | no certificates |
| Priest | fr.antonio@stisidore.example | dashboard, own appointments | no certificate access |

Parishioner portal: `/login` (any email and password; the portal is always Lorenz Santiago).

## Routes

Public: `/`, `/about`, `/sacraments`, `/schedule`, `/events`, `/announcements`, `/announcements/:id`, `/contact`
Auth: `/login`, `/register`, `/forgot-password`, `/admin/login`
Parishioner: `/portal`, `/portal/requests`, `/portal/requests/new`, `/portal/appointments`, `/portal/messages`, `/portal/certificates`, `/portal/profile`
Admin: `/admin/dashboard`, `/admin/requests`, `/admin/requests/:id`, `/admin/appointments`, `/admin/parishioners`, `/admin/events`, `/admin/certificates`, `/admin/priests`, `/admin/messages`, `/admin/reports`, `/admin/users`, `/admin/profile`
Design system: `/design-system` (linked from the public footer)

## Structure

```
src/
  theme/tokens.js        colours/fonts/breakpoints: single source for Tailwind and SVG charts
  context/               Data (mock "database"), Auth (mock sessions + roles), Toast, AdminShell
  data/                  all sample data, status labels, nav config, role permissions
  hooks/                 useMediaQuery, useDisclosure, useRequestWizard, useRequestSacrament
  components/ui/         Button, Field, Badge, Modal, Dropdown, Tabs, Pagination, Stepper, ...
  components/tables/     DataTable (stacks into cards on phones)
  components/common/     MonthCalendar, Charts, Messaging, CertificatePreview, ...
  components/navigation/ Sidebar, AdminTopbar, PortalHeader, PublicHeader, BottomNavigation
  layouts/               PublicLayout, AdminLayout, PortalLayout, AuthLayout
  pages/{public,auth,parishioner,admin}/
  routes/                AppRoutes + guards (RequireAdmin, RequireParishioner, ScreenGate)
```

To add a real API later, replace the functions exposed by `DataContext` / `AuthContext`; pages only call those.

## Certificate workflow (important)

Parishioners can only **follow status** (Processing, Ready for pickup, Released).
There is no download, print or sign control anywhere in the portal. The portal list is derived from the
same records the office manages, so when parish office staff advance a certificate in admin, the
parishioner's status changes too.

Staff side: prepare and print on the supplied pre-signed parish paper (Admin, Secretary) -> mark ready
for pickup (Admin, Secretary) -> release with ID confirmation (Admin, Secretary). Revoke is Admin only
and needs a reason.
Buttons the current role may not use are disabled with an explanatory tooltip.

## Where this differs from the prototype

- Responsive behaviour uses viewport breakpoints (`sm` 561px, `md` 881px, `lg` 1081px) instead of the prototype's container queries.
- Screen access follows the "What each role can do" table. In the prototype every screen was visible to the Secretary.
- Month navigation arrows in calendars are disabled (sample data covers October 2026 only).
- Small additions: demo-account buttons on admin login, a "With" field on the appointment form, a Full record dialog
  (sacraments / requests / appointments) on parishioners, request details adapt to non-baptism types,
  announcements have their own URL.
- Request, reject, reschedule, approve, appointments, events, priests, users and messages actually update state (the prototype mostly showed toasts).
- The prototype's own review chrome (device switcher, screen list bar) is not part of the product and was not ported.

## Not verified

This package was assembled in a sandbox without network access, so `npm install`, `vite build`, the Tailwind
compile and a visual browser check were **not** run. What was checked offline: every file parses, and every page
renders under every role against the real React with only the router and icon packages stubbed (84 render checks, 63
logic assertions). Package versions in `package.json` and lucide icon names were written from memory; if `npm run build`
reports an unknown icon or version, adjust that line.
