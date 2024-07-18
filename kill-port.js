const { exec } = require("child_process");

const port = 3000;

const command =
  process.platform === "win32"
    ? `netstat -ano | findstr :${port}`
    : `lsof -i :${port}`;

exec(command, (err, stdout, stderr) => {
  if (err) {
    console.error(`Error executing command: ${err}`);
    return;
  }

  if (!stdout) {
    console.log(`No process running on port ${port}`);
    return;
  }

  const lines = stdout.trim().split("\n");
  const pids = lines.map((line) => {
    const columns = line.trim().split(/\s+/);
    return process.platform === "win32"
      ? columns[columns.length - 1]
      : columns[1];
  });

  pids.forEach((pid) => {
    const killCommand =
      process.platform === "win32"
        ? `taskkill /PID ${pid} /F`
        : `kill -9 ${pid}`;

    exec(killCommand, (killErr, killStdout, killStderr) => {
      if (killErr) {
        console.error(`Error killing process: ${killErr}`);
        return;
      }

      console.log(`Killed process ${pid} on port ${port}`);
    });
  });
});
