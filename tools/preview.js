// Runs the real Apps Script code on this computer with stand-ins for Google's services.
//   npm start, then open http://localhost:3000            (as the teacher)
//   http://localhost:3000/?as=maya@school.test            (as anyone else)
// Data goes to data/preview-sheets.json. Nothing touches Google.
const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PORT = process.env.PORT || 3000, OWNER = 'teacher@school.test';
const root = path.join(__dirname, '..'), dir = path.join(root, 'apps-script');
const FILE = process.env.PREVIEW_DATA || path.join(root, 'data/preview-sheets.json');
fs.mkdirSync(path.dirname(FILE), { recursive: true });

// ---- stand-ins that enforce the Sheets rules the real code has to respect
let store = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : { props: {}, books: {} };
const persist = () => fs.writeFileSync(FILE, JSON.stringify(store));
const checkCell = v => {
  if (typeof v === 'string' && v.length > 50000) throw new Error('Your input contains more than the maximum of 50000 characters in a single cell.');
  if (typeof v === 'string' && /^[=+]/.test(v)) throw new Error('Cell would be read as a formula: ' + v.slice(0, 30));
  return v;
};
function sheet(rows) {
  return {
    getLastRow: () => rows.length,
    appendRow: r => { rows.push(r.map(checkCell)); return this; },
    setFrozenRows() {}, clearContents() { rows.length = 0; },
    deleteRow: n => { rows.splice(n - 1, 1); },
    getRange(r, c, nr = 1, nc = 1) {
      const range = {
        setNumberFormat: () => range,
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => (rows[r - 1 + i] || [])[c - 1 + j] ?? '')),
        setValues(v) { v.forEach((line, i) => { rows[r - 1 + i] = rows[r - 1 + i] || []; line.forEach((x, j) => { rows[r - 1 + i][c - 1 + j] = checkCell(x); }); }); return range; }
      };
      return range;
    }
  };
}
function book(id) {
  const b = store.books[id];
  if (!b) throw new Error('No spreadsheet ' + id);
  return {
    getId: () => id, getUrl: () => 'https://docs.google.com/spreadsheets/d/' + id, addEditor() {},
    getSheets: () => Object.values(b.tabs).map(sheet),
    getSheetByName: n => b.tabs[n] ? sheet(b.tabs[n]) : null,
    insertSheet: n => sheet(b.tabs[n] = [])
  };
}
const previewFolder = {
  getId: () => 'folder1',
  createFile(blob) { const id = 'file' + crypto.randomBytes(4).toString('hex'); store.files = store.files || {}; store.files[id] = Buffer.from(blob.bytes).toString('base64'); return { getId: () => id }; }
};
// Mimics the rules that matter: students' submissions exist only once work is created, and only returned grades count.
function classroomStandIn() {
  const c = () => { store.classroom = store.classroom || { work: {} }; return store.classroom; };
  // Everyone who has joined, plus two rostered students who haven't opened the app yet.
  const extra = [['jordan@school.test', 'Jordan', 'Lee'], ['sam@school.test', 'Sam', 'Ortiz']].map(([e, f, l]) => ({ userId: 'g' + e, profile: { emailAddress: e, name: { givenName: f, familyName: l, fullName: f + ' ' + l } } }));
  const students = () => {
    const joined = Object.values(store.books).flatMap(b => (b.tabs.Users || []).slice(1)).map(r => JSON.parse(r[2])).filter(u => u.role === 'student' && !u.email.startsWith('notinclassroom'));
    const out = joined.map(u => ({ userId: 'g' + u.email, profile: { emailAddress: u.email, name: { givenName: u.name.split(' ')[0], familyName: u.name.split(' ').slice(1).join(' '), fullName: u.name } } }));
    return out.concat(extra.filter(x => !joined.some(u => u.email === x.profile.emailAddress)));
  };
  return {
    Courses: {
      list: () => ({ courses: [{ id: 'course1', name: 'Robotics P3', section: 'Period 3' }] }),
      get: id => ({ id, name: 'Robotics P3' }),
      Students: { list: () => ({ students: students() }) },
      CourseWork: {
        create(res) {
          if (!res.dueDate || res.maxPoints !== 100) throw new Error('bad coursework');
          if (res.scheduledTime && res.state !== 'DRAFT') throw new Error('scheduledTime needs a DRAFT');
          const id = 'cw' + Object.keys(c().work).length;
          c().work[id] = { res, subs: Object.fromEntries(students().map(s => ['sub' + s.userId, { id: 'sub' + s.userId, userId: s.userId }])) };
          return { id };
        },
        StudentSubmissions: {
          list: (_, cw) => ({ studentSubmissions: Object.values(c().work[cw].subs) }),
          patch(res, _, cw, id, opts) { if (opts.updateMask !== 'draftGrade,assignedGrade') throw new Error('bad mask'); Object.assign(c().work[cw].subs[id], res); },
          return(_, __, cw, id) { c().work[cw].subs[id].state = 'RETURNED'; }
        }
      }
    }
  };
}
let activeUser = OWNER;
const sandbox = vm.createContext({
  console,
  Session: { getActiveUser: () => ({ getEmail: () => activeUser }), getEffectiveUser: () => ({ getEmail: () => OWNER }) },
  Utilities: {
    getUuid: () => crypto.randomUUID(),
    base64Decode: s => [...Buffer.from(s, 'base64')],
    base64Encode: b => Buffer.from(b).toString('base64'),
    newBlob: (bytes, type, name) => ({ bytes, type, name })
  },
  DriveApp: {
    createFolder: () => previewFolder,
    getFolderById: () => previewFolder,
    getFileById: id => ({ setTrashed() { delete store.files[id]; }, getBlob: () => ({ getBytes: () => [...Buffer.from(store.files[id], 'base64')] }) })
  },
  Classroom: classroomStandIn(),
  ScriptApp: { getService: () => ({ getUrl: () => `http://localhost:${PORT}/` }) },
  Logger: { log: console.log },
  LockService: { getScriptLock: () => ({ tryLock: () => true, releaseLock() {} }) },
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => store.props[k] ?? null, setProperty: (k, v) => { store.props[k] = v; } }) },
  SpreadsheetApp: {
    flush() {},
    create(name) { const id = 'sheet' + crypto.randomBytes(4).toString('hex'); store.books[id] = { name, tabs: { Sheet1: [] } }; return book(id); },
    openById: book
  }
});
for (const f of ['Lessons.gs', 'Code.gs']) vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), sandbox, { filename: f });

// ---- what google.script.run does in the real thing
const shim = `<script>
window.google = { script: {
  history: { push() {}, setChangeHandler() {} }, url: { getLocation(cb) { cb({ hash: '', parameter: Object.fromEntries(new URLSearchParams(location.search)) }); } },
  run: (function make(ok, bad) { return new Proxy({}, { get(_, fn) {
    if (fn === 'withSuccessHandler') return h => make(h, bad);
    if (fn === 'withFailureHandler') return h => make(ok, h);
    return (...args) => fetch('/rpc' + location.search, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fn, args }) })
      .then(r => { if (!r.ok) throw new Error('rpc failed'); return r.json(); }).then(r => ok && ok(r.result), e => bad && bad(e));
  } }); })()
} };
</script>`;

const app = express();
app.use(express.json({ limit: '2mb' }));
app.get('/', (req, res) => res.type('html').send(fs.readFileSync(path.join(dir, 'Index.html'), 'utf8').replace('<head>', () => '<head>' + shim)));
app.post('/rpc', (req, res) => {
  const { fn, args } = req.body;
  if (fn.endsWith('_') || !['api', 'setup'].includes(fn)) return res.status(403).end();
  activeUser = String(req.query.as || OWNER).toLowerCase();
  sandbox.__args = args;
  const result = vm.runInContext(`${fn}.apply(null, __args)`, sandbox);
  persist();
  res.json({ result });
});
app.listen(PORT, () => console.log(`\nRoboCode Academy preview: http://localhost:${PORT}\nSign in as someone else: http://localhost:${PORT}/?as=maya@school.test\n`));
