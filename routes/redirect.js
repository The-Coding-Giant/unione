const express = require('express');
const router = express.Router();
const Store = require('../lib/store');

// Wildcard route handler for dynamic redirects
router.get('*', (req, res, next) => {
  // Ignore static assets or admin paths (which are handled beforehand)
  if (req.path.startsWith('/admin') || req.path.startsWith('/public') || req.path === '/favicon.ico') {
    return next();
  }

  const requestedPath = Store.normalizePath(req.path);
  const target = Store.selectRandomTarget(requestedPath);

  if (target && target.url) {
    let destination = target.url;

    // Preserve query parameters if present in the incoming request
    const originalQuery = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    if (originalQuery) {
      const separator = destination.includes('?') ? '&' : '?';
      destination += separator + originalQuery.slice(1);
    }

    const statusCode = parseInt(process.env.REDIRECT_HTTP_CODE, 10) || 302;

    // DIRECT REDIRECT - No UI, no delay, immediate browser redirection
    return res.redirect(statusCode, destination);
  }

  // If no redirect rule exists for this path, show a clean 404 page
  res.status(404).render('not-found', {
    requestedPath: req.path,
    title: '404 - No Redirect Configured'
  });
});

module.exports = router;
