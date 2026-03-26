const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db/init');

const router = express.Router();

// Hardcoded JWT secret (intentional vulnerability)
const JWT_SECRET = 'super-secret-key-123';

// Login page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Login handler — SQL injection via string concatenation (intentional vulnerability)
// No rate limiting (intentional vulnerability)
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // VULNERABLE: string concatenation instead of parameterized query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const user = db.prepare(query).get();

  if (user) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.cookie('token', token);
    res.redirect('/notes');
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Register handler — also uses string concatenation (intentional vulnerability)
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Check if user exists
  const existing = db.prepare(`SELECT * FROM users WHERE username = '${username}'`).get();
  if (existing) {
    return res.render('register', { error: 'Username already taken' });
  }

  // VULNERABLE: password stored in plain text
  db.prepare(`INSERT INTO users (username, password) VALUES ('${username}', '${password}')`).run();

  res.redirect('/login');
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
});

// Auth middleware — exported for use in other routes
function authenticate(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.redirect('/login');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}

module.exports = { router, authenticate, JWT_SECRET };
