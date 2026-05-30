// ── page entrance animations ──
gsap.to('.page-title', {
  opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.2
});

gsap.to('.about-lead', {
  opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.4
});

// ── about blocks scroll animation ──
gsap.to('.about-block', {
  opacity: 1,
  y: 0,
  duration: 0.5,
  ease: 'power2.out',
  stagger: 0.1,
  scrollTrigger: {
    trigger: '.about-grid',
    start: 'top 80%',
  }
});

// ── stack items scroll animation ──
gsap.registerPlugin(ScrollTrigger);

gsap.to('.stack-item', {
  opacity: 1,
  y: 0,
  duration: 0.4,
  ease: 'power2.out',
  stagger: 0.05,
  scrollTrigger: {
    trigger: '.stack-grid',
    start: 'top 85%',
  }
});

// ── cta animation ──
gsap.to('.cta-title', {
  opacity: 1,
  y: 0,
  duration: 0.6,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.about-cta',
    start: 'top 80%',
  }
});

gsap.to('.cta-sub', {
  opacity: 1,
  y: 0,
  duration: 0.5,
  ease: 'power2.out',
  delay: 0.1,
  scrollTrigger: {
    trigger: '.about-cta',
    start: 'top 80%',
  }
});

// close nav when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});
