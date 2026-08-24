# ECMVS Database Setup

ECMVS uses **MongoDB** (Community Server, run locally) — no SQL, no paid cloud services required.

## 1. Install MongoDB Community Server

**Windows 11**
1. Download the MSI installer from https://www.mongodb.com/try/download/community
2. Run the installer, choosing "Complete" setup and installing it as a Service.
3. Optionally install **MongoDB Shell (mongosh)** from the same download page if not bundled.

**Ubuntu / Linux**
```bash
# Import the MongoDB public key and add the repo (Ubuntu 24.04 "noble" example)
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] http://repo.mongodb.org/apt/ubuntu noble/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
```

## 2. Start MongoDB

**Windows 11** (as a service, usually starts automatically after install; to control manually):
```powershell
net start MongoDB
:: to stop:
net stop MongoDB
```

**Ubuntu / Linux**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod   # optional: start on boot
sudo systemctl status mongod   # verify it's running
```

MongoDB will listen on `mongodb://127.0.0.1:27017` by default, which matches `backend/appsettings.json`.

## 3. Seed demo data

From the `ECMVS` project root:

```bash
mongosh < database/seed.js
```

This drops and repopulates the `ECMVS` database with:
- 6 users (one Super Administrator, two Compliance Officers, one Vendor Manager, one Approver, one Employee)
- 10 vendor issues across every status in the lifecycle
- 5 investigations
- 5 risk assessments
- 5 resolutions (including one still Draft and one Pending Approval, to exercise the approval workflow)
- 11 notifications, correctly scoped per user
- 20 audit log entries
- Indexes on the most frequently queried fields

Super Administrator: `shubham@ecmvs.local` / `Shubham@ECMVS2026!`  
Other seeded demo accounts: `Password123!`

Re-run the same command any time you want to reset the demo data back to its original state.

See `collections.md` for the full schema and field reference.
