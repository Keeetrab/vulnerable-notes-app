const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const ATTACHMENTS_DIR = path.join(__dirname, '..', 'attachments');

// Download attachment — path traversal vulnerability (intentional)
router.get('/download', (req, res) => {
  const { file } = req.query;
  if (!file) {
    return res.status(400).json({ error: 'Missing file parameter' });
  }

  // VULNERABLE: no sanitization of file path — allows ../../ traversal
  const filePath = path.join(ATTACHMENTS_DIR, file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath);
});

// List available attachments
router.get('/attachments', (req, res) => {
  const files = fs.readdirSync(ATTACHMENTS_DIR);
  res.json({ files });
});

module.exports = router;
