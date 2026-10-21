const fs = require('fs');
const path = require('path');
const session = require('express-session');

/**
 * FileSessionStore persists express sessions to JSON files in the data directory.
 * This guarantees that when the server is stopped, restarted, or goes offline,
 * session authentication data is preserved and not lost.
 */
class FileSessionStore extends session.Store {
  constructor(options = {}) {
    super(options);
    this.dir = options.dir || path.join(__dirname, '..', 'data', 'sessions');
    this.ttl = options.ttl || 1000 * 60 * 60 * 24 * 7; // Default 7 days

    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }
  }

  _getFilePath(sid) {
    // Sanitize sid to prevent directory traversal
    const safeSid = sid.replace(/[^a-zA-Z0-9_\-]/g, '_');
    return path.join(this.dir, `${safeSid}.json`);
  }

  get(sid, callback) {
    const filePath = this._getFilePath(sid);
    fs.readFile(filePath, 'utf-8', (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return callback(null, null);
        }
        return callback(err);
      }

      try {
        const sess = JSON.parse(content);
        if (sess && sess.cookie && sess.cookie.expires) {
          const expires = new Date(sess.cookie.expires);
          if (expires <= new Date()) {
            return this.destroy(sid, callback);
          }
        }
        return callback(null, sess);
      } catch (parseErr) {
        // Corrupted session file, treat as expired
        return callback(null, null);
      }
    });
  }

  set(sid, sess, callback) {
    const filePath = this._getFilePath(sid);
    const tempFile = path.join(this.dir, `${sid}.tmp.${Date.now()}`);

    try {
      const data = JSON.stringify(sess, null, 2);
      fs.writeFile(tempFile, data, 'utf-8', (err) => {
        if (err) return callback && callback(err);

        try {
          fs.renameSync(tempFile, filePath);
          if (callback) callback(null);
        } catch (renameErr) {
          // On Windows, fall back to write directly if rename fails
          fs.writeFile(filePath, data, 'utf-8', (writeErr) => {
            try { fs.unlinkSync(tempFile); } catch (e) {}
            if (callback) callback(writeErr);
          });
        }
      });
    } catch (err) {
      if (callback) callback(err);
    }
  }

  destroy(sid, callback) {
    const filePath = this._getFilePath(sid);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        return callback && callback(err);
      }
      if (callback) callback(null);
    });
  }

  touch(sid, sess, callback) {
    this.set(sid, sess, callback);
  }

  length(callback) {
    fs.readdir(this.dir, (err, files) => {
      if (err) return callback(err);
      const sessionFiles = files.filter(f => f.endsWith('.json') && !f.includes('.tmp.'));
      callback(null, sessionFiles.length);
    });
  }

  clear(callback) {
    fs.readdir(this.dir, (err, files) => {
      if (err) return callback(err);
      const sessionFiles = files.filter(f => f.endsWith('.json'));
      let remaining = sessionFiles.length;
      if (remaining === 0) return callback(null);

      sessionFiles.forEach(file => {
        fs.unlink(path.join(this.dir, file), () => {
          remaining -= 1;
          if (remaining === 0) callback(null);
        });
      });
    });
  }
}

module.exports = FileSessionStore;
