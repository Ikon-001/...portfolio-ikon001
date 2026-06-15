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

// ── theme engine ──
{
  const overlay = document.getElementById('theme-overlay');

  const THEME_BGS = {
    default:      '#0a0a0a',
    automation:   '#0a0a0a',
    dev:          '#1e1e1e',
    design:       '#faf5f0',
    visuals:      '#0d0b09',
    'ai-systems': '#0f0f0f'
  };

  let lockedTheme   = 'default';
  let lockedCard    = null;
  let isExpanding   = false;
  let expansionTween = null;
  let currentOrigin = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let repaintTargets = [];
  const state = { radius: 0 };

  function getMaxRadius(ox, oy) {
    return Math.max(
      Math.hypot(ox, oy),
      Math.hypot(window.innerWidth - ox, oy),
      Math.hypot(ox, window.innerHeight - oy),
      Math.hypot(window.innerWidth - ox, window.innerHeight - oy)
    );
  }

  function buildRepaintTargets(ox, oy) {
    const selectors = [
      '.hero-tag', '.hero-name', '.hero-sub', '.hero-btns',
      '.hero-scroll', '.area-tile', '.section-label',
      '.section-title', '.navbar', '.nav-logo', '.nav-links',
      '.project-card', '.view-all', '.about-inner',
      '.footer-copy', '.footer-links'
    ];
    repaintTargets = [];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(cx - ox, cy - oy);
        repaintTargets.push({ el, dist, repainted: false });
      });
    });
    repaintTargets.sort((a, b) => a.dist - b.dist);
  }

  function updateClip() {
    if (!overlay) return;
    overlay.style.clipPath = `circle(${state.radius}px at ${currentOrigin.x}px ${currentOrigin.y}px)`;

    // progressive repaint — flash each element as wave reaches it
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
    const ox = rect.left + rect.width / 2;
    const oy = rect.top + rect.height / 2;
    currentOrigin = { x: ox, y: oy };

    const maxRadius = getMaxRadius(ox, oy);

    overlay.style.background = THEME_BGS[theme] || THEME_BGS.default;
    document.body.setAttribute('data-theme', theme);
    buildRepaintTargets(ox, oy);

    if (window._setCanvasTheme) window._setCanvasTheme(theme);
    if (expansionTween) expansionTween.kill();

    state.radius = 0;
    isExpanding   = true;

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
  }

  // tile listeners — homepage only
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

  // work page — set theme from URL
  const urlParams = new URLSearchParams(window.location.search);
  const urlArea   = urlParams.get('area');
  if (urlArea && !overlay) {
    document.body.setAttribute('data-theme', urlArea);
  }

  window._currentTheme = () => lockedTheme;
}

  // hover on area tiles
  document.querySelectorAll('.area-tile').forEach(tile => {
    const area = tile.dataset.area;
    if (!area) return;

    tile.addEventListener('mouseenter', () => {
      if (resetTimer) clearTimeout(resetTimer);
      setTheme(area);
    });

    tile.addEventListener('mouseleave', () => {
      resetTimer = setTimeout(() => {
        setTheme('default');
      }, 300);
    });
  });

  // set theme from URL on work page
  const params = new URLSearchParams(window.location.search);
  const areaParam = params.get('area');
  if (areaParam) setTheme(areaParam);

  // expose for canvas
  window._currentTheme = () => currentTheme;
