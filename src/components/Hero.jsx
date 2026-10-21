import { useRef } from 'react';
import { Arrow, BrandMark } from './Icons.jsx';
import useAtmosphere from '../hooks/useAtmosphere.js';

export default function Hero() {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const { reducedMotion, paused, running, togglePaused } = useAtmosphere(heroRef, canvasRef);

  return (
    <section ref={heroRef} className={running ? 'hero' : 'hero motion-paused'} aria-labelledby="hero-title">
      <img className="hero-image" src="/unione-hero.webp" alt="An open book unfolds into a misty mountain landscape in the morning light." width="1983" height="793" fetchPriority="high" />
      <div className="hero-shade" aria-hidden="true"></div>
      <div className="mist" aria-hidden="true"><div className="mist-bank mist-one"></div><div className="mist-bank mist-two"></div></div>
      <canvas ref={canvasRef} className="smoke" aria-hidden="true"></canvas>

      <header className="header wrap">
        <a className="wordmark" href="/" aria-label="Unione home"><BrandMark />unione<span className="brand-period">.</span></a>
        <nav aria-label="Main navigation">
          <a href="#apps">The apps <span aria-hidden="true"><Arrow direction="down-right" /></span></a>
          <a href="#about">The idea</a>
        </nav>
        <a className="header-cta" href="/notesandpapers">Notes &amp; Papers <span aria-hidden="true"><Arrow /></span></a>
      </header>

      <div className="hero-content wrap">
        <p className="eyebrow"><span className="small-star" aria-hidden="true">✳</span> A LITTLE CURIOSITY GOES A LONG WAY</p>
        <h1 id="hero-title">Your next<br /><em>chapter</em> starts here.</h1>
        <p className="hero-description">For the late-night revision. The first résumé.<br />The small things that take you somewhere.</p>
        <a className="button button-cream" href="#apps">Find your next tool <span aria-hidden="true"><Arrow /></span></a>
        <p className="hero-caption">Many little apps. One shared home.</p>
      </div>

      <div className="hero-bottom wrap">
        <a className="scroll-link" href="#apps"><span className="circle-arrow" aria-hidden="true"><Arrow direction="down" /></span> A WORLD TO EXPLORE</a>
        <div className="hero-note"><span className="status-dot" aria-hidden="true"></span> Made for the everyday student.</div>
        <button
          className="motion-toggle"
          type="button"
          title={paused ? 'Play atmospheric effects' : 'Pause atmospheric effects'}
          aria-pressed={paused}
          hidden={reducedMotion}
          onClick={togglePaused}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path className="pause-symbol" d="M5 3v10M11 3v10" stroke="currentColor" strokeWidth="2" />
            <path className="play-symbol" d="m5 3 8 5-8 5Z" fill="currentColor" />
          </svg>
          <span>{paused ? 'Atmosphere off' : 'Atmosphere on'}</span>
        </button>
      </div>
    </section>
  );
}
