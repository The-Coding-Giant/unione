import { Arrow } from './Icons.jsx';

export default function Footer() {
  return (
    <footer className="footer wrap">
      <a className="wordmark" href="/" aria-label="Unione home">unione<span className="brand-period">.</span></a>
      <p>A growing family of useful little apps.</p>
      <a className="back-top" href="#">Back to the top <span aria-hidden="true"><Arrow direction="up" /></span></a>
      <span className="copyright">© {new Date().getFullYear()} Unione</span>
    </footer>
  );
}
