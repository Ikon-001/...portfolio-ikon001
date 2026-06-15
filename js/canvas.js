(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── state ──
  let currentState    = 'default';
  let targetState     = 'default';
  let transitionAlpha = 1;
  const FADE_SPEED    = 0.03;

  window._setCanvasTheme = (theme) => { targetState = theme; };

  // ── theme colors ──
  const THEME_COLORS = {
    default:      { r: '232, 180, 83',   s: '240, 237, 232' },
    automation:   { r: '255, 109, 53',   s: '240, 237, 232' },
    dev:          { r: '78, 201, 176',   s: '212, 212, 212' },
    design:       { r: '192, 132, 160',  s: '42, 31, 40'    },
    visuals:      { r: '200, 168, 130',  s: '232, 224, 216' },
    'ai-systems': { r: '232, 180, 83',   s: '240, 237, 232' },
  };

  function gc(alpha, type = 'r') {
    const t = THEME_COLORS[currentState] || THEME_COLORS.default;
    return `rgba(${t[type]}, ${alpha})`;
  }

  // ── particles (constellation idle) ──
  const PARTICLE_COUNT = 60;
  const particles = [];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x     = Math.random() * canvas.width;
      this.y     = init ? Math.random() * canvas.height : -10;
      this.vx    = (Math.random() - 0.5) * 0.28;
      this.vy    = (Math.random() - 0.5) * 0.28;
      this.r     = Math.random() * 1.4 + 0.4;
      this.alpha = Math.random() * 0.35 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    }
    draw(a) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = gc(this.alpha * a);
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawConstellation(a) {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = gc((1 - dist / 130) * 0.1 * a);
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => p.draw(a));
  }

  // ══════════════════════════════════════
  // ── AUTOMATION — n8n realistic ──
  // ══════════════════════════════════════
  const N8N_LABELS = [
    'Webhook','Filter','Sheets','Gmail',
    'Slack','HTTP Request','IF','Merge',
    'Set','Code','Notion','Tally'
  ];
  const N8N_ICONS = ['⚡','⊗','▦','✉','◈','↗','⋔','⊕','✦','</>', '◻','◎'];
  let n8nNodes = [], n8nConns = [], n8nFrame = 0;
  let n8nStatus = { done: 0, total: 0 };

  function initN8N() {
    n8nNodes = [];
    n8nConns = [];
    n8nFrame = 0;
    n8nStatus = { done: 0, total: 0 };

    const cols = 5, rows = 2;
    const marginX = canvas.width  * 0.12;
    const marginY = canvas.height * 0.25;
    const spacingX = (canvas.width  - marginX * 2) / (cols - 1);
    const spacingY = (canvas.height - marginY * 2) / (rows - 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        n8nNodes.push({
          x:          marginX + c * spacingX + (Math.random() - 0.5) * 30,
          y:          marginY + r * spacingY + (Math.random() - 0.5) * 30,
          label:      N8N_LABELS[idx % N8N_LABELS.length],
          icon:       N8N_ICONS[idx  % N8N_ICONS.length],
          status:     'waiting',
          activateAt: idx * 30,
          frame:      0,
          pulse:      Math.random() * Math.PI * 2,
          packetPos:  0
        });
      }
    }

    n8nStatus.total = n8nNodes.length;

    // bezier connections
    for (let i = 0; i < n8nNodes.length - 1; i++) {
      if (i % 5 !== 4) {
        n8nConns.push({
          from: i, to: i + 1,
          progress: 0,
          packetPos: 0,
          packetActive: false
        });
      }
    }
    // cross connections
    for (let i = 0; i < 5 && i < n8nNodes.length - 5; i++) {
      if (Math.random() > 0.4) {
        n8nConns.push({
          from: i, to: i + 5,
          progress: 0,
          packetPos: 0,
          packetActive: false
        });
      }
    }
  }
  initN8N();

  function drawBezierConn(fx, fy, tx, ty, progress, color, packetPos, packetActive, a) {
    const cp1x = fx + (tx - fx) * 0.5;
    const cp1y = fy;
    const cp2x = fx + (tx - fx) * 0.5;
    const cp2y = ty;

    // draw full bezier faded
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tx, ty);
    ctx.strokeStyle = `rgba(50,50,50, ${0.4 * a})`;
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // draw progress portion
    if (progress > 0) {
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      const steps = 40;
      for (let s = 1; s <= Math.floor(steps * progress); s++) {
        const t = s / steps;
        const bx = Math.pow(1-t,3)*fx + 3*Math.pow(1-t,2)*t*cp1x + 3*(1-t)*t*t*cp2x + Math.pow(t,3)*tx;
        const by = Math.pow(1-t,3)*fy + 3*Math.pow(1-t,2)*t*cp1y + 3*(1-t)*t*t*cp2y + Math.pow(t,3)*ty;
        ctx.lineTo(bx, by);
      }
      ctx.strokeStyle = `rgba(98,205,130, ${0.6 * a})`;
      ctx.lineWidth   = 2;
      ctx.stroke();
    }

    // data packet
    if (packetActive && progress >= 1) {
      const t = packetPos;
      const px = Math.pow(1-t,3)*fx + 3*Math.pow(1-t,2)*t*cp1x + 3*(1-t)*t*t*cp2x + Math.pow(t,3)*tx;
      const py = Math.pow(1-t,3)*fy + 3*Math.pow(1-t,2)*t*cp1y + 3*(1-t)*t*t*cp2y + Math.pow(t,3)*ty;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(98,205,130, ${0.9 * a})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, py, 7, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(98,205,130, ${0.2 * a})`;
      ctx.fill();
    }
  }

  function drawAutomation(a) {
    n8nFrame++;
    if (n8nFrame > 400) initN8N();

    n8nStatus.done = 0;
    n8nNodes.forEach(node => {
      node.frame++;
      node.pulse += 0.04;
      if (node.frame >= node.activateAt && node.status === 'waiting') node.status = 'running';
      if (node.status === 'running' && node.frame >= node.activateAt + 60) node.status = 'done';
      if (node.status === 'done') n8nStatus.done++;
    });

    n8nConns.forEach(conn => {
      const f = n8nNodes[conn.from];
      const t = n8nNodes[conn.to];
      if (f.status === 'done') {
        conn.progress = Math.min(1, conn.progress + 0.018);
        if (conn.progress >= 1) {
          conn.packetActive = true;
          conn.packetPos = Math.min(1, conn.packetPos + 0.02);
          if (conn.packetPos >= 1) conn.packetPos = 0;
        }
      }
      drawBezierConn(
        f.x, f.y, t.x, t.y,
        conn.progress, 'green',
        conn.packetPos, conn.packetActive, a
      );
    });

    n8nNodes.forEach(node => {
      const w = 110, h = 40;
      const x = node.x - w / 2, y = node.y - h / 2;
      const pulse = Math.sin(node.pulse) * 0.5 + 0.5;

      let bg, border, text, iconColor;
      if (node.status === 'done') {
        bg        = `rgba(20,70,40, ${0.75 * a})`;
        border    = `rgba(98,205,130, ${0.9 * a})`;
        text      = `rgba(98,205,130, ${0.95 * a})`;
        iconColor = `rgba(98,205,130, ${0.7 * a})`;
      } else if (node.status === 'running') {
        bg        = `rgba(255,109,53, ${0.1 * a})`;
        border    = `rgba(255,109,53, ${(0.4 + pulse * 0.5) * a})`;
        text      = `rgba(255,165,90, ${0.9 * a})`;
        iconColor = `rgba(255,109,53, ${0.7 * a})`;
      } else {
        bg        = `rgba(20,20,20, ${0.6 * a})`;
        border    = `rgba(60,60,60, ${0.5 * a})`;
        text      = `rgba(100,100,100, ${0.5 * a})`;
        iconColor = `rgba(80,80,80, ${0.4 * a})`;
      }

      // node body
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fillStyle   = bg;
      ctx.fill();
      ctx.strokeStyle = border;
      ctx.lineWidth   = node.status === 'running' ? 2 : 1.5;
      ctx.stroke();

      // icon circle
      ctx.beginPath();
      ctx.arc(x + 18, node.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = iconColor;
      ctx.globalAlpha = 0.15 * a;
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.font      = '10px monospace';
      ctx.fillStyle = iconColor;
      ctx.textAlign = 'center';
      ctx.fillText(node.icon, x + 18, node.y + 3);

      // label
      ctx.font      = '11px "General Sans", sans-serif';
      ctx.fillStyle = text;
      ctx.fillText(node.label, x + 32, node.y + 4);
      ctx.textAlign = 'left';

      // status dot
      if (node.status === 'done') {
        ctx.beginPath();
        ctx.arc(x + w - 10, y + 10, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(98,205,130, ${0.9 * a})`;
        ctx.fill();
      } else if (node.status === 'running') {
        ctx.beginPath();
        ctx.arc(x + w - 10, y + 10, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,109,53, ${(0.5 + pulse * 0.5) * a})`;
        ctx.fill();
      }

      // running pulse ring
      if (node.status === 'running') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, (w / 2 + 4) + pulse * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,109,53, ${0.08 * pulse * a})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }
    });

    // status bar
    const barY  = canvas.height - 32;
    const barW  = canvas.width  * 0.5;
    const barX  = (canvas.width - barW) / 2;

    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 22, 6);
    ctx.fillStyle = `rgba(15,15,15, ${0.7 * a})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,109,53, ${0.2 * a})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    const pct     = n8nStatus.total > 0 ? n8nStatus.done / n8nStatus.total : 0;
    ctx.beginPath();
    ctx.roundRect(barX + 2, barY + 2, (barW - 4) * pct, 18, 5);
    ctx.fillStyle = `rgba(98,205,130, ${0.25 * a})`;
    ctx.fill();

    ctx.font      = '11px "General Sans", sans-serif';
    ctx.fillStyle = `rgba(98,205,130, ${0.8 * a})`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `executing workflow... ${n8nStatus.done}/${n8nStatus.total} nodes complete`,
      canvas.width / 2, barY + 15
    );
    ctx.textAlign = 'left';
  }

  // ══════════════════════════════════════
  // ── DEV — VS Code realistic ──
  // ══════════════════════════════════════
  const VS_LINES = [
    { t: 'import { AutoFlow } from "./pipeline";',          c: 'i' },
    { t: 'import { sheets, gmail } from "./integrations";', c: 'i' },
    { t: '',                                                 c: 't' },
    { t: 'const pipeline = new AutoFlow({',                 c: 'k' },
    { t: '  trigger: "webhook",',                           c: 's' },
    { t: '  destination: "google-sheets",',                 c: 's' },
    { t: '  notify: true,',                                 c: 't' },
    { t: '});',                                             c: 't' },
    { t: '',                                                c: 't' },
    { t: 'pipeline.on("submit", async (payload) => {',     c: 'k' },
    { t: '  const row = await sheets.append(payload);',    c: 't' },
    { t: '  await gmail.send({',                           c: 't' },
    { t: '    to: payload.email,',                         c: 's' },
    { t: '    subject: "Got your message",',               c: 's' },
    { t: '  });',                                          c: 't' },
    { t: '  return { success: true, row };',               c: 'k' },
    { t: '});',                                            c: 't' },
    { t: '',                                               c: 't' },
    { t: 'export default pipeline;',                       c: 'k' },
  ];

  const vsState = VS_LINES.map((l, i) => ({
    ...l, cp: 0, speed: 0.7 + Math.random() * 0.35, delay: i * 16
  }));
  let vsFrame = 0;

  const FILE_TREE = [
    { name: 'portfolio',  indent: 0, isFolder: true  },
    { name: 'src',        indent: 1, isFolder: true  },
    { name: 'pipeline.js',indent: 2, isFolder: false },
    { name: 'global.js',  indent: 2, isFolder: false, active: true },
    { name: 'canvas.js',  indent: 2, isFolder: false },
    { name: 'css',        indent: 1, isFolder: true  },
    { name: 'style.css',  indent: 2, isFolder: false },
    { name: 'work.css',   indent: 2, isFolder: false },
    { name: 'data',       indent: 1, isFolder: true  },
    { name: 'projects.js',indent: 2, isFolder: false },
  ];

  function drawDev(a) {
    vsFrame++;
    if (vsFrame > 640) { vsFrame = 0; vsState.forEach(l => l.cp = 0); }

    const treeW   = 180;
    const headerH = 32;
    const statusH = 24;
    const lineH   = 21;
    const codeX   = treeW + 52;
    const codeY   = headerH + 16;

    // ── activity bar (far left) ──
    ctx.fillStyle = `rgba(30,30,30, ${0.85 * a})`;
    ctx.fillRect(0, 0, 44, canvas.height);
    ['⊞','⊙','⊗','◎','⚙'].forEach((icon, i) => {
      ctx.font      = '14px monospace';
      ctx.fillStyle = i === 0
        ? `rgba(78,201,176, ${0.8 * a})`
        : `rgba(100,100,100, ${0.4 * a})`;
      ctx.textAlign = 'center';
      ctx.fillText(icon, 22, 60 + i * 36);
    });
    ctx.textAlign = 'left';

    // ── file tree ──
    ctx.fillStyle = `rgba(37,37,38, ${0.85 * a})`;
    ctx.fillRect(44, 0, treeW, canvas.height);

    ctx.font      = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = `rgba(187,187,187, ${0.35 * a})`;
    ctx.fillText('EXPLORER', 52, 20);

    FILE_TREE.forEach((file, i) => {
      const fy = 40 + i * 22;
      if (file.active) {
        ctx.fillStyle = `rgba(78,201,176, ${0.08 * a})`;
        ctx.fillRect(44, fy - 12, treeW, 20);
      }
      ctx.font      = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = file.active
        ? `rgba(78,201,176, ${0.85 * a})`
        : file.isFolder
          ? `rgba(220,220,220, ${0.45 * a})`
          : `rgba(180,180,180, ${0.35 * a})`;
      ctx.fillText(
        (file.isFolder ? '▾ ' : '  ') + file.name,
        52 + file.indent * 12, fy
      );
    });

    // ── tab bar ──
    ctx.fillStyle = `rgba(30,30,30, ${0.9 * a})`;
    ctx.fillRect(treeW + 44, 0, canvas.width - treeW - 44, headerH);

    const tabs = ['pipeline.js', 'global.js ×', 'canvas.js'];
    tabs.forEach((tab, i) => {
      const tx = treeW + 44 + i * 120;
      const isActive = i === 1;
      ctx.fillStyle = isActive
        ? `rgba(30,30,30, ${0.9 * a})`
        : `rgba(45,45,45, ${0.7 * a})`;
      ctx.fillRect(tx, 0, 118, headerH);

      if (isActive) {
        ctx.fillStyle = `rgba(78,201,176, ${0.8 * a})`;
        ctx.fillRect(tx, 0, 118, 2);
      }

      ctx.font      = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = isActive
        ? `rgba(212,212,212, ${0.85 * a})`
        : `rgba(130,130,130, ${0.5 * a})`;
      ctx.fillText(tab, tx + 12, 20);
    });

    // ── code area ──
    ctx.fillStyle = `rgba(30,30,30, ${0.75 * a})`;
    ctx.fillRect(treeW + 44, headerH, canvas.width - treeW - 44, canvas.height - headerH - statusH);

    vsState.forEach((line, i) => {
      if (vsFrame < line.delay) return;
      line.cp = Math.min(line.t.length, line.cp + line.speed);
      const chars = Math.floor(line.cp);
      const y     = codeY + i * lineH;

      // line number
      ctx.font      = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(80,80,80, ${0.4 * a})`;
      ctx.textAlign = 'right';
      ctx.fillText(String(i + 1), treeW + 44 + 40, y);
      ctx.textAlign = 'left';

      // current line highlight
      const activeIdx = Math.min(Math.floor(vsFrame / 16), VS_LINES.length - 1);
      if (i === activeIdx) {
        ctx.fillStyle = `rgba(255,255,255, ${0.03 * a})`;
        ctx.fillRect(treeW + 44, y - 13, canvas.width - treeW - 44, lineH);
      }

      let color;
      if (line.c === 'k')      color = `rgba(86,156,214, ${0.8 * a})`;
      else if (line.c === 's') color = `rgba(206,145,120, ${0.8 * a})`;
      else if (line.c === 'i') color = `rgba(197,134,192, ${0.8 * a})`;
      else                     color = `rgba(212,212,212, ${0.55 * a})`;

      ctx.fillStyle = color;
      ctx.fillText(line.t.substring(0, chars), codeX, y);

      // blinking cursor
      if (i === activeIdx && Math.floor(vsFrame / 20) % 2 === 0) {
        const w = ctx.measureText(line.t.substring(0, chars)).width;
        ctx.fillStyle = `rgba(212,212,212, ${0.8 * a})`;
        ctx.fillRect(codeX + w, y - 12, 2, 14);
      }
    });

    // ── minimap ──
    const mmW = 60;
    const mmX = canvas.width - mmW;
    ctx.fillStyle = `rgba(25,25,25, ${0.7 * a})`;
    ctx.fillRect(mmX, headerH, mmW, canvas.height - headerH - statusH);
    vsState.forEach((line, i) => {
      if (!line.t) return;
      const my = headerH + 8 + i * 6;
      ctx.fillStyle = line.c === 'k'
        ? `rgba(86,156,214, ${0.3 * a})`
        : `rgba(100,100,100, ${0.2 * a})`;
      ctx.fillRect(mmX + 6, my, Math.min(line.t.length * 1.8, mmW - 12), 2);
    });

    // ── status bar ──
    ctx.fillStyle = `rgba(0,122,204, ${0.7 * a})`;
    ctx.fillRect(0, canvas.height - statusH, canvas.width, statusH);

    ctx.font      = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = `rgba(255,255,255, ${0.75 * a})`;
    ctx.fillText(' ⎇  main    ⚠ 0    ✓ 0', 44, canvas.height - 7);

    const fileInfo = 'JavaScript  UTF-8  Ln 11, Col 24';
    ctx.textAlign  = 'right';
    ctx.fillText(fileInfo, canvas.width - 8, canvas.height - 7);
    ctx.textAlign  = 'left';
  }

  // ══════════════════════════════════════
  // ── DESIGN — Figma-like canvas ──
  // ══════════════════════════════════════
  const TYPO_SPECIMENS = ['Aa', 'Gg', 'Rr', 'Kk'];
  const DESIGN_FRAMES  = [];
  const PALETTE = ['#c084a0','#d4a0b8','#e8c8d8','#f0e0e8','#a06880','#7a4060'];
  let designFrame = 0;
  let designEls   = [];

  function initDesign() {
    designFrame = 0;
    designEls   = [];
    DESIGN_FRAMES.length = 0;

    // Figma-like frames
    const frameData = [
      { x: canvas.width*0.1,  y: canvas.height*0.15, w: 200, h: 140, label: 'Homepage Hero'    },
      { x: canvas.width*0.45, y: canvas.height*0.1,  w: 160, h: 100, label: 'Card Component'   },
      { x: canvas.width*0.7,  y: canvas.height*0.2,  w: 120, h: 80,  label: 'Button States'    },
      { x: canvas.width*0.15, y: canvas.height*0.6,  w: 180, h: 120, label: 'Color System'     },
      { x: canvas.width*0.55, y: canvas.height*0.55, w: 220, h: 150, label: 'Typography Scale' },
    ];

    frameData.forEach((f, i) => {
      DESIGN_FRAMES.push({ ...f, progress: 0, delay: i * 40, drawn: false });
    });

    // floating shapes
    for (let i = 0; i < 12; i++) {
      designEls.push({
        type:     ['rect','circle','pill'][Math.floor(Math.random() * 3)],
        x:        Math.random() * canvas.width,
        y:        Math.random() * canvas.height,
        w:        Math.random() * 80 + 20,
        h:        Math.random() * 40 + 12,
        color:    PALETTE[Math.floor(Math.random() * PALETTE.length)],
        phase:    Math.random() * Math.PI * 2,
        speed:    Math.random() * 0.003 + 0.001,
        rot:      Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
      });
    }
  }
  initDesign();

  function drawDesign(a) {
    designFrame++;
    if (designFrame > 500) initDesign();

    // toolbar
    ctx.fillStyle = `rgba(255,255,255, ${0.06 * a})`;
    ctx.fillRect(0, 0, canvas.width, 40);
    const tools = ['▲','⬡','⬜','✏','T','⊕'];
    tools.forEach((t, i) => {
      ctx.font      = '13px monospace';
      ctx.fillStyle = i === 1
        ? `rgba(192,132,160, ${0.9 * a})`
        : `rgba(100,100,100, ${0.5 * a})`;
      ctx.textAlign = 'center';
      ctx.fillText(t, 20 + i * 36, 26);
    });
    ctx.textAlign = 'left';

    // left panel
    ctx.fillStyle = `rgba(255,255,255, ${0.04 * a})`;
    ctx.fillRect(0, 40, 160, canvas.height - 40);
    ctx.font      = '10px "General Sans", sans-serif';
    ctx.fillStyle = `rgba(42,31,40, ${0.4 * a})`;
    ctx.fillText('LAYERS', 12, 60);

    const layers = ['Frame 1', 'Hero Text', 'Button', 'Background', 'Accent Shape'];
    layers.forEach((l, i) => {
      const ly = 76 + i * 22;
      if (i === 0) {
        ctx.fillStyle = `rgba(192,132,160, ${0.12 * a})`;
        ctx.fillRect(0, ly - 12, 160, 20);
      }
      ctx.font      = '11px "General Sans", sans-serif';
      ctx.fillStyle = i === 0
        ? `rgba(192,132,160, ${0.8 * a})`
        : `rgba(80,60,70, ${0.5 * a})`;
      ctx.fillText('  ' + (i === 0 ? '▾ ' : '  ') + l, 8, ly);
    });

    // right panel
    ctx.fillStyle = `rgba(255,255,255, ${0.04 * a})`;
    ctx.fillRect(canvas.width - 200, 40, 200, canvas.height - 40);
    ctx.font      = '10px "General Sans", sans-serif';
    ctx.fillStyle = `rgba(42,31,40, ${0.4 * a})`;
    ctx.fillText('DESIGN', canvas.width - 188, 60);

    // color swatches in panel
    PALETTE.forEach((color, i) => {
      const sx = canvas.width - 188 + (i % 3) * 40;
      const sy = 76 + Math.floor(i / 3) * 40;
      ctx.beginPath();
      ctx.roundRect(sx, sy, 32, 32, 6);
      ctx.fillStyle   = color + Math.round(0.6 * a * 255).toString(16).padStart(2,'0');
      ctx.fill();
      ctx.strokeStyle = `rgba(192,132,160, ${0.2 * a})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
    });

    // typography specimens
    ctx.font      = `bold ${Math.min(canvas.height * 0.08, 60)}px 'Playfair Display', serif`;
    ctx.fillStyle = `rgba(192,132,160, ${0.06 * a})`;
    TYPO_SPECIMENS.forEach((spec, i) => {
      ctx.fillText(spec, 180 + i * (canvas.width * 0.15), canvas.height * 0.5);
    });

    // frames
    DESIGN_FRAMES.forEach(frame => {
      if (designFrame < frame.delay) return;
      frame.progress = Math.min(1, frame.progress + 0.02);

      // grid inside frame
      ctx.strokeStyle = `rgba(192,132,160, ${0.06 * frame.progress * a})`;
      ctx.lineWidth   = 0.5;
      for (let gx = frame.x; gx <= frame.x + frame.w; gx += 20) {
        ctx.beginPath();
        ctx.moveTo(gx, frame.y);
        ctx.lineTo(gx, frame.y + frame.h);
        ctx.stroke();
      }
      for (let gy = frame.y; gy <= frame.y + frame.h; gy += 20) {
        ctx.beginPath();
        ctx.moveTo(frame.x, gy);
        ctx.lineTo(frame.x + frame.w, gy);
        ctx.stroke();
      }

      // frame border
      ctx.strokeStyle = `rgba(192,132,160, ${0.35 * frame.progress * a})`;
      ctx.lineWidth   = 1.5;
      ctx.strokeRect(frame.x, frame.y, frame.w, frame.h);

      // corner handles
      const handles = [
        [frame.x, frame.y], [frame.x + frame.w, frame.y],
        [frame.x, frame.y + frame.h], [frame.x + frame.w, frame.y + frame.h]
      ];
      handles.forEach(([hx, hy]) => {
        ctx.fillStyle = `rgba(192,132,160, ${0.6 * frame.progress * a})`;
        ctx.fillRect(hx - 3, hy - 3, 6, 6);
      });

      // label above frame
      ctx.font      = '10px "General Sans", sans-serif';
      ctx.fillStyle = `rgba(192,132,160, ${0.55 * frame.progress * a})`;
      ctx.fillText(frame.label, frame.x, frame.y - 6);
    });

    // alignment guides
    if (designFrame > 80) {
      ctx.strokeStyle = `rgba(255,100,100, ${0.12 * a})`;
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 40);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(160, canvas.height / 2);
      ctx.lineTo(canvas.width - 200, canvas.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // floating design elements
    designEls.forEach(el => {
      el.phase += el.speed;
      el.rot   += el.rotSpeed;
      const fade = Math.sin(el.phase) * 0.25 + 0.4;
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate(el.rot);
      ctx.globalAlpha = 0.12 * fade * a;
      ctx.fillStyle   = el.color;
      if (el.type === 'rect') {
        ctx.fillRect(-el.w/2, -el.h/2, el.w, el.h);
      } else if (el.type === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, el.w/2, 0, Math.PI*2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.roundRect(-el.w/2, -el.h/2, el.w, el.h, el.h/2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    });
  }

  // ══════════════════════════════════════
  // ── VISUALS — cinematic ──
  // ══════════════════════════════════════
  let cinemaFrame = 0;
  let filmStrips  = [];
  let aperture    = { open: 0, opening: true };

  function initCinema() {
    cinemaFrame = 0;
    aperture    = { open: 0, opening: true };
    filmStrips  = [];
    for (let i = 0; i < 3; i++) {
      filmStrips.push({
        y:      canvas.height * (0.2 + i * 0.25),
        x:      -300,
        speed:  0.4 + Math.random() * 0.3,
        frames: Math.floor(Math.random() * 4) + 3
      });
    }
  }
  initCinema();

  function drawVisuals(a) {
    cinemaFrame++;
    if (cinemaFrame > 600) initCinema();

    // aperture animation
    if (aperture.opening) {
      aperture.open = Math.min(1, aperture.open + 0.012);
      if (aperture.open >= 1) aperture.opening = false;
    }

    // letterbox bars
    const barH = canvas.height * 0.12;
    ctx.fillStyle = `rgba(0,0,0, ${0.85 * a})`;
    ctx.fillRect(0, 0, canvas.width, barH);
    ctx.fillRect(0, canvas.height - barH, canvas.width, barH);

    // iris/aperture
    const cx      = canvas.width  * 0.5;
    const cy      = canvas.height * 0.5;
    const maxR    = Math.min(canvas.width, canvas.height) * 0.35;
    const irisR   = maxR * aperture.open;
    const blades  = 8;

    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < blades; i++) {
      const angle = (i / blades) * Math.PI * 2 + cinemaFrame * 0.002;
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(irisR * 0.3, 0, irisR * 0.5, irisR * 0.15, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(200,168,130, ${0.12 * a})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // outer iris ring
    ctx.beginPath();
    ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(200,168,130, ${0.08 * a})`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    // rule of thirds grid
    const gridAlpha = 0.06 * aperture.open * a;
    ctx.strokeStyle = `rgba(200,168,130, ${gridAlpha})`;
    ctx.lineWidth   = 0.5;
    [1/3, 2/3].forEach(t => {
      ctx.beginPath();
      ctx.moveTo(canvas.width * t, barH);
      ctx.lineTo(canvas.width * t, canvas.height - barH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, barH + (canvas.height - barH * 2) * t);
      ctx.lineTo(canvas.width, barH + (canvas.height - barH * 2) * t);
      ctx.stroke();
    });

    // film strip
    filmStrips.forEach(strip => {
      strip.x += strip.speed;
      if (strip.x > canvas.width + 300) strip.x = -300;

      const fw = 80, fh = 52, gap = 8, sprocket = 8;
      for (let i = 0; i < strip.frames; i++) {
        const fx = strip.x + i * (fw + gap);
        const fy = strip.y;

        ctx.fillStyle   = `rgba(10,8,6, ${0.7 * a})`;
        ctx.strokeStyle = `rgba(200,168,130, ${0.2 * a})`;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.roundRect(fx, fy - fh/2, fw, fh, 2);
        ctx.fill();
        ctx.stroke();

        // sprocket holes
        [fy - fh/2 + 4, fy + fh/2 - 12].forEach(sy => {
          [fx + 6, fx + fw - 14].forEach(sx => {
            ctx.beginPath();
            ctx.roundRect(sx, sy, 8, 8, 2);
            ctx.fillStyle = `rgba(200,168,130, ${0.15 * a})`;
            ctx.fill();
          });
        });

        // frame content placeholder
        ctx.fillStyle = `rgba(200,168,130, ${0.04 * a})`;
        ctx.fillRect(fx + 12, fy - fh/2 + 16, fw - 24, fh - 32);
      }
    });

    // aspect ratio indicators
    const ratios  = ['1.85:1', '2.39:1', '16:9'];
    const heights = [canvas.width/1.85, canvas.width/2.39, canvas.width/1.78];
    ratios.forEach((r, i) => {
      const rh  = heights[i];
      const ry  = (canvas.height - rh) / 2;
      ctx.strokeStyle = `rgba(200,168,130, ${[0.12, 0.2, 0.08][i] * a})`;
      ctx.lineWidth   = [0.5, 1, 0.5][i];
      ctx.setLineDash(i === 1 ? [] : [4, 8]);
      ctx.strokeRect(0, ry, canvas.width, rh);
      ctx.setLineDash([]);

      ctx.font      = '10px "General Sans", sans-serif';
      ctx.fillStyle = `rgba(200,168,130, ${0.3 * [0.6, 1, 0.4][i] * a})`;
      ctx.fillText(r, 8, ry + 14);
    });

    // histogram at bottom
    const histX = canvas.width - 180;
    const histY = canvas.height - barH - 80;
    const histW = 160, histH = 50;

    ctx.fillStyle = `rgba(10,8,6, ${0.55 * a})`;
    ctx.fillRect(histX, histY, histW, histH);
    ctx.strokeStyle = `rgba(200,168,130, ${0.15 * a})`;
    ctx.lineWidth   = 0.5;
    ctx.strokeRect(histX, histY, histW, histH);

    ctx.font      = '9px "General Sans", sans-serif';
    ctx.fillStyle = `rgba(200,168,130, ${0.4 * a})`;
    ctx.fillText('HISTOGRAM', histX + 4, histY - 4);

    for (let b = 0; b < histW; b += 2) {
      const h = Math.max(4, Math.sin(b * 0.08 + cinemaFrame * 0.01) * histH * 0.5 + histH * 0.4);
      ctx.fillStyle = `rgba(200,168,130, ${0.18 * a})`;
      ctx.fillRect(histX + b, histY + histH - h, 2, h);
    }
  }

  // ══════════════════════════════════════
  // ── AI SYSTEMS — Claude interface ──
  // ══════════════════════════════════════
  const AI_MESSAGES = [
    { role: 'user', text: 'Summarize this Claude session'    },
    { role: 'ai',   text: 'Identified 3 key decisions...'    },
    { role: 'user', text: 'Push notes to Notion'             },
    { role: 'ai',   text: 'Creating page in workspace...'    },
    { role: 'user', text: 'Tag it under Automation'          },
    { role: 'ai',   text: 'Done. Page linked ✓'              },
    { role: 'user', text: 'What tools were used?'            },
    { role: 'ai',   text: 'Make · Tally · Sheets · Gmail'   },
  ];

  const TOOL_CALLS = [
    'notion.createPage({ title: "Session Notes" })',
    'notion.addTag({ tag: "automation" })',
    'sheets.append({ data: summary })',
  ];

  let aiState = [];
  let aiFrame = 0;
  let thinking = { active: false, frame: 0 };
  let contextBar = { used: 0 };

  function initAI() {
    aiFrame   = 0;
    thinking  = { active: false, frame: 0 };
    contextBar = { used: 0 };
    aiState   = AI_MESSAGES.map((m, i) => ({
      ...m, y: 0, cp: 0,
      speed: 0.45 + Math.random() * 0.2,
      delay: i * 50,
      toolCall: i % 3 === 1 ? TOOL_CALLS[Math.floor(i/3)] : null
    }));
  }
  initAI();

  function drawAI(a) {
    aiFrame++;
    if (aiFrame > 600) initAI();

    const panelW  = Math.min(560, canvas.width * 0.55);
    const panelX  = (canvas.width - panelW) / 2;
    const headerH = 44;
    const statusH = 36;

    // panel background
    ctx.fillStyle = `rgba(15,15,15, ${0.7 * a})`;
    ctx.beginPath();
    ctx.roundRect(panelX, 20, panelW, canvas.height - 40, 12);
    ctx.fill();
    ctx.strokeStyle = `rgba(232,180,83, ${0.1 * a})`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    // header
    ctx.fillStyle = `rgba(20,20,20, ${0.8 * a})`;
    ctx.beginPath();
    ctx.roundRect(panelX, 20, panelW, headerH, [12, 12, 0, 0]);
    ctx.fill();

    ctx.font      = '13px "General Sans", sans-serif';
    ctx.fillStyle = `rgba(232,180,83, ${0.85 * a})`;
    ctx.textAlign = 'center';
    ctx.fillText('claude · session active', panelX + panelW / 2, 20 + 27);

    // model badge
    ctx.font      = '10px "General Sans", sans-serif';
    ctx.fillStyle = `rgba(232,180,83, ${0.4 * a})`;
    ctx.fillText('sonnet-4', panelX + panelW - 60, 20 + 27);
    ctx.textAlign = 'left';

    // context window bar
    contextBar.used = Math.min(0.68, contextBar.used + 0.001);
    const cwY  = 20 + headerH + 8;
    const cwW  = panelW - 24;
    ctx.fillStyle   = `rgba(30,30,30, ${0.6 * a})`;
    ctx.beginPath();
    ctx.roundRect(panelX + 12, cwY, cwW, 6, 3);
    ctx.fill();

    ctx.fillStyle = `rgba(232,180,83, ${0.5 * a})`;
    ctx.beginPath();
    ctx.roundRect(panelX + 12, cwY, cwW * contextBar.used, 6, 3);
    ctx.fill();

    ctx.font      = '9px "General Sans", sans-serif';
    ctx.fillStyle = `rgba(232,180,83, ${0.35 * a})`;
    ctx.fillText(
      `context: ${Math.round(contextBar.used * 100)}% used`,
      panelX + 12, cwY - 4
    );

    // messages
    let msgY = cwY + 20;
    ctx.font = '12px "General Sans", sans-serif';

    aiState.forEach((msg, i) => {
      if (aiFrame < msg.delay) return;
      msg.cp = Math.min(msg.text.length, msg.cp + msg.speed);
      const isAI   = msg.role === 'ai';
      const fade   = Math.min(1, (aiFrame - msg.delay) / 24);
      const text   = msg.text.substring(0, Math.floor(msg.cp));
      const tw     = ctx.measureText(msg.text).width;
      const bw     = Math.min(tw + 28, panelW * 0.75);
      const bh     = 34;
      const bx     = isAI
        ? panelX + 12
        : panelX + panelW - bw - 12;
      msg.y        = msgY;

      // avatar
      if (isAI) {
        ctx.beginPath();
        ctx.arc(panelX + 22, msgY + bh/2, 8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,180,83, ${0.15 * fade * a})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(232,180,83, ${0.4 * fade * a})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
        ctx.font      = '8px monospace';
        ctx.fillStyle = `rgba(232,180,83, ${0.8 * fade * a})`;
        ctx.textAlign = 'center';
        ctx.fillText('C', panelX + 22, msgY + bh/2 + 3);
        ctx.textAlign = 'left';
        ctx.font      = '12px "General Sans", sans-serif';
      }

      // bubble
      const bubX = isAI ? panelX + 36 : bx;
      ctx.beginPath();
      ctx.roundRect(bubX, msgY, bw, bh, 8);
      ctx.fillStyle = isAI
        ? `rgba(232,180,83, ${0.07 * fade * a})`
        : `rgba(50,50,50, ${0.4 * fade * a})`;
      ctx.fill();
      ctx.strokeStyle = isAI
        ? `rgba(232,180,83, ${0.2 * fade * a})`
        : `rgba(80,80,80, ${0.2 * fade * a})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = isAI
        ? `rgba(232,180,83, ${0.85 * fade * a})`
        : `rgba(200,200,200, ${0.7 * fade * a})`;
      ctx.fillText(text, bubX + 14, msgY + 22);

      // tool call
      if (msg.toolCall && msg.cp >= msg.text.length) {
        const tcY = msgY + bh + 4;
        ctx.fillStyle   = `rgba(20,20,20, ${0.6 * fade * a})`;
        ctx.beginPath();
        ctx.roundRect(panelX + 36, tcY, panelW - 60, 22, 4);
        ctx.fill();
        ctx.strokeStyle = `rgba(78,201,176, ${0.25 * fade * a})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();

        ctx.font      = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(78,201,176, ${0.65 * fade * a})`;
        ctx.fillText('⚙ ' + msg.toolCall, panelX + 44, tcY + 15);
        ctx.font = '12px "General Sans", sans-serif';
        msgY    += 28;
      }

      msgY += bh + 10;
    });

    // thinking indicator
    const lastMsg = aiState[aiState.length - 1];
    if (lastMsg && aiFrame > lastMsg.delay && lastMsg.cp < lastMsg.text.length * 0.5) {
      const dots  = Math.floor(aiFrame / 12) % 4;
      ctx.font      = '12px "General Sans", sans-serif';
      ctx.fillStyle = `rgba(232,180,83, ${0.45 * a})`;
      ctx.fillText('claude is thinking' + '.'.repeat(dots), panelX + 50, msgY + 20);
    }

    // input bar at bottom
    const inputY = 20 + canvas.height - 40 - statusH;
    ctx.fillStyle   = `rgba(25,25,25, ${0.7 * a})`;
    ctx.beginPath();
    ctx.roundRect(panelX + 12, inputY, panelW - 24, 32, 8);
    ctx.fill();
    ctx.strokeStyle = `rgba(232,180,83, ${0.15 * a})`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    ctx.font      = '12px "General Sans", sans-serif';
    ctx.fillStyle = `rgba(100,100,100, ${0.5 * a})`;
    ctx.fillText('Message claude...', panelX + 24, inputY + 21);

    if (Math.floor(aiFrame / 20) % 2 === 0) {
      ctx.fillStyle = `rgba(232,180,83, ${0.6 * a})`;
      ctx.fillRect(panelX + 24, inputY + 8, 2, 14);
    }
  }

  // ── main draw loop ──
  let idleAlpha  = 1;
  let hoverAlpha = 0;

  function initForTheme(theme) {
    if (theme === 'automation')   initN8N();
    else if (theme === 'dev')     { vsFrame = 0; vsState.forEach(l => l.cp = 0); }
    else if (theme === 'design')  initDesign();
    else if (theme === 'visuals') initCinema();
    else if (theme === 'ai-systems') initAI();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isIdle = currentState === 'default';

    if (currentState !== targetState) {
      transitionAlpha = Math.max(0, transitionAlpha - FADE_SPEED);
      if (transitionAlpha === 0) {
        currentState    = targetState;
        transitionAlpha = 0;
        if (currentState !== 'default') initForTheme(currentState);
      }
    } else {
      transitionAlpha = Math.min(1, transitionAlpha + FADE_SPEED);
    }

    idleAlpha  = isIdle ? transitionAlpha : 1 - transitionAlpha;
    hoverAlpha = isIdle ? 0 : transitionAlpha;

    particles.forEach(p => p.update());

    if (idleAlpha > 0.01)  drawConstellation(idleAlpha);

    if (hoverAlpha > 0.01) {
      if      (currentState === 'automation')   drawAutomation(hoverAlpha);
      else if (currentState === 'dev')          drawDev(hoverAlpha);
      else if (currentState === 'design')       drawDesign(hoverAlpha);
      else if (currentState === 'visuals')      drawVisuals(hoverAlpha);
      else if (currentState === 'ai-systems')   drawAI(hoverAlpha);
    }

    requestAnimationFrame(draw);
  }

  draw();
})();