const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let backendProcess = null;

function getBackendPath() {
  // In development, backend runs separately
  // In production, it's bundled as extraResource
  if (process.env.NODE_ENV === "development") {
    return null; // Don't spawn in dev mode
  }

  // In production, the backend exe is in resources/
  const basePath = process.resourcesPath
    ? path.join(process.resourcesPath, "backend")
    : path.join(__dirname, "..", "backend");

  const backendExe = path.join(basePath, "malamjaba-backend.exe");
  return backendExe;
}

function spawnBackend() {
  const backendExe = getBackendPath();
  if (!backendExe) {
    console.log("[Electron] Development mode - backend not spawned");
    return;
  }

  console.log(`[Electron] Spawning backend: ${backendExe}`);

  // Check if backend exe exists
  const fs = require("fs");
  if (!fs.existsSync(backendExe)) {
    console.error(`[Electron] Backend executable not found at: ${backendExe}`);
    dialog.showErrorBox(
      "Backend Error",
      `Backend executable not found at:\n${backendExe}\n\nPlease ensure the app was built correctly.`
    );
    app.quit();
    return;
  }

  backendProcess = spawn(backendExe, [], {
    cwd: path.dirname(backendExe),
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true, // Hide console window on Windows
  });

  backendProcess.stdout.on("data", (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`[Backend ERROR] ${data.toString().trim()}`);
  });

  backendProcess.on("error", (err) => {
    console.error(`[Electron] Failed to spawn backend: ${err.message}`);
    dialog.showErrorBox(
      "Backend Error",
      `Failed to start backend:\n${err.message}`
    );
    app.quit();
  });

  backendProcess.on("close", (code) => {
    console.log(`[Electron] Backend process exited with code ${code}`);
    if (code !== 0 && code !== null) {
      dialog.showErrorBox(
        "Backend Crashed",
        `The backend server stopped unexpectedly (exit code: ${code}).\nThe application will now close.`
      );
      app.quit();
    }
  });

  // Give backend time to start
  return new Promise((resolve) => setTimeout(resolve, 3000));
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
    icon: path.join(__dirname, "..", "public", "icon.png"),
    show: false, // Don't show until backend is ready
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
    mainWindow.once("ready-to-show", () => mainWindow.show());
  } else {
    // Wait for backend to start, then load the app
    spawnBackend().then(() => {
      mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
      mainWindow.once("ready-to-show", () => mainWindow.show());
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
  // Kill backend process when all windows closed
  if (backendProcess) {
    console.log("[Electron] Terminating backend process...");
    backendProcess.kill("SIGTERM");
    // Force kill after 5 seconds
    setTimeout(() => {
      if (backendProcess && !backendProcess.killed) {
        backendProcess.kill("SIGKILL");
      }
    }, 5000);
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  // Ensure backend is killed before quitting
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill("SIGTERM");
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("[Electron] Uncaught exception:", err);
  if (backendProcess) backendProcess.kill("SIGKILL");
});

process.on("unhandledRejection", (reason) => {
  console.error("[Electron] Unhandled rejection:", reason);
});