require("dotenv").config();

module.exports = {
  apps: [
    {
      name: "@saitamafun/api",
      exec_mode: process.env.EXEC_MODE,
      interpreter: process.env.INTERPRETER,
      instances: process.env.CPU_INSTANCES
        ? Number(process.env.CPU_INSTANCES)
        : undefined,
      script: "dist/index.cjs",
    },
    {
      name: "raliqbot-watch",
      exec_mode: process.env.EXEC_MODE,
      interpreter: process.env.INTERPRETER,
      instances: process.env.CPU_INSTANCES
        ? Number(process.env.CPU_INSTANCES)
        : undefined,
      script: "dist/watch/index.cjs",
    },
  ],
};
