// ── register ScrollTrigger ──
gsap.registerPlugin(ScrollTrigger);

// ── hero tag cycling ──
const areas = ['Automation', 'Dev', 'Design', 'Visuals', 'Prompt eng.'];
const tagText = document.querySelector('.tag-text');
let current = 0;

function cycleTag() {
  gsap.to(tagText, {
    opacity: 0,
    y: -8,
    duration: 0.3,
    onComplete: () => {
      current = (current + 1) % areas.length;
      tagText.textContent = areas[current];
      gsap.fromTo(tagText,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3 }
      );
    }
  });
}

setInterval(cycleTag, 2000);

// ── hero entrance animation ──
const heroTl = gsap.timeline({ delay: 0.2 });

heroTl
  .to('.hero-tag', {
    opacity: 1, y: 0, duration: 0.6, ease: 'power2.out'
  })
  .to('.hero-name', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power2.out'
  }, '-=0.3')
  .to('.hero-sub', {
    opacity: 1, y: 0, duration: 0.6, ease: 'power2.out'
  }, '-=0.3')
  .to('.hero-btns', {
    opacity: 1, y: 0, duration: 0.5, ease: 'power2.out'
  }, '-=0.3')
  .to('.hero-scroll', {
    opacity: 1, y: 0, duration: 0.5, ease: 'power2.out'
  }, '-=0.2');

// ── area tiles scroll animation ──
gsap.to('.area-tile', {
  opacity: 1,
  y: 0,
  duration: 0.5,
  ease: 'power2.out',
  stagger: 0.08,
  scrollTrigger: {
    trigger: '.areas-grid',
    start: 'top 80%',
  }
});

// ── featured projects render ──
function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid || typeof projects === 'undefined') return;

  const featured = projects.slice(0, 3);

  featured.forEach(p => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="card-id">${p.id} · ${p.area}</div>
      <div class="card-title">${p.title}</div>
      <div class="card-desc">${p.description}</div>
      <div class="card-tags">
        ${p.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
      </div>
    `;
    card.addEventListener('click', () => {
      window.location.href = `project.html?id=${p.id}`;
    });
    grid.appendChild(card);
  });
}

renderFeatured();

// ── project cards scroll animation ──
gsap.to('.project-card', {
  opacity: 1,
  y: 0,
  duration: 0.5,
  ease: 'power2.out',
  stagger: 0.1,
  scrollTrigger: {
    trigger: '.projects-grid',
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
