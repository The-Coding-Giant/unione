import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Local mirror of public/_redirects, which only the static host reads.
const redirects = {
  '/notesandpapers': 'https://notesandpapers.dpdns.org/',
};

function redirect(req, res, next) {
  const [path, query] = req.url.split('?');
  const target = redirects[path.replace(/\/$/, '')];
  if (!target) return next();
  res.writeHead(302, { Location: target + (query ? `?${query}` : '') });
  res.end();
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-redirects',
      configureServer: server => { server.middlewares.use(redirect); },
      configurePreviewServer: server => { server.middlewares.use(redirect); },
    },
  ],
});
