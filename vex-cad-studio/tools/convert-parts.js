// Converts the VEX IQ STEP files into the compact part library the editor loads.
//
//   node tools/convert-parts.js <folder of .step files>
//
// Each part is tessellated with OpenCascade (occt-import-js), welded, simplified to within
// about 0.08 mm of the real shape, turned Y-up, quantized to 16 bits and compressed with
// meshoptimizer. The result is written to parts/library.json, which build-gas.js splits
// into Apps Script files. Running it on all 449 parts takes several minutes; it only needs
// running again when you add new STEP files.
const fs = require('fs');
const path = require('path');
const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { categorize } = require('./categories');

const MAX_TRIANGLES = 16000;  // cap for any one part after simplifying
const ERROR_MM = 0.08;        // allowed shape error when simplifying

if (isMainThread) main(); else worker();

function main() {
  const dir = process.argv[2];
  if (!dir || !fs.existsSync(dir)) {
    console.error('Usage: node tools/convert-parts.js <folder of .step files>');
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter(f => /\.ste?p$/i.test(f)).sort();
  const outFile = path.join(__dirname, '..', 'parts', 'library.json');
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  // Reuse parts already converted from an unchanged file, so a rerun only does new ones.
  const old = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, 'utf8')) : { parts: [] };
  const done = new Map(old.parts.map(p => [p.file + '|' + p.bytes, p]));
  const results = [];
  const queue = [];
  for (const f of files) {
    const bytes = fs.statSync(path.join(dir, f)).size;
    const prev = done.get(f + '|' + bytes);
    if (prev) results.push(prev); else queue.push({ file: f, bytes });
  }
  console.log(`${files.length} STEP files, ${queue.length} to convert`);
  // Biggest first, so the slow plates don't finish last.
  queue.sort((a, b) => b.bytes - a.bytes);
  const failed = [];
  let active = 0, finished = 0;
  const total = queue.length;
  const save = () => {
    const parts = results.slice().sort((a, b) => a.file.localeCompare(b.file, 'en', { numeric: true }));
    // A few part numbers appear on two files; give the second one its own id.
    const seen = new Set();
    for (const p of parts) {
      if (seen.has(p.id)) { let n = 2; while (seen.has(p.id + '-' + n)) n++; p.id = p.id + '-' + n; }
      seen.add(p.id);
    }
    fs.writeFileSync(outFile, JSON.stringify({ generated: new Date().toISOString(), parts }));
  };
  if (!total) { save(); return; }
  const threads = Math.max(1, Math.min(os.cpus().length, total));
  for (let t = 0; t < threads; t++) {
    const w = new Worker(__filename, { workerData: { dir } });
    active++;
    const next = () => {
      const job = queue.shift();
      if (!job) { w.terminate(); if (--active === 0) finish(); return; }
      w.postMessage(job);
    };
    w.on('message', msg => {
      finished++;
      if (msg.error) { failed.push(msg.file + ': ' + msg.error); console.log(`[${finished}/${total}] FAILED ${msg.file}: ${msg.error}`); }
      else {
        results.push(msg.part);
        console.log(`[${finished}/${total}] ${msg.part.name}  ${msg.part.tris} tris  ${(msg.ms / 1000).toFixed(1)}s`);
        if (finished % 25 === 0) save();
      }
      next();
    });
    w.on('error', e => { console.error(e); });
    next();
  }
  function finish() {
    save();
    const size = fs.statSync(outFile).size;
    console.log(`Wrote ${results.length} parts to ${path.relative(process.cwd(), outFile)} (${(size / 1048576).toFixed(1)} MB)`);
    if (failed.length) { console.log('Failed:\n  ' + failed.join('\n  ')); process.exitCode = 1; }
  }
}

function worker() {
  const occtReady = require('occt-import-js')();
  const { MeshoptSimplifier, MeshoptEncoder } = require('meshoptimizer');
  const ready = Promise.all([occtReady, MeshoptSimplifier.ready, MeshoptEncoder.ready]);
  parentPort.on('message', async job => {
    const start = Date.now();
    try {
      const [occt] = await ready;
      const part = convert(occt, MeshoptSimplifier, MeshoptEncoder, job);
      parentPort.postMessage({ part, ms: Date.now() - start });
    } catch (e) {
      parentPort.postMessage({ file: job.file, error: String(e && e.message || e) });
    }
  });
}

function convert(occt, Simplifier, Encoder, job) {
  const data = new Uint8Array(fs.readFileSync(path.join(workerData.dir, job.file)));
  const r = occt.ReadStepFile(data, {
    linearUnit: 'millimeter',
    linearDeflectionType: 'absolute_value',
    linearDeflection: 0.05,
    angularDeflection: 0.35
  });
  if (!r.success || !r.meshes.length) throw new Error('could not read STEP');

  // Merge all meshes, turning STEP's Z-up into three.js Y-up: (x, y, z) -> (x, z, -y).
  const pos = [], idx = [];
  for (const m of r.meshes) {
    const p = m.attributes.position.array, base = pos.length / 3;
    for (let i = 0; i < p.length; i += 3) pos.push(p[i], p[i + 2], -p[i + 1]);
    for (const i of m.index.array) idx.push(base + i);
  }

  // Weld vertices that share a position (OpenCascade splits them at every face edge),
  // so the simplifier can work across faces. Normals are rebuilt with a crease angle later.
  const key = (x) => Math.round(x * 2000);
  const map = new Map(), wpos = [], remap = new Uint32Array(pos.length / 3);
  for (let v = 0; v < pos.length / 3; v++) {
    const k = key(pos[v * 3]) + ',' + key(pos[v * 3 + 1]) + ',' + key(pos[v * 3 + 2]);
    let n = map.get(k);
    if (n === undefined) { n = wpos.length / 3; map.set(k, n); wpos.push(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]); }
    remap[v] = n;
  }
  let windex = [];
  for (let t = 0; t < idx.length; t += 3) {
    const a = remap[idx[t]], b = remap[idx[t + 1]], c = remap[idx[t + 2]];
    if (a !== b && b !== c && a !== c) windex.push(a, b, c);
  }
  const positions = new Float32Array(wpos);
  let indices = new Uint32Array(windex);
  const trisIn = indices.length / 3;

  // Simplify: keep within ERROR_MM of the original, and under MAX_TRIANGLES.
  const scale = Simplifier.getScale ? Simplifier.getScale(positions, 3) : extent(positions);
  let [simple] = Simplifier.simplify(indices, positions, 3, 0, ERROR_MM / scale, ['LockBorder']);
  if (simple.length / 3 > MAX_TRIANGLES) {
    [simple] = Simplifier.simplify(indices, positions, 3, MAX_TRIANGLES * 3, 1, ['LockBorder']);
  }
  if (simple.length >= 3) indices = simple;

  // Drop unused vertices and order for compression.
  const [vremap, unique] = Encoder.reorderMesh(indices, true, false);
  const vcount = unique;
  const outPos = new Float32Array(vcount * 3);
  for (let v = 0; v < vremap.length; v++) {
    const n = vremap[v];
    if (n === 0xffffffff) continue;
    outPos[n * 3] = positions[v * 3]; outPos[n * 3 + 1] = positions[v * 3 + 1]; outPos[n * 3 + 2] = positions[v * 3 + 2];
  }

  // Quantize to 16 bits inside the bounding box.
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < outPos.length; i++) { const a = i % 3; if (outPos[i] < min[a]) min[a] = outPos[i]; if (outPos[i] > max[a]) max[a] = outPos[i]; }
  const span = max.map((m, a) => Math.max(m - min[a], 1e-6));
  const q = new Uint16Array(vcount * 4);
  for (let v = 0; v < vcount; v++) for (let a = 0; a < 3; a++) q[v * 4 + a] = Math.round((outPos[v * 3 + a] - min[a]) / span[a] * 65535);

  const vbuf = Encoder.encodeVertexBuffer(new Uint8Array(q.buffer), vcount, 8);
  const ibuf = Encoder.encodeIndexBuffer(new Uint8Array(indices.buffer, indices.byteOffset, indices.byteLength), indices.length, 4);

  const base = job.file.replace(/\.ste?p$/i, '');
  // Most files are "Name (228-2500-123).step"; a few are "228-2500-1960 (1950 Hub).step".
  let m = base.match(/^(.*?)\s*\((228-[\d-]+)\)\s*$/), name = base, pn = '';
  if (m) { name = m[1]; pn = m[2]; }
  else if ((m = base.match(/^(228-[\d-]+)\s*\((.*)\)$/))) { pn = m[1]; name = 'Wheel Hub Assembly ' + pn.split('-').pop() + ' (' + m[2] + ')'; }
  return {
    id: pn ? pn.replace(/^228-2500-/, '') : slug(name),
    name, pn, cat: categorize(name),
    file: job.file, bytes: job.bytes,
    min: min.map(round), max: max.map(round),
    vc: vcount, ic: indices.length, tris: indices.length / 3, trisIn,
    v: Buffer.from(vbuf).toString('base64'),
    i: Buffer.from(ibuf).toString('base64')
  };
}

function extent(p) {
  let mn = Infinity, mx = -Infinity;
  for (const x of p) { if (x < mn) mn = x; if (x > mx) mx = x; }
  return mx - mn || 1;
}
function round(x) { return Math.round(x * 1000) / 1000; }
function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
