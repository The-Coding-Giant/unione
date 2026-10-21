require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');

const adminRouter = require('./routes/admin');
const redirectRouter = require('./routes/redirect');

const app = express();
const PORT = process.env.PORT || 3333;

// Hide Express framework header for security
app.disable('x-powered-by');

// View engine setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const FileSessionStore = require('./lib/session-store');

// Static files (CSS, client JS, assets)
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware with file persistence (sessions survive server stops/restarts)
app.use(
  session({
    store: new FileSessionStore({
      dir: path.join(__dirname, 'data', 'sessions'),
      ttl: 1000 * 60 * 60 * 24 * 7 // 7 days
    }),
    secret: process.env.SESSION_SECRET || 'fallback_secret_for_url_redirector',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

// Admin Portal routes
app.use('/admin', adminRouter);

// Dynamic direct redirect routes (handles /, /app, /custom-route, etc.)
app.use('/', redirectRouter);

// Start server with port error handling
function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 URL Redirector service is running on port ${portToTry}`);
    console.log(`👉 Base Server URL:    http://localhost:${portToTry}`);
    console.log(`🔒 Admin Portal:       http://localhost:${portToTry}/admin`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${portToTry} is already in use. Retrying on port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
