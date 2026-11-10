// Builds the files you copy into Google Apps Script, in apps-script/:
//   Code.gs, appsscript.json, Index.html (the whole editor) and Parts01.html, Parts02.html, ...
// (the part shapes, loaded by the page as needed).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ORDER } = require('./categories');

const root = path.join(__dirname, '..');
const out = path.join(root, 'apps-script');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const CHUNK_BYTES = 700 * 1024; // keeps each file a comfortable size for the Apps Script editor

const lib = JSON.parse(read('parts/library.json'));
const version = crypto.createHash('sha1').update(JSON.stringify(lib.parts.map(p => [p.id, p.v, p.i]))).digest('hex').slice(0, 10);

// Pack parts into files by category, so a category's shapes arrive together.
const parts = lib.parts.slice().sort((a, b) => ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat) || a.name.localeCompare(b.name, 'en', { numeric: true }));
const chunks = [];
let cur = null;
for (const p of parts) {
  const size = p.v.length + p.i.length + 60;
  if (!cur || cur.size + size > CHUNK_BYTES) { cur = { name: 'Parts' + String(chunks.length + 1).padStart(2, '0'), size: 0, list: [] }; chunks.push(cur); }
  cur.list.push({ id: p.id, vc: p.vc, ic: p.ic, v: p.v, i: p.i });
  cur.size += size;
  p.chunk = cur.name;
}
if (chunks.length > 99) throw new Error('Too many parts files');

const catalog = {
  version, categories: ORDER, chunks: chunks.map(c => c.name),
  parts: parts.map(p => ({ id: p.id, name: p.name, pn: p.pn, cat: p.cat, min: p.min, max: p.max, tris: p.tris, chunk: p.chunk }))
};

const vendor = [
  'node_modules/three/build/three.min.js',
  'node_modules/three/examples/js/utils/BufferGeometryUtils.js',
  'node_modules/three/examples/js/controls/OrbitControls.js',
  'node_modules/three/examples/js/controls/TransformControls.js',
  'node_modules/three/examples/js/exporters/STLExporter.js',
  'node_modules/meshoptimizer/meshopt_decoder.js'
];
const script = code => '<script>\n' + code.replace(/<\/script/gi, '<\\/script') + '\n</script>';
const json = o => JSON.stringify(o).replace(/</g, '\\u003c');
const scripts = [
  ...vendor.map(f => script(read(f))),
  script('window.VIQ_CATALOG = ' + json(catalog) + ';'),
  script(read('src/electronics.js')),
  script(read('src/examples.js')),
  script(read('src/app.js'))
].join('\n');
const html = read('src/index.html')
  .replace('<!-- STYLE -->', () => '<style>\n' + read('src/style.css') + '\n</style>')
  .replace('<!-- SCRIPTS -->', () => scripts);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'Index.html'), html);
fs.copyFileSync(path.join(root, 'gas/Code.gs'), path.join(out, 'Code.gs'));
fs.copyFileSync(path.join(root, 'gas/appsscript.json'), path.join(out, 'appsscript.json'));
for (const c of chunks) fs.writeFileSync(path.join(out, c.name + '.html'), JSON.stringify(c.list));

const kb = f => Math.round(fs.statSync(path.join(out, f)).size / 1024) + ' KB';
console.log(`Built apps-script/ for ${parts.length} parts (library version ${version}):`);
console.log(`  Index.html  ${kb('Index.html')}`);
for (const c of chunks) console.log(`  ${c.name}.html  ${kb(c.name + '.html')}  (${c.list.length} parts)`);
