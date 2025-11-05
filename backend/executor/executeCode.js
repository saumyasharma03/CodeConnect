import fs from "fs";
import { exec } from "child_process";

export async function executeCppCode(userCode, stdin = "") {
  const cppDir = "./dock/cpp";
  const filePath = `${cppDir}/main.cpp`;

  // 1️⃣ Write user's code into main.cpp
  fs.writeFileSync(filePath, userCode);

  // 2️⃣ Build Docker image
  const buildCmd = `docker build --rm -t my-cpp-app ${cppDir}`;

  const buildResult = await new Promise((resolve, reject) => {
    exec(buildCmd, (err, stdout, stderr) => {
      if (err) reject(stderr || err);
      else resolve(stdout);
    });
  });

  console.log("✅ Image built:", buildResult);

  // 3️⃣ Run the container
  const runCmd = `docker run --rm -i my-cpp-app`;

  const runResult = await new Promise((resolve, reject) => {
    const process = exec(runCmd, (err, stdout, stderr) => {
      if (err) reject(stderr || err);
      else resolve(stdout);
    });
    process.stdin.write(stdin);
    process.stdin.end();
  });

  console.log("✅ Output:", runResult);

  return runResult;
}
