const express = require('express');
const router = express.Router();
const Store = require('../lib/store');
const { requireAuth, verifyCredentials } = require('../lib/auth');

// --- Auth Routes ---
router.get('/login', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    return res.redirect('/admin');
  }
  const error = req.session.loginError;
  req.session.loginError = null;
  res.render('login', { error, title: 'Sign In' });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (verifyCredentials(username, password)) {
    req.session.isAuthenticated = true;
    req.session.adminUser = username || 'admin';
    return res.redirect('/admin');
  }
  req.session.loginError = 'Invalid credentials.';
  return res.redirect('/admin/login');
});

router.all('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// Protect all following routes with requireAuth
router.use(requireAuth);

// --- Dashboard View ---
router.get('/', (req, res) => {
  const routes = Store.getAllList();
  const stats = Store.getStats();
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const flash = req.session.flash;
  req.session.flash = null;

  res.render('dashboard', {
    routes,
    stats,
    baseUrl,
    flash,
    adminUser: req.session.adminUser || 'Admin',
    title: 'Dashboard - URL Redirector'
  });
});

// --- Create New Route ---
router.post('/routes/create', (req, res) => {
  try {
    let { path: routePath, label, targetUrls } = req.body;
    if (!routePath) {
      req.session.flash = { type: 'error', message: 'Route path is required.' };
      return res.redirect('/admin');
    }

    const normPath = Store.normalizePath(routePath);
    if (normPath.startsWith('/admin')) {
      req.session.flash = { type: 'error', message: 'The /admin path is reserved for the admin portal.' };
      return res.redirect('/admin');
    }

    // Split targetUrls by newline or comma if passed as string
    let urlsArray = [];
    if (typeof targetUrls === 'string') {
      urlsArray = targetUrls
        .split(/[\r\n,]+/)
        .map(u => u.trim())
        .filter(u => u.length > 0);
    } else if (Array.isArray(targetUrls)) {
      urlsArray = targetUrls.filter(u => u && u.trim());
    }

    if (urlsArray.length === 0) {
      req.session.flash = { type: 'error', message: 'Please provide at least one target redirect URL.' };
      return res.redirect('/admin');
    }

    const formattedUrls = urlsArray.map(u => ({ url: u }));
    Store.setRoute(normPath, { label, urls: formattedUrls });

    req.session.flash = { type: 'success', message: `Route "${normPath}" created successfully with ${formattedUrls.length} target URL(s)!` };
  } catch (err) {
    req.session.flash = { type: 'error', message: 'Failed to create route: ' + err.message };
  }
  res.redirect('/admin');
});

// --- Delete Route ---
router.post('/routes/delete', (req, res) => {
  const { path: routePath } = req.body;
  if (routePath) {
    Store.deleteRoute(routePath);
    req.session.flash = { type: 'success', message: `Route "${routePath}" has been deleted.` };
  }
  res.redirect('/admin');
});

// --- Add URL to existing route ---
router.post('/routes/urls/add', (req, res) => {
  const { path: routePath, url, label } = req.body;
  if (!routePath || !url) {
    req.session.flash = { type: 'error', message: 'Route path and target URL are required.' };
    return res.redirect('/admin');
  }

  Store.addUrlToRoute(routePath, url, label);
  req.session.flash = { type: 'success', message: `New target URL added to route "${routePath}".` };
  res.redirect('/admin');
});

// --- Remove URL from route ---
router.post('/routes/urls/delete', (req, res) => {
  const { path: routePath, urlId } = req.body;
  if (routePath && urlId) {
    Store.removeUrlFromRoute(routePath, urlId);
    req.session.flash = { type: 'success', message: 'Target URL removed from route.' };
  }
  res.redirect('/admin');
});

// --- Toggle URL active/inactive status ---
router.post('/routes/urls/toggle', (req, res) => {
  const { path: routePath, urlId } = req.body;
  if (routePath && urlId) {
    const newStatus = Store.toggleUrlStatus(routePath, urlId);
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.json({ success: true, enabled: newStatus });
    }
    req.session.flash = {
      type: 'success',
      message: `Target URL ${newStatus ? 'enabled' : 'disabled'}.`
    };
  }
  res.redirect('/admin');
});

module.exports = router;
