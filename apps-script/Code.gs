/* RoboCode Academy - Google Apps Script backend.
 *
 * The web app runs as the teacher who deploys it, so students never get access
 * to the data spreadsheet. Who is calling comes from their signed-in Google
 * account (Session.getActiveUser), never from anything the browser sends.
 *
 * Apps Script lets the browser call any global function, so everything except
 * doGet, api and setup ends in an underscore, which makes it private.
 */

var CELL_SIZE = 40000;     // Sheets allows 50,000 characters in a cell
var BODY_CELLS = 10;       // cells per Progress row for code, drafts and reflections
var KEEP_SUBMISSIONS = 10; // newest code submissions kept per student per lesson
var LOOK_CHOICES = {
  shape: ['rounded', 'box', 'wedge', 'round'],
  wheels: ['standard', 'big', 'treads'],
  deco: ['none', 'stripe', 'flames', 'eyes', 'star']
};
var TABS = {
  Users: ['id', 'email', 'json'],
  Classes: ['id', 'name', 'json'],
  Overrides: ['lessonId', 'note', 'json'],
  Progress: ['id', 'userId', 'lessonId', 'summary', 'work (split across cells)'],
  Teachers: ['Extra teacher emails, one per row']
};

var cache_ = {};      // per-request copy of sheet data
var heldLock_ = null;

// ---------------------------------------------------------------- entry points
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('RoboCode Academy')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Run once from the script editor: grants permissions and creates the data sheet. */
function setup() {
  if (email_() !== owner_()) throw new Error('Only the teacher who owns this script can run setup.');
  var ss = spreadsheet_();
  Object.keys(TABS).forEach(tab_);
  Logger.log('Data spreadsheet: ' + ss.getUrl());
  return ss.getUrl();
}

/** The single function the web page calls. Returns a JSON string. */
function api(method, path, bodyJson) {
  cache_ = {}; heldLock_ = null;
  try {
    var body = bodyJson ? JSON.parse(bodyJson) : {};
    var routes = routes_();
    for (var i = 0; i < routes.length; i++) {
      var r = routes[i];
      var m = r.method === method && path.match(r.pattern);
      if (!m) continue;
      var user = r.role === 'public' ? null : currentUser_();
      if (r.role !== 'public' && !user) throw fail_(401, 'Please join a class first.');
      if (r.role === 'teacher' || r.role === 'student') { if (user.role !== r.role) throw fail_(403, 'Not allowed.'); }
      if (r.write) { lock_(); if (user) user = currentUser_(); }
      return JSON.stringify(r.fn({ user: user, body: body, params: m.slice(1) }));
    }
    throw fail_(404, 'Not found.');
  } catch (e) {
    if (e && e.status) return JSON.stringify({ __error: e.message, status: e.status });
    console.error(e && e.stack || e);
    return JSON.stringify({ __error: 'Something went wrong on the server. Please try again.', status: 500 });
  } finally {
    if (heldLock_) { SpreadsheetApp.flush(); heldLock_.releaseLock(); heldLock_ = null; }
  }
}

function routes_() {
  var R = function (method, pattern, role, write, fn) { return { method: method, pattern: pattern, role: role, write: write, fn: fn }; };
  var ID = '([\\w-]+)';
  var P = function (s) { return new RegExp('^/api/' + s.replace(/:id/g, ID) + '$'); };
  return [
    R('GET', P('me'), 'public', false, me_),
    R('POST', P('join'), 'public', true, join_),
    R('PUT', P('me/robot'), 'any', true, saveRobot_),
    R('GET', P('map'), 'student', false, function (c) { return map_(c.user, classById_(c.user.classId)); }),
    R('GET', P('map/:id'), 'teacher', false, function (c) { return map_(c.user, ownClass_(c.user, c.params[0])); }),

    R('GET', P('lessons'), 'any', false, listLessons_),
    R('GET', P('lessons/:id'), 'any', false, getLesson_),
    R('POST', P('lessons/:id/draft'), 'student', true, saveDraft_),
    R('POST', P('lessons/:id/submit'), 'student', true, submitCode_),
    R('POST', P('lessons/:id/quiz'), 'student', true, submitQuiz_),

    R('GET', P('teacher/classes'), 'teacher', false, listClasses_),
    R('POST', P('teacher/classes'), 'teacher', true, createClass_),
    R('PATCH', P('teacher/classes/:id'), 'teacher', true, updateClass_),
    R('DELETE', P('teacher/classes/:id'), 'teacher', true, deleteClass_),
    R('GET', P('teacher/classes/:id/progress'), 'teacher', false, classProgress_),
    R('POST', P('teacher/classes/:id/export'), 'teacher', true, exportClass_),
    R('GET', P('teacher/students/:id/lessons/:id'), 'teacher', false, studentWork_),
    R('POST', P('teacher/students/:id/lessons/:id/review'), 'teacher', true, reviewWork_),
    R('POST', P('teacher/students/:id/rename'), 'teacher', true, renameStudent_),
    R('POST', P('teacher/students/:id/move'), 'teacher', true, moveStudent_),
    R('DELETE', P('teacher/students/:id'), 'teacher', true, removeStudent_),
    R('GET', P('teacher/lessons-full'), 'teacher', false, function () { return { lessons: LESSONS.map(function (l) { return lessonForClient_(l, true, true); }) }; }),
    R('PUT', P('teacher/lessons/:id'), 'teacher', true, updateLessonExtras_)
  ];
}

// ---------------------------------------------------------------- helpers
function fail_(status, message) { var e = new Error(message); e.status = status; return e; }
function uid_(prefix) { return prefix + Utilities.getUuid().replace(/-/g, '').slice(0, 16); }
function now_() { return new Date().toISOString(); }
function clean_(s, n) { return String(s === undefined || s === null ? '' : s).trim().slice(0, n || 60); }
function owner_() { return String(Session.getEffectiveUser().getEmail() || '').toLowerCase(); }
function email_() {
  var e = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!e) throw fail_(401, 'We could not read your Google account. Sign in with your school Google account and reload this page.');
  return e;
}
function lessonById_(id) { return LESSONS.filter(function (l) { return l.id === id; })[0]; }
function lock_() {
  if (heldLock_) return;
  var l = LockService.getScriptLock();
  if (!l.tryLock(20000)) throw fail_(503, 'The class is saving a lot of work right now. Please try again in a moment.');
  heldLock_ = l;
  cache_ = {}; // anything read before the lock may be out of date
}
function publicUser_(u) {
  return u && { id: u.id, role: u.role, name: u.name, username: u.email.split('@')[0], classId: u.classId || null, robot: u.robot || null };
}
/** What classmates see: first name and last initial, nothing else. */
function peerName_(name) {
  var parts = String(name).trim().split(/\s+/);
  return parts.length < 2 ? parts[0] : parts[0] + ' ' + parts[parts.length - 1].charAt(0).toUpperCase() + '.';
}
/** Accepts only known options, so nothing odd is shown on classmates' screens. */
function cleanLook_(raw) {
  var out = {};
  raw = raw || {};
  Object.keys(LOOK_CHOICES).forEach(function (k) { if (LOOK_CHOICES[k].indexOf(raw[k]) >= 0) out[k] = raw[k]; });
  ['body', 'brain', 'decoColor', 'trail'].forEach(function (k) { if (/^#[0-9a-f]{6}$/i.test(raw[k])) out[k] = raw[k]; });
  if (typeof raw.name === 'string') out.name = raw.name.trim().slice(0, 12);
  return out;
}

// ---------------------------------------------------------------- storage
function spreadsheet_() {
  if (cache_.ss) return cache_.ss;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (!id) {
    lock_();
    id = props.getProperty('SHEET_ID');
    if (!id) {
      var made = SpreadsheetApp.create('RoboCode Academy Data');
      id = made.getId();
      props.setProperty('SHEET_ID', id);
    }
  }
  return (cache_.ss = SpreadsheetApp.openById(id));
}
function tab_(name) {
  var key = 'tab:' + name;
  if (cache_[key]) return cache_[key];
  var ss = spreadsheet_();
  var sh = ss.getSheetByName(name);
  if (!sh) {
    lock_();
    ss = spreadsheet_();
    sh = ss.getSheetByName(name);
    if (!sh) { sh = ss.insertSheet(name); sh.appendRow(TABS[name]); sh.setFrozenRows(1); }
  }
  return (cache_[key] = sh);
}
function setRow_(obj, row) { Object.defineProperty(obj, '_row', { value: row, writable: true, enumerable: false }); return obj; }
function rows_(name) {
  var key = 'rows:' + name;
  if (cache_[key]) return cache_[key];
  var sh = tab_(name), n = sh.getLastRow() - 1;
  var values = n > 0 ? sh.getRange(2, 1, n, 3).getValues() : [];
  return (cache_[key] = values.map(function (r, i) { return setRow_(JSON.parse(r[2]), i + 2); }));
}
function put_(name, obj, label) {
  var sh = tab_(name), row = [obj.id, label, JSON.stringify(obj)];
  if (obj._row) { sh.getRange(obj._row, 1, 1, 3).setValues([row]); return; }
  var list = rows_(name);
  sh.appendRow(row);
  setRow_(obj, sh.getLastRow());
  list.push(obj);
}
function drop_(name, obj) { tab_(name).deleteRow(obj._row); delete cache_['rows:' + name]; }

function users_() { return rows_('Users'); }
function classes_() { return rows_('Classes'); }
function overrides_() {
  if (cache_.overrides) return cache_.overrides;
  var map = {};
  rows_('Overrides').forEach(function (o) { map[o.id] = o; });
  return (cache_.overrides = map);
}
function userByEmail_(email) { return users_().filter(function (u) { return u.email === email; })[0]; }
function currentUser_() { return userByEmail_(email_()); }
function classById_(id) { return classes_().filter(function (c) { return c.id === id; })[0]; }
function saveUser_(u) { put_('Users', u, u.email); }
function saveClass_(c) { put_('Classes', c, c.name); }
function isTeacher_(email) {
  if (email === owner_()) return true;
  var sh = tab_('Teachers'), n = sh.getLastRow() - 1;
  if (n < 1) return false;
  return sh.getRange(2, 1, n, 1).getValues().some(function (r) { return String(r[0]).trim().toLowerCase() === email; });
}

// Progress rows keep a small summary in one cell, used by the map and grade grid,
// and the bulky work (code, drafts, reflections) in separate cells read only when
// needed. That keeps the pages quick when a class has thousands of rows.
function summaries_() {
  if (cache_.summaries) return cache_.summaries;
  var sh = tab_('Progress'), n = sh.getLastRow() - 1;
  var values = n > 0 ? sh.getRange(2, 1, n, 4).getValues() : [];
  return (cache_.summaries = values.map(function (r, i) { return setRow_(JSON.parse(r[3]), i + 2); }));
}
function progressByUser_() {
  if (cache_.byUser) return cache_.byUser;
  var map = {};
  summaries_().forEach(function (p) { (map[p.userId] = map[p.userId] || {})[p.lessonId] = p; });
  return (cache_.byUser = map);
}
function progressOf_(userId) { return progressByUser_()[userId] || {}; }
function workOf_(p) {
  var cells = tab_('Progress').getRange(p._row, 5, 1, BODY_CELLS).getValues()[0];
  var text = cells.map(function (c) { return String(c).slice(1); }).join('');
  return text ? JSON.parse(text) : {};
}
function merged_(p, work) { return p ? Object.assign({}, p, work) : null; }
function saveProgress_(p, work) {
  var sh = tab_('Progress');
  if (work) { p.subs = (work.submissions || []).length; p.hasReflection = !!work.reflection; }
  var row = [p.id, p.userId, p.lessonId, JSON.stringify(p)];
  if (p._row && !work) { sh.getRange(p._row, 1, 1, 4).setValues([row]); return; }
  var text = JSON.stringify(work || {}), cells = [];
  for (var i = 0; i < BODY_CELLS; i++) {
    var part = text.slice(i * CELL_SIZE, (i + 1) * CELL_SIZE);
    cells.push(part ? 'j' + part : ''); // the prefix stops Sheets treating a piece as a formula or number
  }
  if (text.length > BODY_CELLS * CELL_SIZE) throw fail_(413, 'That work is too large to save.');
  row = row.concat(cells);
  if (p._row) { sh.getRange(p._row, 1, 1, row.length).setValues([row]); return; }
  var list = summaries_();
  sh.appendRow(row);
  setRow_(p, sh.getLastRow());
  list.push(p);
  delete cache_.byUser;
}

// ---------------------------------------------------------------- sign-in
function classInfo_(k) { return k && { id: k.id, name: k.name, unlockAll: !!k.unlockAll }; }
function me_() {
  var email = email_();
  var u = userByEmail_(email);
  if (!u && isTeacher_(email)) {
    lock_();
    u = userByEmail_(email);
    if (!u) { u = { id: uid_('u_'), role: 'teacher', email: email, name: email.split('@')[0], created: now_() }; saveUser_(u); }
  }
  if (!u) return { user: null, email: email };
  if (!u.lastLogin || Date.now() - new Date(u.lastLogin).getTime() > 3600000) {
    lock_();
    u = userByEmail_(email);
    u.lastLogin = now_();
    saveUser_(u);
  }
  var out = { user: publicUser_(u) };
  if (u.classId) out['class'] = classInfo_(classById_(u.classId));
  return out;
}
function join_(c) {
  var email = email_();
  if (userByEmail_(email)) throw fail_(400, 'You have already joined a class.');
  var first = clean_(c.body.firstName, 30), last = clean_(c.body.lastName, 30);
  var code = clean_(c.body.classCode, 10).toUpperCase();
  var klass = classes_().filter(function (k) { return k.code === code; })[0];
  if (!klass) throw fail_(400, 'Class code not found. Ask your teacher for the 6-letter code.');
  if (klass.closed) throw fail_(400, 'This class is not accepting new students right now.');
  if (!first || !last) throw fail_(400, 'Enter your first and last name.');
  var u = { id: uid_('u_'), role: 'student', email: email, name: first + ' ' + last, classId: klass.id, created: now_(), lastLogin: now_() };
  saveUser_(u);
  return { user: publicUser_(u), 'class': classInfo_(klass) };
}
function saveRobot_(c) {
  c.user.robot = cleanLook_(c.body.robot);
  saveUser_(c.user);
  return { robot: c.user.robot };
}

// ---------------------------------------------------------------- lessons
function isComplete_(p) {
  if (!p || !p.quiz) return false;
  var l = lessonById_(p.lessonId);
  return !!(p.challenge || !(l && l.challenge));
}
function unlockedFor_(user) {
  if (user.role === 'teacher') return LESSONS.map(function (l) { return l.id; });
  var k = classById_(user.classId) || {};
  var extra = k.unlocked || [], mine = progressOf_(user.id);
  return LESSONS.filter(function (l, i) {
    return i === 0 || k.unlockAll || extra.indexOf(l.id) >= 0 || isComplete_(mine[LESSONS[i - 1].id]) || mine[l.id];
  }).map(function (l) { return l.id; });
}
function lessonForClient_(l, revealAnswers, isTeacher) {
  var o = overrides_()[l.id] || {};
  var copy = JSON.parse(JSON.stringify(l));
  if (o.video !== undefined) copy.video = o.video;
  if (o.teacherNote) copy.teacherNote = o.teacherNote;
  if (!revealAnswers) copy.quiz = (copy.quiz || []).map(function (q) { return { q: q.q, choices: q.choices }; });
  if (!isTeacher && copy.challenge) delete copy.challenge.solution;
  return copy;
}
function listLessons_(c) {
  var unlocked = unlockedFor_(c.user), mine = progressOf_(c.user.id);
  return {
    lessons: LESSONS.map(function (l) {
      var p = mine[l.id];
      return {
        id: l.id, unit: l.unit, order: l.order, title: l.title, minutes: l.minutes, tags: l.tags, summary: l.summary,
        hasChallenge: !!l.challenge, unlocked: unlocked.indexOf(l.id) >= 0,
        status: isComplete_(p) ? 'complete' : p ? 'started' : 'new',
        quizScore: p && p.quiz ? p.quiz.score + '/' + p.quiz.total : null
      };
    })
  };
}
function getLesson_(c) {
  var l = lessonById_(c.params[0]);
  if (!l) throw fail_(404, 'No such lesson.');
  var user = c.user;
  if (unlockedFor_(user).indexOf(l.id) < 0) throw fail_(403, 'Finish the previous lesson to unlock this one!');
  var p = progressOf_(user.id)[l.id];
  if (user.role === 'student' && !p) {
    lock_();
    user = currentUser_();
    p = progressOf_(user.id)[l.id];
    if (!p) { p = { id: uid_('p_'), userId: user.id, lessonId: l.id, started: now_() }; saveProgress_(p, {}); }
  }
  var idx = LESSONS.indexOf(l), teacher = user.role === 'teacher';
  return {
    lesson: lessonForClient_(l, teacher || !!(p && p.quiz), teacher),
    progress: p ? merged_(p, workOf_(p)) : null,
    prev: idx > 0 ? LESSONS[idx - 1].id : null,
    next: idx < LESSONS.length - 1 ? LESSONS[idx + 1].id : null
  };
}
function openProgress_(c) {
  var p = progressOf_(c.user.id)[c.params[0]];
  if (!p) throw fail_(404, 'Open the lesson first.');
  return p;
}
function markCompleted_(p) { if (isComplete_(p) && !p.completed) p.completed = now_(); }
function saveDraft_(c) {
  var p = openProgress_(c), work = workOf_(p);
  work.draft = String(c.body.code || '').slice(0, 20000);
  work.draftAt = now_();
  saveProgress_(p, work);
  return { ok: true };
}
function submitCode_(c) {
  var p = openProgress_(c), work = workOf_(p);
  var checks = Array.isArray(c.body.checks) ? c.body.checks.slice(0, 20).map(function (x) { return { message: clean_(x.message, 200), pass: !!x.pass }; }) : [];
  var code = String(c.body.code || '').slice(0, 20000);
  work.submissions = (work.submissions || []).concat([{ at: now_(), code: code, checks: checks, output: String(c.body.output || '').slice(0, 4000) }]).slice(-KEEP_SUBMISSIONS);
  work.draft = code;
  p.challenge = { at: now_(), passed: checks.every(function (x) { return x.pass; }), passCount: checks.filter(function (x) { return x.pass; }).length, total: checks.length };
  markCompleted_(p);
  saveProgress_(p, work);
  return { progress: merged_(p, work) };
}
function submitQuiz_(c) {
  var l = lessonById_(c.params[0]), p = openProgress_(c), work = workOf_(p);
  var answers = Array.isArray(c.body.answers) ? c.body.answers.map(Number) : [];
  var score = (l.quiz || []).reduce(function (s, q, i) { return s + (answers[i] === q.answer ? 1 : 0); }, 0);
  p.quizAttempts = (p.quizAttempts || 0) + 1;
  p.quiz = { score: score, total: (l.quiz || []).length, answers: answers, at: now_() };
  if (!p.quizBest || score > p.quizBest) p.quizBest = score;
  work.reflection = clean_(c.body.reflection, 3000);
  markCompleted_(p);
  saveProgress_(p, work);
  return { progress: merged_(p, work), lesson: lessonForClient_(l, true) };
}

// ---------------------------------------------------------------- learning map
function map_(user, klass) {
  if (!klass) throw fail_(404, 'Class not found.');
  var teacher = user.role === 'teacher', showPeers = klass.showPeers !== false;
  var unlocked = unlockedFor_(user), mine = progressOf_(user.id);
  var entries = users_().filter(function (s) {
    return s.classId === klass.id && (teacher || showPeers || s.id === user.id);
  }).map(function (s) {
    var progress = progressOf_(s.id), done = 0, at = -1;
    LESSONS.forEach(function (l, i) { if (isComplete_(progress[l.id])) done++; else if (at < 0) at = i; });
    return {
      name: teacher ? s.name : peerName_(s.name), me: s.id === user.id, done: done,
      at: at < 0 ? LESSONS.length : at, look: Object.assign({}, cleanLook_(s.robot), { name: '' })
    };
  }).sort(function (a, b) { return a.name.localeCompare(b.name); });
  return {
    'class': { id: klass.id, name: klass.name, showPeers: showPeers },
    lessons: LESSONS.map(function (l) {
      return { id: l.id, unit: l.unit, order: l.order, title: l.title, unlocked: unlocked.indexOf(l.id) >= 0, complete: isComplete_(mine[l.id]) };
    }),
    students: entries
  };
}

// ---------------------------------------------------------------- teacher
function listClasses_(c) {
  var mine = classes_().filter(function (k) { return k.teacherId === c.user.id; });
  return {
    classes: mine.map(function (k) {
      return Object.assign({}, k, { studentCount: users_().filter(function (u) { return u.classId === k.id; }).length });
    })
  };
}
function joinCode_() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', code;
  var taken = function (x) { return classes_().some(function (k) { return k.code === x; }); };
  do {
    code = '';
    for (var i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  } while (taken(code));
  return code;
}
function createClass_(c) {
  var name = clean_(c.body.name);
  if (!name) throw fail_(400, 'Give the class a name (e.g. "Period 3").');
  var k = { id: uid_('c_'), teacherId: c.user.id, name: name, code: joinCode_(), created: now_(), unlockAll: false, unlocked: [], showPeers: true };
  saveClass_(k);
  return { 'class': k };
}
function ownClass_(user, id) {
  var k = classes_().filter(function (x) { return x.id === id && x.teacherId === user.id; })[0];
  if (!k) throw fail_(404, 'Class not found.');
  return k;
}
function updateClass_(c) {
  var k = ownClass_(c.user, c.params[0]), b = c.body;
  if ('name' in b) k.name = clean_(b.name) || k.name;
  if ('unlockAll' in b) k.unlockAll = !!b.unlockAll;
  if ('closed' in b) k.closed = !!b.closed;
  if ('showPeers' in b) k.showPeers = !!b.showPeers;
  if (Array.isArray(b.unlocked)) k.unlocked = b.unlocked.filter(lessonById_);
  if (b.newCode) k.code = joinCode_();
  saveClass_(k);
  return { 'class': k };
}
function deleteClass_(c) {
  var k = ownClass_(c.user, c.params[0]);
  if (users_().some(function (u) { return u.classId === k.id; })) throw fail_(400, 'Remove or move the students first.');
  drop_('Classes', k);
  return { ok: true };
}
function studentsIn_(k) {
  return users_().filter(function (u) { return u.classId === k.id; }).sort(function (a, b) { return a.name.localeCompare(b.name); });
}
function classProgress_(c) {
  var k = ownClass_(c.user, c.params[0]);
  return {
    'class': k,
    lessons: LESSONS.map(function (l) { return { id: l.id, unit: l.unit, order: l.order, title: l.title, hasChallenge: !!l.challenge }; }),
    students: studentsIn_(k).map(function (s) {
      var progress = {}, mine = progressOf_(s.id);
      Object.keys(mine).forEach(function (id) {
        var p = mine[id];
        progress[id] = {
          status: isComplete_(p) ? 'complete' : 'started',
          quiz: p.quiz ? { score: p.quiz.score, total: p.quiz.total } : null,
          challenge: p.challenge || null, submissions: p.subs || 0,
          grade: p.grade === undefined ? null : p.grade,
          needsReview: !!((p.subs || p.hasReflection) && !p.reviewedAt)
        };
      });
      return Object.assign(publicUser_(s), { lastLogin: s.lastLogin || null, progress: progress });
    })
  };
}
function ownStudent_(user, id) {
  var s = users_().filter(function (u) { return u.id === id && u.role === 'student'; })[0];
  if (!s) throw fail_(404, 'Student not found.');
  ownClass_(user, s.classId);
  return s;
}
function studentWork_(c) {
  var s = ownStudent_(c.user, c.params[0]), l = lessonById_(c.params[1]);
  var p = progressOf_(s.id)[c.params[1]];
  return { student: publicUser_(s), lesson: l && lessonForClient_(l, true, true), progress: p ? merged_(p, workOf_(p)) : null };
}
function reviewWork_(c) {
  var s = ownStudent_(c.user, c.params[0]), lessonId = c.params[1], b = c.body;
  if (!lessonById_(lessonId)) throw fail_(404, 'No such lesson.');
  var p = progressOf_(s.id)[lessonId] || { id: uid_('p_'), userId: s.id, lessonId: lessonId, started: now_() };
  var work = p._row ? workOf_(p) : {};
  if ('grade' in b) p.grade = b.grade === '' || b.grade === null ? null : Math.max(0, Math.min(100, Number(b.grade) || 0));
  if ('feedback' in b) work.feedback = clean_(b.feedback, 3000);
  if (b.markComplete) {
    p.quiz = p.quiz || { score: 0, total: 0, answers: [], at: now_(), excused: true };
    p.challenge = p.challenge || { at: now_(), passed: true, excused: true };
    p.completed = p.completed || now_();
  }
  p.reviewedAt = now_();
  saveProgress_(p, work);
  return { progress: merged_(p, work) };
}
function renameStudent_(c) {
  var s = ownStudent_(c.user, c.params[0]), name = clean_(c.body.name);
  if (!name) throw fail_(400, 'Enter a name.');
  s.name = name;
  saveUser_(s);
  return { ok: true };
}
function moveStudent_(c) {
  var s = ownStudent_(c.user, c.params[0]);
  var k = ownClass_(c.user, c.body.classId);
  s.classId = k.id;
  saveUser_(s);
  return { ok: true };
}
function removeStudent_(c) {
  var s = ownStudent_(c.user, c.params[0]);
  var rows = summaries_().filter(function (p) { return p.userId === s.id; }).map(function (p) { return p._row; });
  rows.sort(function (a, b) { return b - a; }).forEach(function (r) { tab_('Progress').deleteRow(r); }); // bottom up, so row numbers stay valid
  drop_('Users', s);
  delete cache_.summaries; delete cache_.byUser;
  return { ok: true };
}
function updateLessonExtras_(c) {
  var id = c.params[0];
  if (!lessonById_(id)) throw fail_(404, 'No such lesson.');
  var o = overrides_()[id] || { id: id };
  if ('video' in c.body) o.video = clean_(c.body.video, 500);
  if ('teacherNote' in c.body) o.teacherNote = clean_(c.body.teacherNote, 2000);
  put_('Overrides', o, lessonById_(id).title);
  return { ok: true, override: o };
}
/** Grades go into a Google Sheet of their own, which is re-used on later exports. */
function exportClass_(c) {
  var k = ownClass_(c.user, c.params[0]);
  var header = ['Student', 'Email'];
  LESSONS.forEach(function (l) { header.push(l.order + '. ' + l.title + ' - quiz', l.order + ' - challenge', l.order + ' - grade'); });
  var rows = [header].concat(studentsIn_(k).map(function (s) {
    var mine = progressOf_(s.id), row = [s.name, s.email];
    LESSONS.forEach(function (l) {
      var p = mine[l.id];
      row.push(
        p && p.quiz ? p.quiz.score + '/' + p.quiz.total : '',
        p && p.challenge ? (p.challenge.passed ? 'passed' : p.challenge.passCount + '/' + p.challenge.total) : '',
        p && p.grade !== undefined && p.grade !== null ? p.grade : ''
      );
    });
    return row;
  }));
  var ss = null;
  if (k.exportId) { try { ss = SpreadsheetApp.openById(k.exportId); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create(k.name + ' - RoboCode grades');
    if (c.user.email !== owner_()) ss.addEditor(c.user.email);
    k.exportId = ss.getId();
    saveClass_(k);
  }
  var sh = ss.getSheets()[0];
  sh.clearContents();
  sh.getRange(1, 1, rows.length, header.length).setNumberFormat('@').setValues(rows); // plain text, so 8/10 doesn't become a date
  sh.setFrozenRows(1);
  return { url: ss.getUrl() };
}
