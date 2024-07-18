// main.js
const { app, BrowserWindow } = require("electron");
const { exec } = require("child_process");
const waitOn = require("wait-on");

let mainWindow;
let serverProcess;

function createWindow() {
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
    mainWindow = null;
  });
}

app.on("ready", () => {
  // Start the Express server
  serverProcess = exec("node server.js", (err, stdout, stderr) => {
    if (err) {
      console.error(`Error starting server: ${stderr}`);
      return;
    }
    console.log(stdout);
  });

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
  if (serverProcess) {
    serverProcess.kill(); // Kill the server process
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on("quit", () => {
  if (serverProcess) {
    serverProcess.kill(); // Ensure the server process is killed when the app quits
  }
});
