document.addEventListener('DOMContentLoaded', function () {
  const text = "I'm Md. Imdadul Haque Somik, a problem-solving enthusiast!";
  let index = 0;
  const speed = 40;

  function typeEffect() {
    if (index < text.length) {
      document.getElementById('typing-text').innerHTML += text.charAt(index);
      index++;
      setTimeout(typeEffect, speed);
    }
  }

  typeEffect();

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

  window.addEventListener('scroll', reveal);
  reveal();

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
});
