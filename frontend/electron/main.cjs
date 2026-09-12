const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn, execSync } = require("child_process");

let mainWindow;
let backendProcess = null;
let isQuitting = false;

function getBackendPath() {
  const basePath = process.resourcesPath
    ? path.join(process.resourcesPath, "backend")
    : path.join(__dirname, "..", "backend");
  return path.join(basePath, "malamjaba-backend.exe");
}

function killPort8000() {
  try {
    const result = execSync('netstat -ano | findstr ":8000" | findstr "LISTENING"', {
      encoding: "utf8",
      timeout: 3000,
    }).trim();
    if (result) {
      const parts = result.split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== "0") {
        execSync(`taskkill /PID ${pid} /F`, { timeout: 5000 });
      }
    }
  } catch (e) {
    // No process on port 8000
  }
}

function spawnBackend() {
  const backendExe = getBackendPath();
  const fs = require("fs");

  if (!fs.existsSync(backendExe)) {
    console.error("[Electron] Backend not found:", backendExe);
    return;
  }

  killPort8000();

  backendProcess = spawn(backendExe, [], {
    cwd: path.dirname(backendExe),
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  backendProcess.stdout.on("data", (d) => console.log(`[Backend] ${d.toString().trim()}`));
  backendProcess.stderr.on("data", (d) => console.error(`[Backend] ${d.toString().trim()}`));

  backendProcess.on("error", (err) => {
    console.error("[Electron] Backend spawn error:", err.message);
  });

  backendProcess.on("close", (code) => {
    console.log(`[Electron] Backend exited with code ${code}`);
    if (!isQuitting && mainWindow) {
      mainWindow.reload();
    }
  });
}

function waitForBackend(url, maxRetries) {
  return new Promise((resolve) => {
    const http = require("http");
    let retries = 0;
    const check = () => {
      const req = http.get(url, () => resolve(true));
      req.on("error", () => {
        retries++;
        if (retries >= maxRetries) resolve(false);
        else setTimeout(check, 1000);
      });
      req.end();
    };
    check();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: "Malamjaba Recruiting Agency",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    show: true,
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    spawnBackend();

    waitForBackend("http://127.0.0.1:8000/health", 30).then((ready) => {
      if (ready) {
        mainWindow.loadURL("http://localhost:8000");
      } else {
        mainWindow.loadURL("http://localhost:8000");
        setTimeout(() => {
          if (mainWindow) mainWindow.reload();
        }, 5000);
      }
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  isQuitting = true;
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill("SIGTERM");
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) backendProcess.kill("SIGKILL");
    }, 3000);
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  isQuitting = true;
  if (backendProcess && !backendProcess.killed) backendProcess.kill("SIGTERM");
});

process.on("uncaughtException", (err) => {
  console.error("[Electron] Uncaught:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[Electron] Rejection:", reason);
});
