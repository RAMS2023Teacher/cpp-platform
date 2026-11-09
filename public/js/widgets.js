/* Interactive lesson widgets: <div data-widget="name"></div> */
(function () {
  const h = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) { if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else if (k === 'class') e.className = v; else e.setAttribute(k, v); }
    kids.flat().forEach(k => e.append(k instanceof Node ? k : document.createTextNode(k)));
    return e;
  };
  const W = {};

  W['binary-search'] = el => {
    let lo, hi, secret, guesses, max = 100;
    const msg = h('p', {}, ''), input = h('input', { class: 'input', type: 'number', style: 'max-width:140px;display:inline-block;margin:0' });
    const range = h('p', { class: 'muted small' });
    const sel = h('select', { class: 'input', style: 'max-width:180px;display:inline-block;margin:0' }, ...[100, 1000, 1000000].map(n => h('option', { value: n }, `1 – ${n.toLocaleString()}`)));
    function start() { max = +sel.value; lo = 1; hi = max; secret = 1 + Math.floor(Math.random() * max); guesses = 0; msg.textContent = `I'm thinking of a number from 1 to ${max.toLocaleString()}. Guess it!`; upd(); }
    function upd() { range.textContent = `Possible range: ${lo.toLocaleString()} – ${hi.toLocaleString()}   ·   Guesses: ${guesses}   ·   Binary search would need at most ${Math.ceil(Math.log2(max + 1))}`; }
    function guess(g) {
      if (!Number.isFinite(g)) return; guesses++;
      if (g === secret) msg.textContent = `🎉 Got it in ${guesses} guesses! The number was ${secret.toLocaleString()}.`;
      else if (g < secret) { msg.textContent = `${g.toLocaleString()} is too LOW ⬆️`; lo = Math.max(lo, g + 1); }
      else { msg.textContent = `${g.toLocaleString()} is too HIGH ⬇️`; hi = Math.min(hi, g - 1); }
      upd();
    }
    el.append(h('h4', {}, '🔎 Binary Search Challenge'), h('div', { class: 'row' }, sel, h('button', { class: 'btn sm', onclick: start }, 'New game')), msg,
      h('div', { class: 'row' }, input, h('button', { class: 'btn primary sm', onclick: () => { guess(+input.value); input.select(); } }, 'Guess'),
        h('button', { class: 'btn sm', onclick: () => { const m = Math.floor((lo + hi) / 2); input.value = m; guess(m); } }, '🤖 Let the robot guess the middle')), range);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { guess(+input.value); input.select(); } });
    start();
  };

  W['bubble-sort'] = el => {
    let arr, i, j, swaps, comps, done;
    const bars = h('div', { class: 'bars' }), info = h('p', { class: 'small muted' }), code = h('pre', { class: 'code', style: 'font-size:.8rem' });
    function reset() { arr = Array.from({ length: 8 }, () => 5 + Math.floor(Math.random() * 95)); i = 0; j = 0; swaps = 0; comps = 0; done = false; draw(); }
    function draw(cmp) {
      bars.innerHTML = '';
      const sortedFrom = arr.length - i;
      arr.forEach((v, k) => bars.append(h('div', { class: (cmp && (k === j || k === j + 1) ? 'cmp' : '') + (k >= sortedFrom || done ? ' done' : ''), style: `height:${v * 1.5}px` }, String(v))));
      info.textContent = done ? `✅ Sorted! ${comps} comparisons, ${swaps} swaps.` : `Pass ${i + 1}: comparing positions ${j} and ${j + 1}.  Comparisons: ${comps}  Swaps: ${swaps}`;
      code.textContent = `if (arr[${j}] > arr[${j + 1}])   // ${arr[j]} > ${arr[j + 1]} ?  ${arr[j] > arr[j + 1] ? 'YES → swap' : 'no'}`;
    }
    function step() {
      if (done) return;
      comps++;
      if (arr[j] > arr[j + 1]) { [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]; swaps++; }
      j++;
      if (j >= arr.length - 1 - i) { j = 0; i++; }
      if (i >= arr.length - 1) done = true;
      draw(true);
    }
    let timer = null;
    el.append(h('h4', {}, '🫧 Bubble Sort, step by step'), bars, code, info,
      h('div', { class: 'row' }, h('button', { class: 'btn primary sm', onclick: step }, 'Step ▶'),
        h('button', { class: 'btn sm', onclick: () => { clearInterval(timer); timer = setInterval(() => { step(); if (done) clearInterval(timer); }, 350); } }, 'Auto ⏩'),
        h('button', { class: 'btn sm', onclick: () => { clearInterval(timer); reset(); } }, 'Shuffle 🔀')));
    reset();
  };

  W['maze-bfs'] = el => {
    const R = 10, C = 14; let walls = new Set(['2,3', '3,3', '4,3', '5,3', '6,3', '1,7', '2,7', '3,7', '4,7', '6,10', '7,10', '8,10', '5,10']);
    const S = [8, 1], G = [1, 12]; const cells = {};
    const grid = h('div', { class: 'mgrid', style: `grid-template-columns:repeat(${C},1fr)` }); const info = h('p', { class: 'small muted' }, 'Click squares to add/remove walls, then press Find Path.');
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      const d = h('div', { title: `${r},${c}`, role: 'button', tabindex: '0' }); cells[r + ',' + c] = d;
      const toggle = () => { const k = r + ',' + c; if (k === S.join() || k === G.join()) return; walls.has(k) ? walls.delete(k) : walls.add(k); paint(); };
      d.addEventListener('click', toggle);
      d.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      grid.append(d);
    }
    function paint() {
      for (const k in cells) {
        cells[k].className = walls.has(k) ? 'w' : k === S.join() ? 's' : k === G.join() ? 'g' : '';
        const [r, c] = k.split(',').map(Number);
        cells[k].setAttribute('aria-label', `Row ${r + 1}, column ${c + 1}: ${walls.has(k) ? 'wall' : k === S.join() ? 'robot start' : k === G.join() ? 'goal' : 'open'}`);
      }
    }
    async function bfs() {
      paint(); const q = [S], prev = { [S.join()]: null }; let order = 0;
      while (q.length) {
        const [r, c] = q.shift(); const k = r + ',' + c;
        if (k === G.join()) break;
        if (k !== S.join()) { cells[k].className = 'v'; if (++order % 3 === 0) await new Promise(res => setTimeout(res, 25)); }
        for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) {
          const nr = r + dr, nc = c + dc, nk = nr + ',' + nc;
          if (nr < 0 || nc < 0 || nr >= R || nc >= C || walls.has(nk) || nk in prev) continue;
          prev[nk] = k; q.push([nr, nc]);
        }
      }
      if (!(G.join() in prev)) { info.textContent = '🚫 No path! The goal is walled off.'; return; }
      let k = prev[G.join()], len = 1; while (k && k !== S.join()) { cells[k].className = 'p'; k = prev[k]; len++; }
      info.textContent = `✅ Shortest path: ${len} moves. BFS explored ${order} squares (light blue) — it searches in rings, nearest first.`;
    }
    el.append(h('h4', {}, '🧭 Breadth-First Search Maze'), h('p', { class: 'small' }, '🟩 robot start   🟥 goal   ⬛ wall   🟦 explored   🟨 shortest path'), grid, info,
      h('div', { class: 'row' }, h('button', { class: 'btn primary sm', onclick: bfs }, 'Find Path 🔍'), h('button', { class: 'btn sm', onclick: () => { walls = new Set(); paint(); } }, 'Clear walls'),
        h('button', { class: 'btn sm', onclick: () => { walls = new Set(); for (let i = 0; i < 38; i++) { const k = Math.floor(Math.random() * R) + ',' + Math.floor(Math.random() * C); if (k !== S.join() && k !== G.join()) walls.add(k); } paint(); } }, 'Random walls 🎲')));
    paint();
  };

  W['perceptron'] = el => {
    const cv = h('canvas', { width: 420, height: 300, role: 'img', 'aria-label': 'Training points and the line the model has learned. The accuracy is written below.', style: 'width:100%;max-width:420px;background:#fff;border:1px solid #e2e5ee;cursor:crosshair' });
    const ctx = cv.getContext('2d'); let pts = [], w = [0.2, -0.3, 0.05], label = 1, epochs = 0;
    const info = h('p', { class: 'small muted', role: 'status' });
    const pred = (x, y) => (w[0] * x + w[1] * y + w[2] >= 0 ? 1 : -1);
    function draw() {
      ctx.clearRect(0, 0, 420, 300);
      for (let x = 0; x < 420; x += 10) for (let y = 0; y < 300; y += 10) { ctx.fillStyle = pred(x / 420, y / 300) > 0 ? 'rgba(229,72,77,.08)' : 'rgba(62,99,221,.08)'; ctx.fillRect(x, y, 10, 10); }
      if (Math.abs(w[1]) > 1e-6) { ctx.strokeStyle = '#1b1f2a'; ctx.lineWidth = 2; ctx.beginPath(); const yAt = x => -(w[0] * x + w[2]) / w[1]; ctx.moveTo(0, yAt(0) * 300); ctx.lineTo(420, yAt(1) * 300); ctx.stroke(); }
      let right = 0;
      pts.forEach(p => { const ok = pred(p.x, p.y) === p.l; right += ok; ctx.fillStyle = p.l > 0 ? '#e5484d' : '#3e63dd'; ctx.beginPath(); ctx.arc(p.x * 420, p.y * 300, 7, 0, 7); ctx.fill(); if (!ok) { ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke(); } });
      info.textContent = pts.length ? `Accuracy: ${right}/${pts.length} (${Math.round(100 * right / pts.length)}%) · Training rounds: ${epochs} · Weights: [${w.map(v => v.toFixed(2)).join(', ')}]  (circled = wrong)` : 'Click to add points. Choose red or blue first.';
    }
    cv.addEventListener('click', e => { const r = cv.getBoundingClientRect(); pts.push({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, l: label }); draw(); });
    function train(n = 1) { for (let k = 0; k < n; k++) { epochs++; pts.forEach(p => { const err = p.l - pred(p.x, p.y); if (err) { w[0] += 0.1 * err * p.x; w[1] += 0.1 * err * p.y; w[2] += 0.1 * err; } }); } draw(); }
    const lbl = h('span', { class: 'tag' }, 'Adding: RED');
    el.append(h('h4', {}, '🧠 Train a Perceptron (a tiny neural network)'), h('p', { class: 'small' }, 'Each dot is a training example (think: Optical sensor readings). The line is the AI\'s decision boundary. Train it and watch it learn!'), cv,
      h('div', { class: 'row', style: 'margin-top:8px' }, h('button', { class: 'btn sm', onclick: () => { label = 1; lbl.textContent = 'Adding: RED'; } }, '🔴 Red'), h('button', { class: 'btn sm', onclick: () => { label = -1; lbl.textContent = 'Adding: BLUE'; } }, '🔵 Blue'), lbl,
        h('button', { class: 'btn sm', onclick: () => { pts.push({ x: Math.random(), y: Math.random(), l: label }); draw(); } }, 'Add a point for me'),
        h('button', { class: 'btn primary sm', onclick: () => train(1) }, 'Train 1 round'), h('button', { class: 'btn sm', onclick: () => train(25) }, 'Train ×25'),
        h('button', { class: 'btn sm', onclick: () => { w = [Math.random() - .5, Math.random() - .5, Math.random() - .5]; epochs = 0; draw(); } }, 'Forget (reset weights)'),
        h('button', { class: 'btn sm', onclick: () => { pts = []; epochs = 0; draw(); } }, 'Clear points')), info);
    draw();
  };

  W['decision-tree'] = el => {
    let tree; try { tree = JSON.parse(el.dataset.tree || ''); } catch (e) { tree = null; }
    tree = tree || { q: 'Is there a wall within 6 inches?', yes: { q: 'Is the bumper pressed?', yes: 'Back up and turn around', no: 'Turn right 90°' }, no: { q: 'Is the floor black (line)?', yes: 'Follow the line', no: 'Drive forward' } };
    const box = h('div'); const path = h('p', { class: 'small muted' });
    function show(node, trail) {
      box.innerHTML = ''; path.textContent = trail.length ? 'Path: ' + trail.join(' → ') : 'Answer the questions like the robot\'s "brain" would.';
      if (typeof node === 'string') { box.append(h('div', { class: 'tree-node tree-leaf' }, '🤖 Decision: ' + node), h('button', { class: 'btn sm', onclick: () => show(tree, []) }, 'Start over ↺')); return; }
      box.append(h('div', { class: 'tree-node' }, '❓ ' + node.q), h('div', { class: 'row', style: 'justify-content:center' },
        h('button', { class: 'btn go sm', onclick: () => show(node.yes, [...trail, node.q + ' YES']) }, 'Yes'),
        h('button', { class: 'btn stop sm', onclick: () => show(node.no, [...trail, node.q + ' NO']) }, 'No')));
    }
    el.append(h('h4', {}, '🌳 Decision Tree'), box, path); show(tree, []);
  };

  window.mountWidgets = root => root.querySelectorAll('[data-widget]').forEach(el => {
    if (el.dataset.mounted) return; el.dataset.mounted = 1; el.classList.add('widget');
    const f = W[el.dataset.widget]; if (f) f(el); else el.textContent = 'Unknown widget: ' + el.dataset.widget;
  });
})();
