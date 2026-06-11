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

  // ── page title ──
  document.title = `${project.title} — Ikon.dev`;

  // ── meta ──
  const meta = document.getElementById('project-meta');
  meta.innerHTML = `
    <div class="project-id">${project.id} · ${project.area}</div>
    <h1 class="project-title">${project.title}</h1>
    <div class="project-tags">
      ${project.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}
    </div>
  `;

  // ── overview ──
  document.getElementById('overview-text').textContent = project.overview || project.description;

  // ── phases (multi-phase builds) ──
  if (project.phases && project.phases.length) {
    const phasesSection = document.getElementById('project-phases');
    phasesSection.style.display = 'block';
    const container = document.getElementById('phases-container');
    container.innerHTML = project.phases.map(phase => `
      <div class="phase-block">
        <div class="phase-label">${phase.label}</div>
        <div class="how-steps">
          ${phase.steps.map((step, i) => `
            <div class="how-step">
              <span class="step-number">0${i + 1}</span>
              <p class="step-text">${step}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } else if (project.how_it_works && project.how_it_works.length) {
    // ── single phase how it works ──
    const howSection = document.getElementById('project-how');
    howSection.style.display = 'block';
    document.getElementById('how-steps').innerHTML = project.how_it_works.map((step, i) => `
      <div class="how-step">
        <span class="step-number">0${i + 1}</span>
        <p class="step-text">${step}</p>
      </div>
    `).join('');
  }

  // ── tools ──
  const toolsGrid = document.getElementById('tools-grid');
  project.tags.forEach(t => {
    const el = document.createElement('div');
    el.className = 'tool-item';
    el.textContent = t;
    toolsGrid.appendChild(el);
  });

  // ── use cases ──
  if (project.use_cases && project.use_cases.length) {
    const usecasesSection = document.getElementById('project-usecases');
    usecasesSection.style.display = 'block';
    const grid = document.getElementById('usecases-grid');
    grid.innerHTML = project.use_cases.map(uc => `
      <div class="usecase-card">
        <div class="usecase-title">${uc.title}</div>
        <div class="usecase-desc">${uc.desc}</div>
      </div>
    `).join('');
  }

  // ── learnings ──
  document.getElementById('learnings-text').textContent = project.learnings ||
    'Learnings and process notes coming soon.';

  // ── next project ──
  const currentIndex = projects.findIndex(p => p.id === projectId);
  const next = projects[(currentIndex + 1) % projects.length];
  const nextLink = document.getElementById('next-link');
  nextLink.textContent = `${next.id} — ${next.title} →`;
  nextLink.href = `./project.html?id=${next.id}`;

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