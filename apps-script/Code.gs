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
  Teachers: ['Extra teacher emails, one per row'],
  Teams: ['id', 'code', 'json'],
  Photos: ['id', 'checkpoint', 'json'],
  Events: ['id', 'event', 'json']
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
    R('PUT', P('me/setup'), 'any', true, saveSetup_),
    R('GET', P('map'), 'student', false, function (c) { return map_(c.user, classById_(c.user.classId)); }),
    R('GET', P('map/:id'), 'teacher', false, function (c) { return map_(c.user, ownClass_(c.user, c.params[0])); }),

    R('GET', P('team'), 'student', false, getTeam_),
    R('POST', P('team'), 'student', true, createTeam_),
    R('POST', P('team/join'), 'student', true, joinTeam_),
    R('POST', P('team/leave'), 'student', true, leaveTeam_),
    R('POST', P('team/rename'), 'student', true, renameTeam_),
    R('POST', P('photos'), 'student', false, uploadPhoto_),
    R('GET', P('photos/:id'), 'any', false, getPhoto_),
    R('DELETE', P('photos/:id'), 'teacher', true, deletePhoto_),
    R('GET', P('events/:id'), 'student', false, function (c) { return eventView_(c.user, classById_(c.user.classId), c.params[0]); }),

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
    R('GET', P('teacher/classes/:id/teams'), 'teacher', false, classTeams_),
    R('POST', P('teacher/classes/:id/teams/remove'), 'teacher', true, teacherRemoveFromTeam_),
    R('GET', P('teacher/classes/:id/photos'), 'teacher', false, classPhotos_),
    R('GET', P('teacher/classes/:id/events/:id'), 'teacher', false, function (c) { return eventView_(c.user, ownClass_(c.user, c.params[0]), c.params[1]); }),
    R('POST', P('teacher/classes/:id/events/:id/status'), 'teacher', true, setEventStatus_),
    R('POST', P('teacher/classes/:id/events/:id/waive'), 'teacher', true, waiveCheckIn_),
    R('POST', P('teacher/classes/:id/events/:id/bracket'), 'teacher', true, buildBracket_),
    R('POST', P('teacher/classes/:id/events/:id/match'), 'teacher', true, setMatchWinner_),
    R('POST', P('teacher/classes/:id/events/:id/time'), 'teacher', true, addRaceTime_),
    R('POST', P('teacher/classes/:id/events/:id/time/remove'), 'teacher', true, removeRaceTime_),
    R('GET', P('teacher/classroom/courses'), 'teacher', false, classroomCourses_),
    R('POST', P('teacher/classes/:id/classroom/link'), 'teacher', true, linkClassroom_),
    R('POST', P('teacher/classes/:id/classroom/sync'), 'teacher', false, syncClassroom_),
    R('GET', P('teacher/standards'), 'teacher', false, function () {
      return { standards: STANDARDS, plans: PLANS, lessons: LESSONS.map(function (l) { return { id: l.id, unit: l.unit, order: l.order, title: l.title, anchor: l.standards.anchor, supporting: l.standards.supporting }; }) };
    }),
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
  if (!u) return u;
  var team = teamOf_(u);
  return {
    id: u.id, role: u.role, name: u.name, username: u.email.split('@')[0], classId: u.classId || null,
    robot: (team ? team.robot : u.robot) || null, setup: (team ? team.setup : u.setup) || null,
    team: team ? { id: team.id, name: team.name } : null
  };
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

/** Robot Setup: which devices a student's robot has, on which ports, under which names. */
function cleanSetup_(raw) {
  raw = raw || {};
  var port = function (v) { var n = Number(v); if (n !== Math.floor(n) || n < 1 || n > 12) throw fail_(400, 'Ports must be 1 to 12.'); return n; };
  var used = [], names = ['Drivetrain', 'Brain', 'main'];
  var takePort = function (n) { if (used.indexOf(n) >= 0) throw fail_(400, 'Port ' + n + ' is used twice.'); used.push(n); return n; };
  var drive = raw.drive || {};
  var out = { gen: raw.gen === 2 ? 2 : 1, confirmed: true, drive: { left: takePort(port(drive.left)), right: takePort(port(drive.right)) }, devices: {} };
  ['gyro', 'distance', 'color', 'bumper', 'touchled', 'claw', 'arm'].forEach(function (job) {
    var d = (raw.devices || {})[job];
    if (!d) return;
    var clean = { on: !!d.on, port: port(d.port), name: String(d.name || '').trim() };
    if (!/^[A-Za-z_][A-Za-z0-9_]{0,19}$/.test(clean.name)) throw fail_(400, 'Device names can only use letters, numbers and _, and cannot start with a number.');
    if (clean.on) {
      takePort(clean.port);
      if (names.indexOf(clean.name) >= 0) throw fail_(400, 'The name ' + clean.name + ' is already taken.');
      names.push(clean.name);
    }
    if (job === 'color') clean.kind = d.kind === 'optical' ? 'optical' : 'color';
    out.devices[job] = clean;
  });
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
function classInfo_(k) { return k && { id: k.id, name: k.name, unlockAll: !!k.unlockAll, plan: planId_(k), kit: kitOf_(k) }; }
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
  var robot = cleanLook_(c.body.robot), team = teamOf_(c.user);
  if (team) { team.robot = robot; saveTeam_(team); } else { c.user.robot = robot; saveUser_(c.user); }
  return { robot: robot };
}

function saveSetup_(c) {
  var setup = cleanSetup_(c.body.setup), team = teamOf_(c.user);
  if (team) { team.setup = setup; saveTeam_(team); } else { c.user.setup = setup; saveUser_(c.user); }
  return { setup: setup };
}

// ---------------------------------------------------------------- term plans
function planId_(k) { return k && (k.plan === 'all' || PLANS[k.plan]) ? k.plan : '15'; }
function kitOf_(k) { return k && k.kit === '2' ? '2' : '1'; }
/** A class's lessons: the main path for the term, and everything else as extras. */
function pathOfClass_(k) {
  var id = planId_(k);
  if (id === 'all') return { main: LESSONS, extra: [] };
  var ids = PLANS[id];
  var inPlan = function (l) { return ids.indexOf(l.id) >= 0; };
  return { main: LESSONS.filter(inPlan), extra: LESSONS.filter(function (l) { return !inPlan(l); }) };
}
function pathOf_(user) { return user.role === 'teacher' ? { main: LESSONS, extra: [] } : pathOfClass_(classById_(user.classId)); }
function eventAfter_(lessonId) {
  var id = Object.keys(EVENTS).filter(function (e) { return EVENTS[e].after === lessonId; })[0];
  return id ? Object.assign({ id: id }, EVENTS[id]) : null;
}
function eventState_(k, id) {
  var key = k.id + '_' + id;
  return rows_('Events').filter(function (e) { return e.id === key; })[0] || { id: key, classId: k.id, eventId: id, status: 'upcoming', waived: [], times: [], bracket: null };
}
function blockingEvent_(k, lessonId) {
  var ev = eventAfter_(lessonId);
  return ev && k.id && eventState_(k, ev.id).status !== 'done' ? ev : null;
}
function placeIn_(path, l) {
  var i = path.main.indexOf(l);
  return i >= 0 ? { track: 'main', num: i + 1 } : { track: 'extra', num: null };
}

// ---------------------------------------------------------------- lessons
function isComplete_(p) {
  if (!p || !p.quiz) return false;
  var l = lessonById_(p.lessonId);
  if (!(p.challenge || !(l && l.challenge))) return false;
  return !PHOTO_LESSONS[p.lessonId] || !!p.photoExcused || hasPhoto_(userById_(p.userId), p.lessonId);
}
function unlockedFor_(user) {
  if (user.role === 'teacher') return LESSONS.map(function (l) { return l.id; });
  var k = classById_(user.classId) || {};
  var extra = k.unlocked || [], mine = progressOf_(user.id), path = pathOfClass_(k);
  var opened = function (l) { return k.unlockAll || extra.indexOf(l.id) >= 0 || !!mine[l.id]; };
  var main = path.main.filter(function (l, i) {
    if (i === 0 || opened(l)) return true;
    var before = path.main[i - 1];
    return isComplete_(mine[before.id]) && !blockingEvent_(k, before.id);
  });
  var extras = path.extra.filter(function (l) { return opened(l) || (PREREQS[l.id] || []).every(function (id) { return isComplete_(mine[id]); }); });
  return main.concat(extras).map(function (l) { return l.id; });
}
function lessonForClient_(l, revealAnswers, isTeacher) {
  var o = overrides_()[l.id] || {};
  var copy = JSON.parse(JSON.stringify(l));
  if (o.video !== undefined) copy.video = o.video;
  if (o.teacherNote) copy.teacherNote = o.teacherNote;
  if (!revealAnswers) copy.quiz = (copy.quiz || []).map(function (q) { return { q: q.q, choices: q.choices }; });
  if (!isTeacher && copy.challenge) delete copy.challenge.solution;
  var withText = function (code) { return STANDARDS.filter(function (s) { return s.code === code; })[0]; };
  copy.standards = { anchor: l.standards.anchor.map(withText), supporting: l.standards.supporting.map(withText) };
  return copy;
}
function listLessons_(c) {
  var unlocked = unlockedFor_(c.user), mine = progressOf_(c.user.id), path = pathOf_(c.user);
  var k = c.user.classId ? classById_(c.user.classId) : null;
  var events = k ? Object.keys(EVENTS).map(function (id) {
    var state = eventState_(k, id), after = placeIn_(path, lessonById_(EVENTS[id].after));
    return { id: id, title: EVENTS[id].title, icon: EVENTS[id].icon, status: state.status, afterNum: after.num, ready: isComplete_(mine[EVENTS[id].after]) };
  }).filter(function (e) { return e.afterNum; }) : [];
  return {
    events: events,
    lessons: path.main.concat(path.extra).map(function (l) {
      var p = mine[l.id], place = placeIn_(path, l), open = unlocked.indexOf(l.id) >= 0;
      var waiting = place.track === 'extra' && !open ? (PREREQS[l.id] || []).filter(function (id) { return !isComplete_(mine[id]); }) : [];
      return {
        id: l.id, unit: l.unit, order: l.order, title: l.title, minutes: l.minutes, tags: l.tags, summary: l.summary,
        hasChallenge: !!l.challenge, unlocked: open, track: place.track, num: place.num,
        requires: waiting.map(function (id) { return lessonById_(id).title; }),
        photo: !!PHOTO_LESSONS[l.id],
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
  if (unlockedFor_(user).indexOf(l.id) < 0) throw fail_(403, 'Finish the earlier lesson or class event to unlock this one!');
  var p = progressOf_(user.id)[l.id];
  if (user.role === 'student' && !p) {
    lock_();
    user = currentUser_();
    p = progressOf_(user.id)[l.id];
    if (!p) { p = { id: uid_('p_'), userId: user.id, lessonId: l.id, started: now_() }; saveProgress_(p, {}); }
  }
  var path = pathOf_(user), idx = path.main.indexOf(l), teacher = user.role === 'teacher';
  return {
    lesson: lessonForClient_(l, teacher || !!(p && p.quiz), teacher),
    progress: p ? merged_(p, workOf_(p)) : null,
    place: placeIn_(path, l),
    photo: PHOTO_LESSONS[l.id] && user.role === 'student' ? { prompt: PHOTO_LESSONS[l.id], photoId: (photoFor_(user, l.id) || {}).id || null, excused: !!(p && p.photoExcused) } : null,
    prev: idx > 0 ? path.main[idx - 1].id : null,
    next: idx >= 0 && idx < path.main.length - 1 ? path.main[idx + 1].id : null
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
  var unlocked = unlockedFor_(user), mine = progressOf_(user.id), path = pathOfClass_(klass);
  var stops = [];
  path.main.forEach(function (l, i) {
    stops.push({ id: l.id, unit: l.unit, num: i + 1, title: l.title, unlocked: teacher || unlocked.indexOf(l.id) >= 0, complete: isComplete_(mine[l.id]) });
    var ev = eventAfter_(l.id);
    if (ev) stops.push({ id: ev.id, event: true, icon: ev.icon, unit: l.unit, title: ev.title, unlocked: true, complete: eventState_(klass, ev.id).status === 'done' });
  });
  var entries = users_().filter(function (s) {
    return s.classId === klass.id && (teacher || showPeers || s.id === user.id);
  }).map(function (s) {
    var progress = progressOf_(s.id), at = -1, team = teamOf_(s);
    stops.forEach(function (stop, i) {
      if (at >= 0) return;
      if (stop.event ? !stop.complete : !isComplete_(progress[stop.id])) at = i;
    });
    var built = LESSONS.filter(function (l) { return isComplete_(progress[l.id]); }).map(function (l) { return l.id; });
    var entry = { name: teacher ? s.name : peerName_(s.name), team: team ? team.name : null, me: s.id === user.id, built: built, at: at < 0 ? stops.length : at, look: Object.assign({}, cleanLook_(team ? team.robot : s.robot), { name: '' }) };
    if (teacher) entry.extras = path.extra.filter(function (l) { return isComplete_(progress[l.id]); }).length; // students don't see how many extras others did
    return entry;
  }).sort(function (a, b) { return a.name.localeCompare(b.name); });
  var extra = function (l) { return { id: l.id, unit: l.unit, title: l.title, unlocked: unlocked.indexOf(l.id) >= 0, complete: isComplete_(mine[l.id]) }; };
  return {
    'class': { id: klass.id, name: klass.name, showPeers: showPeers },
    lessons: stops,
    extras: teacher ? [] : path.extra.map(extra),
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
function planChoice_(v) { v = String(v); return v === 'all' || PLANS[v] ? v : null; }
function createClass_(c) {
  var name = clean_(c.body.name);
  if (!name) throw fail_(400, 'Give the class a name (e.g. "Period 3").');
  var k = { id: uid_('c_'), teacherId: c.user.id, name: name, code: joinCode_(), created: now_(), unlockAll: false, unlocked: [], showPeers: true, plan: planChoice_(c.body.plan) || '15', kit: c.body.kit === '2' ? '2' : '1' };
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
  if ('plan' in b && planChoice_(b.plan)) k.plan = planChoice_(b.plan);
  if ('kit' in b) k.kit = b.kit === '2' ? '2' : '1';
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
  var k = ownClass_(c.user, c.params[0]), path = pathOfClass_(k);
  return {
    'class': Object.assign({}, k, { plan: planId_(k), kit: kitOf_(k) }),
    events: Object.keys(EVENTS).map(function (id) { return { id: id, title: EVENTS[id].title, icon: EVENTS[id].icon, status: eventState_(k, id).status }; }),
    lessons: path.main.concat(path.extra).map(function (l) { var pl = placeIn_(path, l); return { id: l.id, unit: l.unit, order: l.order, title: l.title, hasChallenge: !!l.challenge, track: pl.track, num: pl.num }; }),
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
    p.photoExcused = true;
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
  removeFromTeam_(s);
  s.classId = k.id;
  saveUser_(s);
  return { ok: true };
}
function removeStudent_(c) {
  var s = ownStudent_(c.user, c.params[0]);
  var rows = summaries_().filter(function (p) { return p.userId === s.id; }).map(function (p) { return p._row; });
  rows.sort(function (a, b) { return b - a; }).forEach(function (r) { tab_('Progress').deleteRow(r); }); // bottom up, so row numbers stay valid
  removeFromTeam_(s);
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

// ---------------------------------------------------------------- teams
var TEAM_WORDS = [['Turbo', 'Mighty', 'Rapid', 'Clever', 'Atomic', 'Golden', 'Silent', 'Rocket', 'Steel', 'Cosmic', 'Electric', 'Brave'], ['Gears', 'Bolts', 'Sprockets', 'Circuits', 'Pistons', 'Sensors', 'Comets', 'Falcons', 'Rovers', 'Wheels', 'Magnets', 'Motors']];
var TEAM_SIZE = 4;
function teams_() { return rows_('Teams'); }
function teamOf_(u) { return u && u.teamId ? teams_().filter(function (t) { return t.id === u.teamId; })[0] : null; }
function userById_(id) {
  if (!cache_.userIds) { cache_.userIds = {}; users_().forEach(function (u) { cache_.userIds[u.id] = u; }); }
  return cache_.userIds[id];
}
function saveTeam_(t) { put_('Teams', t, t.code); }
function pick_(list) { return list[Math.floor(Math.random() * list.length)]; }
// Names come from a word list, so nothing a student types appears on classmates' screens.
function teamName_() { return pick_(TEAM_WORDS[0]) + ' ' + pick_(TEAM_WORDS[1]); }
function teamCode_() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', code;
  do {
    code = '';
    for (var i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  } while (teams_().some(function (t) { return t.code === code; }) || classes_().some(function (k) { return k.code === code; }));
  return code;
}
function teamView_(t, teacher) {
  return {
    id: t.id, name: t.name, code: t.code,
    members: t.members.map(function (id) { var u = userById_(id); return { id: id, name: u ? (teacher ? u.name : peerName_(u.name)) : '?' }; })
  };
}
function checkpointLabel_(checkpoint) {
  if (checkpoint.indexOf('event_') === 0) return EVENTS[checkpoint.slice(6)].title;
  return lessonById_(checkpoint).title;
}
function getTeam_(c) {
  var team = teamOf_(c.user);
  var photos = rows_('Photos').filter(function (p) { return team ? p.teamId === team.id : p.by === c.user.id; }).map(function (p) { return { id: p.id, label: checkpointLabel_(p.checkpoint), at: p.at }; });
  return { team: team ? teamView_(team) : null, photos: photos, maxSize: TEAM_SIZE };
}
function createTeam_(c) {
  if (c.user.teamId) throw fail_(400, 'You are already on a team.');
  var t = { id: uid_('t_'), classId: c.user.classId, code: teamCode_(), name: teamName_(), members: [c.user.id], robot: c.user.robot || null, setup: c.user.setup || null, created: now_() };
  saveTeam_(t);
  c.user.teamId = t.id;
  saveUser_(c.user);
  return { team: teamView_(t) };
}
function joinTeam_(c) {
  if (c.user.teamId) throw fail_(400, 'Leave your current team first.');
  var code = clean_(c.body.code, 10).toUpperCase();
  var t = teams_().filter(function (x) { return x.code === code && x.classId === c.user.classId; })[0];
  if (!t) throw fail_(400, 'Team code not found. Check it with your partner.');
  if (t.members.length >= TEAM_SIZE) throw fail_(400, 'That team is full.');
  t.members.push(c.user.id);
  saveTeam_(t);
  c.user.teamId = t.id;
  saveUser_(c.user);
  return { team: teamView_(t) };
}
function removeFromTeam_(u) {
  var t = teamOf_(u);
  if (!t) return;
  t.members = t.members.filter(function (id) { return id !== u.id; });
  if (t.members.length) saveTeam_(t); else drop_('Teams', t);
  delete u.teamId;
  saveUser_(u);
}
function leaveTeam_(c) { removeFromTeam_(c.user); return { ok: true }; }
function renameTeam_(c) {
  var t = teamOf_(c.user);
  if (!t) throw fail_(400, 'Join a team first.');
  t.name = teamName_();
  saveTeam_(t);
  return { team: teamView_(t) };
}
function classTeams_(c) {
  var k = ownClass_(c.user, c.params[0]);
  return {
    teams: teams_().filter(function (t) { return t.classId === k.id; }).map(function (t) { return teamView_(t, true); }),
    solo: studentsIn_(k).filter(function (s) { return !s.teamId; }).map(function (s) { return s.name; })
  };
}
function teacherRemoveFromTeam_(c) {
  var s = ownStudent_(c.user, c.body.userId);
  removeFromTeam_(s);
  return { ok: true };
}

// ---------------------------------------------------------------- robot photos (kept private in the teacher's Drive)
function photoFolder_() {
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('PHOTO_FOLDER');
  if (id) return DriveApp.getFolderById(id);
  var folder = DriveApp.createFolder('RoboCode Academy Robot Photos');
  props.setProperty('PHOTO_FOLDER', folder.getId());
  return folder;
}
function photoIndex_() {
  if (cache_.photoIndex) return cache_.photoIndex;
  var index = {};
  rows_('Photos').forEach(function (p) {
    if (p.teamId) index['t|' + p.teamId + '|' + p.checkpoint] = p;
    p.members.forEach(function (m) { index['u|' + m + '|' + p.checkpoint] = p; });
  });
  return (cache_.photoIndex = index);
}
function photoFor_(u, checkpoint) {
  var index = photoIndex_();
  return (u && u.teamId && index['t|' + u.teamId + '|' + checkpoint]) || (u && index['u|' + u.id + '|' + checkpoint]) || null;
}
function hasPhoto_(u, checkpoint) { return !!photoFor_(u, checkpoint); }
function validCheckpoint_(cp) {
  if (PHOTO_LESSONS[cp]) return true;
  return cp.indexOf('event_') === 0 && !!EVENTS[cp.slice(6)];
}
function uploadPhoto_(c) {
  var checkpoint = clean_(c.body.checkpoint, 30);
  if (!validCheckpoint_(checkpoint)) throw fail_(400, 'This step does not need a photo.');
  var data = String(c.body.image || '').replace(/^data:image\/jpeg;base64,/, '');
  if (!data || data.length > 4000000) throw fail_(413, 'That photo is too large. Please try another.');
  var bytes = Utilities.base64Decode(data);
  if ((bytes[0] & 255) !== 255 || (bytes[1] & 255) !== 216) throw fail_(400, 'Please upload a photo.');
  // Saved to Drive before taking the lock, so one upload doesn't hold up the class.
  var file = photoFolder_().createFile(Utilities.newBlob(bytes, 'image/jpeg', checkpoint + '_' + c.user.id + '.jpg'));
  lock_();
  var user = currentUser_(), team = teamOf_(user), old = photoFor_(user, checkpoint);
  if (old) { trashPhotoFile_(old); drop_('Photos', old); delete cache_.photoIndex; }
  var photo = { id: uid_('f_'), classId: user.classId, checkpoint: checkpoint, teamId: team ? team.id : null, by: user.id, members: team ? team.members.slice() : [user.id], fileId: file.getId(), at: now_() };
  put_('Photos', photo, checkpoint);
  delete cache_.photoIndex;
  var p = progressOf_(user.id)[checkpoint], progress = null;
  if (p) { var work = workOf_(p); markCompleted_(p); saveProgress_(p, work); progress = merged_(p, work); }
  return { photo: { id: photo.id, at: photo.at }, progress: progress };
}
function trashPhotoFile_(p) { try { DriveApp.getFileById(p.fileId).setTrashed(true); } catch (e) { console.error(e); } }
function photoById_(id) { return rows_('Photos').filter(function (p) { return p.id === id; })[0]; }
function getPhoto_(c) {
  var p = photoById_(c.params[0]);
  if (!p) throw fail_(404, 'Photo not found.');
  var allowed = c.user.role === 'teacher' ? classes_().some(function (k) { return k.id === p.classId && k.teacherId === c.user.id; }) : p.members.indexOf(c.user.id) >= 0 || (p.teamId && c.user.teamId === p.teamId);
  if (!allowed) throw fail_(403, 'Not allowed.');
  return { image: 'data:image/jpeg;base64,' + Utilities.base64Encode(DriveApp.getFileById(p.fileId).getBlob().getBytes()) };
}
function deletePhoto_(c) {
  var p = photoById_(c.params[0]);
  if (!p) throw fail_(404, 'Photo not found.');
  ownClass_(c.user, p.classId);
  trashPhotoFile_(p);
  drop_('Photos', p);
  return { ok: true };
}
function classPhotos_(c) {
  var k = ownClass_(c.user, c.params[0]);
  return {
    photos: rows_('Photos').filter(function (p) { return p.classId === k.id; }).map(function (p) {
      var t = p.teamId ? teams_().filter(function (x) { return x.id === p.teamId; })[0] : null, by = userById_(p.by);
      return { id: p.id, label: checkpointLabel_(p.checkpoint), who: t ? t.name : (by ? by.name : 'Former student'), at: p.at };
    })
  };
}

// ---------------------------------------------------------------- class events
function eventEntrants_(k, eventId, teacher) {
  var checkpoint = 'event_' + eventId, waived = eventState_(k, eventId).waived, list = [];
  teams_().filter(function (t) { return t.classId === k.id; }).forEach(function (t) {
    var key = 't_' + t.id, view = teamView_(t, teacher);
    list.push({ key: key, name: t.name, members: view.members.map(function (m) { return m.name; }), checkedIn: !!photoIndex_()['t|' + t.id + '|' + checkpoint] || waived.indexOf(key) >= 0 });
  });
  studentsIn_(k).filter(function (s) { return !s.teamId; }).forEach(function (s) {
    var key = 'u_' + s.id, name = teacher ? s.name : peerName_(s.name);
    list.push({ key: key, name: name, members: [name], checkedIn: !!photoIndex_()['u|' + s.id + '|' + checkpoint] || waived.indexOf(key) >= 0 });
  });
  return list;
}
function bestTimes_(state) {
  var best = {};
  state.times.forEach(function (t) {
    var total = t.seconds + t.touches * 5;
    if (!best[t.key] || total < best[t.key].total) best[t.key] = { key: t.key, total: total, seconds: t.seconds, touches: t.touches };
  });
  return Object.keys(best).map(function (k) { return best[k]; }).sort(function (a, b) { return a.total - b.total; });
}
function eventView_(user, k, eventId) {
  if (!k || !EVENTS[eventId]) throw fail_(404, 'Event not found.');
  var state = eventState_(k, eventId), teacher = user.role === 'teacher', e = EVENTS[eventId];
  var myKey = teacher ? null : (user.teamId ? 't_' + user.teamId : 'u_' + user.id);
  var view = {
    event: { id: eventId, title: e.title, icon: e.icon, kind: e.kind, rules: e.rules, photo: e.photo, after: lessonById_(e.after).title, status: state.status },
    entrants: eventEntrants_(k, eventId, teacher), bracket: state.bracket, best: bestTimes_(state), myKey: myKey
  };
  if (teacher) view.times = state.times;
  if (!teacher) view.myPhotoId = (photoFor_(user, 'event_' + eventId) || {}).id || null;
  return view;
}
function teacherEvent_(c) {
  var k = ownClass_(c.user, c.params[0]), id = c.params[1];
  if (!EVENTS[id]) throw fail_(404, 'Event not found.');
  var state = eventState_(k, id);
  state.waived = state.waived || [];
  state.times = state.times || [];
  return { k: k, id: id, state: state };
}
function saveEvent_(e) {
  put_('Events', e.state, e.id);
  return eventView_(e.user, e.k, e.id);
}
function setEventStatus_(c) {
  var e = teacherEvent_(c), s = c.body.status;
  if (['upcoming', 'live', 'done'].indexOf(s) < 0) throw fail_(400, 'Unknown status.');
  e.state.status = s; e.user = c.user;
  return saveEvent_(e);
}
function waiveCheckIn_(c) {
  var e = teacherEvent_(c), key = clean_(c.body.key, 40);
  if (e.state.waived.indexOf(key) < 0) e.state.waived.push(key);
  e.user = c.user;
  return saveEvent_(e);
}
function propagateWinner_(rounds, r, m) {
  while (r + 1 < rounds.length) {
    var value = rounds[r][m].winner || null, nm = Math.floor(m / 2), next = rounds[r + 1][nm], side = m % 2 ? 'b' : 'a';
    if (next[side] === value) return;
    next[side] = value; next.winner = null;
    r += 1; m = nm;
  }
}
function buildBracket_(c) {
  var e = teacherEvent_(c), players = eventEntrants_(e.k, e.id, true).filter(function (x) { return x.checkedIn; }).map(function (x) { return x.key; });
  if (players.length < 2) throw fail_(400, 'At least 2 checked-in teams are needed.');
  for (var i = players.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), hold = players[i]; players[i] = players[j]; players[j] = hold; }
  var size = 2; while (size < players.length) size *= 2;
  var byes = size - players.length, slots = [];
  players.forEach(function (key, n) { slots.push(key); if (n < byes) slots.push(null); });
  var rounds = [[]];
  for (var s = 0; s < size; s += 2) rounds[0].push({ a: slots[s], b: slots[s + 1], winner: null });
  for (var n = size / 2; n > 1; n /= 2) { var round = []; for (var q = 0; q < n / 2; q++) round.push({ a: null, b: null, winner: null }); rounds.push(round); }
  rounds[0].forEach(function (match, m) { if (!match.b) { match.winner = match.a; propagateWinner_(rounds, 0, m); } });
  e.state.bracket = { rounds: rounds }; e.user = c.user;
  return saveEvent_(e);
}
function setMatchWinner_(c) {
  var e = teacherEvent_(c), rounds = e.state.bracket && e.state.bracket.rounds, r = Number(c.body.round), m = Number(c.body.match);
  var match = rounds && rounds[r] && rounds[r][m];
  if (!match) throw fail_(404, 'Match not found.');
  if (c.body.winner !== match.a && c.body.winner !== match.b) throw fail_(400, 'That team is not in this match.');
  match.winner = c.body.winner;
  propagateWinner_(rounds, r, m);
  e.user = c.user;
  return saveEvent_(e);
}
function addRaceTime_(c) {
  var e = teacherEvent_(c), key = clean_(c.body.key, 40), seconds = Number(c.body.seconds), touches = Math.max(0, Math.floor(Number(c.body.touches) || 0));
  if (!(seconds > 0)) throw fail_(400, 'Enter the time in seconds.');
  if (!eventEntrants_(e.k, e.id, true).some(function (x) { return x.key === key; })) throw fail_(400, 'Choose a team.');
  e.state.times.push({ id: uid_('r_'), key: key, seconds: seconds, touches: touches, at: now_() });
  e.user = c.user;
  return saveEvent_(e);
}
function removeRaceTime_(c) {
  var e = teacherEvent_(c);
  e.state.times = e.state.times.filter(function (t) { return t.id !== c.body.id; });
  e.user = c.user;
  return saveEvent_(e);
}

// ---------------------------------------------------------------- Google Classroom
function needClassroom_() {
  if (typeof Classroom === 'undefined') throw fail_(400, 'The Google Classroom API is not turned on for this script. See "Connect Google Classroom" in the setup guide.');
}
function classroomCourses_() {
  needClassroom_();
  var res = Classroom.Courses.list({ teacherId: 'me', courseStates: ['ACTIVE'], pageSize: 100 });
  return { courses: (res.courses || []).map(function (x) { return { id: x.id, name: x.name, section: x.section || '' }; }) };
}
function linkClassroom_(c) {
  needClassroom_();
  var k = ownClass_(c.user, c.params[0]), courseId = clean_(c.body.courseId, 40);
  var course = Classroom.Courses.get(courseId);
  if (k.courseId !== courseId) k.sync = {};
  k.courseId = courseId; k.courseName = course.name;
  saveClass_(k);
  return { courseName: course.name };
}
/** The teacher's grade if there is one. Otherwise a score from a completed lesson's exit ticket and code challenge. */
function gradeFor_(p, l) {
  if (p && p.grade !== undefined && p.grade !== null) return p.grade;
  if (!isComplete_(p) || p.quiz.excused || !p.quiz.total) return null;
  var quiz = Math.max(p.quiz.score, p.quizBest || 0) / p.quiz.total * 100;
  if (!l.challenge) return Math.round(quiz);
  var ch = p.challenge;
  var code = ch.excused ? quiz : ch.passed ? 100 : ch.total ? ch.passCount / ch.total * 100 : 0;
  return Math.round((quiz + code) / 2);
}
function pageOptions_(token) { return token ? { pageSize: 100, pageToken: token } : { pageSize: 100 }; }
function allPages_(fetch, field) {
  var out = [], token;
  do {
    var res = fetch(token);
    out = out.concat(res[field] || []);
    token = res.nextPageToken;
  } while (token);
  return out;
}
function syncClassroom_(c) {
  needClassroom_();
  var k = ownClass_(c.user, c.params[0]), courseId = k.courseId;
  if (!courseId) throw fail_(400, 'Choose a Google Classroom class first.');
  var due = String(c.body.dueDate || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!due) throw fail_(400, 'Choose a due date inside your PowerSchool grading period.');
  var started = Date.now(), state = k.sync || {}, report = { assignments: 0, sent: 0, unchanged: 0, notOnRoster: [], errors: [], partial: false };
  var students = studentsIn_(k), path = pathOfClass_(k);
  var roster = {};
  allPages_(function (token) { return Classroom.Courses.Students.list(courseId, pageOptions_(token)); }, 'students').forEach(function (s) {
    if (s.profile && s.profile.emailAddress) roster[s.profile.emailAddress.toLowerCase()] = s.userId;
  });
  students.forEach(function (s) { if (!roster[s.email]) report.notOnRoster.push(s.name); });
  path.main.some(function (l, i) {
    if (Date.now() - started > 270000) { report.partial = true; return true; } // Apps Script stops a run at 6 minutes
    var graded = students.filter(function (s) { return roster[s.email] && gradeFor_(progressOf_(s.id)[l.id], l) !== null; });
    if (!graded.length) return false;
    var entry = state[l.id] || { grades: {} };
    try {
      if (!entry.courseWorkId) {
        var work = Classroom.Courses.CourseWork.create({ title: 'RoboCode ' + (i + 1) + ': ' + l.title, workType: 'ASSIGNMENT', state: 'PUBLISHED', maxPoints: 100, dueDate: { year: +due[1], month: +due[2], day: +due[3] }, dueTime: { hours: 23, minutes: 59 } }, courseId);
        entry.courseWorkId = work.id;
        report.assignments++;
      }
      state[l.id] = entry;
      var submissions = {};
      allPages_(function (token) { return Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, entry.courseWorkId, pageOptions_(token)); }, 'studentSubmissions').forEach(function (sub) { submissions[sub.userId] = sub; });
      graded.forEach(function (s) {
        var grade = gradeFor_(progressOf_(s.id)[l.id], l);
        if (entry.grades[s.id] === grade) { report.unchanged++; return; }
        var sub = submissions[roster[s.email]];
        if (!sub) { report.errors.push(s.name + ' has no submission for ' + l.title); return; }
        try {
          Classroom.Courses.CourseWork.StudentSubmissions.patch({ draftGrade: grade, assignedGrade: grade }, courseId, entry.courseWorkId, sub.id, { updateMask: 'draftGrade,assignedGrade' });
          Classroom.Courses.CourseWork.StudentSubmissions['return']({}, courseId, entry.courseWorkId, sub.id); // only returned grades reach PowerSchool
          entry.grades[s.id] = grade;
          report.sent++;
        } catch (e) { report.errors.push(s.name + ', ' + l.title + ': ' + e.message); }
      });
    } catch (e) {
      report.errors.push(l.title + ': ' + e.message);
      if (/not found/i.test(e.message)) delete state[l.id]; // the assignment was deleted in Classroom; the next sync recreates it
    }
    return false;
  });
  lock_();
  var fresh = ownClass_(c.user, c.params[0]);
  fresh.sync = state; fresh.lastSync = now_();
  saveClass_(fresh);
  return report;
}
