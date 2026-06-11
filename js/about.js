gsap.registerPlugin(ScrollTrigger);

// ── page entrance ──
gsap.fromTo('.page-title',
  { opacity: 0, y: 30 },
  { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.2 }
);

gsap.fromTo('.about-lead',
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.4 }
);

// ── about blocks — alternating sides ──
document.querySelectorAll('.about-block').forEach((block, i) => {
  gsap.fromTo(block,
    { opacity: 0, x: i % 2 === 0 ? -24 : 24 },
    {
      opacity: 1,
      x: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: block,
        start: 'top 85%'
      }
    }
  );
});

// ── stack items ──
gsap.fromTo('.stack-item',
  { opacity: 0, y: 12 },
  {
    opacity: 1,
    y: 0,
    duration: 0.4,
    ease: 'power2.out',
    stagger: 0.04,
    scrollTrigger: {
      trigger: '.stack-grid',
      start: 'top 85%'
    }
  }
);

// ── cta ──
gsap.fromTo('.cta-title',
  { opacity: 0, y: 20 },
  {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.about-cta', start: 'top 80%' }
  }
);

gsap.fromTo('.cta-sub',
  { opacity: 0, y: 16 },
  {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
    delay: 0.1,
    scrollTrigger: { trigger: '.about-cta', start: 'top 80%' }
  }
);