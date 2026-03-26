const express = require('express');
const db = require('../db/init');
const { authenticate } = require('./auth');

const router = express.Router();

// List current user's notes
router.get('/notes', authenticate, (req, res) => {
  const notes = db.prepare('SELECT * FROM notes WHERE user_id = ?').all(req.user.id);
  res.render('notes', { user: req.user, notes, search: null });
});

// Search notes — SQL injection via string concatenation (intentional vulnerability)
router.get('/notes/search', authenticate, (req, res) => {
  const { q } = req.query;

  // VULNERABLE: string concatenation instead of parameterized query
  const query = `SELECT * FROM notes WHERE user_id = ${req.user.id} AND (title LIKE '%${q}%' OR content LIKE '%${q}%')`;
  const notes = db.prepare(query).all();
  res.render('notes', { user: req.user, notes, search: q });
});

// Create note form
router.get('/notes/new', authenticate, (req, res) => {
  res.render('note-new', { user: req.user });
});

// Create note
router.post('/notes', authenticate, (req, res) => {
  const { title, content } = req.body;
  db.prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)').run(req.user.id, title, content);
  res.redirect('/notes');
});

// View single note — IDOR: no ownership check (intentional vulnerability)
router.get('/api/notes/:id', (req, res) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  // VULNERABLE: returns any user's note without checking ownership
  res.json(note);
});

// View note in HTML — also no ownership check
router.get('/notes/:id', authenticate, (req, res) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!note) {
    return res.status(404).send('Note not found');
  }
  // VULNERABLE: renders content as raw HTML (stored XSS)
  res.render('note-view', { user: req.user, note });
});

module.exports = router;
