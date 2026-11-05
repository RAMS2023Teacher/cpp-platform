// RoboCode Academy – classroom server
// Run:  npm install && npm start   →  http://localhost:3000
const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SECRET_FILE = path.join(DATA_DIR, 'secret.key');

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SECRET_FILE)) fs.writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString('hex'));
const SECRET = fs.readFileSync(SECRET_FILE, 'utf8').trim();
// Teachers must know this code to create a teacher account (printed at startup). Set TEACHER_CODE to choose your own.
const TEACHER_CODE = process.env.TEACHER_CODE || SECRET.slice(0, 8).toUpperCase();

// ---------- Lessons ----------
function loadLessons() {
  const dir = path.join(__dirname, 'lessons');
  let all = [];
  for (const f of fs.readdirSync(dir).filter(f => /^unit\d+\.js$/.test(f))) {
    delete require.cache[require.resolve(path.join(dir, f))];
    all = all.concat(require(path.join(dir, f)));
  }
  return all.sort((a, b) => a.order - b.order);
}
let LESSONS = loadLessons();
const lessonById = id => LESSONS.find(l => l.id === id);

// ---------- Tiny JSON database ----------
let db = { users: [], classes: [], progress: [], lessonOverrides: {} };
if (fs.existsSync(DB_FILE)) db = Object.assign(db, JSON.parse(fs.readFileSync(DB_FILE, 'utf8')));
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db, null, 1));
    fs.renameSync(tmp, DB_FILE);
  }, 150);
}
const uid = () => crypto.randomBytes(8).toString('hex');
const now = () => new Date().toISOString();

function hashPw(pw, salt = crypto.randomBytes(16).toString('hex')) {
  return salt + ':' + crypto.scryptSync(pw, salt, 32).toString('hex');
}
function checkPw(pw, stored) {
  const [salt, h] = stored.split(':');
  const test = crypto.scryptSync(pw, salt, 32).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(h, 'hex'), Buffer.from(test, 'hex'));
}
function sign(v) { return v + '.' + crypto.createHmac('sha256', SECRET).update(v).digest('hex').slice(0, 32); }
function unsign(s) {
  if (!s) return null; const i = s.lastIndexOf('.'); const v = s.slice(0, i);
  return sign(v) === s ? v : null;
}
function makeJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let c; do { c = Array.from({ length: 6 }, () => chars[crypto.randomInt(chars.length)]).join(''); }
  while (db.classes.some(k => k.code === c));
  return c;
}
const publicUser = u => u && ({ id: u.id, role: u.role, name: u.name, username: u.username, classId: u.classId || null });

// ---------- App ----------
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/vendor/codemirror', express.static(path.join(__dirname, 'node_modules/codemirror')));

app.use((req, res, next) => {
  const cookie = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('sid='));
  const id = cookie ? unsign(decodeURIComponent(cookie.slice(4))) : null;
  req.user = id ? db.users.find(u => u.id === id) : null;
  next();
});
function setSession(res, user) {
  res.setHeader('Set-Cookie', `sid=${encodeURIComponent(sign(user.id))}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 180}`);
}
const need = role => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Please log in.' });
  if (role && req.user.role !== role) return res.status(403).json({ error: 'Not allowed.' });
  next();
};
const clean = (s, n = 60) => String(s || '').trim().slice(0, n);

// --- auth ---
app.post('/api/register/teacher', (req, res) => {
  const name = clean(req.body.name), username = clean(req.body.username, 40).toLowerCase(), pw = String(req.body.password || '');
  if (clean(req.body.teacherCode, 40).toUpperCase() !== TEACHER_CODE) return res.status(400).json({ error: 'Teacher code is not correct. (It is printed in the server console when the site starts.)' });
  if (!name || !/^[a-z0-9._-]{3,40}$/.test(username)) return res.status(400).json({ error: 'Enter a name and a username (3+ letters/numbers).' });
  if (pw.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (db.users.some(u => u.username === username)) return res.status(400).json({ error: 'That username is taken.' });
  const u = { id: uid(), role: 'teacher', name, username, pw: hashPw(pw), created: now() };
  db.users.push(u); save(); setSession(res, u); res.json({ user: publicUser(u) });
});

app.post('/api/register/student', (req, res) => {
  const name = clean(req.body.name), username = clean(req.body.username, 40).toLowerCase(), pw = String(req.body.password || '');
  const klass = db.classes.find(c => c.code === clean(req.body.classCode, 10).toUpperCase());
  if (!klass) return res.status(400).json({ error: 'Class code not found. Ask your teacher for the 6-letter code.' });
  if (klass.closed) return res.status(400).json({ error: 'This class is not accepting new students right now.' });
  if (!name || !/^[a-z0-9._-]{3,40}$/.test(username)) return res.status(400).json({ error: 'Enter your name and a username (3+ letters/numbers, no spaces).' });
  if (pw.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  if (db.users.some(u => u.username === username)) return res.status(400).json({ error: 'That username is taken — try adding a number.' });
  const u = { id: uid(), role: 'student', name, username, pw: hashPw(pw), classId: klass.id, created: now() };
  db.users.push(u); save(); setSession(res, u); res.json({ user: publicUser(u) });
});

app.post('/api/login', (req, res) => {
  const u = db.users.find(x => x.username === clean(req.body.username, 40).toLowerCase());
  if (!u || !checkPw(String(req.body.password || ''), u.pw)) return res.status(400).json({ error: 'Wrong username or password.' });
  u.lastLogin = now(); save(); setSession(res, u); res.json({ user: publicUser(u) });
});
app.post('/api/logout', (req, res) => { res.setHeader('Set-Cookie', 'sid=; Path=/; Max-Age=0'); res.json({ ok: true }); });
app.get('/api/me', (req, res) => {
  const out = { user: publicUser(req.user) };
  if (req.user?.classId) { const k = db.classes.find(c => c.id === req.user.classId); out.class = k && { id: k.id, name: k.name, unlockAll: !!k.unlockAll }; }
  res.json(out);
});

// --- lessons ---
function lessonForClient(l, revealAnswers, isTeacher = false) {
  const o = db.lessonOverrides[l.id] || {};
  const copy = JSON.parse(JSON.stringify(l));
  if (o.video !== undefined) copy.video = o.video;
  if (o.teacherNote) copy.teacherNote = o.teacherNote;
  if (!revealAnswers) copy.quiz = (copy.quiz || []).map(q => ({ q: q.q, choices: q.choices }));
  if (!isTeacher && copy.challenge) delete copy.challenge.solution;
  return copy;
}
const progFor = (userId, lessonId) => db.progress.find(p => p.userId === userId && p.lessonId === lessonId);
function isComplete(p) { return !!(p && p.quiz && (p.challenge || !lessonById(p.lessonId)?.challenge)); }
function unlockedFor(user) {
  if (user.role === 'teacher') return LESSONS.map(l => l.id);
  const k = db.classes.find(c => c.id === user.classId);
  const extra = new Set((k && k.unlocked) || []);
  const ids = [];
  for (let i = 0; i < LESSONS.length; i++) {
    const l = LESSONS[i];
    if (i === 0 || k?.unlockAll || extra.has(l.id) || isComplete(progFor(user.id, LESSONS[i - 1].id)) || progFor(user.id, l.id)) ids.push(l.id);
  }
  return ids;
}
app.get('/api/lessons', need(), (req, res) => {
  const unlocked = new Set(unlockedFor(req.user));
  res.json({
    lessons: LESSONS.map(l => {
      const p = progFor(req.user.id, l.id);
      return {
        id: l.id, unit: l.unit, order: l.order, title: l.title, minutes: l.minutes, tags: l.tags, summary: l.summary,
        hasChallenge: !!l.challenge, unlocked: unlocked.has(l.id),
        status: isComplete(p) ? 'complete' : p ? 'started' : 'new',
        quizScore: p?.quiz ? p.quiz.score + '/' + p.quiz.total : null
      };
    })
  });
});
app.get('/api/lessons/:id', need(), (req, res) => {
  const l = lessonById(req.params.id);
  if (!l) return res.status(404).json({ error: 'No such lesson.' });
  if (!unlockedFor(req.user).includes(l.id)) return res.status(403).json({ error: 'Finish the previous lesson to unlock this one!' });
  let p = progFor(req.user.id, l.id);
  if (req.user.role === 'student' && !p) { p = { id: uid(), userId: req.user.id, lessonId: l.id, started: now() }; db.progress.push(p); save(); }
  const idx = LESSONS.indexOf(l);
  res.json({
    lesson: lessonForClient(l, req.user.role === 'teacher' || !!p?.quiz, req.user.role === 'teacher'),
    progress: p || null,
    prev: LESSONS[idx - 1]?.id || null, next: LESSONS[idx + 1]?.id || null
  });
});

// --- student work ---
app.post('/api/lessons/:id/draft', need('student'), (req, res) => {
  const p = progFor(req.user.id, req.params.id); if (!p) return res.status(404).json({ error: 'Open the lesson first.' });
  p.draft = String(req.body.code || '').slice(0, 20000); p.draftAt = now(); save(); res.json({ ok: true });
});
app.post('/api/lessons/:id/submit', need('student'), (req, res) => {
  const p = progFor(req.user.id, req.params.id); if (!p) return res.status(404).json({ error: 'Open the lesson first.' });
  const results = Array.isArray(req.body.checks) ? req.body.checks.slice(0, 20).map(c => ({ message: clean(c.message, 200), pass: !!c.pass })) : [];
  p.submissions = p.submissions || [];
  p.submissions.push({ at: now(), code: String(req.body.code || '').slice(0, 20000), checks: results, output: String(req.body.output || '').slice(0, 4000) });
  p.challenge = { at: now(), passed: results.every(r => r.pass), passCount: results.filter(r => r.pass).length, total: results.length };
  p.draft = p.submissions.at(-1).code;
  save(); res.json({ progress: p });
});
app.post('/api/lessons/:id/quiz', need('student'), (req, res) => {
  const l = lessonById(req.params.id); const p = progFor(req.user.id, req.params.id);
  if (!l || !p) return res.status(404).json({ error: 'Open the lesson first.' });
  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  const score = (l.quiz || []).reduce((s, q, i) => s + (Number(answers[i]) === q.answer ? 1 : 0), 0);
  p.quizAttempts = (p.quizAttempts || 0) + 1;
  p.quiz = { score, total: (l.quiz || []).length, answers, at: now() };
  if (!p.quizBest || score > p.quizBest) p.quizBest = score;
  p.reflection = clean(req.body.reflection, 3000);
  if (isComplete(p) && !p.completed) p.completed = now();
  save();
  res.json({ progress: p, lesson: lessonForClient(l, true) });
});

// --- teacher ---
app.get('/api/teacher/classes', need('teacher'), (req, res) => {
  res.json({ classes: db.classes.filter(c => c.teacherId === req.user.id).map(c => ({ ...c, studentCount: db.users.filter(u => u.classId === c.id).length })) });
});
app.post('/api/teacher/classes', need('teacher'), (req, res) => {
  const name = clean(req.body.name); if (!name) return res.status(400).json({ error: 'Give the class a name (e.g. "Period 3").' });
  const c = { id: uid(), teacherId: req.user.id, name, code: makeJoinCode(), created: now(), unlockAll: false, unlocked: [] };
  db.classes.push(c); save(); res.json({ class: c });
});
function ownClass(req, res) {
  const c = db.classes.find(k => k.id === req.params.cid && k.teacherId === req.user.id);
  if (!c) res.status(404).json({ error: 'Class not found.' });
  return c;
}
app.patch('/api/teacher/classes/:cid', need('teacher'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  if ('name' in req.body) c.name = clean(req.body.name) || c.name;
  if ('unlockAll' in req.body) c.unlockAll = !!req.body.unlockAll;
  if ('closed' in req.body) c.closed = !!req.body.closed;
  if (Array.isArray(req.body.unlocked)) c.unlocked = req.body.unlocked.filter(id => lessonById(id));
  if (req.body.newCode) c.code = makeJoinCode();
  save(); res.json({ class: c });
});
app.delete('/api/teacher/classes/:cid', need('teacher'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  if (db.users.some(u => u.classId === c.id)) return res.status(400).json({ error: 'Remove or move the students first.' });
  db.classes = db.classes.filter(k => k !== c); save(); res.json({ ok: true });
});
app.get('/api/teacher/classes/:cid/progress', need('teacher'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  const students = db.users.filter(u => u.classId === c.id).sort((a, b) => a.name.localeCompare(b.name));
  res.json({
    class: c,
    lessons: LESSONS.map(l => ({ id: l.id, unit: l.unit, order: l.order, title: l.title, hasChallenge: !!l.challenge })),
    students: students.map(s => ({
      ...publicUser(s), lastLogin: s.lastLogin || null,
      progress: Object.fromEntries(db.progress.filter(p => p.userId === s.id).map(p => [p.lessonId, {
        status: isComplete(p) ? 'complete' : 'started',
        quiz: p.quiz ? { score: p.quiz.score, total: p.quiz.total } : null,
        challenge: p.challenge || null, submissions: (p.submissions || []).length,
        grade: p.grade ?? null, needsReview: !!(p.submissions?.length && !p.reviewedAt) || !!(p.reflection && !p.reviewedAt)
      }]))
    }))
  });
});
function ownStudent(req, res) {
  const s = db.users.find(u => u.id === req.params.sid && u.role === 'student');
  const c = s && db.classes.find(k => k.id === s.classId && k.teacherId === req.user.id);
  if (!c) { res.status(404).json({ error: 'Student not found.' }); return null; }
  return s;
}
app.get('/api/teacher/students/:sid/lessons/:lid', need('teacher'), (req, res) => {
  const s = ownStudent(req, res); if (!s) return;
  const l = lessonById(req.params.lid);
  res.json({ student: publicUser(s), lesson: l && lessonForClient(l, true, true), progress: progFor(s.id, req.params.lid) || null });
});
app.post('/api/teacher/students/:sid/lessons/:lid/review', need('teacher'), (req, res) => {
  const s = ownStudent(req, res); if (!s) return;
  let p = progFor(s.id, req.params.lid);
  if (!p) { p = { id: uid(), userId: s.id, lessonId: req.params.lid, started: now() }; db.progress.push(p); }
  if ('grade' in req.body) p.grade = req.body.grade === '' || req.body.grade === null ? null : Math.max(0, Math.min(100, Number(req.body.grade) || 0));
  if ('feedback' in req.body) p.feedback = clean(req.body.feedback, 3000);
  if (req.body.markComplete) { p.quiz = p.quiz || { score: 0, total: 0, answers: [], at: now(), excused: true }; p.challenge = p.challenge || { at: now(), passed: true, excused: true }; p.completed = p.completed || now(); }
  p.reviewedAt = now(); save(); res.json({ progress: p });
});
app.post('/api/teacher/students/:sid/reset-password', need('teacher'), (req, res) => {
  const s = ownStudent(req, res); if (!s) return;
  const pw = String(req.body.password || ''); if (pw.length < 4) return res.status(400).json({ error: 'At least 4 characters.' });
  s.pw = hashPw(pw); save(); res.json({ ok: true });
});
app.post('/api/teacher/students/:sid/move', need('teacher'), (req, res) => {
  const s = ownStudent(req, res); if (!s) return;
  const c = db.classes.find(k => k.id === req.body.classId && k.teacherId === req.user.id);
  if (!c) return res.status(400).json({ error: 'Class not found.' });
  s.classId = c.id; save(); res.json({ ok: true });
});
app.delete('/api/teacher/students/:sid', need('teacher'), (req, res) => {
  const s = ownStudent(req, res); if (!s) return;
  db.users = db.users.filter(u => u !== s); db.progress = db.progress.filter(p => p.userId !== s.id); save(); res.json({ ok: true });
});
app.put('/api/teacher/lessons/:lid', need('teacher'), (req, res) => {
  if (!lessonById(req.params.lid)) return res.status(404).json({ error: 'No such lesson.' });
  const o = db.lessonOverrides[req.params.lid] = db.lessonOverrides[req.params.lid] || {};
  if ('video' in req.body) o.video = clean(req.body.video, 500);
  if ('teacherNote' in req.body) o.teacherNote = clean(req.body.teacherNote, 2000);
  save(); res.json({ ok: true, override: o });
});
app.get('/api/teacher/classes/:cid/export.csv', need('teacher'), (req, res) => {
  const c = ownClass(req, res); if (!c) return;
  const students = db.users.filter(u => u.classId === c.id).sort((a, b) => a.name.localeCompare(b.name));
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['Student', 'Username', ...LESSONS.flatMap(l => [`${l.order}. ${l.title} – quiz`, `${l.order} – challenge`, `${l.order} – grade`])]];
  for (const s of students) rows.push([s.name, s.username, ...LESSONS.flatMap(l => {
    const p = progFor(s.id, l.id);
    return [p?.quiz ? `${p.quiz.score}/${p.quiz.total}` : '', p?.challenge ? (p.challenge.passed ? 'passed' : `${p.challenge.passCount}/${p.challenge.total}`) : '', p?.grade ?? ''];
  })]);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${c.name.replace(/[^\w-]+/g, '_')}_progress.csv"`);
  res.send(rows.map(r => r.map(q).join(',')).join('\n'));
});

app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => {
  console.log(`\nRoboCode Academy running at http://localhost:${PORT}`);
  console.log(`Teacher sign-up code: ${TEACHER_CODE}   (set TEACHER_CODE env var to change)`);
  console.log(`${LESSONS.length} lessons loaded.\n`);
});
