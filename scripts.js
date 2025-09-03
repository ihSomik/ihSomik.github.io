document.addEventListener('DOMContentLoaded', function () {
  const text = "I'm Md. Imdadul Haque Somik, a problem-solving enthusiast!";
  let index = 0;
  const speed = 40;

  // Typing effect
  function typeEffect() {
    const el = document.getElementById('typing-text');
    if (!el) return;
    if (index < text.length) {
      el.innerHTML += text.charAt(index);
      index++;
      setTimeout(typeEffect, speed);
    }
  }
  typeEffect();

  // Reveal on scroll
  function reveal() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(el => {
      const windowHeight = window.innerHeight;
      const elementTop = el.getBoundingClientRect().top;
      const visible = 100;
      if (elementTop < windowHeight - visible) {
        el.classList.add('visible');
      }
    });
  }

  window.addEventListener('scroll', reveal, { passive: true });
  reveal();

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const active = navLinks.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(active));
    });

    // ✅ Close menu only on mobile (<= 900px)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          navLinks.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', "false");
        }
      });
    });
  }
});
