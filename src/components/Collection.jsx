import { Arrow } from './Icons.jsx';

// To launch an app, move it out of this list into its own featured link and add its redirect.
const upcomingApps = [
  {
    meta: '02 / BUILD',
    title: 'Résumé builder',
    description: 'Your experience deserves a good first impression. A simpler way to put it on paper.',
    footer: 'A new chapter for your career',
    iconClass: 'resume-icon',
    icon: <path d="M13 6h16l8 8v28H13zM29 6v9h8M19 23h12M19 29h12M19 35h7" stroke="currentColor" strokeWidth="1.6" />,
  },
  {
    meta: '03 / CONNECT',
    title: 'Telegram bots',
    description: 'Helpful little companions for student life. Useful tools, right inside your chats.',
    footer: 'A little help, a message away',
    iconClass: 'bot-icon',
    icon: <path d="m7 22 34-14-8 33-11-10-7 7 2-13 18-12-13 18M7 22l10 3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  },
  {
    meta: '04 / PRACTISE',
    title: 'Tables practice',
    description: 'A few minutes. A little practice. Build confidence with multiplication, one table at a time.',
    footer: 'Small steps. Sharper skills.',
    iconClass: 'tables-icon',
    icon: <path d="m11 10 10 10m0-10L11 20M29 15h12M11 34h12m-6-6v12M30 30h11M30 38h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
  },
];

const liveCount = 1;
const pad = number => String(number).padStart(2, '0');

function FeaturedApp() {
  return (
    <a className="featured-app" href="/notesandpapers">
      <div className="paper-scene" aria-hidden="true">
        <span className="scene-label">LESS SEARCHING. MORE STUDYING.</span>
        <div className="paper-sheet sheet-back"></div><div className="paper-sheet sheet-middle"></div>
        <div className="paper-sheet sheet-front">
          <span className="paper-brand">n&amp;p<span>STUDY COLLECTION</span></span>
          <span className="paper-rule"></span>
          <span className="paper-title">A little more<br />prepared.</span>
          <span className="paper-lines"></span>
          <span className="paper-bottom">NOTES / PREVIOUS YEAR PAPERS <span><Arrow /></span></span>
        </div>
        <span className="scene-index">YOUR NEXT STUDY SESSION, SORTED.</span>
      </div>
      <div className="featured-copy">
        <div className="app-meta"><span>01 / LEARN</span><span className="live-badge"><span className="status-dot" aria-hidden="true"></span> LIVE NOW</span></div>
        <h3>Notes &amp; Papers<span className="app-title-dot">.</span></h3>
        <p>The notes you need. The papers you’ve been looking for. Find study material and previous year question papers, all in one place.</p>
        <div className="app-tags"><span>Study notes</span><span>Previous year papers</span></div>
        <div className="featured-link"><span>Open Notes &amp; Papers</span><span className="round-link" aria-hidden="true"><Arrow /></span></div>
      </div>
    </a>
  );
}

function UpcomingApp({ app }) {
  return (
    <article className="upcoming-app">
      <div className="app-meta"><span>{app.meta}</span><span className="coming-label">IN THE MAKING</span></div>
      <div className={`tool-icon ${app.iconClass}`} aria-hidden="true"><svg viewBox="0 0 48 48" fill="none">{app.icon}</svg></div>
      <h3>{app.title}</h3>
      <p>{app.description}</p>
      <span className="upcoming-footer">{app.footer}</span>
    </article>
  );
}

export default function Collection() {
  return (
    <section className="collection wrap" id="apps" aria-labelledby="apps-title">
      <div className="section-top">
        <p className="eyebrow">THE UNIONE COLLECTION</p>
        <span className="collection-count">{pad(liveCount)} live <span aria-hidden="true">/</span> {pad(upcomingApps.length)} in the making</span>
      </div>
      <div className="section-heading">
        <h2 id="apps-title">A few good tools.<br /><em>One familiar place.</em></h2>
        <p>A little help with what’s in front of you.<br />A little room for what comes next.</p>
      </div>
      <FeaturedApp />
      <div className="upcoming-grid">
        {upcomingApps.map(app => <UpcomingApp key={app.title} app={app} />)}
      </div>
      <p className="collection-footnote"><span aria-hidden="true">↳</span> Good things take a little time. More apps will find a home here.</p>
    </section>
  );
}
