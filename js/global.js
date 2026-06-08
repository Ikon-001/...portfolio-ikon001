// ── navbar scroll ──
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── custom cursor ──
{
  const cursor = document.createElement('div');
  cursor.classList.add('cursor');
  document.body.appendChild(cursor);

  const cursorDot = document.createElement('div');
  cursorDot.classList.add('cursor-dot');
  document.body.appendChild(cursorDot);

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  function animateCursor() {
    dotX += (mouseX - dotX) * 0.12;
    dotY += (mouseY - dotY) * 0.12;
    cursor.style.transform = `translate(${dotX}px, ${dotY}px)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const hoverables = document.querySelectorAll(
    'a, button, .project-card, .area-tile, .filter-btn'
  );

  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
  });
}

// ── page transitions ──
{
  const overlay = document.createElement('div');
  overlay.classList.add('page-transition');
  document.body.appendChild(overlay);

  // page enter
  // page enter — handles both normal load and back/forward
window.addEventListener('pageshow', () => {
  gsap.fromTo(overlay,
    { scaleY: 1, transformOrigin: 'top' },
    { scaleY: 0, duration: 0.3, ease: 'power2.out', delay: 0.05 }
  );
});

  // page exit
  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');

    if (!href || href.startsWith('http') || href.startsWith('mailto')
      || href.startsWith('#') || href.startsWith('tel')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      gsap.fromTo(overlay,
        { scaleY: 0, transformOrigin: 'bottom' },
        {
          scaleY: 1,
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => {
            window.location.href = href;
          }
        }
      );
    });
  });
}

// ── mobile nav ──
{
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('open');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
      });
    });
  }
}