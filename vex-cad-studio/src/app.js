// VEX IQ CAD Studio — the editor. Runs in the browser; the Apps Script server only hands out files.
(function () {
  'use strict';
  const PITCH = 12.7;
  const FILE_FORMAT = 'vex-iq-cad';
  const FILE_VERSION = 1;
  const AUTOSAVE_KEY = 'viq-cad-autosave-v1';
  const CATALOG = window.VIQ_CATALOG;
  const ELEC = window.VIQ_ELECTRONICS;
  const CAT_ORDER = CATALOG.categories;

  const COLORS = [
    ['Red', '#d32f2f'], ['Orange', '#f57c00'], ['Yellow', '#fbc02d'], ['Green', '#2e9d4a'], ['Teal', '#00897b'], ['Blue', '#1e63c6'],
    ['Purple', '#7b3fb5'], ['Pink', '#e05a9a'], ['White', '#f2f2f2'], ['Light Gray', '#b9bec6'], ['Dark Gray', '#4f5660'], ['Black', '#22252a']
  ];
  const CAT_COLOR = {
    'Beams': '#1e63c6', 'Plates': '#2e9d4a', 'Connectors': '#f57c00', 'Panels': '#fbc02d', 'Pins': '#7b3fb5', 'Standoffs': '#4f5660',
    'Shafts & Collars': '#4f5660', 'Gears & Sprockets': '#d32f2f', 'Wheels & Tires': '#00897b', 'Motion': '#e05a9a',
    'Electronics': '#4f5660', 'Special & Themed': '#f57c00'
  };
  const partColorDefault = p => /tire|rubber|belt|band|tread/i.test(p.name) ? '#22252a' : (CAT_COLOR[p.cat] || '#b9bec6');

  // ---------- catalog ----------
  const parts = CATALOG.parts.concat(ELEC.list);
  const byId = new Map(parts.map(p => [p.id, p]));
  for (const p of ELEC.list) {
    const g = ELEC.build(p.id); g.computeBoundingBox();
    p.min = g.boundingBox.min.toArray(); p.max = g.boundingBox.max.toArray(); p.tris = g.attributes.position.count / 3;
  }

  // ---------- small helpers ----------
  const $ = s => document.querySelector(s);
  const el = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    for (const kid of kids.flat()) if (kid != null) e.append(kid.nodeType ? kid : document.createTextNode(kid));
    return e;
  };
  const round = (x, d = 3) => { const f = 10 ** d; return Math.round(x * f) / f; };
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }
  function b64(s) { const bin = atob(s), out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; }
  function download(blob, name) {
    const a = el('a', { href: URL.createObjectURL(blob), download: name });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  const safeName = () => (modelName().replace(/[^\w\- ]+/g, '').trim() || 'model').replace(/\s+/g, '-');
  const modelName = () => $('#modelName').value.trim() || 'My Robot';

  function dialog(html, buttons = [['OK', 'ok']]) {
    const d = $('#dialog');
    $('#dialogBody').innerHTML = '';
    $('#dialogBody').append(typeof html === 'string' ? el('div', {}, html) : html);
    const menu = $('#dialogMenu'); menu.innerHTML = '';
    buttons.forEach(([label, value, primary]) => menu.append(el('button', { value, class: primary ? 'primary' : '' }, label)));
    return new Promise(res => {
      d.onclose = () => res(d.returnValue);
      d.returnValue = '';
      d.showModal();
    });
  }

  // ---------- storage cache (IndexedDB) ----------
  const cache = (() => {
    let dbp = null;
    function db() {
      if (!dbp) dbp = new Promise(res => {
        try {
          const r = indexedDB.open('viq-cad', 1);
          r.onupgradeneeded = () => { r.result.createObjectStore('chunks'); r.result.createObjectStore('thumbs'); };
          r.onsuccess = () => res(r.result);
          r.onerror = () => res(null);
        } catch (e) { res(null); }
      });
      return dbp;
    }
    async function op(store, mode, fn) {
      const d = await db(); if (!d) return undefined;
      return new Promise(res => {
        try {
          const tx = d.transaction(store, mode), req = fn(tx.objectStore(store));
          req.onsuccess = () => res(req.result); req.onerror = () => res(undefined);
        } catch (e) { res(undefined); }
      });
    }
    const v = CATALOG.version + '/';
    return {
      get: (store, key) => op(store, 'readonly', s => s.get(v + key)),
      put: (store, key, val) => op(store, 'readwrite', s => s.put(val, v + key)),
      async prune() {
        for (const store of ['chunks', 'thumbs']) {
          const keys = await op(store, 'readonly', s => s.getAllKeys()) || [];
          for (const k of keys) if (!String(k).startsWith(v)) op(store, 'readwrite', s => s.delete(k));
        }
      }
    };
  })();

  // ---------- mesh loading ----------
  const chunkJobs = new Map();
  const raw = new Map();
  const geoms = new Map();
  let chunksDone = 0;
  function fetchChunk(name) {
    if (window.google && google.script && google.script.run) {
      return new Promise((res, rej) => google.script.run.withSuccessHandler(res).withFailureHandler(rej).cadPartsChunk(name));
    }
    return fetch('chunks/' + name + '.html').then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
  }
  function loadChunk(name) {
    if (!chunkJobs.has(name)) {
      const job = (async () => {
        let text = await cache.get('chunks', name);
        if (!text) {
          for (let tries = 0; ; tries++) {
            try { text = await fetchChunk(name); break; }
            catch (e) { if (tries >= 3) throw e; await new Promise(r => setTimeout(r, 1500 * (tries + 1))); }
          }
          cache.put('chunks', name, text);
        }
        for (const r of JSON.parse(text)) raw.set(r.id, r);
        chunksDone++; updateLoadStatus();
      })();
      job.catch(() => { chunkJobs.delete(name); toast('Some parts could not load. Check your connection and try again.'); });
      chunkJobs.set(name, job);
    }
    return chunkJobs.get(name);
  }
  function updateLoadStatus() {
    const n = CATALOG.chunks.length;
    $('#stLoad').textContent = chunksDone < n ? `Loading part shapes… ${Math.round(chunksDone / n * 100)}%` : '';
  }
  async function getGeometry(id) {
    if (geoms.has(id)) return geoms.get(id);
    const p = byId.get(id);
    if (!p) throw new Error('Unknown part ' + id);
    let g;
    if (p.stand) g = ELEC.build(id);
    else {
      await loadChunk(p.chunk);
      await MeshoptDecoder.ready;
      if (geoms.has(id)) return geoms.get(id);
      const r = raw.get(id);
      const vb = new Uint8Array(r.vc * 8);
      MeshoptDecoder.decodeVertexBuffer(vb, r.vc, 8, b64(r.v));
      const q = new Uint16Array(vb.buffer), pos = new Float32Array(r.vc * 3);
      for (let i = 0; i < r.vc; i++) for (let a = 0; a < 3; a++) pos[i * 3 + a] = p.min[a] + q[i * 4 + a] / 65535 * (p.max[a] - p.min[a]);
      const idx = new Uint32Array(r.ic);
      MeshoptDecoder.decodeIndexBuffer(new Uint8Array(idx.buffer), r.ic, 4, b64(r.i));
      const indexed = new THREE.BufferGeometry();
      indexed.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      indexed.setIndex(new THREE.BufferAttribute(idx, 1));
      g = THREE.BufferGeometryUtils.toCreasedNormals(indexed, THREE.MathUtils.degToRad(35));
      indexed.dispose();
      raw.delete(id);
    }
    g.computeBoundingBox(); g.computeBoundingSphere();
    geoms.set(id, g);
    return g;
  }
  const boxGeoms = new Map();
  function placeholderGeometry(p) {
    if (!boxGeoms.has(p.id)) {
      const s = p.max.map((m, a) => Math.max(m - p.min[a], 0.5));
      const g = new THREE.BoxGeometry(s[0], s[1], s[2]);
      g.translate((p.max[0] + p.min[0]) / 2, (p.max[1] + p.min[1]) / 2, (p.max[2] + p.min[2]) / 2);
      g.computeBoundingBox(); g.computeBoundingSphere();
      boxGeoms.set(p.id, g);
    }
    return boxGeoms.get(p.id);
  }

  // Parts with an even number of holes along an axis have their centre half a pitch off the hole grid.
  // This offset is added when snapping by whole pitches, so holes on different parts line up.
  function holeOffset(pid, quat) {
    const p = byId.get(pid), off = new THREE.Vector3();
    for (let i = 0; i < 3; i++) {
      const ext = p.max[i] - p.min[i], mid = (p.max[i] + p.min[i]) / 2, n = Math.round(ext / PITCH);
      if (n >= 2 && n % 2 === 0 && Math.abs(ext - n * PITCH) < 1.5 && Math.abs(mid) < 0.5) off.setComponent(i, PITCH / 2);
    }
    off.applyQuaternion(quat);
    return new THREE.Vector3(Math.abs(round(off.x)), Math.abs(round(off.y)), Math.abs(round(off.z)));
  }
  const snapStep = () => +$('#snapMove').value || 0;

  // ---------- scene ----------
  const viewport = $('#viewport');
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  viewport.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  scene.background = new THREE.Color(dark ? 0x1e252f : 0xe4e9f0);
  const camera = new THREE.PerspectiveCamera(40, 1, 1, 20000);
  camera.position.set(260, 220, 320);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8890a0, 0.75));
  const sun = new THREE.DirectionalLight(0xffffff, 0.75); sun.position.set(300, 600, 400); scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.3); fill.position.set(-400, 200, -300); scene.add(fill);
  const camLight = new THREE.DirectionalLight(0xffffff, 0.25); camera.add(camLight); scene.add(camera);

  const grid = new THREE.Group();
  const lin = hex => new THREE.Color(hex).convertSRGBToLinear();
  const minor = new THREE.GridHelper(60 * PITCH, 60, lin(dark ? 0x2a3340 : 0xc9d0da), lin(dark ? 0x2a3340 : 0xc9d0da));
  const major = new THREE.GridHelper(60 * PITCH, 12, lin(dark ? 0x3d4a5e : 0xa3adbb), lin(dark ? 0x3d4a5e : 0xa3adbb));
  minor.position.y = -0.05; major.position.y = -0.04;
  grid.add(minor, major); scene.add(grid);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ visible: false }));
  scene.add(ground);

  const model = new THREE.Group(); scene.add(model);
  const selBox = new THREE.Box3Helper(new THREE.Box3(), 0x1f6feb); selBox.visible = false; scene.add(selBox);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.screenSpacePanning = true;
  controls.addEventListener('change', render);
  controls.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };

  const pivot = new THREE.Object3D(); scene.add(pivot);
  const gizmo = new THREE.TransformControls(camera, renderer.domElement);
  gizmo.setSize(0.85);
  scene.add(gizmo);
  gizmo.addEventListener('change', render);
  gizmo.addEventListener('dragging-changed', e => { controls.enabled = !e.value; });

  const mats = new Map();
  function material(hex, selected, ghost) {
    const key = hex + (selected ? 's' : '') + (ghost ? 'g' : '');
    if (!mats.has(key)) {
      const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(hex).convertSRGBToLinear(), roughness: 0.55, metalness: 0.02 });
      if (selected) { m.emissive = new THREE.Color(0x1f6feb); m.emissiveIntensity = 0.35; }
      if (ghost) { m.transparent = true; m.opacity = 0.55; m.depthWrite = false; }
      mats.set(key, m);
    }
    return mats.get(key);
  }

  let renderQueued = false;
  function render() {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; renderer.render(scene, camera); });
  }
  function resize() {
    const w = viewport.clientWidth, h = viewport.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    render();
  }
  new ResizeObserver(resize).observe(viewport);

  // ---------- model parts ----------
  let nextUid = 1;
  function addPart(pid, opts = {}) {
    const p = byId.get(pid);
    if (!p) return null;
    const color = opts.color || partColorDefault(p);
    const mesh = new THREE.Mesh(geoms.get(pid) || placeholderGeometry(p), material(color));
    mesh.userData = { uid: opts.uid || nextUid++, pid, color };
    if (opts.uid && opts.uid >= nextUid) nextUid = opts.uid + 1;
    if (opts.position) mesh.position.fromArray(opts.position);
    if (opts.quaternion) mesh.quaternion.fromArray(opts.quaternion);
    if (opts.hidden) mesh.visible = false;
    model.add(mesh);
    if (!geoms.has(pid)) getGeometry(pid).then(g => { mesh.geometry = g; if (selection.includes(mesh)) updateSelectionBox(); render(); }).catch(() => {});
    return mesh;
  }
  function setColor(mesh, hex) {
    mesh.userData.color = hex;
    mesh.material = material(hex, selection.includes(mesh));
  }
  function serialize() {
    return model.children.map(m => {
      const o = {
        p: m.userData.pid,
        t: m.position.toArray().map(x => round(x)),
        q: m.quaternion.toArray().map(x => round(x, 6)),
        c: m.userData.color
      };
      if (!m.visible) o.h = 1;
      return o;
    });
  }
  function snapshot() { const list = serialize(); return JSON.stringify(list.map((o, i) => Object.assign(o, { u: model.children[i].userData.uid }))); }
  function restore(json) {
    const list = JSON.parse(json);
    const keepSel = new Set(selection.map(m => m.userData.uid));
    const existing = new Map(model.children.map(m => [m.userData.uid, m]));
    const seen = new Set();
    for (const o of list) {
      let m = existing.get(o.u);
      if (m && m.userData.pid !== o.p) { model.remove(m); m = null; }
      if (!m) m = addPart(o.p, { uid: o.u, color: o.c });
      if (!m) continue;
      m.position.fromArray(o.t); m.quaternion.fromArray(o.q); m.visible = !o.h;
      m.userData.color = o.c; m.material = material(o.c, keepSel.has(o.u));
      seen.add(o.u);
    }
    for (const [u, m] of existing) if (!seen.has(u)) model.remove(m);
    setSelection(model.children.filter(m => keepSel.has(m.userData.uid)));
    changed();
  }

  // ---------- undo ----------
  let current = '[]';
  const undoStack = [], redoStack = [];
  function commit() {
    const s = snapshot();
    if (s === current) return;
    undoStack.push(current); if (undoStack.length > 150) undoStack.shift();
    redoStack.length = 0; current = s;
    changed();
  }
  function undo() { if (!undoStack.length) return; redoStack.push(current); current = undoStack.pop(); restore(current); }
  function redo() { if (!redoStack.length) return; undoStack.push(current); current = redoStack.pop(); restore(current); }
  function resetHistory() { undoStack.length = 0; redoStack.length = 0; current = snapshot(); changed(); }

  let saveTimer, dirty = false;
  function changed() {
    $('#emptyHint').hidden = model.children.length > 0;
    $('[data-act=undo]').disabled = !undoStack.length;
    $('[data-act=redo]').disabled = !redoStack.length;
    updateStatus(); renderBom(); render();
    dirty = true;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(autosave, 600);
  }
  function autosave() {
    try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(projectData())); } catch (e) { /* storage full or blocked */ }
  }

  // ---------- selection ----------
  let selection = [];
  let placing = null; // { pid, ghost, color } while a new part follows the mouse
  function setSelection(list) {
    for (const m of selection) m.material = material(m.userData.color, false);
    selection = list.filter(m => m.parent === model);
    for (const m of selection) m.material = material(m.userData.color, true);
    updatePivot(); updateSelectionBox(); renderProps(); updateStatus(); render();
  }
  function updatePivot() {
    if (!selection.length || placing) { gizmo.detach(); return; }
    const primary = selection[selection.length - 1];
    pivot.position.copy(primary.position);
    if (snapStep() === PITCH) pivot.position.sub(holeOffset(primary.userData.pid, primary.quaternion));
    pivot.quaternion.identity(); pivot.updateMatrixWorld();
    gizmo.attach(pivot);
  }
  function selectionBounds(list = selection) {
    const b = new THREE.Box3();
    for (const m of list) if (m.visible) { m.updateMatrixWorld(); b.expandByObject(m); }
    return b;
  }
  function updateSelectionBox() {
    if (!selection.length) { selBox.visible = false; return; }
    selBox.box.copy(selectionBounds()); selBox.visible = !selBox.box.isEmpty();
  }
  let dragStart = null;
  gizmo.addEventListener('mouseDown', () => {
    pivot.updateMatrixWorld();
    dragStart = { inv: pivot.matrixWorld.clone().invert(), mats: selection.map(m => { m.updateMatrix(); return m.matrix.clone(); }) };
  });
  gizmo.addEventListener('objectChange', () => {
    if (!dragStart) return;
    pivot.updateMatrixWorld();
    const d = pivot.matrixWorld.clone().multiply(dragStart.inv);
    selection.forEach((m, i) => { const M = d.clone().multiply(dragStart.mats[i]); M.decompose(m.position, m.quaternion, m.scale); m.scale.set(1, 1, 1); });
    updateSelectionBox(); renderPropsValues(); updateStatus();
  });
  gizmo.addEventListener('mouseUp', () => { dragStart = null; commit(); updatePivot(); renderProps(); });

  function applySnaps() {
    const t = +$('#snapMove').value, r = +$('#snapRot').value;
    gizmo.setTranslationSnap(t || null);
    gizmo.setRotationSnap(r ? THREE.MathUtils.degToRad(r) : null);
    updatePivot();
  }
  $('#snapMove').onchange = applySnaps; $('#snapRot').onchange = applySnaps; applySnaps();
  function setMode(mode) {
    gizmo.setMode(mode);
    document.querySelectorAll('#modeSeg button').forEach(b => b.classList.toggle('on', b.dataset.mode === mode));
  }
  document.querySelectorAll('#modeSeg button').forEach(b => b.onclick = () => setMode(b.dataset.mode));

  // ---------- picking ----------
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pointer(e) {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
  }
  function pick(e, exclude) {
    pointer(e);
    const hits = ray.intersectObjects(model.children.filter(m => m.visible && m !== exclude), false);
    return hits[0] || null;
  }
  // ---------- drag tools: orbit, pan, box select ----------
  let dragTool = 'orbit';
  function setDragTool(t) {
    dragTool = t;
    controls.mouseButtons.LEFT = t === 'orbit' ? THREE.MOUSE.ROTATE : t === 'pan' ? THREE.MOUSE.PAN : -1;
    controls.touches.ONE = t === 'orbit' ? THREE.TOUCH.ROTATE : t === 'pan' ? THREE.TOUCH.PAN : -1;
    document.querySelectorAll('[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === t));
    viewport.dataset.tool = t;
  }
  document.querySelectorAll('[data-tool]').forEach(b => b.onclick = () => setDragTool(b.dataset.tool));

  const boxEl = el('div', { class: 'box-select', hidden: true });
  viewport.append(boxEl);
  let boxDrag = null;
  // Runs before the camera controls see the press (capture phase), so a box drag doesn't also orbit.
  viewport.addEventListener('pointerdown', e => {
    if (e.button !== 0 || placing || gizmo.axis || e.target !== renderer.domElement) return;
    if (dragTool !== 'select' && !e.shiftKey) return;
    controls.enabled = false;
    const r = viewport.getBoundingClientRect();
    boxDrag = { x0: e.clientX - r.left, y0: e.clientY - r.top, add: e.shiftKey || e.ctrlKey || e.metaKey, rect: r };
  }, true);
  function boxRect(e) {
    const b = boxDrag, x = e.clientX - b.rect.left, y = e.clientY - b.rect.top;
    return { left: Math.min(b.x0, x), top: Math.min(b.y0, y), right: Math.max(b.x0, x), bottom: Math.max(b.y0, y) };
  }
  window.addEventListener('pointermove', e => {
    if (!boxDrag) return;
    const r = boxRect(e);
    if (r.right - r.left < 4 && r.bottom - r.top < 4) return;
    Object.assign(boxEl.style, { left: r.left + 'px', top: r.top + 'px', width: (r.right - r.left) + 'px', height: (r.bottom - r.top) + 'px' });
    boxEl.hidden = false;
  });
  window.addEventListener('pointerup', e => {
    if (!boxDrag) return;
    const r = boxRect(e), add = boxDrag.add, w = boxDrag.rect.width, h = boxDrag.rect.height;
    boxDrag = null; boxEl.hidden = true; controls.enabled = true;
    if (r.right - r.left < 5 && r.bottom - r.top < 5) return; // a click, handled below
    // A part is inside the box when the centre of its outline is.
    const hits = model.children.filter(m => {
      if (!m.visible) return false;
      const c = new THREE.Box3().setFromObject(m).getCenter(new THREE.Vector3()).project(camera);
      if (c.z > 1) return false;
      const sx = (c.x + 1) / 2 * w, sy = (1 - c.y) / 2 * h;
      return sx >= r.left && sx <= r.right && sy >= r.top && sy <= r.bottom;
    });
    setSelection(add ? selection.concat(hits.filter(m => !selection.includes(m))) : hits);
    if (hits.length) toast(`Selected ${selection.length} part${selection.length === 1 ? '' : 's'}`);
  });

  let downAt = null;
  renderer.domElement.addEventListener('pointerdown', e => { downAt = { x: e.clientX, y: e.clientY, b: e.button }; viewport.focus({ preventScroll: true }); });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!downAt || downAt.b !== 0) { downAt = null; return; }
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 5;
    downAt = null;
    if (moved || gizmo.dragging) return;
    if (placing) { placeGhost(e.shiftKey); return; }
    if (gizmo.axis) return;
    const hit = pick(e);
    if (!hit) { if (!e.shiftKey) setSelection([]); return; }
    const m = hit.object;
    if (e.shiftKey || e.ctrlKey || e.metaKey) setSelection(selection.includes(m) ? selection.filter(x => x !== m) : selection.concat(m));
    else setSelection([m]);
  });
  renderer.domElement.addEventListener('dblclick', e => {
    const hit = pick(e);
    if (hit) { const pid = hit.object.userData.pid; setSelection(model.children.filter(m => m.userData.pid === pid && m.visible)); toast(`Selected every ${byId.get(pid).name}`); }
  });

  // ---------- placing new parts ----------
  function startPlacing(pid) {
    cancelPlacing();
    const p = byId.get(pid);
    const ghost = new THREE.Mesh(geoms.get(pid) || placeholderGeometry(p), material(partColorDefault(p), false, true));
    ghost.visible = false; ghost.userData.pid = pid;
    scene.add(ghost);
    placing = { pid, ghost, color: partColorDefault(p) };
    getGeometry(pid).then(g => { if (placing && placing.ghost === ghost) { ghost.geometry = g; render(); } }).catch(() => toast('That part could not load.'));
    gizmo.detach();
    const hint = $('#placeHint');
    hint.innerHTML = `Placing <b></b> — click to drop · <kbd>R</kbd> turn · <kbd>T</kbd> tilt · <kbd>Shift</kbd>+click to keep placing · <kbd>Esc</kbd> stop`;
    hint.querySelector('b').textContent = p.name;
    hint.hidden = false;
    $('#emptyHint').hidden = true;
    document.querySelectorAll('.tile').forEach(t => t.classList.toggle('active', t.dataset.id === pid));
    if (lastPointer) moveGhost(lastPointer);
  }
  function cancelPlacing() {
    if (!placing) return;
    scene.remove(placing.ghost); placing = null;
    $('#placeHint').hidden = true;
    $('#emptyHint').hidden = model.children.length > 0;
    document.querySelectorAll('.tile.active').forEach(t => t.classList.remove('active'));
    updatePivot(); render();
  }
  let lastPointer = null;
  function moveGhost(e) {
    if (!placing) return;
    const ghost = placing.ghost;
    pointer(e);
    const hits = ray.intersectObjects(model.children.filter(m => m.visible).concat(ground), false);
    if (!hits.length) { ghost.visible = false; render(); return; }
    const hit = hits[0];
    let point = hit.point, a = 1, s = 1;
    if (hit.object !== ground) {
      // Stack against the outside of the part's bounding box, not the face under the mouse,
      // so pointing at a hole still puts the new part on top instead of inside the hole.
      const bb = new THREE.Box3().setFromObject(hit.object);
      const entry = ray.ray.intersectBox(bb, new THREE.Vector3());
      if (entry) {
        point = entry;
        let best = Infinity;
        for (let i = 0; i < 3; i++) {
          for (const [side, v] of [[-1, bb.min.getComponent(i)], [1, bb.max.getComponent(i)]]) {
            const d = Math.abs(entry.getComponent(i) - v);
            if (d < best) { best = d; a = i; s = side; }
          }
        }
      }
    }
    ghost.position.set(0, 0, 0); ghost.updateMatrixWorld();
    const box = new THREE.Box3().setFromObject(ghost);
    const snap = snapStep();
    const off = snap === PITCH ? holeOffset(placing.pid, ghost.quaternion) : new THREE.Vector3();
    const p = point.clone();
    for (let i = 0; i < 3; i++) if (i !== a && snap) { const o = off.getComponent(i); p.setComponent(i, Math.round((p.getComponent(i) - o) / snap) * snap + o); }
    p.setComponent(a, point.getComponent(a) - (s > 0 ? box.min.getComponent(a) : box.max.getComponent(a)));
    ghost.position.copy(p); ghost.visible = true;
    render();
  }
  function placeGhost(keep) {
    if (!placing || !placing.ghost.visible) return;
    const g = placing.ghost;
    const m = addPart(placing.pid, { position: g.position.toArray(), quaternion: g.quaternion.toArray(), color: placing.color });
    commit();
    if (keep) { setSelection([]); return; }
    cancelPlacing(); setSelection([m]);
  }
  function turnGhost(axis) {
    const q = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI / 2);
    placing.ghost.quaternion.premultiply(q);
    if (lastPointer) moveGhost(lastPointer);
  }
  renderer.domElement.addEventListener('pointermove', e => { lastPointer = { clientX: e.clientX, clientY: e.clientY }; if (placing) moveGhost(e); });
  renderer.domElement.addEventListener('pointerleave', () => { if (placing) { placing.ghost.visible = false; render(); } });
  viewport.addEventListener('dragover', e => {
    if (!placing) return;
    e.preventDefault(); lastPointer = { clientX: e.clientX, clientY: e.clientY }; moveGhost(e);
  });
  viewport.addEventListener('drop', e => {
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) { e.preventDefault(); openFile(f); return; }
    if (!placing) return;
    e.preventDefault(); moveGhost(e); placeGhost(false);
  });
  viewport.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('Files')) e.preventDefault(); });

  // ---------- edit actions ----------
  function rotateSelection(axis, deg = 90) {
    if (placing) { turnGhost(axis); return; }
    if (!selection.length) return;
    const q = new THREE.Quaternion().setFromAxisAngle(axis, THREE.MathUtils.degToRad(deg));
    const c = pivot.position.clone();
    for (const m of selection) { m.position.sub(c).applyQuaternion(q).add(c); m.quaternion.premultiply(q); }
    commit(); updatePivot(); updateSelectionBox(); renderProps();
  }
  function moveSelection(v) {
    if (!selection.length) return;
    for (const m of selection) m.position.add(v);
    commit(); updatePivot(); updateSelectionBox(); renderProps();
  }
  function deleteSelection() {
    if (!selection.length) return;
    const n = selection.length;
    for (const m of selection) model.remove(m);
    setSelection([]); commit(); toast(n === 1 ? 'Part deleted' : `${n} parts deleted`);
  }
  function cloneList(list, offset) {
    return list.map(m => addPart(m.userData.pid, { position: m.position.clone().add(offset).toArray(), quaternion: m.quaternion.toArray(), color: m.userData.color }));
  }
  function nextToOffset(list) {
    const b = selectionBounds(list), w = b.isEmpty() ? PITCH : b.max.x - b.min.x;
    return new THREE.Vector3(Math.ceil((w + 0.5) / PITCH) * PITCH, 0, 0);
  }
  function duplicate() {
    if (!selection.length) return;
    const copies = cloneList(selection, nextToOffset(selection));
    setSelection(copies); commit();
  }
  let clipboard = null;
  function copy() { if (selection.length) { clipboard = selection.map(m => ({ pid: m.userData.pid, pos: m.position.clone(), q: m.quaternion.clone(), color: m.userData.color })); toast(`Copied ${clipboard.length} part${clipboard.length > 1 ? 's' : ''}`); } }
  function paste() {
    if (!clipboard) return;
    const fake = clipboard.map(c => { const m = new THREE.Mesh(geoms.get(c.pid) || placeholderGeometry(byId.get(c.pid))); m.position.copy(c.pos); m.quaternion.copy(c.q); m.userData = { pid: c.pid, color: c.color }; return m; });
    const off = nextToOffset(fake);
    setSelection(fake.map(m => addPart(m.userData.pid, { position: m.position.clone().add(off).toArray(), quaternion: m.quaternion.toArray(), color: m.userData.color })));
    clipboard.forEach(c => c.pos.add(off));
    commit();
  }
  function hideSelection() { if (!selection.length) return; selection.forEach(m => { m.visible = false; }); setSelection([]); commit(); toast('Hidden. Press Shift+H to show everything.'); }
  function showAll() { model.children.forEach(m => { m.visible = true; }); commit(); }
  function dropToGround() {
    if (!selection.length) return;
    const b = selectionBounds();
    if (b.isEmpty()) return;
    moveSelection(new THREE.Vector3(0, -b.min.y, 0));
  }

  // ---------- camera ----------
  function frame(list, dir) {
    const b = selectionBounds(list && list.length ? list : model.children);
    const sphere = b.isEmpty() ? new THREE.Sphere(new THREE.Vector3(), 120) : b.getBoundingSphere(new THREE.Sphere());
    const r = Math.max(sphere.radius, 30);
    const d = dir || camera.position.clone().sub(controls.target).normalize();
    const dist = r / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.1;
    controls.target.copy(sphere.center);
    camera.position.copy(sphere.center).addScaledVector(d, dist);
    camera.near = Math.max(dist / 200, 0.5); camera.far = dist * 50; camera.updateProjectionMatrix();
    controls.update(); render();
  }
  const VIEWS = { iso: new THREE.Vector3(0.6, 0.55, 0.75), top: new THREE.Vector3(0, 1, 0.0001), front: new THREE.Vector3(0, 0.0001, 1), side: new THREE.Vector3(1, 0.0001, 0) };
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => frame(null, VIEWS[b.dataset.view].clone().normalize()));

  // ---------- library ----------
  const thumbRenderer = (() => {
    let r = null, sc, cam;
    return {
      draw(g, color) {
        if (!r) {
          r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
          r.setSize(128, 128); r.outputEncoding = THREE.sRGBEncoding;
          sc = new THREE.Scene();
          sc.add(new THREE.HemisphereLight(0xffffff, 0x8890a0, 0.8));
          const l = new THREE.DirectionalLight(0xffffff, 0.8); l.position.set(1, 2, 1.5); sc.add(l);
          cam = new THREE.PerspectiveCamera(30, 1, 0.1, 5000);
        }
        const m = new THREE.Mesh(g, material(color)); sc.add(m);
        const s = g.boundingSphere;
        const dir = new THREE.Vector3(0.55, 0.6, 0.75).normalize();
        const dist = s.radius / Math.sin(THREE.MathUtils.degToRad(15)) * 1.02;
        cam.position.copy(s.center).addScaledVector(dir, dist); cam.near = dist / 50; cam.far = dist * 4; cam.updateProjectionMatrix();
        cam.lookAt(s.center);
        r.render(sc, cam); sc.remove(m);
        return r.domElement.toDataURL('image/png');
      }
    };
  })();
  const THUMB_STYLE = 'color1/'; // change to redraw cached library pictures
  const thumbQueue = []; let thumbBusy = false;
  const thumbs = new Map();
  function requestThumb(img) {
    const id = img.dataset.id;
    if (thumbs.has(id)) { img.src = thumbs.get(id); img.classList.remove('ph'); return; }
    thumbQueue.push(img); pumpThumbs();
  }
  async function pumpThumbs() {
    if (thumbBusy) return; thumbBusy = true;
    while (thumbQueue.length) {
      const img = thumbQueue.shift(), id = img.dataset.id;
      try {
        let url = thumbs.get(id) || await cache.get('thumbs', THUMB_STYLE + id);
        if (!url) {
          const p = byId.get(id);
          url = thumbRenderer.draw(await getGeometry(id), partColorDefault(p));
          cache.put('thumbs', THUMB_STYLE + id, url);
        }
        thumbs.set(id, url);
        document.querySelectorAll(`img[data-id="${CSS.escape(id)}"]`).forEach(i => { i.src = url; i.classList.remove('ph'); });
      } catch (e) { /* leave placeholder */ }
      await new Promise(r => setTimeout(r, 0));
    }
    thumbBusy = false;
  }
  const io = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) { io.unobserve(en.target); requestThumb(en.target); }
  }, { root: $('#libList'), rootMargin: '200px' });

  const catSel = $('#catFilter');
  catSel.append(el('option', { value: '' }, 'All categories'));
  for (const c of CAT_ORDER) if (parts.some(p => p.cat === c)) catSel.append(el('option', { value: c }, c));
  function renderLibrary() {
    const q = $('#search').value.trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    const cat = catSel.value;
    const list = $('#libList'); list.innerHTML = '';
    let shown = 0;
    for (const c of CAT_ORDER) {
      if (cat && c !== cat) continue;
      const items = parts.filter(p => p.cat === c && words.every(w => (p.name + ' ' + p.pn).toLowerCase().includes(w)))
        .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
      if (!items.length) continue;
      shown += items.length;
      list.append(el('div', { class: 'lib-cat' }, c, el('span', {}, String(items.length))));
      const gridEl = el('div', { class: 'lib-grid' });
      for (const p of items) {
        const img = el('img', { class: 'ph', alt: '', 'data-id': p.id, width: 64, height: 64, draggable: 'false' });
        const tile = el('button', {
          class: 'tile' + (placing && placing.pid === p.id ? ' active' : ''), 'data-id': p.id, draggable: 'true',
          title: p.name + (p.pn ? ' (' + p.pn + ')' : '') + (p.stand ? ' — simplified shape, size is approximate' : ''),
          onclick: () => { if (placing && placing.pid === p.id) cancelPlacing(); else startPlacing(p.id); },
          ondragstart: e => { startPlacing(p.id); e.dataTransfer.setData('text/plain', p.id); e.dataTransfer.effectAllowed = 'copy'; }
        }, img, el('span', {}, p.name));
        gridEl.append(tile);
        io.observe(img);
      }
      list.append(gridEl);
    }
    if (!shown) list.append(el('p', { class: 'lib-empty' }, 'No parts match. Try a shorter word, like “beam” or “gear”.'));
  }
  let searchTimer;
  $('#search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(renderLibrary, 120); });
  catSel.onchange = renderLibrary;

  // ---------- inspector ----------
  function tabs(name) {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === name));
    $('#tab-props').hidden = name !== 'props'; $('#tab-bom').hidden = name !== 'bom';
  }
  document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => tabs(b.dataset.tab));

  let propInputs = null;
  function renderProps() {
    const box = $('#tab-props'); box.innerHTML = ''; propInputs = null;
    if (!selection.length) {
      box.append(el('h3', {}, 'Nothing selected'),
        el('p', { class: 'sub' }, 'Click a part in the 3D view to select it. Shift+click selects more than one. Double-click selects every part of that kind.'));
      return;
    }
    const one = selection.length === 1 ? selection[0] : null;
    if (one) {
      const p = byId.get(one.userData.pid);
      box.append(el('h3', {}, p.name), el('p', { class: 'sub' }, p.stand ? 'Simplified stand-in · size is approximate' : `Part ${p.pn} · ${p.cat}`));
      const mk = (label, key, axis, step) => {
        const inp = el('input', { type: 'number', step, 'aria-label': label + ' ' + axis });
        inp.addEventListener('change', () => applyPropInputs());
        inp.addEventListener('keydown', e => e.stopPropagation());
        propInputs[key + axis] = inp;
        return el('label', {}, axis.toUpperCase(), inp);
      };
      propInputs = {};
      box.append(el('div', { class: 'field-label' }, 'Position (mm)', el('span', {}, '1 pitch = 12.7 mm')),
        el('div', { class: 'xyz' }, mk('Position', 'p', 'x', 'any'), mk('Position', 'p', 'y', 'any'), mk('Position', 'p', 'z', 'any')));
      box.append(el('div', { class: 'field-label' }, 'Rotation (degrees)'),
        el('div', { class: 'xyz' }, mk('Rotation', 'r', 'x', 15), mk('Rotation', 'r', 'y', 15), mk('Rotation', 'r', 'z', 15)));
      renderPropsValues();
    } else {
      box.append(el('h3', {}, `${selection.length} parts selected`), el('p', { class: 'sub' }, 'Move, turn, copy or color them together.'));
    }
    box.append(el('div', { class: 'field-label' }, 'Color'));
    const sw = el('div', { class: 'swatches' });
    const curr = new Set(selection.map(m => m.userData.color));
    for (const [name, hex] of COLORS) {
      sw.append(el('button', {
        class: 'swatch' + (curr.size === 1 && curr.has(hex) ? ' on' : ''), title: name, 'aria-label': name, style: `background:${hex}`,
        onclick: () => { selection.forEach(m => setColor(m, hex)); commit(); renderProps(); }
      }));
    }
    box.append(sw);
    box.append(el('div', { class: 'field-label' }, 'Actions'),
      el('div', { class: 'btn-row' },
        el('button', { onclick: dropToGround, title: 'Move down until it sits on the grid' }, 'Drop to grid'),
        el('button', { onclick: () => frame(selection), title: 'Zoom to the selection (F)' }, 'Zoom to'),
        el('button', { onclick: hideSelection, title: 'Hide (H)' }, 'Hide'),
        el('button', { onclick: () => { const pid = (one || selection[0]).userData.pid; setSelection(model.children.filter(m => m.userData.pid === pid && m.visible)); } }, 'Select same')));
  }
  function renderPropsValues() {
    if (!propInputs || selection.length !== 1) return;
    const m = selection[0], e = new THREE.Euler().setFromQuaternion(m.quaternion, 'XYZ');
    for (const a of 'xyz') {
      propInputs['p' + a].value = round(m.position[a], 2);
      propInputs['r' + a].value = round(THREE.MathUtils.radToDeg(e[a]), 1);
    }
  }
  function applyPropInputs() {
    if (!propInputs || selection.length !== 1) return;
    const m = selection[0], v = k => parseFloat(propInputs[k].value) || 0;
    m.position.set(v('px'), v('py'), v('pz'));
    m.quaternion.setFromEuler(new THREE.Euler(...['rx', 'ry', 'rz'].map(k => THREE.MathUtils.degToRad(v(k))), 'XYZ'));
    commit(); updatePivot(); updateSelectionBox(); render();
  }

  function bomRows() {
    const counts = new Map();
    for (const m of model.children) counts.set(m.userData.pid, (counts.get(m.userData.pid) || 0) + 1);
    return [...counts].map(([pid, n]) => ({ p: byId.get(pid), n })).sort((a, b) => CAT_ORDER.indexOf(a.p.cat) - CAT_ORDER.indexOf(b.p.cat) || a.p.name.localeCompare(b.p.name, 'en', { numeric: true }));
  }
  function renderBom() {
    const box = $('#tab-bom'); box.innerHTML = '';
    const rows = bomRows();
    box.append(el('h3', {}, 'Parts list'), el('p', { class: 'sub' }, `${model.children.length} parts, ${rows.length} different kinds. Click a row to select them.`));
    if (!rows.length) return;
    const t = el('table', { class: 'bom' });
    for (const r of rows) {
      t.append(el('tr', { onclick: () => setSelection(model.children.filter(m => m.userData.pid === r.p.id && m.visible)) },
        el('td', {}, r.p.name, el('br'), el('small', {}, r.p.pn || 'stand-in')), el('td', {}, '×' + r.n)));
    }
    box.append(t, el('div', { class: 'btn-row' }, el('button', { onclick: exportCsv }, 'Download as CSV')));
  }
  function updateStatus() {
    const n = model.children.length;
    $('#stCount').textContent = `${n} part${n === 1 ? '' : 's'}`;
    if (!selection.length) { $('#stSel').textContent = ''; return; }
    const b = selectionBounds(), s = b.getSize(new THREE.Vector3());
    const f = x => `${round(x, 1)} mm (${round(x / PITCH, 1)}p)`;
    $('#stSel').textContent = `Selected ${selection.length} · size ${f(s.x)} × ${f(s.z)} × ${f(s.y)} tall`;
  }

  // ---------- files ----------
  function projectData() {
    return { format: FILE_FORMAT, version: FILE_VERSION, name: modelName(), saved: new Date().toISOString(), parts: serialize(),
      camera: { position: camera.position.toArray().map(x => round(x, 1)), target: controls.target.toArray().map(x => round(x, 1)) } };
  }
  function loadProject(data, { silent } = {}) {
    if (!data || data.format !== FILE_FORMAT || !Array.isArray(data.parts)) throw new Error('This is not a VEX IQ CAD Studio file.');
    cancelPlacing(); setSelection([]);
    model.clear();
    let missing = 0;
    for (const o of data.parts) {
      if (!byId.has(o.p)) { missing++; continue; }
      addPart(o.p, { position: o.t, quaternion: o.q, color: o.c, hidden: o.h });
    }
    $('#modelName').value = data.name || 'My Robot';
    resetHistory();
    if (data.camera && data.camera.position) {
      camera.position.fromArray(data.camera.position); controls.target.fromArray(data.camera.target); controls.update();
    } else frame();
    render();
    if (missing) toast(`${missing} part${missing > 1 ? 's' : ''} in this file aren't in this library and were skipped.`);
    else if (!silent) toast(`Opened “${modelName()}”`);
    dirty = false;
  }
  function saveFile() {
    const blob = new Blob([JSON.stringify(projectData(), null, 1)], { type: 'application/json' });
    download(blob, safeName() + '.vexiq.json');
    dirty = false;
    toast('Saved to your Downloads folder. Open it again with “Open…”.');
  }
  function openFile(file) {
    const r = new FileReader();
    r.onload = () => {
      try { loadProject(JSON.parse(r.result)); }
      catch (e) { dialog(el('div', {}, el('h2', {}, 'Can’t open that file'), el('p', {}, e.message && e.message.startsWith('This') ? e.message : 'The file is damaged or isn’t a model file. Choose a .vexiq.json file saved from CAD Studio.'))); }
    };
    r.readAsText(file);
  }
  $('#fileInput').onchange = e => { const f = e.target.files[0]; if (f) openFile(f); e.target.value = ''; };
  async function newModel() {
    if (model.children.length) {
      const ok = await dialog(el('div', {}, el('h2', {}, 'Start a new model?'), el('p', {}, 'Anything you haven’t saved with “Save” will be lost.')), [['Cancel', ''], ['Start new', 'yes', true]]);
      if (ok !== 'yes') return;
    }
    cancelPlacing(); setSelection([]); model.clear(); $('#modelName').value = 'My Robot'; resetHistory(); frame(null, VIEWS.iso.clone().normalize());
  }
  function exportStl() {
    const list = (selection.length ? selection : model.children).filter(m => m.visible);
    if (!list.length) { toast('Add some parts first.'); return; }
    const group = new THREE.Group();
    for (const m of list) { const c = new THREE.Mesh(m.geometry); c.position.copy(m.position); c.quaternion.copy(m.quaternion); group.add(c); }
    // STL is usually Z-up, so turn the model back.
    group.rotation.x = Math.PI / 2; group.updateMatrixWorld(true);
    const data = new THREE.STLExporter().parse(group, { binary: true });
    download(new Blob([data], { type: 'model/stl' }), safeName() + '.stl');
    toast(selection.length ? 'Exported the selected parts as STL.' : 'Exported the whole model as STL.');
  }
  function exportPng() {
    const was = selBox.visible, wasG = gizmo.visible;
    selBox.visible = false; gizmo.visible = false;
    renderer.render(scene, camera);
    renderer.domElement.toBlob(b => download(b, safeName() + '.png'));
    selBox.visible = was; gizmo.visible = wasG; render();
  }
  function exportCsv() {
    const rows = [['Part', 'Part number', 'Category', 'Quantity']].concat(bomRows().map(r => [r.p.name, r.p.pn || 'stand-in', r.p.cat, r.n]));
    const csv = rows.map(r => r.map(x => /[",\n]/.test(String(x)) ? '"' + String(x).replace(/"/g, '""') + '"' : x).join(',')).join('\n');
    download(new Blob([csv], { type: 'text/csv' }), safeName() + '-parts.csv');
  }

  // ---------- examples ----------
  const EXAMPLES = window.VIQ_EXAMPLES || [];
  async function showExamples() {
    if (!EXAMPLES.length) { toast('No examples in this build.'); return; }
    const box = el('div', {}, el('h2', {}, 'Example models'), el('p', { class: 'muted' }, 'Open one to explore or change it. This replaces what’s on screen, so save first.'));
    const list = el('div', { class: 'examples' });
    EXAMPLES.forEach((ex, i) => list.append(el('button', { value: 'ex' + i, type: 'submit' }, el('b', {}, ex.name), ex.about)));
    box.append(list);
    const v = await dialog(box, [['Cancel', '']]);
    if (v && v.startsWith('ex')) loadProject(EXAMPLES[+v.slice(2)].data);
  }

  function showHelp() {
    const rows = [
      ['Click a part in the library', 'Pick it up, then click in the 3D view to place it'],
      ['Shift + click', 'Place another copy, or add to the selection'],
      ['Left-drag', 'Orbit, pan or box-select, depending on the tool chosen at the top right'], ['Right-drag', 'Pan the camera'], ['Scroll / pinch', 'Zoom'],
      ['W / E', 'Move or Rotate arrows'], ['R / T / Y', 'Turn, tilt or roll 90°'],
      ['Arrow keys', 'Nudge 1 pitch (Ctrl for ½ pitch)'], ['Shift + ↑ / ↓', 'Nudge up or down'],
      ['Ctrl+D', 'Duplicate'], ['Ctrl+C / Ctrl+V', 'Copy and paste'], ['Delete', 'Delete'],
      ['Ctrl+Z / Ctrl+Y', 'Undo and redo'], ['F', 'Zoom to fit'], ['O / P / B', 'Left-drag orbits, pans or box-selects'], ['Shift + drag', 'Box-select more parts'], ['H / Shift+H', 'Hide / show all'], ['G', 'Grid on or off'],
      ['Ctrl+S / Ctrl+O', 'Save or open a model file'], ['Esc', 'Stop placing, or clear the selection']
    ];
    const g = el('div', { class: 'help-grid' });
    rows.forEach(([k, v]) => g.append(el('b', {}, k), el('span', {}, v)));
    dialog(el('div', {}, el('h2', {}, 'How to use CAD Studio'),
      el('p', { class: 'muted' }, 'Parts are the real VEX IQ CAD shapes. Holes are 1 pitch (12.7 mm) apart, so leave Snap on ½ pitch to line holes up. Your model saves itself in this browser as you work, but use Save to keep a file on your Chromebook.'),
      g));
  }

  // ---------- buttons, menu, keys ----------
  const ACTIONS = {
    new: newModel, open: () => $('#fileInput').click(), save: saveFile, stl: exportStl, png: exportPng, csv: exportCsv,
    help: showHelp, examples: showExamples,
    rotX: () => rotateSelection(new THREE.Vector3(1, 0, 0)), rotY: () => rotateSelection(new THREE.Vector3(0, 1, 0)), rotZ: () => rotateSelection(new THREE.Vector3(0, 0, 1)),
    dup: duplicate, del: deleteSelection, undo, redo, frame: () => frame(selection),
    grid: () => { grid.visible = !grid.visible; $('[data-act=grid]').classList.toggle('on', grid.visible); render(); }
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    const menu = document.querySelector('.menu');
    if (e.target.closest('.menu-btn')) { menu.classList.toggle('open'); return; }
    menu.classList.remove('open');
    if (b && ACTIONS[b.dataset.act]) { e.preventDefault(); ACTIONS[b.dataset.act](); }
  });
  document.addEventListener('keydown', e => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea' || $('#dialog').open) return;
    const k = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
    const camDir = () => { const d = new THREE.Vector3(); camera.getWorldDirection(d); d.y = 0; return Math.abs(d.x) > Math.abs(d.z) ? new THREE.Vector3(Math.sign(d.x), 0, 0) : new THREE.Vector3(0, 0, Math.sign(d.z) || -1); };
    const step = ctrl ? PITCH / 2 : PITCH;
    let handled = true;
    if (ctrl && k === 'z' && !e.shiftKey) undo();
    else if (ctrl && (k === 'y' || (k === 'z' && e.shiftKey))) redo();
    else if (ctrl && k === 'd') duplicate();
    else if (ctrl && k === 'c') copy();
    else if (ctrl && k === 'v') paste();
    else if (ctrl && k === 'a') setSelection(model.children.filter(m => m.visible));
    else if (ctrl && k === 's') saveFile();
    else if (ctrl && k === 'o') $('#fileInput').click();
    else if (ctrl) handled = false;
    else if (k === 'delete' || k === 'backspace') deleteSelection();
    else if (k === 'escape') { if (placing) cancelPlacing(); else setSelection([]); }
    else if (k === 'w') setMode('translate');
    else if (k === 'e') setMode('rotate');
    else if (k === 'r') ACTIONS.rotY();
    else if (k === 't') ACTIONS.rotX();
    else if (k === 'y') ACTIONS.rotZ();
    else if (k === 'f') frame(selection);
    else if (k === 'g') ACTIONS.grid();
    else if (k === 'o') setDragTool('orbit');
    else if (k === 'p') setDragTool('pan');
    else if (k === 'b') setDragTool('select');
    else if (k === 'h') { if (e.shiftKey) showAll(); else hideSelection(); }
    else if (k === '?') showHelp();
    else if (k.startsWith('arrow') && selection.length) {
      const f = camDir(), r = new THREE.Vector3(-f.z, 0, f.x);
      const v = k === 'arrowup' ? (e.shiftKey ? new THREE.Vector3(0, 1, 0) : f) : k === 'arrowdown' ? (e.shiftKey ? new THREE.Vector3(0, -1, 0) : f.negate())
        : k === 'arrowleft' ? r.negate() : r;
      moveSelection(v.multiplyScalar(step));
    }
    else handled = false;
    if (handled) e.preventDefault();
  });
  $('#modelName').addEventListener('change', () => changed());
  window.addEventListener('beforeunload', () => autosave());

  // ---------- start ----------
  async function start() {
    renderLibrary();
    resize();
    let restored = false;
    try {
      const saved = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || 'null');
      if (saved && saved.parts && saved.parts.length) { loadProject(saved, { silent: true }); restored = true; toast('Welcome back! Your last model is restored.'); }
    } catch (e) { /* ignore a broken autosave */ }
    if (!restored) { resetHistory(); frame(null, VIEWS.iso.clone().normalize()); }
    renderProps();
    $('#loading').classList.add('done');
    cache.prune();
    updateLoadStatus();
    // Fetch every part file in the background, a couple at a time, so the library fills in.
    const queue = CATALOG.chunks.slice();
    const worker = async () => { while (queue.length) { try { await loadChunk(queue.shift()); } catch (e) { /* retried on demand */ } } };
    worker(); worker();
  }
  start();
})();
