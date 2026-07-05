document.addEventListener('DOMContentLoaded', function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle (dark / light) ---------- */
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }

  function getStoredTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }

  function storeTheme(theme) {
    try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
  }

  const savedTheme = getStoredTheme();
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      storeTheme(next);
    });
  }

  /* ---------- Terminal typing sequence ---------- */
  const termLines = [
    { type: 'cmd', text: 'whoami' },
    { type: 'out', text: 'Md. Imdadul Haque Somik — exploring AI & ML' },
    { type: 'cmd', text: 'cat journal.md' },
    { type: 'out', text: 'Still learning: deep learning, computer vision, and how to ship real things' },
    { type: 'cmd', text: './status --current' },
    { type: 'out', text: 'Learning at FlyRank AI · 800+ problems along the way' },
  ];

  const termEl = document.getElementById('terminal-body');

  function renderStatic() {
    if (!termEl) return;
    termEl.innerHTML = termLines
      .map(l => l.type === 'cmd'
        ? `<span class="prompt">$</span> ${l.text}`
        : `<span class="out">${l.text}</span>`)
      .join('\n');
  }

  function typeTerminal() {
    if (!termEl) return;
    let lineIndex = 0;
    let charIndex = 0;
    termEl.setAttribute('aria-hidden', 'false');

    function step() {
      if (lineIndex >= termLines.length) {
        termEl.insertAdjacentHTML('beforeend', '<span class="cursor"></span>');
        return;
      }
      const line = termLines[lineIndex];
      const prefix = line.type === 'cmd' ? '<span class="prompt">$</span> ' : '<span class="out">';
      const suffix = line.type === 'cmd' ? '' : '</span>';

      if (charIndex === 0) {
        termEl.insertAdjacentHTML('beforeend', prefix + '<span class="typed-' + lineIndex + '"></span>' + suffix);
      }

      const holder = termEl.querySelector('.typed-' + lineIndex);
      if (charIndex < line.text.length) {
        holder.textContent += line.text.charAt(charIndex);
        charIndex++;
        setTimeout(step, line.type === 'cmd' ? 55 : 12);
      } else {
        termEl.insertAdjacentHTML('beforeend', '\n');
        lineIndex++;
        charIndex = 0;
        setTimeout(step, line.type === 'cmd' ? 260 : 180);
      }
    }
    step();
  }

  if (reduceMotion) {
    renderStatic();
  } else {
    typeTerminal();
  }

  /* ---------- Animated stat counters ---------- */
  const statEls = document.querySelectorAll('.stat-value[data-count]');

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const hasPlus = el.textContent.includes('+');
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(target * progress);
      el.textContent = value + (hasPlus ? '+' : '');
      if (progress < 1) requestAnimationFrame(tick);
    }
    if (reduceMotion) {
      el.textContent = target + (hasPlus ? '+' : '');
    } else {
      requestAnimationFrame(tick);
    }
  }

  const statObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statEls.forEach(el => statObserver.observe(el));

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- Geometric shapes background (hero) ---------- */
  (function geoBackground() {
    const canvas = document.getElementById('geo-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const heroSection = canvas.closest('.hero');

    const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    let accent = cssVar('--accent') || '#3B4CCA';
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let shapes = [];
    let rafId = null;
    let running = false;

    // Keep the shape count small so this stays cheap to render.
    const SHAPE_COUNT = 7;
    const TYPES = ['triangle', 'square', 'hexagon', 'ring'];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    function makeShape(i) {
      return {
        type: TYPES[i % TYPES.length],
        x: rand(0, w),
        y: rand(0, h),
        size: rand(18, 46),
        rotation: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.0025, 0.0025),
        vx: rand(-0.12, 0.12),
        vy: rand(-0.08, 0.08),
        alpha: rand(0.14, 0.32)
      };
    }

    function resize() {
      const rect = heroSection.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawShape(s) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.strokeStyle = accent;
      ctx.globalAlpha = s.alpha;
      ctx.lineWidth = 1.4;

      const r = s.size / 2;
      ctx.beginPath();
      if (s.type === 'triangle') {
        for (let i = 0; i < 3; i++) {
          const a = (Math.PI * 2 / 3) * i - Math.PI / 2;
          const px = Math.cos(a) * r, py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else if (s.type === 'square') {
        ctx.rect(-r, -r, r * 2, r * 2);
      } else if (s.type === 'hexagon') {
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI * 2 / 6) * i;
          const px = Math.cos(a) * r, py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else {
        ctx.arc(0, 0, r, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.restore();
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      shapes.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.rotSpeed;

        // Wrap around edges instead of bouncing, keeps motion feeling continuous.
        const pad = s.size;
        if (s.x < -pad) s.x = w + pad;
        if (s.x > w + pad) s.x = -pad;
        if (s.y < -pad) s.y = h + pad;
        if (s.y > h + pad) s.y = -pad;

        drawShape(s);
      });
      rafId = requestAnimationFrame(step);
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      shapes.forEach(drawShape);
    }

    function start() {
      resize();
      shapes = Array.from({ length: SHAPE_COUNT }, (_, i) => makeShape(i));
      if (reduceMotion) {
        drawStatic();
      } else if (!running) {
        running = true;
        step();
      }
    }

    function stop() {
      if (rafId) cancelAnimationFrame(rafId);
      running = false;
    }

    // Pause animation off-screen or on a hidden tab to save CPU.
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (reduceMotion) return;
        if (entry.isIntersecting) {
          if (!running) { running = true; step(); }
        } else {
          stop();
        }
      });
    }, { threshold: 0 });
    io.observe(heroSection);

    document.addEventListener('visibilitychange', () => {
      if (reduceMotion) return;
      if (document.hidden) stop();
      else if (!running) { running = true; step(); }
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); if (reduceMotion) drawStatic(); }, 150);
    });

    // Re-tint shapes when the theme toggle updates the accent color.
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        accent = cssVar('--accent') || accent;
        if (reduceMotion) drawStatic();
      });
    }

    start();
  })();

  /* ---------- Mobile menu toggle ---------- */
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const active = navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(active));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          navLinks.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
});
