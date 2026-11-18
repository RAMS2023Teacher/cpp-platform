// ---------------------------------------------------------------- grades and Circuit City Arena
// A class is grade 7 or grade 8; its students see that grade's lessons and arena challenges.
// Arena scores live in config.json: cfg.arena[class id][event id][email] = points (the teacher types them).

function gradeOfClass_(c) { return c && DATA.grades[String(c.grade)] ? Number(c.grade) : DATA.default_grade; }
function gradeOf_(rec, cfg) {
  var ids = rec ? studentClassIds_(rec, cfg) : [];
  return ids.length ? gradeOfClass_(cfg.classes[ids[ids.length - 1]]) : DATA.default_grade;
}
function cleanGrade_(g) { return DATA.grades[String(g)] ? Number(g) : DATA.default_grade; }
function courseFor_(grade) { return DATA.course.filter(function (c) { return !grade || c.grade === grade; }); }
function gradeList_() { return Object.keys(DATA.grades).sort().map(function (g) { return { grade: Number(g), name: DATA.grades[g] }; }); }

function setClassGrade(cid, grade) {
  var cfg = teacher_(), c = cfg.classes[cid];
  if (!c) throw new Error('No such class.');
  c.grade = cleanGrade_(grade);
  saveConfig_(cfg);
  return { grade: c.grade };
}

function arenaEvents_(grade) { return DATA.arena.events.filter(function (e) { return e.grade === grade; }); }

/** Ranks one event's scores: highest first, ties share a place. [{email, score, place, points}] */
function arenaRank_(scores) {
  var pts = DATA.arena.place_points, rows = Object.keys(scores || {}).map(function (email) { return { email: email, score: Number(scores[email]) }; })
    .filter(function (r) { return isFinite(r.score); }).sort(function (a, b) { return b.score - a.score; });
  rows.forEach(function (r, i) {
    r.place = i && rows[i - 1].score === r.score ? rows[i - 1].place : i + 1;
    r.points = pts[Math.min(r.place, pts.length) - 1];
  });
  return rows;
}

/** Everything about a class's arena: each event with its results, and the season standings. `me` marks one student's rows. */
function arenaData_(cfg, cid, me, teacher) {
  var c = cfg.classes[cid], grade = gradeOfClass_(c), saved = (cfg.arena || {})[cid] || {};
  var students = classStudents_(cfg, summary_(), cid), names = teacher ? {} : shownNames_(students, 'first'), by = {};
  students.forEach(function (s) { by[s.email] = s; if (teacher) names[s.email] = s.name; });
  var season = {};
  var events = arenaEvents_(grade).map(function (e) {
    var L = DATA.lessons[e.lesson_id];
    var results = arenaRank_(saved[e.id]).filter(function (r) { return by[r.email]; }).map(function (r) {
      var t = season[r.email] = season[r.email] || { points: 0, events: 0, wins: 0 };
      t.points += r.points; t.events++; if (r.place === 1) t.wins++;
      var row = { name: names[r.email], avatar: by[r.email].avatar || null, score: r.score, place: r.place, points: r.points, me: r.email === me };
      if (teacher) row.email = r.email;
      return row;
    });
    return { id: e.id, icon: e.icon, name: e.name, kind: e.kind, blurb: e.blurb, guide: e.guide, lesson_id: e.lesson_id,
             lesson: L ? L.number + '. ' + L.title : '', results: results };
  });
  var standings = Object.keys(season).map(function (email) {
    return { name: names[email], avatar: by[email].avatar || null, points: season[email].points, events: season[email].events, wins: season[email].wins, me: email === me };
  }).sort(function (a, b) { return b.points - a.points || b.wins - a.wins || a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });
  standings.forEach(function (r, i) { r.place = i && standings[i - 1].points === r.points ? standings[i - 1].place : i + 1; });
  var out = { grade: grade, grade_name: DATA.grades[String(grade)], events: events, standings: standings, place_points: DATA.arena.place_points, chassis: DATA.chassis };
  if (teacher) out.students = students.map(function (s) { return { email: s.email, name: s.name }; });
  return out;
}

/** Teacher: save one event's scores for a class. scores: {email: points, ...}; a blank removes that student's score. */
function arenaSave(cid, eventId, scores) {
  var cfg = teacher_(), c = cfg.classes[cid];
  if (!c) throw new Error('No such class.');
  if (!arenaEvents_(gradeOfClass_(c)).some(function (e) { return e.id === eventId; })) throw new Error('No such arena challenge for this class.');
  var ok = {};
  classStudents_(cfg, summary_(), cid).forEach(function (s) { ok[s.email] = 1; });
  cfg.arena = cfg.arena || {};
  cfg.arena[cid] = cfg.arena[cid] || {};
  var ev = cfg.arena[cid][eventId] = cfg.arena[cid][eventId] || {};
  Object.keys(scores || {}).forEach(function (email) {
    if (!ok[email]) return;
    var v = scores[email];
    if (v === '' || v === null || v === undefined || !isFinite(Number(v))) delete ev[email];
    else ev[email] = Math.max(-9999, Math.min(9999, Math.round(Number(v) * 10) / 10));
  });
  saveConfig_(cfg);
  return arenaData_(cfg, cid, null, true);
}

/** For badges: how many arena events a student has a score in, and their best place. */
function arenaRecord_(rec, cfg) {
  var out = { events: 0, best: 0 };
  studentClassIds_(rec, cfg).forEach(function (cid) {
    var saved = (cfg.arena || {})[cid] || {};
    Object.keys(saved).forEach(function (eid) {
      var mine = arenaRank_(saved[eid]).filter(function (r) { return r.email === rec.email; })[0];
      if (!mine) return;
      out.events++;
      if (!out.best || mine.place < out.best) out.best = mine.place;
    });
  });
  return out;
}

/** The student's Arena page: their class's challenges, results and standings. */
function arenaPage_(rec, cfg) {
  var ids = studentClassIds_(rec, cfg);
  return arenaData_(cfg, ids[ids.length - 1], rec.email, false);
}

/** The class display's arena card: season top 5 and the newest event with scores. Names follow the display's setting. */
function arenaScreen_(cfg, cid) {
  var a = arenaData_(cfg, cid, null, false), scored = a.events.filter(function (e) { return e.results.length; });
  if (!scored.length) return null;
  var last = scored[scored.length - 1];
  return { standings: a.standings.slice(0, 5).map(function (r) { return { name: r.name, avatar: r.avatar, points: r.points, place: r.place }; }),
           event: { icon: last.icon, name: last.name, top: last.results.slice(0, 3).map(function (r) { return { name: r.name, score: r.score, place: r.place }; }) } };
}
