const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let backendProcess = null;
let isQuitting = false;

function getBackendPath() {
  if (process.env.NODE_ENV === "development") {
    return null;
  }
  const basePath = process.resourcesPath
    ? path.join(process.resourcesPath, "backend")
    : path.join(__dirname, "..", "backend");
  return path.join(basePath, "malamjaba-backend.exe");
}

function waitForBackend(url, maxRetries = 30) {
  return new Promise((resolve, reject) => {
    const http = require("http");
    let retries = 0;
    const check = () => {
      const req = http.get(url, (res) => {
        resolve(true);
      });
      req.on("error", () => {
        retries++;
        if (retries >= maxRetries) {
          resolve(false);
        } else {
          setTimeout(check, 1000);
        }
      });
      req.end();
    };
    check();
  });
}

function spawnBackend() {
  const backendExe = getBackendPath();
  if (!backendExe) {
    console.log("[Electron] Development mode - backend not spawned");
    return Promise.resolve();
  }

  console.log(`[Electron] Spawning backend: ${backendExe}`);

  const fs = require("fs");
  if (!fs.existsSync(backendExe)) {
    console.error(`[Electron] Backend executable not found at: ${backendExe}`);
    dialog.showErrorBox(
      "Backend Error",
      `Backend executable not found at:\n${backendExe}\n\nPlease ensure the app was built correctly.`
    );
    app.quit();
    return Promise.resolve();
  }

  // Kill any existing process on port 8000 first
  try {
    const { execSync } = require("child_process");
    const result = execSync('netstat -ano | findstr ":8000" | findstr "LISTENING"', {
      encoding: "utf8",
      timeout: 3000,
    }).trim();
    if (result) {
      const parts = result.split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== "0") {
        console.log(`[Electron] Killing existing process on port 8000 (PID: ${pid})`);
        execSync(`taskkill /PID ${pid} /F`, { timeout: 5000 });
      }
    }
  } catch (e) {
    // No process on port 8000, good
  }

  backendProcess = spawn(backendExe, [], {
    cwd: path.dirname(backendExe),
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  backendProcess.stdout.on("data", (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`[Backend ERROR] ${data.toString().trim()}`);
  });

  backendProcess.on("error", (err) => {
    console.error(`[Electron] Failed to spawn backend: ${err.message}`);
    if (!isQuitting) {
      dialog.showErrorBox(
        "Backend Error",
        `Failed to start backend:\n${err.message}`
      );
      app.quit();
    }
  });

  backendProcess.on("close", (code) => {
    console.log(`[Electron] Backend process exited with code ${code}`);
    if (!isQuitting && code !== 0 && code !== null) {
      dialog.showErrorBox(
        "Backend Error",
        `The backend server stopped unexpectedly (exit code: ${code}).\n\nMake sure port 8000 is not in use.\nThe application will now close.`
      );
      app.quit();
    }
  });

  return waitForBackend("http://127.0.0.1:8000/health");
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
    show: false,
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
    mainWindow.once("ready-to-show", () => mainWindow.show());
  } else {
    spawnBackend().then((ready) => {
      if (!ready) {
        console.log("[Electron] Backend did not respond in time, loading frontend anyway");
      }
      mainWindow.loadURL("http://localhost:8000");
      mainWindow.webContents.once("did-finish-load", () => {
        mainWindow.show();
      });
      setTimeout(() => mainWindow.show(), 10000);
    });
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  isQuitting = true;
  if (backendProcess && !backendProcess.killed) {
    console.log("[Electron] Terminating backend process...");
    backendProcess.kill("SIGTERM");
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        backendProcess.kill("SIGKILL");
      }
    }, 3000);
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill("SIGTERM");
  }
});

process.on("uncaughtException", (err) => {
  console.error("[Electron] Uncaught exception:", err);
  if (backendProcess && !backendProcess.killed) backendProcess.kill("SIGKILL");
});

process.on("unhandledRejection", (reason) => {
  console.error("[Electron] Unhandled rejection:", reason);
});
