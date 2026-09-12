# How This EXE Was Built — Full Guide for Replication

## Architecture (2 processes, single port)

```
┌──────────────────────────────────────────────────┐
│  Electron Shell (main.cjs)                       │
│                                                   │
│  ┌──────────────────────────┐  ┌──────────────┐ │
│  │  Backend (FastAPI)        │  │  Browser     │ │
│  │  Port 8000                │→→│  Window      │ │
│  │  SQLite DB + Frontend     │  │  loads       │ │
│  │  serves React dist/       │  │  localhost   │ │
│  └──────────────────────────┘  └──────────────┘ │
└──────────────────────────────────────────────────┘
```

The backend serves BOTH the API (`/api/*`) and the React frontend (`/*`).
Electron loads `http://localhost:8000` — no file:// protocol issues.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Electron 28 |
| Frontend | React 18 + React Router + Tailwind CSS 3 |
| Backend API | FastAPI + SQLite (aiosqlite) |
| Backend packaging | PyInstaller (one-file) |
| Installer | Portable ZIP (electron-builder, asar disabled) |

## Step-by-Step Build Process

### Step 1: Build Frontend → Static Bundle

```bash
cd frontend
npm run build
# Produces: dist/index.html + dist/assets/
```

### Step 2: Build Backend → Python EXE (one-file)

```bash
cd backend
pyinstaller backend.spec
# Produces: dist/malamjaba-backend.exe (~25 MB)
# Frontend dist/ is bundled inside the exe via spec datas
```

**PyInstaller spec** bundles:
- `run_production.py` (entry point)
- `alembic/` (migrations)
- `frontend/` (React dist → served by FastAPI)

### Step 3: Copy Backend EXE to Electron Resources

```bash
Copy-Item backend\dist\malamjaba-backend.exe frontend\electron\backend\
```

### Step 4: Build Electron App

```bash
cd frontend
npm run electron:build
# Produces: release/win-unpacked/
# Zip it: release/Malamjaba-Recruiting-Agency-Portable.zip
```

## What Happens at Runtime (main.cjs)

1. **Electron starts** → `app.whenReady()`
2. **Kills existing port 8000** → Prevents port conflicts
3. **Spawns backend** → `malamjaba-backend.exe` on port 8000
4. **Waits for backend** → Polls `http://127.0.0.1:8000/health` (30 retries, 1s each)
5. **Opens BrowserWindow** → Loads `http://localhost:8000`
6. **Backend serves everything** → React frontend + API endpoints
7. **On close** → Kills backend process, quits

## Directory Structure After Build

```
Malamjaba-Recruiting-Agency-Portable/
├── Malamjaba Recruiting Agency.exe   ← Electron (main process)
├── resources/
│   ├── app/                           ← Electron app code
│   │   ├── package.json
│   │   └── electron/
│   │       ├── main.cjs
│   │       └── preload.js
│   └── backend/
│       └── malamjaba-backend.exe     ← FastAPI + Frontend (one-file)
└── [Electron DLLs and data files]
```

## Runtime Data Storage

```
%APPDATA%\MalamjabaAgency\
├── dev.db                 ← SQLite database (created on first run)
└── backups\
    └── backup_YYYYMMDD_HHMMSS.db
```

## First Run Behavior

1. Backend auto-creates `dev.db` with all tables
2. Seeds admin user: `admin` / `admin123`
3. Seeds accountant user: `accountant` / `accountant123`
4. App opens to login page

## Build Commands (Production Ready)

```bash
# 1. Install dependencies
cd frontend && npm install
cd ../backend && pip install -r requirements.txt pyinstaller

# 2. Build frontend
cd frontend && npm run build

# 3. Build backend (one-file exe, includes frontend)
cd backend && pyinstaller backend.spec --noconfirm

# 4. Copy backend to electron resources
Copy-Item backend\dist\malamjaba-backend.exe frontend\electron\backend\ -Force

# 5. Build Electron app (asar disabled)
cd frontend && npx electron-builder --win --x64

# 6. Zip the win-unpacked folder
Compress-Archive -Path frontend\release\win-unpacked\* -DestinationPath frontend\release\Malamjaba-Recruiting-Agency-Portable.zip
```

## How the App Works Offline

1. **No external server** — FastAPI runs locally on 127.0.0.1:8000
2. **SQLite database** — File-based, stored in %AppData%/MalamjabaAgency/
3. **Backend serves frontend** — React dist/ embedded in the exe
4. **Electron** — Local browser shell, no network needed
5. **Everything in one process** — No CORS, no file:// issues

## Client Installation

1. Extract `Malamjaba-Recruiting-Agency-Portable.zip`
2. Double-click `Malamjaba Recruiting Agency.exe`
3. Login with `admin` / `admin123`
4. Change password immediately

## Notes

- **No internet required** after installation
- **No installer needed** — Portable, just extract and run
- **Database is portable** — Can backup/restore from Settings
- **`asar: false`** in package.json avoids Electron packaging issues
- **Port 8000** must not be in use by another application
- **Backend serves both API and frontend** — Single origin, no CORS
