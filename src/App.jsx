import Hero from './components/Hero.jsx';
import Collection from './components/Collection.jsx';
import About from './components/About.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#apps">Skip to the apps</a>
      <main>
        <Hero />
        <Collection />
        <About />
      </main>
      <Footer />
    </>
  );
}
