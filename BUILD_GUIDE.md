# How This EXE Was Built — Full Guide for Replication

## Architecture (2 processes in one app)

```
┌─────────────────────────────────────────────────┐
│  Electron Shell (main.cjs)                      │
│                                                  │
│  ┌──────────────┐  ┌───────────┐               │
│  │  Backend      │  │  Browser  │               │
│  │  (FastAPI)    │  │  Window   │               │
│  │  Port 8000    │  │  loads    │               │
│  │  SQLite DB    │  │  dist/    │               │
│  └──────────────┘  └───────────┘               │
└─────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Electron 28 |
| Frontend | React 18 + React Router + Tailwind CSS 3 |
| Backend API | FastAPI + SQLite (aiosqlite) |
| Backend packaging | PyInstaller |
| Installer | Portable EXE (electron-builder) |

## Step-by-Step Build Process

### Step 1: Build Frontend → Static Bundle

```bash
cd frontend
npm run build
# Runs: tsc && vite build
# Produces: dist/ folder with:
#   dist/index.html   → main HTML
#   dist/assets/      → CSS, JS bundles
```

### Step 2: Build Backend → Python EXE

```bash
cd backend
pyinstaller backend.spec
# Produces: dist/malamjaba-backend/malamjaba-backend.exe
# This is a one-folder build with console=False
```

**PyInstaller spec** (`backend/backend.spec`):
- Input: `run_production.py` (FastAPI app with uvicorn)
- Hidden imports: aiosqlite
- `console=False` (no terminal window)
- One-folder mode (fast startup, larger size)

### Step 3: Copy Backend EXE to Electron Resources

```bash
# Copy the built backend to electron/backend/
xcopy /E /I dist\malamjaba-backend frontend\electron\backend\
```

### Step 4: Build Electron App

```bash
cd frontend
npm run electron:build
# Runs: vite build && electron-builder
# Produces: release/Malamjaba-Recruiting-Agency-Portable.exe
```

## electron-builder Configuration

From `package.json`:

```json
{
  "build": {
    "appId": "com.malamjaba.agency",
    "productName": "Malamjaba Recruiting Agency",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": [{ "target": "portable", "arch": ["x64"] }],
      "icon": "public/icon.png"
    },
    "extraResources": [
      {
        "from": "electron/backend",
        "to": "backend",
        "filter": ["**/*"]
      }
    ]
  }
}
```

## What Happens at Runtime (main.cjs)

1. **Electron starts** → `app.whenReady()`
2. **Kills existing port 8000** → Prevents port conflicts
3. **Spawns backend** → `malamjaba-backend.exe` on port 8000
4. **Waits for backend** → Polls `http://127.0.0.1:8000/health` (30 retries, 1s each)
5. **Opens BrowserWindow** → Loads `dist/index.html`
6. **Frontend connects** → API calls to `http://localhost:8000`
7. **On close** → Kills backend process, quits

## Directory Structure After Build

```
Malamjaba-Recruiting-Agency-Portable/
├── Malamjaba Recruiting Agency.exe   ← Electron (main process)
├── resources/
│   └── backend/
│       ├── malamjaba-backend.exe     ← FastAPI (Python)
│       └── _internal/                ← Python runtime
├── dist/                             ← Frontend (React)
│   ├── index.html
│   └── assets/
│       ├── index-[hash].js
│       └── index-[hash].css
└── [Electron DLLs and data files]
```

## Runtime Data Storage

```
%APPDATA%\MalamjabaAgency\
├── dev.db                 ← SQLite database (created on first run)
└── backups\
    └── backup_YYYYMMDD_HHMMSS.db  ← Automatic backups
```

## First Run Behavior

1. Backend auto-creates `dev.db` with all tables
2. Seeds admin user: `admin` / `admin123`
3. Seeds accountant user: `accountant` / `accountant123`
4. App opens to login page

## Minimal Command Sequence

```bash
# 1. Install dependencies
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# 2. Build frontend
cd frontend && npm run build

# 3. Build backend with PyInstaller
cd backend && pyinstaller backend.spec

# 4. Copy backend to electron resources
xcopy /E /I dist\malamjaba-backend frontend\electron\backend\

# 5. Build Electron portable EXE
cd frontend && npm run electron:build

# 6. Output appears in:
#    frontend/release/Malamjaba-Recruiting-Agency-Portable.exe
```

## How the App Works Offline

1. **No external server** — FastAPI runs locally on 127.0.0.1:8000
2. **SQLite database** — File-based, stored in %AppData%/MalamjabaAgency/
3. **Static frontend** — Served from bundled files (dist/)
4. **Electron** — Acts as a local browser, no network needed
5. **Client installs the EXE** — Everything runs on their machine

## Client Installation

1. Double-click `Malamjaba-Recruiting-Agency-Portable.exe`
2. App extracts and starts
3. Login with `admin` / `admin123`
4. Change password immediately

## Notes

- **No internet required** after installation
- **No installer needed** — Portable EXE runs directly
- **Database is portable** — Can backup/restore from Settings
- **Windows SmartScreen** may warn on first run — Click "More info" → "Run anyway"
- **Port 8000** must not be in use by another application
