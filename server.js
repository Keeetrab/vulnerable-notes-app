const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const db = require('./db/init');

const app = express();
const PORT = 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const { router: authRouter } = require('./routes/auth');
const notesRouter = require('./routes/notes');
const attachmentsRouter = require('./routes/attachments');
const debugRouter = require('./routes/debug');
app.use(authRouter);
app.use(notesRouter);
app.use(attachmentsRouter);
app.use(debugRouter);

// Landing page
app.get('/', (req, res) => {
  res.render('index');
});

app.listen(PORT, () => {
  console.log(`Super Top Secret Classified Notes App running on http://localhost:${PORT}`);
});
