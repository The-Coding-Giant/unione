import { Arrow } from './Icons.jsx';

export default function About() {
  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <div className="about-inner wrap">
        <div className="about-intro">
          <p className="eyebrow">THE IDEA BEHIND UNIONE</p>
          <svg className="about-symbol" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path d="M15 22v34a22 22 0 0 0 44 0V22M41 22v34a22 22 0 0 0 44 0V22" stroke="currentColor" strokeWidth="3" />
          </svg>
        </div>
        <div className="about-copy">
          <h2 id="about-title">Different tools.<br /><em>The same idea.</em></h2>
          <p>Student life has a lot of moving parts. Unione brings the useful bits together: a place to prepare for exams, build what’s next, and practise a little every day.</p>
          <p>Each app has its own purpose. Unione is the home they share.</p>
          <a className="text-link" href="#apps">Make yourself at home <span aria-hidden="true"><Arrow /></span></a>
        </div>
      </div>
    </section>
  );
}
