# ECMVS Project Guide

## 1. What ECMVS is

ECMVS means Enterprise Compliance & Vendor Management System. It helps an organization record concerns, assign owners, investigate facts, assess risk, approve corrective actions, notify people, and keep an audit history.

The project now has two connected workspaces:

1. **Compliance Hub**: a shared intake and case register for Grievance, Fraud, Health & Safety, Conflict of Interest, Vendor Risk, and Employee compliance.
2. **Vendor Issues**: detailed vendor issue investigation, risk assessment, resolution, approval, and closure workflow.

Contract management is intentionally outside this project.

## 2. Main features

- Login with JWT authentication.
- Role-based access for Super Administrator, Compliance Officer, Vendor Manager, Approver, and Employee.
- Role-specific dashboards and navigation.
- Compliance Hub with six case domains.
- Case creation with title, description, severity, confidentiality, subject, location, anonymous reporter option, tags, owner, and due date.
- Case register search and filters for domain and status.
- Vendor issue creation, editing, assignment, comments, priorities, statuses, due dates, and search.
- Investigation records with findings, root cause, evidence, notes, and officer scoping.
- Risk assessment using likelihood multiplied by impact.
- Resolution records with corrective and preventive actions.
- Approval workflow for resolutions.
- Notifications with unread tracking.
- Admin user management: create, edit, activate, deactivate, and delete users.
- Audit log for important actions.
- Reports with charts and operational analytics.
- Swagger API documentation.
- Responsive layout for desktop and mobile.
- MongoDB local development support through Docker.

## 3. Compliance domains

| Domain | Simple meaning | Example |
|---|---|---|
| Grievance | Employee or workplace concern | Conduct complaint or retaliation concern |
| Fraud | Suspected dishonest or financial activity | Duplicate supplier payment |
| Health & Safety | Incident, hazard, injury, or near miss | Warehouse forklift near miss |
| Conflict of Interest | Disclosure of a personal or business conflict | Relationship with a supplier decision maker |
| Vendor Risk | Third-party exposure and due diligence | Overdue vendor security review |
| Employee | Employee compliance and conduct matter | Missing ethics attestation |

## 4. Standard workflow

### Compliance Hub

1. Open **Compliance Hub**.
2. Select **New case**.
3. Select the domain and severity.
4. Enter the facts and context.
5. Choose confidentiality and anonymous reporting when needed.
6. Create the case.
7. Search or filter the register.
8. Assign and progress the case through review, investigation, action, and closure.

### Vendor issue workflow

1. Create a vendor issue.
2. Assign a Compliance Officer.
3. Investigate the issue.
4. Complete a risk assessment.
5. Create a resolution.
6. Submit for approval when required.
7. Approve or reject the resolution.
8. Mark the issue resolved and closed.
9. Review the audit log and notifications.

## 5. Roles

| Role | Responsibility |
|---|---|
| Super Administrator | Full administration, users, audit, and all workflows |
| Compliance Officer | Investigations, risk assessment, and resolutions |
| Vendor Manager | Vendor issues, assignment, and vendor operations |
| Approver | Reviews and approves or rejects resolutions |
| Employee | Reports concerns and views permitted information |

## 6. Technology

- Frontend: React 18, TypeScript, Vite, React Router, Axios, Recharts.
- Backend: ASP.NET Core 8 Web API and C#.
- Database: MongoDB with the official MongoDB.Driver package.
- Authentication: JWT tokens.
- API documentation: Swagger/OpenAPI.

## 7. Project folders

- `frontend/src/pages`: application screens.
- `frontend/src/components`: shared UI components.
- `frontend/src/services`: API clients.
- `backend/Controllers`: HTTP endpoints.
- `backend/Services`: business logic.
- `backend/Models`: MongoDB models.
- `backend/DTOs`: request and response objects.
- `backend/Data`: MongoDB context and settings.
- `database/seed.js`: demo data and indexes.
- `docs`: project documentation.

## 8. Run locally

### Start MongoDB

```bash
docker run -d --name ecmvs-mongodb -p 27017:27017 mongo:7
docker cp database/seed.js ecmvs-mongodb:/tmp/seed.js
docker exec ecmvs-mongodb mongosh --quiet /tmp/seed.js
```

If the container already exists, use `docker start ecmvs-mongodb`.

### Start the backend

```bash
cd backend
dotnet restore
dotnet run --urls http://localhost:5128
```

API: `http://localhost:5128`  
Swagger: `http://localhost:5128/swagger`

### Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Application: `http://localhost:5173`

The frontend uses `/api` and Vite proxies it to the backend.

## 9. Demo login

Administrator:

- Email: `shubham@ecmvs.local`
- Password: `Shubham@ECMVS2026!`

Other seeded demo accounts use password `Password123!`:

- `rahul@ecmvs.local`
- `neha@ecmvs.local`
- `priya@ecmvs.local`
- `amit@ecmvs.local`
- `employee@ecmvs.local`

## 10. Important API endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/compliance-cases`
- `POST /api/compliance-cases`
- `PUT /api/compliance-cases/{id}`
- `GET /api/vendor-issues`
- `POST /api/vendor-issues`
- `GET /api/investigations`
- `GET /api/risk-assessments`
- `GET /api/resolutions`
- `GET /api/notifications`
- `GET /api/reports/summary`
- `GET /api/users`
- `GET /api/audit-logs`

## 11. Database collections

- `Users`
- `VendorIssues`
- `Investigations`
- `RiskAssessments`
- `Resolutions`
- `Notifications`
- `AuditLogs`
- `ComplianceCases`

## 12. Delivery status

The local project is runnable end to end with seeded MongoDB data. Backend and frontend builds pass. The Compliance Hub covers the requested six domains with shared intake, filtering, case status, severity, confidentiality, anonymous reporting, ownership, and audit events.

For a production enterprise release, add SSO/SAML, salted adaptive password hashing, automated tests, file upload and malware scanning, advanced case-level permissions, vendor master and due diligence workflows, employee training and attestations, regulatory reporting, backups, monitoring, and deployment infrastructure.
