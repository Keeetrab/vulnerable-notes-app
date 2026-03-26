const express = require('express');
const db = require('../db/init');
const { JWT_SECRET } = require('./auth');

const router = express.Router();

// Debug endpoint — no authentication required (intentional vulnerability)
// Exposes environment variables, database schema, and app secrets
router.get('/debug', (req, res) => {
  const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const noteCount = db.prepare('SELECT COUNT(*) as count FROM notes').get();

  res.json({
    environment: process.env,
    database: {
      tables,
      stats: {
        users: userCount.count,
        notes: noteCount.count
      }
    },
    app: {
      jwt_secret: JWT_SECRET,
      node_version: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  });
});

module.exports = router;
