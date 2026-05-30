// ── get project id from URL ──
const params = new URLSearchParams(window.location.search);
const projectId = params.get('id');

// ── find project in data ──
const project = projects.find(p => p.id === projectId);

if (!project) {
  document.querySelector('.project-hero').innerHTML = `
    <div style="padding: 160px 48px;">
      <a href="work.html" style="font-size:13px;color:#999;">← Back to work</a>
      <h1 style="margin-top:32px;font-size:32px;font-weight:700;">Project not found.</h1>
    </div>
  `;
} else {

  // ── set page title ──
  document.title = `${project.title} — Ikon.dev`;

  // ── populate meta ──
  const meta = document.getElementById('project-meta');
  meta.innerHTML = `
    <div class="project-id">${project.id} · ${project.area}</div>
    <h1 class="project-title">${project.title}</h1>
    <div class="project-tags">
      ${project.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
    </div>
  `;

  // ── overview ──
  document.getElementById('overview-text').textContent = project.description;

  // ── tools ──
  const toolsGrid = document.getElementById('tools-grid');
  project.tags.forEach(t => {
    const el = document.createElement('div');
    el.className = 'tool-item';
    el.textContent = t;
    toolsGrid.appendChild(el);
  });

  // ── learnings (placeholder until you add to projects.js) ──
  const learnings = project.learnings ||
    'Learnings and process notes coming soon.';
  document.getElementById('learnings-text').textContent = learnings;

  // ── next project ──
  const currentIndex = projects.findIndex(p => p.id === projectId);
  const next = projects[(currentIndex + 1) % projects.length];
  const nextLink = document.getElementById('next-link');
  nextLink.textContent = `${next.id} — ${next.title} →`;
  nextLink.href = `project.html?id=${next.id}`;

  // ── animations ──
  gsap.to('.project-meta', {
    opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.3
  });

  gsap.to('.project-section', {
    opacity: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
    stagger: 0.12,
    delay: 0.5
  });
}

// close nav when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});
