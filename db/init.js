const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'notes.db');

function initDatabase() {
  const db = new Database(DB_PATH);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Create users table — passwords stored in plain text (intentional vulnerability)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user'
    )
  `);

  // Create notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Seed default users if table is empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const insertUser = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');

    // Hardcoded admin credentials (intentional vulnerability)
    insertUser.run('admin', 'admin123', 'admin');
    insertUser.run('alice', 'password', 'user');
    insertUser.run('bob', 'letmein', 'user');

    // Seed some notes
    const insertNote = db.prepare('INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)');
    insertNote.run(1, 'Admin TODO', 'Remember to change the default JWT secret before going to production.');
    insertNote.run(2, 'Meeting Notes', 'Discuss quarterly roadmap with the team on Friday.');
    insertNote.run(2, 'Shopping List', 'Milk, eggs, bread, coffee');
    insertNote.run(3, 'Project Ideas', 'Build a CLI tool for log analysis. Research vector databases.');

    console.log('Database seeded with default users and notes.');
  }

  return db;
}

const db = initDatabase();

module.exports = db;
