const { Queue } = require("bullmq");

const codeQueue = new Queue("code-run-queue", {
  connection: {
    host: "127.0.0.1",
    port: 6379
  }
});

module.exports = { codeQueue };
