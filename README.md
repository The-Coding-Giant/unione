# Unione

Unione is the shared home for a growing collection of student apps. The homepage introduces the collection with original landscape artwork, drifting mist, and an app directory. It is a small Vite + React site with no backend.

## Files

```text
index.html                         Vite entry (meta tags, fonts, hero preload)
src/main.jsx                       Mounts the app
src/App.jsx                        Page layout
src/components/Hero.jsx            Hero, header, and atmosphere toggle
src/components/Collection.jsx      App directory (featured + upcoming apps)
src/components/About.jsx           "The idea" section
src/components/Footer.jsx          Footer
src/components/Icons.jsx           Shared arrow and brand SVGs
src/hooks/useAtmosphere.js         Smoke canvas and motion controls
src/styles.css                     Responsive homepage styles
public/unione-hero.webp            Original hero artwork (approximately 265 KB)
public/favicon.svg                 Unione icon
public/notesandpapers/index.html   Portable redirect and manual fallback
public/_redirects                  HTTP 302 redirects on Netlify / Cloudflare Pages
docs/hero-artwork.md               Image generation prompt and provenance
```

## Development

```sh
npm install
npm run dev       # local dev server
npm run build     # production build into dist/
npm run preview   # serve dist/ locally
```

Deploy the `dist/` folder to your static host (build command `npm run build`, output directory `dist`). Files in `public/` are copied to `dist/` unchanged.

## App destinations

Notes & Papers links to `/notesandpapers`, which redirects to `https://notesandpapers.dpdns.org/`. Hosts supporting `_redirects` use an HTTP 302. Other static hosts serve `notesandpapers/index.html`, whose JavaScript redirect preserves query parameters and URL fragments, with a meta refresh and manual link as fallbacks. The local Vite servers do not apply `_redirects`, so test the redirect page at `/notesandpapers/` (preview) or `/notesandpapers/index.html` (dev).

The résumé builder, Telegram bots, and tables practice are marked **in the making** because their launch URLs have not been supplied. They are listed in `upcomingApps` in `src/components/Collection.jsx`; the collection count updates from that list. To launch an app, move it into a featured link and add its destination. For an internal redirect path, add a folder with a redirect page under `public/` and corresponding entries in `public/_redirects`.

## Motion and accessibility

The atmosphere control pauses the background drift, CSS mist, and canvas smoke. Reduced-motion preferences disable animations by default. Animation work pauses when the hero leaves the viewport or the tab is hidden. Navigation uses native anchors, visible keyboard focus, and a skip link. Google Fonts are optional; local serif and sans-serif fallbacks are provided.
