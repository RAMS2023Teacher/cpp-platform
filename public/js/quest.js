/* The Rescue Robot quest: which lesson earns which part, how the partly built
   robot is drawn, and the learning map. Parts are keyed by lesson id, so they work with any term plan. */
(function () {
  const PARTS = [
    { id: 'u1l1', icon: '', name: 'Chassis frame', does: 'The skeleton everything else bolts onto.' },
    { id: 'u1b1', icon: '', name: 'Corner brackets', does: 'Pin the frame together so it holds its shape.' },
    { id: 'u1b2', icon: '', name: 'Cross braces', does: 'Stiffen the frame for rough terrain.' },
    { id: 'u1b3', icon: '', name: 'Gearbox', does: 'Trades speed for the strength to climb rubble.' },
    { id: 'u1l2', icon: '', name: 'Drive wheels', does: 'Four wheels to cross rough ground.' },
    { id: 'u1l3', icon: '', name: 'Robot Brain', does: 'Runs every line of code you write.' },
    { id: 'u1v1', icon: '', name: 'Data link', does: 'Carries your code from the computer to the Brain.' },
    { id: 'u1l4', icon: '', name: 'Drive motors', does: 'Turn your commands into movement.' },
    { id: 'u2l1', icon: '', name: 'Memory bank', does: 'Stores the values your robot keeps track of.' },
    { id: 'u2l2', icon: '', name: 'Battery pack', does: 'Keeps the loops running through a long search.' },
    { id: 'u2l3', icon: '', name: 'Touch LED', does: 'Signals what the robot has decided.' },
    { id: 'u2l4', icon: '', name: 'Distance sensor', does: 'Sees walls and rubble before hitting them.' },
    { id: 'u2l5', icon: '', name: 'Function board', does: 'Packages skills the robot can reuse.' },
    { id: 'u3l1', icon: '', name: 'Front bumper', does: 'Feels its way through a collapsed maze.' },
    { id: 'u3l2', icon: '', name: 'Optical sensor', does: 'Follows marked evacuation routes.' },
    { id: 'u3l3', icon: '', name: 'Searchlight', does: 'Scans each zone for survivors.' },
    { id: 'u3l4', icon: '', name: 'Cargo rack', does: 'Keeps supplies sorted and ready.' },
    { id: 'u3l5', icon: '', name: 'Rescue claw', does: 'Picks up and carries what matters.' },
    { id: 'u3l6', icon: '', name: 'Navigation antenna', does: 'Finds the shortest safe path.' },
    { id: 'u3l7', icon: '', name: 'Stabilizer', does: 'Smooths out every stop and turn.' },
    { id: 'u4l1', icon: '', name: 'AI core', does: 'Lets the robot act on what it senses.' },
    { id: 'u4l2', icon: '', name: 'Decision module', does: 'Works through choices step by step.' },
    { id: 'u4l3', icon: '', name: 'Mode switch', does: 'Moves between search, carry and return.' },
    { id: 'u4l4', icon: '', name: 'Training camera', does: 'Collects the examples the AI learns from.' },
    { id: 'u4l5', icon: '', name: 'Learning chip', does: 'Improves through trial and error.' },
    { id: 'u4l6', icon: '', name: 'Safety governor', does: 'Keeps decisions fair and people safe.' }
  ];
  const MISSION = [
    { id: 'u5l1', icon: '', name: 'Plan the rescue', mission: true, does: 'Fit the rescue claw and design your strategy.' },
    { id: 'u5l2', icon: '', name: 'Field test', mission: true, does: 'Build, code and test on the rescue field.' },
    { id: 'u5l3', icon: '', name: 'Rescue day', mission: true, does: 'Show what your finished robot can do.' }
  ];
  const ALL = PARTS.concat(MISSION);
  // Parts that sim.js draws itself; everything else is added on top in drawExtras.
  const BUILT_IN = { wheels: ['u1l2'], brain: ['u1l3'], led: ['u2l3'], claw: ['u3l5', 'u5l1'] } // the capstone fits a claw if the Cube Sorting lesson didn't;
  const UNIT_COLORS = { 1: '#f0d9b5', 2: '#c9d7f2', 3: '#e3cbef', 4: '#bfe6e0', 5: '#f6e39a' };
  const UNIT_NAMES = { 1: 'Meet Your Robot', 2: 'C++ Foundations', 3: 'Algorithms', 4: 'Artificial Intelligence', 5: 'Rescue Mission' };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const part = id => ALL.find(p => p.id === id);

  function drawExtras(ctx, k, has) {
    const box = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x * k, y * k, w * k, h * k); ctx.strokeStyle = '#222'; ctx.lineWidth = 1; ctx.strokeRect(x * k, y * k, w * k, h * k); };
    const dot = (x, y, r, color) => { ctx.fillStyle = color; ctx.strokeStyle = '#222'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x * k, y * k, r * k, 0, 7); ctx.fill(); ctx.stroke(); };
    if (has('u1b2')) { box(-3.35, -4.4, .35, 8.8, '#9aa3ad'); box(3, -4.4, .35, 8.8, '#9aa3ad'); }
    if (has('u1b1')) [[-3.8, -4.9], [3.1, -4.9], [-3.8, 4.2], [3.1, 4.2]].forEach(([x, y]) => box(x, y, .7, .7, '#6c7580'));
    if (has('u1b3')) { dot(-3.1, .4, .6, '#c0c0c0'); dot(3.1, .4, .6, '#c0c0c0'); }
    if (has('u1v1')) { box(-.35, 2.9, .7, 1.3, '#1c7ed6'); dot(0, 2.75, .3, '#74c0fc'); }
    if (has('u1l4')) { box(-4.5, -2.8, 1.1, 1.7, '#555'); box(3.4, -2.8, 1.1, 1.7, '#555'); box(-4.5, 1.6, 1.1, 1.7, '#555'); box(3.4, 1.6, 1.1, 1.7, '#555'); }
    if (has('u2l1')) box(-3.2, -4.2, 1.5, 1, '#2e8b57');
    if (has('u2l2')) box(-2.2, 4.2, 4.4, 1.4, '#e0a500');
    if (has('u2l4')) box(-1, -5.8, 2, .9, '#1c7ed6');
    if (has('u2l5')) box(1.7, -4.2, 1.5, 1, '#8e44ad');
    if (has('u3l1')) box(-3.9, -6.5, 7.8, .55, '#333');
    if (has('u3l2')) dot(-2.8, -1.9, .45, '#f03e3e');
    if (has('u3l3')) { ctx.fillStyle = 'rgba(255,225,90,.55)'; ctx.beginPath(); ctx.moveTo(2.8 * k, -2 * k); ctx.lineTo(6.5 * k, -8 * k); ctx.lineTo(1 * k, -8.6 * k); ctx.fill(); dot(2.8, -1.9, .45, '#ffe066'); }
    if (has('u3l4')) { box(-3.4, 5.7, 6.8, 1.5, '#a0764a'); box(-2.8, 6, 1.1, .9, '#d94848'); box(-.5, 6, 1.1, .9, '#3e7bd6'); box(1.7, 6, 1.1, .9, '#3ca55c'); }
    if (has('u3l6')) { ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-3 * k, 3.4 * k); ctx.lineTo(-5.8 * k, -.2 * k); ctx.stroke(); dot(-5.8, -.2, .4, '#e03131'); }
    if (has('u3l7')) dot(2.9, 3.5, .55, '#20c997');
    if (has('u4l1')) { ctx.save(); ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 2 * k; box(-1.1, -.2, 2.2, 2, '#22d3ee'); ctx.restore(); }
    if (has('u4l2')) { box(-2.3, -.9, .9, .9, '#74c476'); box(1.4, -.9, .9, .9, '#74c476'); }
    if (has('u4l3')) { box(-2.3, 1.7, .9, .9, '#fab005'); box(1.4, 1.7, .9, .9, '#fab005'); }
    if (has('u4l4')) { box(-.8, -3.7, 1.6, 1.1, '#222'); dot(0, -3.15, .35, '#74c0fc'); }
    if (has('u4l5')) dot(0, .8, .35, '#fff');
    if (has('u4l6')) { ctx.strokeStyle = 'rgba(56,160,255,.75)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -.4, 7.6 * k, 8.8 * k, 0, 0, 7); ctx.stroke(); }
    if (has('u5l1')) { ctx.fillStyle = '#c92a2a'; ctx.fillRect(3 * k, 3.9 * k, .25 * k, 2.8 * k); ctx.beginPath(); ctx.moveTo(3.25 * k, 3.9 * k); ctx.lineTo(5.1 * k, 4.6 * k); ctx.lineTo(3.25 * k, 5.3 * k); ctx.fill(); }
    if (has('u5l2')) { box(-1, 4.4, 2, 1, '#fff'); ctx.fillStyle = '#e03131'; ctx.fillRect(-.15 * k, 4.5 * k, .3 * k, .8 * k); ctx.fillRect(-.45 * k, 4.8 * k, .9 * k, .22 * k); }
    if (has('u5l3')) dot(0, -7.9, .75, '#ffd43b');
  }

  /** Draws the robot with only the parts earned by the lessons in `built` (a Set of lesson ids). */
  function drawBuild(canvas, look, built, background) {
    const ctx = canvas.getContext('2d'), S = canvas.width, k = S / 22;
    const parts = new Set(Object.keys(BUILT_IN).filter(name => BUILT_IN[name].some(id => built.has(id))));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, S, S);
    if (background) {
      ctx.fillStyle = '#d9dde3'; ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = '#c2c8d0'; ctx.lineWidth = 1;
      for (let i = k * 2; i < S; i += k * 3) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, S); ctx.moveTo(0, i); ctx.lineTo(S, i); ctx.stroke(); }
    }
    ctx.translate(S / 2, S / 2);
    ctx.globalAlpha = built.has('u1l1') ? 1 : .25; // nothing earned yet: a faint outline of what's to come
    VexSim.drawRobot(ctx, k, VexSim.normalizeLook(look), { parts });
    ctx.globalAlpha = 1;
    drawExtras(ctx, k, id => built.has(id));
  }

  const tokens = new Map();
  function tokenImage(look, built) {
    const key = JSON.stringify([look, built]);
    if (!tokens.has(key)) {
      const c = document.createElement('canvas'); c.width = c.height = 110;
      drawBuild(c, look, new Set(['u1l1', ...built]), false); // even a new student shows up on the map
      tokens.set(key, c.toDataURL());
    }
    return tokens.get(key);
  }

  // ---- learning map: a flight from Earth (bottom) to Moon Base (top), one row per unit
  const W = 1000, ROW = 156, MARGIN = 86, SKY = 44, GROUND = 104;
  const ZONES = {
    1: { icon: '', name: 'Earth', story: 'Build your robot at the launch site.' },
    2: { icon: '', name: 'The Sky', story: 'Teach your robot to think on the climb.' },
    3: { icon: '', name: 'Orbit', story: 'Plot a course with smarter algorithms.' },
    4: { icon: '', name: 'Deep Space', story: 'Far from home, your robot learns to decide alone.' },
    5: { icon: '', name: 'Moon Base', story: 'Land and carry out the rescue.' }
  };
  const EVENT_STORY = { sumo: 'Launch trials: every robot must prove it is ready to fly.', maze: 'Asteroid field: find the fastest safe way through.' };
  const MOON_KM = 384400;
  function layout(lessons) {
    const units = [...new Set(lessons.map(l => l.unit))], stops = [], height = SKY + units.length * ROW + GROUND;
    const rowTop = row => SKY + (units.length - 1 - row) * ROW; // the first unit is at the bottom
    units.forEach((u, row) => {
      const inRow = lessons.filter(l => l.unit === u).map(l => ({ lesson: l }));
      if (row === units.length - 1) inRow.push({ finish: true });
      const gap = inRow.length > 1 ? (W - 2 * MARGIN) / (inRow.length - 1) : 0;
      inRow.forEach((s, i) => {
        const across = inRow.length === 1 ? W / 2 : MARGIN + gap * (row % 2 ? inRow.length - 1 - i : i);
        stops.push(Object.assign(s, { x: Math.round(across), y: rowTop(row) + 50, row, index: stops.length }));
      });
    });
    return { stops, units, height, rowTop };
  }
  function road(stops) {
    return stops.map((s, i) => {
      if (!i) return `M${s.x} ${s.y}`;
      const p = stops[i - 1];
      if (p.row === s.row) return `L${s.x} ${s.y}`;
      const side = s.row % 2 ? W - 12 : 12; // swing out past the edge of the row
      return `C${side} ${p.y} ${side} ${s.y} ${s.x} ${s.y}`;
    }).join(' ');
  }
  function backdrop(stops, height) {
    const stars = Array.from({ length: 90 }, (_, i) => { // the same sky every time, thinning out toward Earth
      const x = (i * 197.3) % W, y = (i * i * 7.13) % (height * .72), r = 1 + (i % 3) * .5;
      return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r}" fill="#fff" opacity="${(.35 + (i % 4) * .15).toFixed(2)}"/>`;
    }).join('');
    const end = stops[stops.length - 1], mx = end.x, my = end.y + 12;
    const craters = [[-48, -40, 15], [38, -52, 10], [56, 22, 18], [-62, 34, 11], [-12, 62, 13]].map(([x, y, r]) => `<circle cx="${mx + x}" cy="${my + y}" r="${r}" fill="#4d5468"/>`).join('');
    const top = height - GROUND + 34;
    return `<defs>
        <linearGradient id="map-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#090d2b"/><stop offset=".55" stop-color="#16346e"/><stop offset="1" stop-color="#1f6aa5"/></linearGradient>
        <clipPath id="map-earth"><ellipse cx="500" cy="${top + 720}" rx="1250" ry="720"/></clipPath>
      </defs>
      <rect width="${W}" height="${height}" fill="url(#map-sky)"/>${stars}
      <circle cx="${mx}" cy="${my}" r="104" fill="#666d82"/>${craters}
      <ellipse cx="500" cy="${top + 720}" rx="1262" ry="732" fill="#7fd6f2" opacity=".35"/>
      <g clip-path="url(#map-earth)"><rect y="${top}" width="${W}" height="${GROUND}" fill="#1b8fc4"/>
        <path d="M0 ${top + 38}C120 ${top + 4} 250 ${top + 22} 360 ${top + 60}S520 ${height} 300 ${height}H0Z" fill="#46b36b"/>
        <path d="M640 ${height}C640 ${top + 40} 760 ${top + 6} 880 ${top + 14}S1000 ${top + 36} 1000 ${top + 50}V${height}Z" fill="#46b36b"/></g>`;
  }
  function renderMap(data) {
    const { stops, units, height, rowTop } = layout(data.lessons);
    const youAt = data.students.find(s => s.me)?.at ?? -1;
    const atStop = i => data.students.filter(s => s.at === i).sort((a, b) => b.me - a.me);
    const labels = units.map((u, r) => {
      const z = ZONES[u] || { icon: '', name: UNIT_NAMES[u] || '' }, y = rowTop(r) + 18;
      return `<text x="${r % 2 ? W - 12 : 12}" y="${y}" text-anchor="${r % 2 ? 'end' : 'start'}" class="map-unit">${z.icon} ${esc(z.name.toUpperCase())} · ${esc(UNIT_NAMES[u] || '')}</text>`;
    }).join('');
    const nodes = stops.map((s, i) => {
      const people = atStop(i), l = s.lesson;
      const state = s.finish ? (youAt === i ? 'done' : 'finish') : l.complete ? 'done' : i === youAt ? 'here' : l.unlocked ? 'open' : 'locked';
      const you = people.find(p => p.me);
      const names = people.length > 3 ? people.slice(0, 2) : people;
      const lines = names.map((p, j) => `<image href="${tokenImage(p.look, p.built)}" x="${s.x - 62}" y="${s.y + 25 + j * 26}" width="26" height="26"/>
        <text x="${s.x - 34}" y="${s.y + 43 + j * 26}" class="map-name${p.me ? ' me' : ''}">${esc(p.me ? 'You' : p.name.length > 15 ? p.name.slice(0, 14) + '…' : p.name)}</text>`).join('');
      const more = people.length > 3 ? `<text x="${s.x - 34}" y="${s.y + 95}" class="map-name">+${people.length - 2} more</text>` : '';
      const label = s.finish ? 'Moon Base, the finish line' : (l.event ? `Class event: ${l.title}` : `Lesson ${l.num}: ${l.title}`);
      return `<g class="map-stop ${state}" data-stop="${i}" role="button" tabindex="0" aria-label="${esc(label)}, ${people.length} here">
        <title>${esc(label)}</title>
        <circle cx="${s.x}" cy="${s.y}" r="21"/>
        <text x="${s.x}" y="${s.y + 6}" class="map-num">${s.finish ? '★' : l.complete ? '✓' : l.event ? '★' : l.num}</text>
        ${you ? `<image href="${tokenImage(you.look, you.built)}" x="${s.x - 42}" y="${s.y - 52}" width="84" height="84" class="map-you"/>` : ''}
        ${lines}${more}</g>`;
    }).join('');
    const launch = stops[0];
    return {
      stops,
      svg: `<svg class="learning-map" viewBox="0 0 ${W} ${height}" role="group" aria-label="Mission map from Earth to Moon Base">
        ${backdrop(stops, height)}${labels}
        <path d="${road(stops)}" class="map-road"/><path d="${road(stops)}" class="map-lane"/>
        <text x="${launch.x + 2}" y="${height - 22}" font-size="30" text-anchor="middle" aria-hidden="true"></text>
        ${nodes}</svg>`
    };
  }

  window.Quest = { part, drawBuild, renderMap, ZONES, EVENT_STORY, MOON_KM };
})();
