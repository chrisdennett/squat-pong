// main.js
const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const waitOn = require("wait-on");

let mainWindow;
let serverProcess;

function createWindow() {
  // console.log("create-window");
  mainWindow = new BrowserWindow({
    fullscreen: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadURL("http://localhost:3000");

  mainWindow.on("closed", function () {
    // console.log("closed");
    stopServer();
    // mainWindow = null;
  });

  // Handle the close event to ensure the server is stopped
  mainWindow.on("close", (event) => {
    // console.log("close");
    stopServer();
    app.quit(); // Ensure the application quits
  });
}

function startServer() {
  // console.log("start-server");
  serverProcess = spawn("node", ["server.js"], { stdio: "inherit" });

  serverProcess.on("error", (err) => {
    console.error(`Error starting server: ${err.message}`);
  });

  serverProcess.on("exit", (code, signal) => {
    console.log(`Server process exited with code ${code} and signal ${signal}`);
  });

  return serverProcess;
}

function stopServer() {
  // console.log("stop-server");
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
  }
}

app.on("ready", () => {
  // console.log("ready");
  // Start the Express server
  serverProcess = startServer();

  // Wait for the server to be ready before creating the window
  waitOn({ resources: ["http://localhost:3000"] }, (err) => {
    if (err) {
      console.error("Error waiting for server:", err);
      return;
    }
    createWindow();
  });
});

app.on("window-all-closed", () => {
  // console.log("window-all-closed");
  // console.log("process.platform: ", process.platform);
  stopServer();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // console.log("activate");
  if (mainWindow === null) {
    createWindow();
  }
});

// Ensure the server process is killed when the app quits
app.on("before-quit", () => {
  // console.log("before-quit");
  stopServer();
});

app.on("will-quit", () => {
  // console.log("will-quit");
  stopServer();
});

app.on("quit", () => {
  // console.log("quit");
  stopServer();
});

process.on("exit", () => {
  // console.log("exit");
  stopServer();
});
