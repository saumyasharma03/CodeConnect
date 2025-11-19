const express = require("express");
const { Queue, Worker, QueueEvents } = require("bullmq");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const router = express.Router();

const codeQueue = new Queue("codeQueue", {
  connection: { host: "127.0.0.1", port: 6379 }
});

new Worker(
  "codeQueue",
  async (job) => {
    const { code, language } = job.data;

    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const filename =
      language === "cpp"
        ? "main.cpp"
        : language === "python"
        ? "main.py"
        : "main.js";

    const filepath = path.join(tempDir, filename);
    fs.writeFileSync(filepath, code);

    const commands = {
      cpp: `g++ ${filepath} -o ${tempDir}/a.out && ${tempDir}/a.out`,
      python: `python ${filepath}`,
      javascript: `node ${filepath}`,
    };

    const start = Date.now();

    const output = await new Promise((resolve, reject) => {
      exec(commands[language], (err, stdout, stderr) => {
        if (err) reject(stderr || err);
        else resolve(stdout);
      });
    });

    const executionTime = Date.now() - start;

    return { output, executionTime };
  },
  { connection: { host: "127.0.0.1", port: 6379 } }
);

router.post("/run", async (req, res) => {
  const { code, language } = req.body;

  const job = await codeQueue.add("run-code", { code, language });
  res.json({ jobId: job.id });
});

router.get("/status/:id", async (req, res) => {
  try {
    const job = await codeQueue.getJob(req.params.id);

    if (!job) return res.json({ state: "not_found" });

    const state = await job.getState();
    const result = job.returnvalue || null;

    res.json({ state, result });
  } catch (err) {
    res.status(500).json({ error: "Status check failed" });
  }
});

module.exports = router;
