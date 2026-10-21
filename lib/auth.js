const crypto = require('crypto');

function requireAuth(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  return res.redirect('/admin/login');
}

function verifyCredentials(username, password) {
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (!username || !password) return false;

  try {
    const userBuf = Buffer.from(String(username));
    const expectedUserBuf = Buffer.from(String(adminUser));
    const passBuf = Buffer.from(String(password));
    const expectedPassBuf = Buffer.from(String(adminPass));

    const userMatch =
      userBuf.length === expectedUserBuf.length &&
      crypto.timingSafeEqual(userBuf, expectedUserBuf);

    const passMatch =
      passBuf.length === expectedPassBuf.length &&
      crypto.timingSafeEqual(passBuf, expectedPassBuf);

    return userMatch && passMatch;
  } catch (err) {
    return false;
  }
}

module.exports = {
  requireAuth,
  verifyCredentials
};
