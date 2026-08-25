# ECMVS — Enterprise Compliance & Vendor Management System

ECMVS lets an organization register vendor-related compliance issues, assign them to
Compliance Officers, investigate them, assess risk, drive resolutions through an approval
workflow, notify the right people, and keep a full audit trail — with strict role-based
access control enforced on the backend, not just hidden in the UI.


---

## 1. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite, React Router, Axios, Recharts |
| Backend | ASP.NET Core 8 Web API (C#), JWT authentication |
| Database | MongoDB (local Community Server) via the official `MongoDB.Driver` |
| API docs | Swagger / OpenAPI (enabled in Development) |

## 2. System Architecture

```
React + Vite (localhost:5173)  --HTTPS/JSON, JWT-->  ASP.NET Core 8 API (localhost:5128)  --Mongo Wire Protocol-->  MongoDB (localhost:27017)
```

- The frontend never talks to MongoDB directly — everything goes through the API.
- Every protected endpoint requires a JWT (`Authorization: Bearer <token>`), issued at login.
- Authorization is enforced with ASP.NET Core `[Authorize(Roles = "...")]` **and** service-level
  filtering (e.g. a Compliance Officer's investigation queries are filtered server-side to their
  own assigned records — the client cannot override this by changing query parameters).

## 3. Prerequisites

Install these on your machine (Windows 11 or Ubuntu/Linux):

| Tool | Version | Check |
|---|---|---|
| Node.js | 20 LTS+ | `node -v` |
| npm | bundled with Node | `npm -v` |
| .NET SDK | 8.0 | `dotnet --version` |
| MongoDB Community Server | latest | `mongod --version` |
| mongosh | latest | `mongosh --version` |
| Git | any recent | `git --version` |
| IDE | VS Code recommended | — |
| Browser | Chrome or Edge | — |

## 4. Database Setup

See **`database/README.md`** for full install/start instructions per OS. Short version:

```bash
# 1. Install & start MongoDB (see database/README.md for OS-specific commands)
# 2. Seed demo data from the project root:
mongosh < database/seed.js
```

This creates the `ECMVS` database with 6 users, 10 vendor issues, 5 investigations,
5 risk assessments, 5 resolutions, 11 notifications, and 20 audit log entries.

## 5. Backend Setup

```bash
cd ECMVS/backend
dotnet restore
dotnet run
```

- API runs at **http://localhost:5128**
- Swagger UI: **http://localhost:5128/swagger**
- Mongo connection string and database name are configured in `backend/appsettings.json`
  (`mongodb://127.0.0.1:27017`, database `ECMVS`) — edit if your MongoDB runs elsewhere.

## 6. Frontend Setup

```bash
cd ECMVS/frontend
npm install
npm run dev
```

- App runs at **http://localhost:5173**
- The API base URL is set in `frontend/src/services/api.ts` (`http://localhost:5128/api`).

## 7. How to Run (full stack)

**Terminal 1 — backend**
```bash
cd ECMVS/backend
dotnet restore
dotnet run
```

**Terminal 2 — frontend**
```bash
cd ECMVS/frontend
npm install
npm run dev
```

**Once, before first run — database**
```bash
mongosh < database/seed.js
```

Then open **http://localhost:5173** in Chrome or Edge and log in with any demo account below.

## 8. Demo Accounts

Password for the seeded demo accounts: **`Password123!`**. The administrator account uses
**`Shubham@ECMVS2026!`**.

| Role | Name | Email |
|---|---|---|
| Super Administrator | Shubham Singh | `shubham@ecmvs.local` |
| Compliance Officer | Rahul Sharma | `rahul@ecmvs.local` |
| Compliance Officer | Neha Kulkarni | `neha@ecmvs.local` |
| Vendor Manager | Priya Mehta | `priya@ecmvs.local` |
| Approver | Amit Verma | `amit@ecmvs.local` |
| Employee | Employee Demo | `employee@ecmvs.local` |

Two Compliance Officers (Rahul and Neha) are seeded specifically so you can verify the
officer-scoping rule described below — each only sees investigations assigned to themselves.

> Passwords are stored as SHA-256 hashes for this local/demo build. This is appropriate for
> a local development environment but should be replaced with a salted adaptive hash
> (BCrypt/Argon2/PBKDF2) before any production deployment.

## 9. Implemented Modules

- **Authentication** — JWT-based login, `/api/auth/me`, demo accounts
- **Role-based dashboards** — different stats/charts per role (Admin, Compliance Officer,
  Vendor Manager, Approver, Employee)
- **Vendor Issue Management** — create/edit/view, auto-generated issue numbers (`VI-YYYY-NNNN`),
  assignment, status workflow, comments, search/filter/sort
- **Investigation Module** — findings, root cause, evidence, notes, status lifecycle,
  strict officer-scoped access
- **Risk Assessment** — Likelihood × Impact scoring with visual risk matrix, available only
  for Vendor Issues
- **Resolution Module** — corrective/preventive actions, draft → submit → approve/reject flow
- **Approval Workflow** — Approver role decides, with recorded approval history
- **Notifications** — always scoped to the authenticated user, unread counts, mark read/all
- **Users Module** — admin-only CRUD, role & department assignment, activate/deactivate
- **Audit Log** — every significant action recorded, admin-only viewer with filters
- **Reports** — issue/investigation/risk/resolution analytics with charts and filters
- **Responsive UI** — sidebar collapses to a mobile menu, tables scroll horizontally on small screens
- **Compliance Hub** — a shared, audited case register and intake flow for Grievance, Fraud,
  Health & Safety, Conflict of Interest, Vendor Risk, and Employee compliance matters. Each case
  supports severity, confidentiality, anonymous reporting, subject/location context, ownership,
  due dates, tags, searchable triage, and controlled status progression.

The Compliance Hub is available at `/compliance` after login. It complements the existing
Vendor Issues workflow, which remains the detailed vendor investigation and resolution workspace.

## 10. Role Permissions Summary

| Capability | Super Admin | Compliance Officer | Vendor Manager | Approver | Employee |
|---|:---:|:---:|:---:|:---:|:---:|
| View all vendor issues | Yes | Yes | Yes | Yes | Yes |
| Create vendor issue | Yes | Yes | Yes | — | Yes |
| Assign officer | Yes | — | Yes | — | — |
| View investigations | Yes, all | Yes, own only | — | — | — |
| Create/update investigation | Yes | Yes | — | — | — |
| Create risk assessment | Yes | Yes | — | — | — |
| Create/submit resolution | Yes | Yes | — | — | — |
| Approve/reject resolution | Yes | — | — | Yes | — |
| Manage users | Yes | — | — | — | — |
| View audit log | Yes | — | — | — | — |
| View own notifications | Yes | Yes | Yes | Yes | Yes |

Enforcement happens on the **backend** (`[Authorize(Roles = ...)]` plus service-level
filtering) — the frontend also hides unavailable navigation/actions, but that's a UX
convenience, not the security boundary.

## 11. Core Workflow

```
Vendor Issue
   -> (assign)
Open / Pending Assignment
   ->
Investigation  (findings, root cause, evidence)
   -> (on completion)
Risk Assessment  (Vendor Issues only -- Likelihood x Impact)
   ->
Resolution  (draft -> submit)
   -> (if RequiresApproval)
Pending Approval -> Approver decides -> Approved/Rejected
   ->
Resolved -> Closed
```

Every transition writes an Audit Log entry and, where relevant, a Notification to the
affected user(s).

## 12. API Endpoints

All endpoints are prefixed with `/api` and (except `/api/auth/login`) require a JWT.
Full interactive documentation is available at `/swagger` once the backend is running.

```
POST   /api/auth/login
GET    /api/auth/me

GET    /api/users                    (Admin)
POST   /api/users                    (Admin)
GET    /api/users/{id}               (Admin)
PUT    /api/users/{id}                (Admin)
PUT    /api/users/{id}/active         (Admin)
DELETE /api/users/{id}                (Admin)
GET    /api/users/officers            (any authenticated user)

GET    /api/vendor-issues
POST   /api/vendor-issues
GET    /api/vendor-issues/{id}
PUT    /api/vendor-issues/{id}
DELETE /api/vendor-issues/{id}        (Admin)
PUT    /api/vendor-issues/{id}/assign
PUT    /api/vendor-issues/{id}/status
POST   /api/vendor-issues/{id}/comments

GET    /api/investigations            (scoped per role -- see Section 13 note)
POST   /api/investigations
GET    /api/investigations/{id}
PUT    /api/investigations/{id}

GET    /api/risk-assessments
POST   /api/risk-assessments
GET    /api/risk-assessments/{id}
PUT    /api/risk-assessments/{id}

GET    /api/resolutions
POST   /api/resolutions
GET    /api/resolutions/{id}
PUT    /api/resolutions/{id}
PUT    /api/resolutions/{id}/submit
PUT    /api/resolutions/{id}/decide   (Admin, Approver)

GET    /api/notifications/me
PUT    /api/notifications/{id}/read
PUT    /api/notifications/read-all

GET    /api/reports/dashboard
GET    /api/reports/issues
GET    /api/reports/investigations
GET    /api/reports/risk
GET    /api/reports/resolutions

GET    /api/audit-logs                (Admin)
```

## 13. Security Notes (please read)

- **Investigations are officer-scoped on the backend.** `GET /api/investigations` for a
  Compliance Officer returns *only* investigations where `OfficerId` matches the officer's
  own JWT-derived user id — this cannot be bypassed by search or query parameters. Try it:
  log in as Rahul, then as Neha — each sees only their own cases. Log in as Shubham
  (Super Administrator) to see all of them.
- **Notifications are always scoped to the caller's JWT identity.** `GET /api/notifications/me`
  never accepts a client-supplied user id.
- **Status transitions are validated server-side** against the defined case lifecycle
  (`Models/Enums.cs` → `IssueStatus.AllowedTransitions`).
- **Risk Assessment only exists for Vendor Issues** — there is no other entity type it can be
  attached to in this system.
- Demo/local authentication uses SHA-256 password hashing for simplicity — see the note under
  Demo Accounts above before using this in anything beyond local development.

## 14. Testing Checklist

Before relying on this build, verify:

- [ ] `cd backend && dotnet build` succeeds
- [ ] `cd frontend && npm install && npm run build` succeeds
- [ ] MongoDB is running and `mongosh < database/seed.js` completes without errors
- [ ] Backend starts (`dotnet run`) and Swagger loads at `/swagger`
- [ ] Frontend starts (`npm run dev`) and the login page loads
- [ ] Login works for each of the 6 demo accounts
- [ ] Vendor issue creation, assignment, and status changes persist to MongoDB
- [ ] Rahul sees only his own investigations; Neha sees only hers; Shubham sees all
- [ ] Risk Assessment is only offered for Vendor Issues once eligible (post-investigation)
- [ ] Resolution -> Submit for Approval -> Approver Approve/Reject flow works end-to-end
- [ ] Rahul's notifications differ from Priya's -- no cross-user leakage
- [ ] Audit Log records the actions above and is visible only to Shubham
- [ ] Reports render charts from live database data (not hardcoded arrays)
- [ ] Logout clears the session and redirects to `/login`

## 15. Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Frontend shows network errors on login | Backend isn't running, or is on a different port than `frontend/src/services/api.ts` expects (`5128`) |
| Backend fails to start with a Mongo connection error | MongoDB isn't running — see `database/README.md` to start it |
| `mongosh < database/seed.js` hangs or errors | Confirm `mongod`/the MongoDB service is running and listening on `27017` |
| CORS errors in the browser console | Confirm the frontend origin (`http://localhost:5173`) matches `Cors:AllowedOrigins` in `backend/appsettings.json` |
| 401 responses right after login | Check your system clock — JWT validation includes expiry/`nbf` checks |
| `dotnet restore` can't find packages | Ensure you have internet access and the .NET 8 SDK installed (`dotnet --version`) |
| Swagger page is blank | Only enabled when `ASPNETCORE_ENVIRONMENT=Development` (the default from `Properties/launchSettings.json`) |

## 16. Known Limitations

- Password hashing (SHA-256, unsalted) is intentionally simple for local/demo use — swap
  for BCrypt/Argon2/PBKDF2 with per-user salts before any real deployment.
- File/evidence "attachments" are stored as text references (names/links), not binary
  uploads — there's no file storage layer in this build.
- No automated test suite is included; the Testing Checklist above is a manual smoke test.
- Email/SMS delivery for notifications is out of scope — notifications are in-app only,
  persisted to MongoDB and polled by the frontend.
- No pagination at the API level yet — list endpoints return full result sets and the
  frontend paginates client-side, which is fine at demo data volumes but should move
  server-side for large datasets.

## 17. Project Structure

```
ECMVS/
├── frontend/          React + TypeScript + Vite SPA
├── backend/           ASP.NET Core 8 Web API
├── database/          MongoDB seed script, schema reference, setup guide
├── README.md          This file
└── .gitignore
```
