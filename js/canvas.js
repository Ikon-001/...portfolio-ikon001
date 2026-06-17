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
    default:      { r: '232, 180, 83',  s: '240, 237, 232' },
    automation:   { r: '255, 109, 53',  s: '240, 237, 232' },
    dev:          { r: '78, 201, 176',  s: '212, 212, 212' },
    design:       { r: '192, 132, 160', s: '240, 237, 232' },
    'ai-systems': { r: '232, 180, 83',  s: '240, 237, 232' },
  };
 
  function gc(alpha, type = 'r') {
    const t = THEME_COLORS[currentState] || THEME_COLORS.default;
    return `rgba(${t[type]}, ${alpha})`;
  }
 
  // ════════════════════════════════════
  // ── CONSTELLATION (default) ──
  // ════════════════════════════════════
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
 
  // ════════════════════════════════════
  // ── AUTOMATION — Gideon's A01 pipeline ──
  // ════════════════════════════════════
  // Real A01 nodes: Tally webhook → Google Sheets → Gmail → Sleep → Gmail Search → IF → Gmail follow-up
  const A01_NODES = [
    { label: 'Tally Form',     icon: '◎',   tool: 'Webhook trigger' },
    { label: 'Google Sheets',  icon: '▦',   tool: 'Log to row'      },
    { label: 'Gmail',          icon: '✉',   tool: 'Send confirm'    },
    { label: 'Sleep',          icon: '⏳',  tool: '3h delay'        },
    { label: 'Gmail Search',   icon: '⊙',   tool: 'Check sent'      },
    { label: 'IF',             icon: '⋔',   tool: 'replied?'        },
    { label: 'Gmail',          icon: '✉',   tool: 'Follow-up'       },
    { label: 'Stop',           icon: '⊗',   tool: 'No duplicate'    },
  ];
 
  let n8nNodes = [], n8nConns = [], n8nFrame = 0;
  let n8nStatus = { done: 0, total: 0 };
 
  function initN8N() {
    n8nNodes = [];
    n8nConns = [];
    n8nFrame  = 0;
    n8nStatus = { done: 0, total: 0 };
 
    const count   = A01_NODES.length;
    const marginX = canvas.width  * 0.1;
    const marginY = canvas.height * 0.3;
    const cols    = 4;
    const rows    = 2;
    const spacingX = (canvas.width  - marginX * 2) / (cols - 1);
    const spacingY = (canvas.height - marginY * 2) / (rows - 1);
 
    A01_NODES.forEach((def, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      n8nNodes.push({
        x:          marginX + col * spacingX + (Math.random() - 0.5) * 20,
        y:          marginY + row * spacingY + (Math.random() - 0.5) * 20,
        label:      def.label,
        icon:       def.icon,
        tool:       def.tool,
        status:     'waiting',
        activateAt: idx * 28,
        frame:      0,
        pulse:      Math.random() * Math.PI * 2,
      });
    });
 
    n8nStatus.total = n8nNodes.length;
 
    // connections: linear through the pipeline
    for (let i = 0; i < n8nNodes.length - 1; i++) {
      // skip IF → Stop branch (show only happy path in canvas)
      if (i === 5) continue;
      n8nConns.push({
        from: i, to: i + 1,
        progress: 0, packetPos: 0, packetActive: false
      });
    }
    // IF branches to both 6 and 7
    n8nConns.push({ from: 5, to: 6, progress: 0, packetPos: 0, packetActive: false });
    n8nConns.push({ from: 5, to: 7, progress: 0, packetPos: 0, packetActive: false });
  }
  initN8N();
 
  function drawBezierConn(fx, fy, tx, ty, progress, packetPos, packetActive, a) {
    const cp1x = fx + (tx - fx) * 0.5;
    const cp1y = fy;
    const cp2x = fx + (tx - fx) * 0.5;
    const cp2y = ty;
 
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tx, ty);
    ctx.strokeStyle = `rgba(50,50,50, ${0.4 * a})`;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
 
    if (progress > 0) {
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      const steps = 40;
      for (let s = 1; s <= Math.floor(steps * progress); s++) {
        const t  = s / steps;
        const bx = Math.pow(1-t,3)*fx + 3*Math.pow(1-t,2)*t*cp1x + 3*(1-t)*t*t*cp2x + Math.pow(t,3)*tx;
        const by = Math.pow(1-t,3)*fy + 3*Math.pow(1-t,2)*t*cp1y + 3*(1-t)*t*t*cp2y + Math.pow(t,3)*ty;
        ctx.lineTo(bx, by);
      }
      ctx.strokeStyle = `rgba(98,205,130, ${0.6 * a})`;
      ctx.lineWidth   = 2;
      ctx.stroke();
    }
 
    if (packetActive && progress >= 1) {
      const t  = packetPos;
      const px = Math.pow(1-t,3)*fx + 3*Math.pow(1-t,2)*t*cp1x + 3*(1-t)*t*t*cp2x + Math.pow(t,3)*tx;
      const py = Math.pow(1-t,3)*fy + 3*Math.pow(1-t,2)*t*cp1y + 3*(1-t)*t*t*cp2y + Math.pow(t,3)*ty;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(98,205,130, ${0.9 * a})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(98,205,130, ${0.18 * a})`;
      ctx.fill();
    }
  }
 
  function drawAutomation(a) {
    n8nFrame++;
    if (n8nFrame > 480) initN8N();
 
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
          conn.packetPos    = Math.min(1, conn.packetPos + 0.022);
          if (conn.packetPos >= 1) conn.packetPos = 0;
        }
      }
      drawBezierConn(f.x, f.y, t.x, t.y, conn.progress, conn.packetPos, conn.packetActive, a);
    });
 
    n8nNodes.forEach(node => {
      const w = 118, h = 44;
      const x = node.x - w / 2, y = node.y - h / 2;
      const pulse = Math.sin(node.pulse) * 0.5 + 0.5;
 
      let bg, border, textColor, iconColor;
      if (node.status === 'done') {
        bg        = `rgba(20,60,35, ${0.75 * a})`;
        border    = `rgba(98,205,130, ${0.85 * a})`;
        textColor = `rgba(98,205,130, ${0.95 * a})`;
        iconColor = `rgba(98,205,130, ${0.7 * a})`;
      } else if (node.status === 'running') {
        bg        = `rgba(255,109,53, ${0.1 * a})`;
        border    = `rgba(255,109,53, ${(0.4 + pulse * 0.5) * a})`;
        textColor = `rgba(255,165,90, ${0.9 * a})`;
        iconColor = `rgba(255,109,53, ${0.7 * a})`;
      } else {
        bg        = `rgba(20,20,20, ${0.6 * a})`;
        border    = `rgba(55,55,55, ${0.5 * a})`;
        textColor = `rgba(90,90,90, ${0.5 * a})`;
        iconColor = `rgba(75,75,75, ${0.4 * a})`;
      }
 
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fillStyle   = bg;
      ctx.fill();
      ctx.strokeStyle = border;
      ctx.lineWidth   = node.status === 'running' ? 2 : 1.5;
      ctx.stroke();
 
      ctx.beginPath();
      ctx.arc(x + 18, node.y, 10, 0, Math.PI * 2);
      ctx.fillStyle   = iconColor;
      ctx.globalAlpha = 0.15 * a;
      ctx.fill();
      ctx.globalAlpha = 1;
 
      ctx.font      = '11px monospace';
      ctx.fillStyle = iconColor;
      ctx.textAlign = 'center';
      ctx.fillText(node.icon, x + 18, node.y + 4);
 
      ctx.font      = '11px "General Sans", sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.fillText(node.label, x + 32, node.y - 4);
 
      ctx.font      = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(${node.status === 'done' ? '98,205,130' : '100,100,100'}, ${0.5 * a})`;
      ctx.fillText(node.tool, x + 32, node.y + 9);
 
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
 
        ctx.beginPath();
        ctx.arc(node.x, node.y, (w / 2 + 4) + pulse * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,109,53, ${0.06 * pulse * a})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }
    });
 
    // status bar
    const barY = canvas.height - 36;
    const barW = canvas.width  * 0.5;
    const barX = (canvas.width - barW) / 2;
 
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, 24, 6);
    ctx.fillStyle   = `rgba(12,12,12, ${0.75 * a})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,109,53, ${0.2 * a})`;
    ctx.lineWidth   = 1;
    ctx.stroke();
 
    const pct = n8nStatus.total > 0 ? n8nStatus.done / n8nStatus.total : 0;
    if (pct > 0) {
      ctx.beginPath();
      ctx.roundRect(barX + 2, barY + 2, (barW - 4) * pct, 20, 5);
      ctx.fillStyle = `rgba(98,205,130, ${0.22 * a})`;
      ctx.fill();
    }
 
    ctx.font      = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = `rgba(98,205,130, ${0.75 * a})`;
    ctx.textAlign = 'center';
    ctx.fillText(
      `● executing A01 — client capture pipeline · ${n8nStatus.done}/${n8nStatus.total} nodes`,
      canvas.width / 2, barY + 16
    );
    ctx.textAlign = 'left';
  }
 
  // ════════════════════════════════════
  // ── DEV — Gideon's actual VS Code ──
  // ════════════════════════════════════
  // Real files: guu-brain (DEV02) and portfolio projects
  const VS_LINES = [
    { t: '# GUU AI Digital Brain — app.py',              c: 'c' },
    { t: 'from flask import Flask, request, jsonify',    c: 'i' },
    { t: 'from supabase import create_client',           c: 'i' },
    { t: 'import os',                                    c: 'i' },
    { t: '',                                             c: 't' },
    { t: 'app = Flask(__name__)',                        c: 'k' },
    { t: 'sb  = create_client(',                        c: 'k' },
    { t: '  os.environ["SUPABASE_URL"],',               c: 's' },
    { t: '  os.environ["SUPABASE_KEY"]',                c: 's' },
    { t: ')',                                            c: 't' },
    { t: '',                                            c: 't' },
    { t: '@app.route("/message", methods=["POST"])',    c: 'k' },
    { t: 'def receive_message():',                      c: 'k' },
    { t: '  data = request.get_json()',                 c: 't' },
    { t: '  user_id = data.get("user_id")',             c: 't' },
    { t: '  message = data.get("message")',             c: 't' },
    { t: '  # route to Rasa NLU',                      c: 'c' },
    { t: '  intent = rasa.parse(message)',              c: 't' },
    { t: '  response = handle_intent(intent)',          c: 't' },
    { t: '  return jsonify({ "reply": response })',     c: 'k' },
  ];
 
  const FILE_TREE = [
    { name: 'guu-brain/',     indent: 0, isFolder: true            },
    { name: 'app.py',         indent: 1, isFolder: false, active: true },
    { name: 'actions.py',     indent: 1, isFolder: false           },
    { name: 'domain.yml',     indent: 1, isFolder: false           },
    { name: 'config.yml',     indent: 1, isFolder: false           },
    { name: 'portfolio/',     indent: 0, isFolder: true            },
    { name: 'js/',            indent: 1, isFolder: true            },
    { name: 'canvas.js',      indent: 2, isFolder: false           },
    { name: 'global.js',      indent: 2, isFolder: false           },
    { name: 'data/',          indent: 1, isFolder: true            },
    { name: 'projects.js',    indent: 2, isFolder: false           },
  ];
 
  const vsState = VS_LINES.map((l, i) => ({
    ...l, cp: 0, speed: 0.65 + Math.random() * 0.35, delay: i * 14
  }));
  let vsFrame = 0;
 
  function drawDev(a) {
    vsFrame++;
    if (vsFrame > 720) { vsFrame = 0; vsState.forEach(l => l.cp = 0); }
 
    const treeW   = 185;
    const headerH = 32;
    const statusH = 24;
    const lineH   = 20;
    const codeX   = treeW + 54;
    const codeY   = headerH + 18;
 
    // activity bar
    ctx.fillStyle = `rgba(30,30,30, ${0.88 * a})`;
    ctx.fillRect(0, 0, 44, canvas.height);
    ['⊞','⊙','⊗','◎','⚙'].forEach((icon, i) => {
      ctx.font      = '13px monospace';
      ctx.fillStyle = i === 0
        ? `rgba(78,201,176, ${0.8 * a})`
        : `rgba(100,100,100, ${0.35 * a})`;
      ctx.textAlign = 'center';
      ctx.fillText(icon, 22, 60 + i * 36);
    });
    ctx.textAlign = 'left';
 
    // file tree
    ctx.fillStyle = `rgba(37,37,38, ${0.88 * a})`;
    ctx.fillRect(44, 0, treeW, canvas.height);
 
    ctx.font      = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = `rgba(187,187,187, ${0.3 * a})`;
    ctx.fillText('EXPLORER', 54, 20);
 
    FILE_TREE.forEach((file, i) => {
      const fy = 38 + i * 21;
      if (file.active) {
        ctx.fillStyle = `rgba(78,201,176, ${0.08 * a})`;
        ctx.fillRect(44, fy - 12, treeW, 20);
      }
      ctx.font      = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = file.active
        ? `rgba(78,201,176, ${0.85 * a})`
        : file.isFolder
          ? `rgba(220,220,220, ${0.4 * a})`
          : `rgba(170,170,170, ${0.3 * a})`;
      ctx.fillText(
        (file.isFolder ? '▾ ' : '  ') + file.name,
        54 + file.indent * 12, fy
      );
    });
 
    // tab bar
    ctx.fillStyle = `rgba(30,30,30, ${0.92 * a})`;
    ctx.fillRect(treeW + 44, 0, canvas.width - treeW - 44, headerH);
 
    const tabs = ['domain.yml', 'app.py ×', 'actions.py'];
    tabs.forEach((tab, i) => {
      const tx = treeW + 44 + i * 120;
      const isActive = i === 1;
      ctx.fillStyle = isActive ? `rgba(30,30,30,${0.92*a})` : `rgba(45,45,45,${0.72*a})`;
      ctx.fillRect(tx, 0, 118, headerH);
      if (isActive) {
        ctx.fillStyle = `rgba(78,201,176, ${0.8 * a})`;
        ctx.fillRect(tx, 0, 118, 2);
      }
      ctx.font      = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = isActive ? `rgba(212,212,212,${0.85*a})` : `rgba(130,130,130,${0.45*a})`;
      ctx.fillText(tab, tx + 10, 20);
    });
 
    // code area
    ctx.fillStyle = `rgba(30,30,30, ${0.78 * a})`;
    ctx.fillRect(treeW + 44, headerH, canvas.width - treeW - 44, canvas.height - headerH - statusH);
 
    vsState.forEach((line, i) => {
      if (vsFrame < line.delay) return;
      line.cp = Math.min(line.t.length, line.cp + line.speed);
      const chars = Math.floor(line.cp);
      const y     = codeY + i * lineH;
 
      ctx.font      = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(75,75,75, ${0.38 * a})`;
      ctx.textAlign = 'right';
      ctx.fillText(String(i + 1), treeW + 44 + 42, y);
      ctx.textAlign = 'left';
 
      const activeIdx = Math.min(Math.floor(vsFrame / 14), VS_LINES.length - 1);
      if (i === activeIdx) {
        ctx.fillStyle = `rgba(255,255,255, ${0.025 * a})`;
        ctx.fillRect(treeW + 44, y - 13, canvas.width - treeW - 44, lineH);
      }
 
      let color;
      if      (line.c === 'k') color = `rgba(86,156,214, ${0.8 * a})`;
      else if (line.c === 's') color = `rgba(206,145,120, ${0.8 * a})`;
      else if (line.c === 'i') color = `rgba(197,134,192, ${0.8 * a})`;
      else if (line.c === 'c') color = `rgba(106,153,85, ${0.7 * a})`;
      else                     color = `rgba(212,212,212, ${0.55 * a})`;
 
      ctx.fillStyle = color;
      ctx.fillText(line.t.substring(0, chars), codeX, y);
 
      if (i === activeIdx && Math.floor(vsFrame / 20) % 2 === 0) {
        const w = ctx.measureText(line.t.substring(0, chars)).width;
        ctx.fillStyle = `rgba(212,212,212, ${0.8 * a})`;
        ctx.fillRect(codeX + w, y - 12, 2, 13);
      }
    });
 
    // minimap
    const mmW = 58;
    const mmX = canvas.width - mmW;
    ctx.fillStyle = `rgba(25,25,25, ${0.7 * a})`;
    ctx.fillRect(mmX, headerH, mmW, canvas.height - headerH - statusH);
    vsState.forEach((line, i) => {
      if (!line.t) return;
      const my = headerH + 8 + i * 5;
      ctx.fillStyle = line.c === 'k'
        ? `rgba(86,156,214, ${0.28 * a})`
        : `rgba(100,100,100, ${0.18 * a})`;
      ctx.fillRect(mmX + 5, my, Math.min(line.t.length * 1.6, mmW - 10), 2);
    });
 
    // status bar
    ctx.fillStyle = `rgba(0,122,204, ${0.72 * a})`;
    ctx.fillRect(0, canvas.height - statusH, canvas.width, statusH);
 
    ctx.font      = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = `rgba(255,255,255, ${0.75 * a})`;
    ctx.fillText(' ⎇  main    Python 3.11    Flask    Rasa 3.x', 44, canvas.height - 7);
 
    ctx.textAlign = 'right';
    ctx.fillText('UTF-8  Ln 12, Col 28', canvas.width - 8, canvas.height - 7);
    ctx.textAlign = 'left';
  }
 
  // ════════════════════════════════════
  // ── DESIGN — Figma canvas (dark) ──
  // ════════════════════════════════════
  const DESIGN_FRAMES = [];
  const PALETTE = ['#c084a0','#d4a0b8','#2a1814','#1a1214','#a06880','#e8b453'];
  let designFrame = 0, designEls = [];
 
  function initDesign() {
    designFrame = 0;
    designEls   = [];
    DESIGN_FRAMES.length = 0;
 
    const frameData = [
      { x: canvas.width*0.12, y: canvas.height*0.18, w: 200, h: 140, label: 'ikon.dev — Hero'      },
      { x: canvas.width*0.46, y: canvas.height*0.12, w: 160, h: 100, label: 'Project Card'          },
      { x: canvas.width*0.72, y: canvas.height*0.22, w: 120, h: 80,  label: 'Area Tile States'      },
      { x: canvas.width*0.16, y: canvas.height*0.62, w: 180, h: 120, label: 'ikon.dev — Color Sys'  },
      { x: canvas.width*0.56, y: canvas.height*0.58, w: 220, h: 150, label: 'Type Scale'            },
    ];
 
    frameData.forEach((f, i) => {
      DESIGN_FRAMES.push({ ...f, progress: 0, delay: i * 40, drawn: false });
    });
 
    for (let i = 0; i < 10; i++) {
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
    ctx.fillStyle = `rgba(15,10,12, ${0.88 * a})`;
    ctx.fillRect(0, 0, canvas.width, 40);
    ['▲','⬡','⬜','✏','T','⊕'].forEach((t, i) => {
      ctx.font      = '13px monospace';
      ctx.fillStyle = i === 1
        ? `rgba(192,132,160, ${0.9 * a})`
        : `rgba(100,80,90, ${0.45 * a})`;
      ctx.textAlign = 'center';
      ctx.fillText(t, 20 + i * 36, 26);
    });
    ctx.textAlign = 'left';
 
    // left panel
    ctx.fillStyle = `rgba(15,10,12, ${0.82 * a})`;
    ctx.fillRect(0, 40, 160, canvas.height - 40);
    ctx.font      = '10px "General Sans", sans-serif';
    ctx.fillStyle = `rgba(192,132,160, ${0.4 * a})`;
    ctx.fillText('LAYERS', 12, 60);
 
    const layers = ['ikon.dev', '  Hero Frame', '  Project Card', '  Area Tiles', '  Footer'];
    layers.forEach((l, i) => {
      const ly = 76 + i * 22;
      if (i === 1) {
        ctx.fillStyle = `rgba(192,132,160, ${0.1 * a})`;
        ctx.fillRect(0, ly - 12, 160, 20);
      }
      ctx.font      = '11px "General Sans", sans-serif';
      ctx.fillStyle = i === 1
        ? `rgba(192,132,160, ${0.8 * a})`
        : `rgba(180,150,160, ${0.4 * a})`;
      ctx.fillText(l, 8, ly);
    });
 
    // right panel
    ctx.fillStyle = `rgba(15,10,12, ${0.82 * a})`;
    ctx.fillRect(canvas.width - 200, 40, 200, canvas.height - 40);
    ctx.font      = '10px "General Sans", sans-serif';
    ctx.fillStyle = `rgba(192,132,160, ${0.4 * a})`;
    ctx.fillText('DESIGN', canvas.width - 188, 60);
 
    // ikon.dev actual palette swatches
    const swatches = [
      { color: '#e8b453', label: 'Gold' },
      { color: '#0a0a0a', label: 'BG'   },
      { color: '#c084a0', label: 'Pink' },
      { color: '#4ec9b0', label: 'Teal' },
      { color: '#f0ede8', label: 'Text' },
      { color: '#888780', label: 'Muted'},
    ];
    swatches.forEach((sw, i) => {
      const sx = canvas.width - 188 + (i % 3) * 60;
      const sy = 76 + Math.floor(i / 3) * 52;
      ctx.beginPath();
      ctx.roundRect(sx, sy, 44, 36, 6);
      ctx.fillStyle = sw.color + Math.round(0.55 * a * 255).toString(16).padStart(2,'0');
      ctx.fill();
      ctx.strokeStyle = `rgba(192,132,160, ${0.15 * a})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font      = '9px "General Sans", sans-serif';
      ctx.fillStyle = `rgba(200,170,180, ${0.5 * a})`;
      ctx.textAlign = 'center';
      ctx.fillText(sw.label, sx + 22, sy + 50);
      ctx.textAlign = 'left';
    });
 
    // typography specimen — Playfair Display
    ctx.font      = `italic bold ${Math.min(canvas.height * 0.07, 54)}px 'Playfair Display', serif`;
    ctx.fillStyle = `rgba(192,132,160, ${0.05 * a})`;
    ctx.fillText('Aa Gg Rr', 180, canvas.height * 0.5);
 
    // frames
    DESIGN_FRAMES.forEach(frame => {
      if (designFrame < frame.delay) return;
      frame.progress = Math.min(1, frame.progress + 0.02);
 
      ctx.strokeStyle = `rgba(192,132,160, ${0.05 * frame.progress * a})`;
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
 
      ctx.strokeStyle = `rgba(192,132,160, ${0.3 * frame.progress * a})`;
      ctx.lineWidth   = 1.5;
      ctx.strokeRect(frame.x, frame.y, frame.w, frame.h);
 
      const handles = [
        [frame.x, frame.y], [frame.x + frame.w, frame.y],
        [frame.x, frame.y + frame.h], [frame.x + frame.w, frame.y + frame.h]
      ];
      handles.forEach(([hx, hy]) => {
        ctx.fillStyle = `rgba(192,132,160, ${0.55 * frame.progress * a})`;
        ctx.fillRect(hx - 3, hy - 3, 6, 6);
      });
 
      ctx.font      = '10px "General Sans", sans-serif';
      ctx.fillStyle = `rgba(192,132,160, ${0.5 * frame.progress * a})`;
      ctx.fillText(frame.label, frame.x, frame.y - 6);
    });
 
    // alignment guides
    if (designFrame > 80) {
      ctx.strokeStyle = `rgba(255,100,100, ${0.08 * a})`;
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 6]);
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
 
    // floating shapes
    designEls.forEach(el => {
      el.phase += el.speed;
      el.rot   += el.rotSpeed;
      const fade = Math.sin(el.phase) * 0.2 + 0.3;
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate(el.rot);
      ctx.globalAlpha = 0.08 * fade * a;
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
 
  // ════════════════════════════════════
  // ── AI SYSTEMS — Model Ops Dashboard ──
  // ════════════════════════════════════
  // DEV02 architecture: Research Lab → Operations Layer → Human Review
  // Stack: Rasa · Claude API · Supabase · Termii · Flask
 
  let aiFrame     = 0;
  let trustScore  = 0.87;
  let aiNodes     = [];
  let aiConns     = [];
  let reviewQueue = [];
  let aiMetrics   = { confidence: 0, latency: 38, drift: 0.04 };
 
  const AI_MODULES = [
    { id: 'lab',   label: 'Research Lab',     sub: 'LAB / EVAL',   color: '78,201,176',  x: 0.2, y: 0.35 },
    { id: 'ops',   label: 'Operations Layer', sub: 'OPS / LIVE',   color: '232,180,83',  x: 0.5, y: 0.35 },
    { id: 'hitl',  label: 'Human Review',     sub: 'HITL / TRUST', color: '192,132,160', x: 0.8, y: 0.35 },
  ];
 
  const QUEUE_STATES = ['pending', 'evaluated', 'routed', 'shipped'];
 
  function initAI() {
    aiFrame   = 0;
    trustScore = 0.87;
    aiMetrics  = { confidence: 94.2, latency: 38, drift: 0.04 };
    reviewQueue = [];
 
    aiNodes = AI_MODULES.map(m => ({
      ...m,
      px:     canvas.width  * m.x,
      py:     canvas.height * m.y,
      pulse:  Math.random() * Math.PI * 2,
      active: false,
      activateAt: AI_MODULES.indexOf(m) * 60,
    }));
 
    aiConns = [
      { from: 0, to: 1, progress: 0, packetPos: 0, packetActive: false },
      { from: 1, to: 2, progress: 0, packetPos: 0, packetActive: false },
    ];
 
    for (let i = 0; i < 4; i++) {
      reviewQueue.push({
        id:     `MSG_${String(i + 1).padStart(3, '0')}`,
        state:  QUEUE_STATES[i % QUEUE_STATES.length],
        conf:   (0.75 + Math.random() * 0.22).toFixed(2),
        frame:  i * 40,
      });
    }
  }
  initAI();
 
  function drawAIConn(from, to, conn, a) {
    const fx = from.px + 90, fy = from.py;
    const tx = to.px   - 90, ty = to.py;
    const cpx = (fx + tx) / 2;
 
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.bezierCurveTo(cpx, fy, cpx, ty, tx, ty);
    ctx.strokeStyle = `rgba(80,80,80, ${0.3 * a})`;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
 
    if (conn.progress > 0) {
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      const steps = 40;
      for (let s = 1; s <= Math.floor(steps * conn.progress); s++) {
        const t  = s / steps;
        const bx = Math.pow(1-t,3)*fx + 3*Math.pow(1-t,2)*t*cpx + 3*(1-t)*t*t*cpx + Math.pow(t,3)*tx;
        const by = Math.pow(1-t,3)*fy + 3*Math.pow(1-t,2)*t*fy  + 3*(1-t)*t*t*ty  + Math.pow(t,3)*ty;
        ctx.lineTo(bx, by);
      }
      ctx.strokeStyle = `rgba(232,180,83, ${0.5 * a})`;
      ctx.lineWidth   = 2;
      ctx.stroke();
    }
 
    if (conn.packetActive && conn.progress >= 1) {
      const t  = conn.packetPos;
      const bx = Math.pow(1-t,3)*fx + 3*Math.pow(1-t,2)*t*cpx + 3*(1-t)*t*t*cpx + Math.pow(t,3)*tx;
      const by = Math.pow(1-t,3)*fy + 3*Math.pow(1-t,2)*t*fy  + 3*(1-t)*t*t*ty  + Math.pow(t,3)*ty;
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,180,83, ${0.9 * a})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(bx, by, 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,180,83, ${0.15 * a})`;
      ctx.fill();
    }
  }
 
  function drawAI(a) {
    aiFrame++;
    if (aiFrame > 600) initAI();
 
    // trust score drifts slightly
    if (aiFrame % 90 === 0) {
      trustScore = Math.max(0.78, Math.min(0.96, trustScore + (Math.random() - 0.5) * 0.04));
    }
 
    // activate modules in sequence
    aiNodes.forEach(node => {
      node.pulse += 0.035;
      if (aiFrame >= node.activateAt) node.active = true;
    });
 
    // advance connections
    aiConns.forEach((conn, i) => {
      if (aiNodes[conn.from].active) {
        conn.progress = Math.min(1, conn.progress + 0.014);
        if (conn.progress >= 1) {
          conn.packetActive = true;
          conn.packetPos    = Math.min(1, conn.packetPos + 0.018);
          if (conn.packetPos >= 1) conn.packetPos = 0;
        }
      }
      drawAIConn(aiNodes[conn.from], aiNodes[conn.to], conn, a);
    });
 
    // draw module cards
    aiNodes.forEach(node => {
      if (!node.active) return;
      const w = 180, h = 120;
      const x = node.px - w / 2;
      const y = node.py - h / 2;
      const pulse = Math.sin(node.pulse) * 0.5 + 0.5;
      const [r,g,b] = node.color.split(',');
 
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 10);
      ctx.fillStyle   = `rgba(15,15,18, ${0.82 * a})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${node.color}, ${(0.3 + pulse * 0.2) * a})`;
      ctx.lineWidth   = 1.5;
      ctx.stroke();
 
      // top bar with label
      ctx.fillStyle = `rgba(${node.color}, ${0.08 * a})`;
      ctx.beginPath();
      ctx.roundRect(x, y, w, 28, [10, 10, 0, 0]);
      ctx.fill();
 
      // status dot
      ctx.beginPath();
      ctx.arc(x + 12, y + 14, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${node.color}, ${(0.6 + pulse * 0.4) * a})`;
      ctx.fill();
 
      // sub label
      ctx.font      = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(${node.color}, ${0.6 * a})`;
      ctx.fillText(node.sub, x + 22, y + 17);
 
      // module name
      ctx.font      = '13px "General Sans", sans-serif';
      ctx.fillStyle = `rgba(240,237,232, ${0.85 * a})`;
      ctx.fillText(node.label, x + 12, y + 46);
 
      // mock chart bars
      for (let b = 0; b < 6; b++) {
        const bh = 20 + Math.sin(node.pulse + b) * 12;
        const bx = x + 12 + b * 26;
        const by = y + h - 16 - bh;
        ctx.fillStyle = `rgba(${node.color}, ${0.2 * a})`;
        ctx.beginPath();
        ctx.roundRect(bx, by, 18, bh, 3);
        ctx.fill();
      }
 
      // confidence score
      const confLabel = node.id === 'lab'
        ? `${aiMetrics.confidence}%`
        : node.id === 'ops'
          ? `${aiMetrics.latency}ms`
          : '100%';
      ctx.font      = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(${node.color}, ${0.75 * a})`;
      ctx.textAlign = 'right';
      ctx.fillText(confLabel, x + w - 10, y + h - 10);
      ctx.textAlign = 'left';
    });
 
    // trust index floating badge
    const tix = canvas.width * 0.5;
    const tiy = canvas.height * 0.14;
    ctx.beginPath();
    ctx.roundRect(tix - 50, tiy - 16, 100, 32, 8);
    ctx.fillStyle   = `rgba(12,12,12, ${0.8 * a})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(232,180,83, ${0.3 * a})`;
    ctx.lineWidth   = 1;
    ctx.stroke();
 
    ctx.font      = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = `rgba(232,180,83, ${0.5 * a})`;
    ctx.textAlign = 'center';
    ctx.fillText('TRUST IDX', tix, tiy - 2);
    ctx.font      = '16px "JetBrains Mono", monospace';
    ctx.fillStyle = `rgba(232,180,83, ${0.9 * a})`;
    ctx.fillText(trustScore.toFixed(2), tix, tiy + 13);
    ctx.textAlign = 'left';
 
    // process steps strip
    const steps   = ['01 Capture context', '02 Evaluate output', '03 Route review', '04 Ship with memory'];
    const stripY  = canvas.height * 0.68;
    const stepW   = Math.min(200, (canvas.width - 120) / 4);
    const startX  = (canvas.width - stepW * 4 - 32) / 2;
 
    steps.forEach((step, i) => {
      if (aiFrame < 80 + i * 30) return;
      const sx = startX + i * (stepW + 10);
      ctx.beginPath();
      ctx.roundRect(sx, stripY, stepW, 48, 6);
      ctx.fillStyle   = `rgba(18,18,22, ${0.75 * a})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(232,180,83, ${0.12 * a})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
 
      ctx.font      = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(232,180,83, ${0.6 * a})`;
      ctx.fillText(step.substring(0, 2), sx + 10, stripY + 18);
 
      ctx.font      = '11px "General Sans", sans-serif';
      ctx.fillStyle = `rgba(200,200,200, ${0.7 * a})`;
      ctx.fillText(step.substring(3), sx + 10, stripY + 36);
 
      if (i < 3) {
        ctx.font      = '14px monospace';
        ctx.fillStyle = `rgba(232,180,83, ${0.25 * a})`;
        ctx.textAlign = 'center';
        ctx.fillText('→', sx + stepW + 5, stripY + 27);
        ctx.textAlign = 'left';
      }
    });
 
    // stack labels floating
    const stack = ['Rasa', 'Claude API', 'Supabase', 'Termii', 'Flask'];
    stack.forEach((s, i) => {
      const sx = 60 + i * 130;
      const sy = canvas.height * 0.85;
      if (aiFrame < 120 + i * 20) return;
      ctx.font      = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = `rgba(232,180,83, ${0.25 * a})`;
      ctx.fillText(s, sx, sy);
    });
  }
 
  // ════════════════════════════════════
  // ── MAIN DRAW LOOP ──
  // ════════════════════════════════════
  function initForTheme(theme) {
    if      (theme === 'automation')   initN8N();
    else if (theme === 'dev')          { vsFrame = 0; vsState.forEach(l => l.cp = 0); }
    else if (theme === 'design')       initDesign();
    else if (theme === 'ai-systems')   initAI();
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
 
    const idleAlpha  = isIdle ? transitionAlpha : 1 - transitionAlpha;
    const hoverAlpha = isIdle ? 0 : transitionAlpha;
 
    particles.forEach(p => p.update());
 
    if (idleAlpha  > 0.01) drawConstellation(idleAlpha);
 
    if (hoverAlpha > 0.01) {
      if      (currentState === 'automation') drawAutomation(hoverAlpha);
      else if (currentState === 'dev')        drawDev(hoverAlpha);
      else if (currentState === 'design')     drawDesign(hoverAlpha);
      else if (currentState === 'ai-systems') drawAI(hoverAlpha);
    }
 
    requestAnimationFrame(draw);
  }
 
  draw();
})();