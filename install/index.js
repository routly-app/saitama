const { execSync } = require("child_process");

const isWin = process.platform === "win32";

if (isWin) {
  execSync("powershell -ExecutionPolicy Bypass -File ./install/install.ps1", {
    stdio: "inherit",
    cwd: __dirname + "/..",
  });
} else {
  execSync(
    "bash -c '[ -f ./install/install.sh ] && chmod +x ./install/install.sh && ./install/install.sh'",
    {
      stdio: "inherit",
      cwd: __dirname + "/..",
    }
  );
}
