const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/run', (req, res) => {
  const { code, language } = req.body;
  const tempDir = path.join(process.cwd(), 'temp');

  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
  const filename =
    language === 'cpp'
      ? 'main.cpp'
      : language === 'python'
      ? 'main.py'
      : 'main.js';
  const filepath = path.join(tempDir, filename);

  fs.writeFileSync(filepath, code);

  const commands = {
    cpp: `g++ ${filepath} -o ${tempDir}/a.out && ${tempDir}/a.out`,
    python: `python ${filepath}`,
    javascript: `node ${filepath}`,
  };

  exec(commands[language], (err, stdout, stderr) => {
    if (err)
      return res.json({ success: false, stderr: stderr || err.message });
    res.json({ success: true, output: stdout });
  });
});

module.exports = router;
