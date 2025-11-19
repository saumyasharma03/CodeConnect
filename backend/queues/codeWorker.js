const { Worker } = require("bullmq");
const io = require("../socket/socket");          // socket instance
const executeCppCode = require("../executor/executeCode");

const worker = new Worker(
  "code-run-queue",
  async job => {
    const { code, language, input } = job.data;

    if (language === "cpp") {
      return await executeCppCode(code, input);
    }

    return { output: "Language not implemented yet." };
  },
  { connection: { host: "127.0.0.1", port: 6379 } }
);

worker.on("completed", (job, result) => {
  io.emit("code-result", { jobId: job.id, output: result });
});

worker.on("failed", (job, err) => {
  io.emit("code-result", { jobId: job.id, error: err.message });
});

module.exports = worker;
