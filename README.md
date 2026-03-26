# Vulnerable Notes App

A deliberately vulnerable web application for the Claude Code workshop. Used to demonstrate how AI agents can discover and patch security issues.

## Tech Stack

- **Express.js** — minimal web server
- **SQLite** — zero-config database, no external services needed
- **EJS templates** — simple HTML rendering
- No build step — just `npm start`

## Plan

### Features

- User registration and login
- Create, read, and search personal notes
- File attachment download
- Admin debug panel

### Planted Vulnerabilities

1. **SQL Injection** — login form and note search use string concatenation instead of parameterized queries
2. **Stored XSS** — note content is rendered as raw HTML without sanitization
3. **Hardcoded Secrets** — admin password and JWT secret are hardcoded in source code
4. **Broken Access Control (IDOR)** — `/api/notes/:id` returns any user's note without ownership check
5. **Path Traversal** — attachment download endpoint doesn't sanitize `../` in filenames
6. **Weak Password Storage** — passwords stored in plain text (no hashing)
7. **Missing Rate Limiting** — login endpoint has no brute-force protection
8. **Information Disclosure** — `/debug` route exposes environment variables and database schema
