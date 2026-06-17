// ── navbar scroll state ──
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
 
  window.addEventListener('pageshow', () => {
    gsap.fromTo(overlay,
      { scaleY: 1, transformOrigin: 'top' },
      { scaleY: 0, duration: 0.3, ease: 'power2.out', delay: 0.05 }
    );
  });
 
  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto')
      || href.startsWith('#') || href.startsWith('tel')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      gsap.fromTo(overlay,
        { scaleY: 0, transformOrigin: 'bottom' },
        { scaleY: 1, duration: 0.25, ease: 'power2.in',
          onComplete: () => { window.location.href = href; }
        }
      );
    });
  });
}
 
// ── mobile nav ──
{
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
 
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
 
// ════════════════════════════════════
// ── THEME ENGINE ──
// ════════════════════════════════════
{
  const overlay = document.getElementById('theme-overlay');
 
  const THEME_BGS = {
    default:      '#0a0a0a',
    automation:   '#0a0a0a',
    dev:          '#1e1e1e',
    design:       '#0a0a0a',
    'ai-systems': '#0f0f0f'
  };
 
  let lockedTheme    = 'default';
  let lockedCard     = null;
  let isExpanding    = false;
  let expansionTween = null;
  let currentOrigin  = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let repaintTargets = [];
  const state        = { radius: 0 };
 
  // ── injected world elements ──
  let trustIndexEl  = null;
  let automationLog = null;
  let terminalPrompt = null;
 
  function ensureWorldElements() {
    // AI Systems — trust index
    if (!trustIndexEl) {
      trustIndexEl = document.createElement('div');
      trustIndexEl.className = 'ai-trust-index';
      trustIndexEl.innerHTML = `TRUST IDX <span id="trust-val">0.87</span>`;
      document.body.appendChild(trustIndexEl);
      animateTrustIndex();
    }
 
    // Automation — execution log
    if (!automationLog) {
      automationLog = document.createElement('div');
      automationLog.className = 'automation-log';
      automationLog.innerHTML = `
        <div class="automation-log-title">● workflow running — A01</div>
        <div class="automation-log-line" id="log-line">initializing...</div>
      `;
      document.body.appendChild(automationLog);
      startAutomationLog();
    }
 
    // Dev — terminal prompt in footer
    if (!terminalPrompt) {
      const footer = document.querySelector('.footer');
      if (footer) {
        terminalPrompt = document.createElement('div');
        terminalPrompt.className = 'dev-terminal-prompt';
        terminalPrompt.innerHTML = `gideon@ikon:~$ building in public <span class="prompt-cursor">▌</span>`;
        footer.appendChild(terminalPrompt);
      }
    }
  }
 
  function animateTrustIndex() {
    if (!trustIndexEl) return;
    const valEl = document.getElementById('trust-val');
    if (!valEl) return;
    setInterval(() => {
      const v = (0.82 + Math.random() * 0.14).toFixed(2);
      valEl.textContent = v;
    }, 3000);
  }
 
  const LOG_LINES = [
    '✓ webhook trigger fired',
    '✓ data logged to sheets',
    '✓ confirmation email sent',
    '⏳ sleep module: 3h remaining',
    '? checking sent folder...',
    '✓ no reply found',
    '✓ follow-up queued',
    '↻ restarting pipeline...',
  ];
  let logIdx = 0;
 
  function startAutomationLog() {
    setInterval(() => {
      if (!automationLog) return;
      const line = document.getElementById('log-line');
      if (!line) return;
      logIdx = (logIdx + 1) % LOG_LINES.length;
      line.style.opacity = '0';
      setTimeout(() => {
        line.textContent = LOG_LINES[logIdx];
        line.style.opacity = '1';
        line.style.transition = 'opacity 0.3s ease';
      }, 200);
    }, 2000);
  }
 
  // ── card status badges ──
  function injectStatusBadges(theme) {
    document.querySelectorAll('.project-card').forEach(card => {
      const existing = card.querySelector('.card-status');
      if (existing) existing.remove();
    });
 
    if (theme !== 'automation' && theme !== 'dev' && theme !== 'ai-systems') return;
 
    const STATUS_MAP = {
      automation: { A01: '● DEPLOYED', A02: '● DEPLOYED', A03: '● DEPLOYED' },
      dev:        { DEV01: '● STAGING', DEV02: '● IN_PROGRESS', A01: '● DEPLOYED' },
      'ai-systems': { DEV02: '● IN_PROGRESS', A01: '● DEPLOYED' }
    };
 
    const map = STATUS_MAP[theme] || {};
 
    document.querySelectorAll('.project-card').forEach(card => {
      const idEl = card.querySelector('.card-id');
      if (!idEl) return;
      const rawId = idEl.textContent.split('·')[0].trim()
        .replace('/* ', '').replace(' */', '').trim();
 
      const status = map[rawId];
      if (!status) return;
 
      const badge = document.createElement('div');
      badge.className = 'card-status';
      badge.innerHTML = `<span class="card-status-dot"></span>${status}`;
      card.appendChild(badge);
    });
  }
 
  // ── design manifesto ──
  function injectDesignManifesto() {
    if (document.querySelector('.design-manifesto')) return;
    const featured = document.querySelector('.featured');
    if (!featured) return;
    const quote = document.createElement('p');
    quote.className = 'design-manifesto';
    quote.textContent = '"The work should feel considered enough to trust, and specific enough to remember."';
    featured.parentNode.insertBefore(quote, featured);
  }
 
  // ── getMaxRadius ──
  function getMaxRadius(ox, oy) {
    return Math.max(
      Math.hypot(ox, oy),
      Math.hypot(window.innerWidth - ox, oy),
      Math.hypot(ox, window.innerHeight - oy),
      Math.hypot(window.innerWidth - ox, window.innerHeight - oy)
    );
  }
 
  // ── repaint targets ──
  function buildRepaintTargets(ox, oy) {
    const selectors = [
      '.hero-tag', '.hero-name', '.hero-sub', '.hero-btns',
      '.hero-scroll', '.hero-photo-wrap', '.area-tile',
      '.section-label', '.section-title', '.navbar', '.nav-logo',
      '.nav-links', '.project-card', '.view-all', '.stack-item',
      '.timeline-item', '.cta-title', '.footer-logo',
      '.footer-copy', '.footer-links', '.footer-nav', '.footer-socials'
    ];
    repaintTargets = [];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const rect = el.getBoundingClientRect();
        const cx   = rect.left + rect.width  / 2;
        const cy   = rect.top  + rect.height / 2;
        const dist = Math.hypot(cx - ox, cy - oy);
        repaintTargets.push({ el, dist, repainted: false });
      });
    });
    repaintTargets.sort((a, b) => a.dist - b.dist);
  }
 
  function updateClip() {
    if (!overlay) return;
    overlay.style.clipPath = `circle(${state.radius}px at ${currentOrigin.x}px ${currentOrigin.y}px)`;
    repaintTargets.forEach(t => {
      if (!t.repainted && state.radius >= t.dist) {
        t.repainted = true;
        t.el.classList.remove('wave-hit');
        void t.el.offsetWidth;
        t.el.classList.add('wave-hit');
      }
    });
  }
 
  function startExpansion(theme, card) {
    if (!overlay) return;
    const rect = card.getBoundingClientRect();
    const ox   = rect.left + rect.width  / 2;
    const oy   = rect.top  + rect.height / 2;
    currentOrigin = { x: ox, y: oy };
 
    const maxRadius = getMaxRadius(ox, oy);
    overlay.style.background = THEME_BGS[theme] || THEME_BGS.default;
    document.body.setAttribute('data-theme', theme);
    buildRepaintTargets(ox, oy);
 
    if (window._setCanvasTheme) window._setCanvasTheme(theme);
    if (expansionTween) expansionTween.kill();
 
    state.radius = 0;
    isExpanding  = true;
 
    expansionTween = gsap.to(state, {
      radius: maxRadius,
      duration: 1.0,
      ease: 'power2.out',
      onUpdate: updateClip,
      onComplete: () => {
        isExpanding = false;
        lockTheme(theme, card);
      }
    });
  }
 
  function retreat() {
    if (!overlay) return;
    if (expansionTween) expansionTween.kill();
    isExpanding = false;
 
    document.body.setAttribute('data-theme', lockedTheme);
    repaintTargets.forEach(t => t.el.classList.remove('wave-hit'));
    if (window._setCanvasTheme) window._setCanvasTheme(lockedTheme);
 
    gsap.to(state, {
      radius: 0,
      duration: 0.45,
      ease: 'power2.in',
      onUpdate: updateClip,
      onComplete: () => {
        state.radius = 0;
        overlay.style.clipPath = `circle(0px at ${currentOrigin.x}px ${currentOrigin.y}px)`;
      }
    });
  }
 
  function lockTheme(theme, card) {
    lockedTheme = theme;
    document.body.setAttribute('data-theme', theme);
 
    if (overlay) {
      overlay.style.clipPath = `circle(200vmax at ${currentOrigin.x}px ${currentOrigin.y}px)`;
    }
 
    document.querySelectorAll('.area-tile').forEach(t => t.classList.remove('theme-locked'));
    if (card) {
      card.classList.add('theme-locked');
      lockedCard = card;
    }
 
    // world-specific injections on lock
    ensureWorldElements();
    injectStatusBadges(theme);
    if (theme === 'design') injectDesignManifesto();
  }
 
  // ── tile listeners (homepage only) ──
  if (overlay) {
    document.querySelectorAll('.area-tile').forEach(tile => {
      const area = tile.dataset.area;
      if (!area || tile.classList.contains('area-parked')) return;
 
      tile.addEventListener('mouseenter', () => startExpansion(area, tile));
 
      tile.addEventListener('mouseleave', () => {
        if (isExpanding) {
          retreat();
        } else {
          if (window._setCanvasTheme) window._setCanvasTheme(lockedTheme);
        }
      });
    });
  }
 
  // ── work page: set theme from URL ──
  const urlParams = new URLSearchParams(window.location.search);
  const urlArea   = urlParams.get('area');
  if (urlArea && !overlay) {
    document.body.setAttribute('data-theme', urlArea);
  }
 
  window._currentTheme = () => lockedTheme;
}
