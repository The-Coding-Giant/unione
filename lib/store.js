const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'redirects.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Normalizes path: ensures leading slash, trims trailing slash (unless root '/'), lowercases
function normalizePath(rawPath) {
  if (!rawPath) return '/';
  let p = rawPath.trim();
  if (!p.startsWith('/')) {
    p = '/' + p;
  }
  // Remove trailing slashes, unless it's just "/"
  if (p.length > 1 && p.endsWith('/')) {
    p = p.replace(/\/+$/, '');
  }
  return p.toLowerCase();
}

// Normalizes destination URL: ensures protocol http/https
function normalizeUrl(rawUrl) {
  if (!rawUrl) return '';
  let u = rawUrl.trim();
  if (!/^https?:\/\//i.test(u)) {
    u = 'https://' + u;
  }
  return u;
}

// Default initial data if file does not exist
const initialData = {};

// In-memory cache synced with file
let memoryStore = null;

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      memoryStore = JSON.parse(content);
    } else {
      memoryStore = initialData;
      saveData(memoryStore);
    }
  } catch (err) {
    console.error('Error reading redirects data file, using default data:', err);
    memoryStore = initialData;
  }
  return memoryStore;
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving redirects data file:', err);
  }
}

// Initialize on start
loadData();

const Store = {
  normalizePath,
  normalizeUrl,

  getAll() {
    if (!memoryStore) loadData();
    return memoryStore;
  },

  getAllList() {
    const all = this.getAll();
    return Object.values(all).sort((a, b) => {
      // Root "/" first, then alphabetical
      if (a.path === '/') return -1;
      if (b.path === '/') return 1;
      return a.path.localeCompare(b.path);
    });
  },

  get(rawPath) {
    const p = normalizePath(rawPath);
    const all = this.getAll();
    return all[p] || null;
  },

  setRoute(rawPath, { label = '', urls = [] }) {
    const p = normalizePath(rawPath);
    const all = this.getAll();
    const existing = all[p] || {
      path: p,
      createdAt: new Date().toISOString(),
      totalHits: 0,
      lastHitAt: null,
      urls: []
    };

    const formattedUrls = urls
      .filter(item => item && (typeof item === 'string' ? item.trim() : item.url && item.url.trim()))
      .map(item => {
        const u = typeof item === 'string' ? item : item.url;
        const l = typeof item === 'object' && item.label ? item.label : '';
        const enabled = typeof item === 'object' && item.enabled !== undefined ? Boolean(item.enabled) : true;
        return {
          id: 'url_' + crypto.randomBytes(4).toString('hex'),
          url: normalizeUrl(u),
          label: l.trim() || new URL(normalizeUrl(u)).hostname,
          enabled,
          hits: 0,
          createdAt: new Date().toISOString()
        };
      });

    all[p] = {
      ...existing,
      path: p,
      label: label.trim() || p,
      updatedAt: new Date().toISOString(),
      urls: formattedUrls.length > 0 ? formattedUrls : existing.urls
    };

    saveData(all);
    return all[p];
  },

  deleteRoute(rawPath) {
    const p = normalizePath(rawPath);
    const all = this.getAll();
    if (all[p]) {
      delete all[p];
      saveData(all);
      return true;
    }
    return false;
  },

  addUrlToRoute(rawPath, url, label = '') {
    const p = normalizePath(rawPath);
    const all = this.getAll();
    if (!all[p]) {
      // Create route if not exists
      all[p] = {
        path: p,
        label: p,
        createdAt: new Date().toISOString(),
        totalHits: 0,
        lastHitAt: null,
        urls: []
      };
    }

    const normUrl = normalizeUrl(url);
    let autoLabel = label ? label.trim() : '';
    if (!autoLabel) {
      try {
        autoLabel = new URL(normUrl).hostname;
      } catch (e) {
        autoLabel = 'Target URL';
      }
    }

    const newUrlObj = {
      id: 'url_' + crypto.randomBytes(4).toString('hex'),
      url: normUrl,
      label: autoLabel,
      enabled: true,
      hits: 0,
      createdAt: new Date().toISOString()
    };

    all[p].urls.push(newUrlObj);
    all[p].updatedAt = new Date().toISOString();
    saveData(all);
    return newUrlObj;
  },

  removeUrlFromRoute(rawPath, urlId) {
    const p = normalizePath(rawPath);
    const all = this.getAll();
    if (all[p] && Array.isArray(all[p].urls)) {
      all[p].urls = all[p].urls.filter(u => u.id !== urlId);
      all[p].updatedAt = new Date().toISOString();
      saveData(all);
      return true;
    }
    return false;
  },

  toggleUrlStatus(rawPath, urlId) {
    const p = normalizePath(rawPath);
    const all = this.getAll();
    if (all[p] && Array.isArray(all[p].urls)) {
      const target = all[p].urls.find(u => u.id === urlId);
      if (target) {
        target.enabled = !target.enabled;
        all[p].updatedAt = new Date().toISOString();
        saveData(all);
        return target.enabled;
      }
    }
    return null;
  },

  // Picks one URL randomly from the enabled URLs for a given route, and records hit stats
  selectRandomTarget(rawPath) {
    const p = normalizePath(rawPath);
    const all = this.getAll();
    const route = all[p];
    if (!route || !route.urls || route.urls.length === 0) {
      return null;
    }

    // Filter only enabled URLs
    const activeUrls = route.urls.filter(u => u.enabled !== false);
    if (activeUrls.length === 0) {
      return null;
    }

    // Random selection
    const randomIndex = Math.floor(Math.random() * activeUrls.length);
    const chosen = activeUrls[randomIndex];

    // Increment counters asynchronously
    chosen.hits = (chosen.hits || 0) + 1;
    route.totalHits = (route.totalHits || 0) + 1;
    route.lastHitAt = new Date().toISOString();
    saveData(all);

    return {
      url: chosen.url,
      label: chosen.label,
      totalActive: activeUrls.length
    };
  },

  getStats() {
    const all = this.getAll();
    const routes = Object.values(all);
    const totalRoutes = routes.length;
    let totalUrls = 0;
    let totalHits = 0;

    routes.forEach(r => {
      totalHits += (r.totalHits || 0);
      if (Array.isArray(r.urls)) {
        totalUrls += r.urls.length;
      }
    });

    return {
      totalRoutes,
      totalUrls,
      totalHits
    };
  }
};

module.exports = Store;
