gsap.registerPlugin(ScrollTrigger);

// ── page header ──
gsap.fromTo('.page-title',
  { opacity: 0, y: 30 },
  { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.2 }
);

gsap.fromTo('.page-sub',
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.4 }
);

gsap.fromTo('.filters',
  { opacity: 0, y: 16 },
  { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: 0.5 }
);

// ── render projects ──
function renderProjects(filter = 'all') {
  const grid = document.getElementById('work-grid');
  const empty = document.getElementById('empty-state');
  grid.innerHTML = '';

  const filtered = filter === 'all'
    ? projects
    : projects.filter(p => p.area === filter);

  if (filtered.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  filtered.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.opacity = '0';
    card.style.transform = 'translateY(24px)';
    card.innerHTML = `
      <div class="card-id">${p.id} · ${p.area}</div>
      <div class="card-title">${p.title}</div>
      <div class="card-desc">${p.description}</div>
      <div class="card-tags">
        ${p.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
      </div>
    `;
    card.addEventListener('click', () => {
      window.location.href = `./project.html?id=${p.id}`;
    });
    grid.appendChild(card);

    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
      delay: i * 0.07
    });
  });
}

// ── filter buttons ──
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProjects(btn.dataset.filter);
  });
});

// ── URL param ──
const params = new URLSearchParams(window.location.search);
const areaParam = params.get('area');

if (areaParam) {
  const matchBtn = [...filterBtns].find(b => b.dataset.filter === areaParam);
  if (matchBtn) {
    filterBtns.forEach(b => b.classList.remove('active'));
    matchBtn.classList.add('active');
    renderProjects(areaParam);
  } else {
    renderProjects('all');
  }
} else {
  renderProjects('all');
}
