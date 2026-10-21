import { useEffect, useRef, useState } from 'react';

const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

// Pre-render the soft cloud once so each frame only needs simple image draws.
function createCloud() {
  const cloud = document.createElement('canvas');
  cloud.width = cloud.height = 256;
  const cloudContext = cloud.getContext('2d');
  if (!cloudContext) return null;
  const gradient = cloudContext.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(228, 234, 219, 0.13)');
  gradient.addColorStop(0.35, 'rgba(228, 234, 219, 0.07)');
  gradient.addColorStop(1, 'rgba(228, 234, 219, 0)');
  cloudContext.fillStyle = gradient;
  cloudContext.fillRect(0, 0, 256, 256);
  return cloud;
}

function createParticles() {
  return Array.from({ length: 14 }, () => ({
    x: Math.random(), y: 0.4 + Math.random() * 0.65,
    size: 0.25 + Math.random() * 0.4,
    speed: 0.003 + Math.random() * 0.009,
    phase: Math.random() * Math.PI * 2,
  }));
}

// Drives the hero's drifting smoke canvas and the CSS mist / background drift.
// Animation pauses when the user asks, prefers reduced motion, scrolls the hero
// out of view, or hides the tab.
export default function useAtmosphere(heroRef, canvasRef) {
  const [reducedMotion, setReducedMotion] = useState(reducedMotionQuery.matches);
  const [paused, setPaused] = useState(reducedMotionQuery.matches);
  const [visible, setVisible] = useState(true);
  const [pageHidden, setPageHidden] = useState(document.hidden);
  const size = useRef({ width: 0, height: 0 });
  const smoke = useRef(null);
  const running = !paused && visible && !pageHidden;

  useEffect(() => {
    const onChange = event => {
      setReducedMotion(event.matches);
      setPaused(event.matches);
    };
    const onVisibility = () => setPageHidden(document.hidden);
    reducedMotionQuery.addEventListener('change', onChange);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      reducedMotionQuery.removeEventListener('change', onChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = hero.clientWidth;
      const height = hero.clientHeight;
      size.current = { width, height };
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    const intersection = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting));
    const resizer = new ResizeObserver(resize);
    intersection.observe(hero);
    resizer.observe(hero);
    resize();
    return () => {
      intersection.disconnect();
      resizer.disconnect();
    };
  }, [heroRef, canvasRef]);

  useEffect(() => {
    if (!running) return;
    const context = canvasRef.current.getContext('2d');
    smoke.current ??= { cloud: createCloud(), particles: createParticles() };
    const { cloud, particles } = smoke.current;
    if (!context || !cloud) return;
    let frame = 0;
    let lastTime = 0;

    function draw(time) {
      const { width, height } = size.current;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
      lastTime = time;
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.x -= particle.speed * delta;
        particle.phase += delta * 0.12;
        if (particle.x < -0.6) particle.x = 1.4;
        const particleSize = Math.max(width, height) * particle.size;
        context.drawImage(cloud, particle.x * width - particleSize / 2,
          particle.y * height + Math.sin(particle.phase) * 35 - particleSize / 3, particleSize * 1.9, particleSize);
      }
      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      context.clearRect(0, 0, size.current.width, size.current.height);
    };
  }, [running, canvasRef]);

  return { reducedMotion, paused, running, togglePaused: () => setPaused(value => !value) };
}
