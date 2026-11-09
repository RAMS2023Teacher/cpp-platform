/* Lesson diagrams, drawn from short descriptions in lessons/supports.js. Every diagram carries alt text. */
(function () {
  const INK = '#1b1b3a', BOX = '#d8e4fb', YES = '#cdeed6', NO = '#fde2c8', LINE = '#3b3b5c';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const wrap = (text, max) => {
    const lines = []; let line = '';
    for (const word of String(text).split(' ')) {
      if (line && (line + ' ' + word).length > max) { lines.push(line); line = word; } else line = line ? line + ' ' + word : word;
    }
    return line ? [...lines, line] : lines;
  };
  const label = (x, y, text, max, opts = {}) => {
    const lines = wrap(text, max), size = opts.size || 15, lead = size + 4, top = y - (lines.length - 1) * lead / 2 + size / 3;
    return lines.map((l, i) => `<text x="${x}" y="${top + i * lead}" text-anchor="${opts.anchor || 'middle'}" font-size="${size}" font-weight="${opts.bold ? 700 : 400}" fill="${INK}"${opts.mono ? ' font-family="monospace"' : ''}>${esc(l)}</text>`).join('');
  };
  const box = (x, y, w, h, fill = BOX) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${fill}" stroke="${LINE}" stroke-width="2"/>`;
  const MARKER = `<defs><marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${LINE}"/></marker></defs>`;
  const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${LINE}" stroke-width="2.5" marker-end="url(#arw)"/>`;

  const DRAW = {
    flow(v) {
      const n = v.items.length, gap = 30, w = (700 - gap * (n - 1)) / n, h = 104, y = 12;
      const parts = v.items.map((t, i) => { const x = 10 + i * (w + gap); return box(x, y, w, h) + label(x + w / 2, y + h / 2, t, Math.floor(w / 8.2)) + (i < n - 1 ? arrow(x + w, y + h / 2, x + w + gap, y + h / 2) : ''); }).join('');
      if (!v.loop) return { h: 128, body: parts };
      const left = 10 + w / 2, right = 10 + (n - 1) * (w + gap) + w / 2, bot = y + h + 34;
      return { h: 186, body: parts + `<path d="M${right} ${y + h} V${bot} H${left} V${y + h + 2}" fill="none" stroke="${LINE}" stroke-width="2.5" stroke-dasharray="7 5" marker-end="url(#arw)"/>` + label(360, bot + 18, v.loop, 70, { size: 14 }) };
    },
    tree(v) {
      const bw = 210, bh = 66, yes = v.yesLabel || 'yes', no = v.noLabel || 'no', nested = typeof v.no === 'object';
      const rootX = 360 - bw / 2;
      let body = box(rootX, 8, bw, bh, BOX) + label(360, 41, v.q, 24, { bold: true });
      const branch = (fromX, fromY, toX, toY, text) => arrow(fromX, fromY, toX, toY) + label((fromX + toX) / 2 + (toX < fromX ? -22 : 22), (fromY + toY) / 2, text, 12, { size: 14, bold: true });
      const leftX = nested ? 130 : 180, rightX = nested ? 470 : 540, ly = 124;
      body += branch(320, 74, leftX, ly, yes) + box(leftX - bw / 2, ly, bw, bh, YES) + label(leftX, ly + 33, v.yes, 24);
      if (!nested) return { h: 200, body: body + branch(400, 74, rightX, ly, no) + box(rightX - bw / 2, ly, bw, bh, NO) + label(rightX, ly + 33, v.no, 24) };
      body += branch(400, 74, rightX, ly, no) + box(rightX - bw / 2, ly, bw, bh, BOX) + label(rightX, ly + 33, v.no.q, 24, { bold: true });
      const y2 = 240, a = rightX - 120, b = rightX + 120, w2 = 200;
      body += branch(rightX - 40, ly + bh, a, y2, 'yes') + box(a - w2 / 2, y2, w2, bh, YES) + label(a, y2 + 33, v.no.yes, 22);
      body += branch(rightX + 40, ly + bh, b - 40, y2, 'no') + box(b - w2 / 2 - 40 + 40 - 10, y2, w2 - 10, bh, NO) + label(b - 5, y2 + 33, v.no.no, 20);
      return { h: 316, body };
    },
    compare(v) {
      const col = (s, x, fill) => box(x, 8, 340, 200, fill) + label(x + 170, 34, s.title, 34, { bold: true, size: 17 }) + s.items.map((t, i) => label(x + 170, 80 + i * 48, t, 38, { size: 15 })).join('');
      return { h: 220, body: col(v.left, 10, YES) + col(v.right, 370, NO) };
    },
    parts(v) {
      return { h: 222, body: v.items.map(([code, note], i) => { const x = 10 + (i % 2) * 355, y = 8 + Math.floor(i / 2) * 106; return box(x, y, 345, 96) + label(x + 172, y + 36, code, 34, { mono: true, bold: true }) + label(x + 172, y + 70, note, 40, { size: 14 }); }).join('') };
    },
    array(v) {
      const n = v.values.length, size = Math.min(84, 660 / n), x0 = 360 - n * size / 2;
      const row = (vals, y, hi = [], fade = []) => vals.map((val, i) => `<rect x="${x0 + i * size}" y="${y}" width="${size}" height="62" fill="${hi.includes(i) ? YES : fade.includes(i) ? '#e4e4e4' : BOX}" stroke="${LINE}" stroke-width="2"/>` + label(x0 + i * size + size / 2, y + 31, String(val), 8, { size: 20, bold: !fade.includes(i) })).join('');
      let body = row(v.values, 12, v.highlight, v.fade), h = 112;
      if (v.after) { body += arrow(360, 80, 360, 112) + row(v.after, 118, v.highlight); h = 218; }
      body += label(360, h - 18, v.caption, 80, { size: 15 });
      return { h, body };
    },
    beam() {
      let beam = `<rect x="30" y="30" width="400" height="100" rx="24" fill="${BOX}" stroke="${LINE}" stroke-width="2"/>`;
      for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) beam += `<circle cx="${62 + c * 48}" cy="${56 + r * 48}" r="14" fill="#fff" stroke="${LINE}" stroke-width="2"/>`;
      const mark = `<line x1="62" y1="14" x2="110" y2="14" stroke="${LINE}" stroke-width="2.5" marker-start="url(#arw)" marker-end="url(#arw)"/>` + label(210, 14, '12.7 mm between holes', 30, { size: 14 }) + label(230, 152, '2 holes wide, 8 holes long: a 2x8 beam', 50, { size: 15, bold: true });
      const joint = (x, pins, text) => { let s = `<rect x="${x}" y="50" width="96" height="30" rx="8" fill="${YES}" stroke="${LINE}" stroke-width="2"/><rect x="${x + 28}" y="${pins === 1 ? 20 : 50}" width="${pins === 1 ? 30 : 96}" height="${pins === 1 ? 92 : 30}" rx="8" fill="${NO}" stroke="${LINE}" stroke-width="2" ${pins === 1 ? `transform="rotate(25 ${x + 43} 65)"` : `transform="translate(0 26)"`}/>`; s += pins === 1 ? `<circle cx="${x + 43}" cy="65" r="7" fill="${INK}"/>` : `<circle cx="${x + 42}" cy="72" r="7" fill="${INK}"/><circle cx="${x + 80}" cy="72" r="7" fill="${INK}"/>`; return s + label(x + 48, 152, text, 18, { size: 14 }); };
      return { h: 176, body: beam + mark + joint(462, 1, '1 pin: swings') + joint(590, 2, '2 pins: locked') };
    },
    shapes() {
      const force = x => `<line x1="${x}" y1="56" x2="${x + 44}" y2="56" stroke="#b3261e" stroke-width="4" marker-end="url(#arw)"/>`;
      const square = `<rect x="80" y="30" width="110" height="110" fill="none" stroke="#9a9ab0" stroke-width="3" stroke-dasharray="7 6"/><path d="M110 30 L220 30 L190 140 L80 140 Z" fill="${NO}" fill-opacity=".7" stroke="${LINE}" stroke-width="4"/>`;
      const tri = `<path d="M520 26 L590 140 L450 140 Z" fill="${YES}" stroke="${LINE}" stroke-width="4"/>`;
      const joints = [[110, 30], [220, 30], [190, 140], [80, 140], [520, 26], [590, 140], [450, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="${INK}"/>`).join('');
      return { h: 190, body: force(20) + force(392) + square + tri + joints + label(150, 166, 'A square leans into a diamond', 40) + label(520, 166, 'A triangle keeps its shape', 40) };
    },
    gears() {
      const gear = (cx, cy, r, teeth, fill) => {
        let d = '';
        for (let i = 0; i < teeth * 2; i++) { const a = i / (teeth * 2) * Math.PI * 2, R = i % 2 ? r : r + 9; for (const da of [-.42, .42]) { const b = a + da * Math.PI / teeth; d += `${d ? 'L' : 'M'}${(cx + R * Math.cos(b)).toFixed(1)} ${(cy + R * Math.sin(b)).toFixed(1)}`; } }
        return `<path d="${d}Z" fill="${fill}" stroke="${LINE}" stroke-width="2"/><rect x="${cx - 7}" y="${cy - 7}" width="14" height="14" fill="#fff" stroke="${LINE}" stroke-width="2"/>`;
      };
      return { h: 238, body: gear(150, 100, 38, 12, YES) + gear(308, 100, 108, 36, BOX) + label(150, 172, '12 teeth: driving gear', 18, { bold: true }) + label(308, 226, '36 teeth: driven gear', 30, { bold: true }) + box(452, 26, 250, 152, '#fff') + label(577, 60, '36 ÷ 12 = 3:1 ratio', 28, { bold: true, size: 17 }) + label(577, 104, '3 times the torque', 28) + label(577, 134, '1/3 of the speed', 28) + label(577, 162, 'opposite direction', 28, { size: 14 }) };
    }
  };

  window.Visuals = {
    render(v) {
      const d = DRAW[v.type](v);
      return `<figure class="viz"><svg viewBox="0 0 720 ${d.h}" role="img" aria-label="${esc(v.alt)}">${MARKER}${d.body}</svg></figure>`;
    }
  };
})();
