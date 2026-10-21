(() => {
  'use strict';
  document.getElementById('year').textContent = new Date().getFullYear();
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('.smoke');
  const toggle = document.querySelector('.motion-toggle');
  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  let visible = true;
  let frame = 0;
  let lastTime = 0;
  let width = 0;
  let height = 0;

  // Pre-render the soft cloud once so each frame only needs simple image draws.
  const cloud = document.createElement('canvas');
  cloud.width = cloud.height = 256;
  const cloudContext = cloud.getContext('2d');
  if (!context || !cloudContext) return;
  const gradient = cloudContext.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, 'rgba(228, 234, 219, 0.13)');
  gradient.addColorStop(0.35, 'rgba(228, 234, 219, 0.07)');
  gradient.addColorStop(1, 'rgba(228, 234, 219, 0)');
  cloudContext.fillStyle = gradient;
  cloudContext.fillRect(0, 0, 256, 256);
  const particles = Array.from({ length: 14 }, () => ({
    x: Math.random(), y: 0.4 + Math.random() * 0.65,
    size: 0.25 + Math.random() * 0.4,
    speed: 0.003 + Math.random() * 0.009,
    phase: Math.random() * Math.PI * 2,
  }));

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = hero.clientWidth;
    height = hero.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw(time) {
    const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0;
    lastTime = time;
    context.clearRect(0, 0, width, height);
    for (const particle of particles) {
      particle.x -= particle.speed * delta;
      particle.phase += delta * 0.12;
      if (particle.x < -0.6) particle.x = 1.4;
      const size = Math.max(width, height) * particle.size;
      context.drawImage(cloud, particle.x * width - size / 2,
        particle.y * height + Math.sin(particle.phase) * 35 - size / 3, size * 1.9, size);
    }
    frame = requestAnimationFrame(draw);
  }

  function syncAnimation() {
    cancelAnimationFrame(frame);
    lastTime = 0;
    const running = !paused && visible && !document.hidden;
    hero.classList.toggle('motion-paused', !running);
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.title = paused ? 'Play atmospheric effects' : 'Pause atmospheric effects';
    toggle.querySelector('span').textContent = paused ? 'Atmosphere off' : 'Atmosphere on';
    if (running) frame = requestAnimationFrame(draw);
    else context.clearRect(0, 0, width, height);
  }

  toggle.hidden = reducedMotion.matches;
  toggle.addEventListener('click', () => { paused = !paused; syncAnimation(); });
  reducedMotion.addEventListener('change', event => {
    paused = event.matches;
    toggle.hidden = event.matches;
    syncAnimation();
  });
  document.addEventListener('visibilitychange', syncAnimation);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    syncAnimation();
  }).observe(hero);
  new ResizeObserver(resize).observe(hero);
  resize();
  syncAnimation();
})();
