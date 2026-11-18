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

// ---------------------------------------------------------------- teams
// Students make a team for the arena: a name, a mascot, a logo (shape + color) and a motto. Teams live in
// config.json: cfg.teams[class id][team id] = {id, name, mascot, shape, color, motto, members: [emails]}.
// A team is scored as one entrant ("t" + team id); a student with no team is scored alone (their email).

function teamsOf_(cfg, cid) { return (cfg.teams || {})[cid] || {}; }
function teamMax_(c) { return Math.max(2, Math.min(6, Number(c && c.team_max) || DATA.teams.max)); }
function teamOfStudent_(cfg, cid, email) {
  var all = teamsOf_(cfg, cid), ids = Object.keys(all);
  for (var i = 0; i < ids.length; i++) if (all[ids[i]].members.indexOf(email) >= 0) return all[ids[i]];
  return null;
}
function pickOption_(list, id) { return list.some(function (o) { return o[0] === id; }) ? id : list[0][0]; }
function teamLook_(d, old) {
  d = d || {}; old = old || {};
  return { mascot: pickOption_(DATA.teams.mascots, d.mascot || old.mascot), shape: pickOption_(DATA.teams.shapes, d.shape || old.shape),
           color: pickOption_(DATA.teams.colors, d.color || old.color),
           motto: String(d.motto === undefined ? (old.motto || '') : d.motto).replace(/\s+/g, ' ').trim().slice(0, 60) };
}
function teamName_(cfg, cid, name, exceptId) {
  name = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 24);
  if (name.length < 2) throw new Error('Give your team a name (2 letters or more).');
  var all = teamsOf_(cfg, cid);
  if (Object.keys(all).some(function (k) { return k !== exceptId && all[k].name.toLowerCase() === name.toLowerCase(); })) throw new Error('Another team already has that name.');
  return name;
}
/** Adds what the logo needs: the mascot's emoji and the color's hex code. */
function teamArt_(v) {
  v.emoji = (DATA.teams.mascots.filter(function (m) { return m[0] === v.mascot; })[0] || DATA.teams.mascots[0])[1];
  v.hex = (DATA.teams.colors.filter(function (m) { return m[0] === v.color; })[0] || DATA.teams.colors[0])[1];
  return v;
}
/** A team as the browser gets it: no emails unless the teacher asks. */
function teamView_(t, names, me, teacher) {
  var v = { id: t.id, name: t.name, mascot: t.mascot, shape: t.shape, color: t.color, motto: t.motto || '',
            members: t.members.filter(function (e) { return names[e]; }).map(function (e) { return teacher ? { email: e, name: names[e] } : { name: names[e], me: e === me }; }) };
  v.mine = !!me && t.members.indexOf(me) >= 0;
  teamArt_(v);
  return v;
}
function studentClass_(ctx) {
  var ids = studentClassIds_(ctx.rec, ctx.cfg);
  if (!ids.length) throw new Error('Join your class first.');
  return ids[ids.length - 1];
}
function teamStudent_(fn) {
  summary_();                    // the class list, read before the lock so nobody waits on it
  return withLock_(function () {
    var ctx = student_(), cid = studentClass_(ctx), c = ctx.cfg.classes[cid];
    noPreview_(ctx.me, 'Teams are');
    if (c.teams_locked) throw new Error('Your teacher has locked the teams.');
    ctx.cfg.teams = ctx.cfg.teams || {};
    ctx.cfg.teams[cid] = ctx.cfg.teams[cid] || {};
    fn(ctx, cid, c, ctx.cfg.teams[cid]);
    saveConfig_(ctx.cfg);
    var rewards = syncRewards_(ctx.rec, ctx.cfg);
    if (rewards.xp_gained) saveStudent_(ctx.rec);
    return { arena: arenaData_(ctx.cfg, cid, ctx.rec.email, false), rewards: rewards };
  });
}

/** Student: start a team, or change the look of the team they are on. d: {name, mascot, shape, color, motto} */
function teamSave(d) {
  return teamStudent_(function (ctx, cid, c, all) {
    var mine = teamOfStudent_(ctx.cfg, cid, ctx.rec.email), look = teamLook_(d, mine);
    if (mine) { mine.name = teamName_(ctx.cfg, cid, d && d.name !== undefined ? d.name : mine.name, mine.id); Object.keys(look).forEach(function (k) { mine[k] = look[k]; }); return; }
    var id = String(nextId_(ctx.cfg));
    all[id] = { id: id, name: teamName_(ctx.cfg, cid, d && d.name, null), members: [ctx.rec.email], created_at: now_() };
    Object.keys(look).forEach(function (k) { all[id][k] = look[k]; });
  });
}
function teamJoin(teamId) {
  return teamStudent_(function (ctx, cid, c, all) {
    var t = all[String(teamId)];
    if (!t) throw new Error('That team is gone. Pick another.');
    if (teamOfStudent_(ctx.cfg, cid, ctx.rec.email)) throw new Error('Leave your team first.');
    if (t.members.length >= teamMax_(c)) throw new Error('That team is full.');
    t.members.push(ctx.rec.email);
  });
}
function teamLeave() {
  return teamStudent_(function (ctx, cid, c, all) {
    var t = teamOfStudent_(ctx.cfg, cid, ctx.rec.email);
    if (!t) return;
    t.members = t.members.filter(function (e) { return e !== ctx.rec.email; });
    if (!t.members.length) { delete all[t.id]; arenaDropEntrant_(ctx.cfg, cid, 't' + t.id); }
  });
}

/** Teacher: manage a class's teams. action: settings {max, locked} · rename {team, name} · look {team, mascot, shape, color, motto}
 *  · move {email, team} (team '' = no team) · delete {team} */
function teamAdmin(cid, action, d) {
  teacher_();
  summary_();                    // read before the lock
  return withLock_(function () {
    var cfg = teacher_(), c = cfg.classes[cid];
    if (!c) throw new Error('No such class.');
    d = d || {};
    cfg.teams = cfg.teams || {};
    var all = cfg.teams[cid] = cfg.teams[cid] || {}, t = all[String(d.team)];
    if (action === 'settings') { c.team_max = Math.max(2, Math.min(6, Math.round(Number(d.max)) || DATA.teams.max)); c.teams_locked = !!d.locked; }
    else if (action === 'move') {
      var email = String(d.email || '');
      if (!classStudents_(cfg, summary_(), cid).some(function (s) { return s.email === email; })) throw new Error('That student is not in this class.');
      Object.keys(all).forEach(function (k) {
        all[k].members = all[k].members.filter(function (e) { return e !== email; });
        if (!all[k].members.length && all[k] !== t) { delete all[k]; arenaDropEntrant_(cfg, cid, 't' + k); }
      });
      if (d.team) { if (!t) throw new Error('No such team.'); t.members.push(email); }
    } else if (!t) throw new Error('No such team.');
    else if (action === 'rename') t.name = teamName_(cfg, cid, d.name, t.id);
    else if (action === 'look') { var look = teamLook_(d, t); Object.keys(look).forEach(function (k) { t[k] = look[k]; }); }
    else if (action === 'delete') { delete all[t.id]; arenaDropEntrant_(cfg, cid, 't' + t.id); }
    else throw new Error('Unknown action.');
    saveConfig_(cfg);
    return arenaData_(cfg, cid, null, true);
  });
}
function arenaDropEntrant_(cfg, cid, key) {
  var saved = (cfg.arena || {})[cid] || {};
  Object.keys(saved).forEach(function (eid) { delete saved[eid][key]; });
}

/** Who competes in a class: every team, then every student who is not on a team. {key: {key, name, team, avatar, emails}} */
function arenaEntrants_(cfg, cid, students, names, me, teacher) {
  var out = {}, taken = {}, all = teamsOf_(cfg, cid), by = {};
  students.forEach(function (s) { by[s.email] = s; });
  Object.keys(all).sort(function (a, b) { return Number(a) - Number(b); }).forEach(function (k) {
    var t = all[k], v = teamView_(t, names, me, teacher);
    if (!v.members.length) return;
    t.members.forEach(function (e) { taken[e] = 1; });
    out['t' + k] = { key: 't' + k, name: t.name, team: v, avatar: null, emails: t.members, me: v.mine };
  });
  students.forEach(function (s) {
    if (!taken[s.email]) out[s.email] = { key: s.email, name: names[s.email], team: null, avatar: s.avatar || null, emails: [s.email], me: s.email === me };
  });
  return out;
}

/** Everything about a class's arena: teams, each event with its results, and the season standings. `me` marks one student's rows. */
function arenaData_(cfg, cid, me, teacher) {
  var c = cfg.classes[cid], grade = gradeOfClass_(c), saved = (cfg.arena || {})[cid] || {};
  var students = classStudents_(cfg, summary_(), cid), names = teacher ? {} : shownNames_(students, 'first');
  if (teacher) students.forEach(function (s) { names[s.email] = s.name; });
  var ent = arenaEntrants_(cfg, cid, students, names, me, teacher), season = {};
  var row = function (e, extra) {
    var r = { name: e.name, team: e.team, avatar: e.avatar, me: !!e.me };
    if (teacher) r.key = e.key;
    Object.keys(extra).forEach(function (k) { r[k] = extra[k]; });
    return r;
  };
  var events = arenaEvents_(grade).map(function (e) {
    var L = DATA.lessons[e.lesson_id], mine = {};
    Object.keys(saved[e.id] || {}).forEach(function (k) { if (ent[k]) mine[k] = saved[e.id][k]; });
    var results = arenaRank_(mine).map(function (r) {
      var t = season[r.email] = season[r.email] || { points: 0, events: 0, wins: 0 };
      t.points += r.points; t.events++; if (r.place === 1) t.wins++;
      return row(ent[r.email], { score: r.score, place: r.place, points: r.points });
    });
    return { id: e.id, icon: e.icon, name: e.name, kind: e.kind, blurb: e.blurb, guide: e.guide, lesson_id: e.lesson_id,
             lesson: L ? L.number + '. ' + L.title : '', results: results };
  });
  var standings = Object.keys(season).map(function (k) { return row(ent[k], { points: season[k].points, events: season[k].events, wins: season[k].wins }); })
    .sort(function (a, b) { return b.points - a.points || b.wins - a.wins || a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });
  standings.forEach(function (r, i) { r.place = i && standings[i - 1].points === r.points ? standings[i - 1].place : i + 1; });
  var keys = Object.keys(ent), teams = keys.filter(function (k) { return ent[k].team; }).map(function (k) { return ent[k].team; });
  var out = { grade: grade, grade_name: DATA.grades[String(grade)], events: events, standings: standings, place_points: DATA.arena.place_points,
              chassis: DATA.chassis, teams: teams, team_max: teamMax_(c), teams_locked: !!c.teams_locked, options: DATA.teams,
              my_team: teams.filter(function (t) { return t.mine; })[0] || null };
  if (teacher) {
    out.entrants = keys.map(function (k) { return { key: k, name: ent[k].name, team: ent[k].team }; });
    out.students = students.map(function (s) { return { email: s.email, name: s.name }; });
  }
  return out;
}

/** Teacher: save one event's scores for a class. scores: {entrant key: points, ...}; a blank removes that score. */
function arenaSave(cid, eventId, scores) {
  teacher_();
  summary_();                    // read before the lock
  return withLock_(function () { return arenaSaveLocked_(cid, eventId, scores); });
}
function arenaSaveLocked_(cid, eventId, scores) {
  var cfg = teacher_(), c = cfg.classes[cid];
  if (!c) throw new Error('No such class.');
  if (!arenaEvents_(gradeOfClass_(c)).some(function (e) { return e.id === eventId; })) throw new Error('No such arena challenge for this class.');
  var students = classStudents_(cfg, summary_(), cid), names = {};
  students.forEach(function (st) { names[st.email] = st.name; });
  var ok = arenaEntrants_(cfg, cid, students, names, null, true);
  cfg.arena = cfg.arena || {};
  cfg.arena[cid] = cfg.arena[cid] || {};
  var ev = cfg.arena[cid][eventId] = cfg.arena[cid][eventId] || {};
  Object.keys(scores || {}).forEach(function (key) {
    if (!ok[key]) return;
    var v = scores[key];
    if (v === '' || v === null || v === undefined || !isFinite(Number(v))) delete ev[key];
    else ev[key] = Math.max(-9999, Math.min(9999, Math.round(Number(v) * 10) / 10));
  });
  saveConfig_(cfg);
  return arenaData_(cfg, cid, null, true);
}

/** For badges: how many arena events a student (or their team) has a score in, their best place, and if they are on a team. */
function arenaRecord_(rec, cfg) {
  var out = { events: 0, best: 0, team: 0 };
  studentClassIds_(rec, cfg).forEach(function (cid) {
    var saved = (cfg.arena || {})[cid] || {}, t = teamOfStudent_(cfg, cid, rec.email), key = t ? 't' + t.id : rec.email;
    if (t) out.team = 1;
    var valid = {};
    Object.keys(teamsOf_(cfg, cid)).forEach(function (k) { valid['t' + k] = 1; });
    Object.keys(saved).forEach(function (eid) {
      var scores = {};
      Object.keys(saved[eid]).forEach(function (k) { if (valid[k] || k.indexOf('@') > 0) scores[k] = saved[eid][k]; });
      var mine = arenaRank_(scores).filter(function (r) { return r.email === key; })[0];
      if (!mine) return;
      out.events++;
      if (!out.best || mine.place < out.best) out.best = mine.place;
    });
  });
  return out;
}

/** The student's Arena page: their class's teams, challenges, results and standings. */
function arenaPage_(rec, cfg) {
  var ids = studentClassIds_(rec, cfg);
  return arenaData_(cfg, ids[ids.length - 1], rec.email, false);
}

/** The class display's arena card: season top 5 and the newest event with scores. */
function arenaScreen_(cfg, cid) {
  var a = arenaData_(cfg, cid, null, false), scored = a.events.filter(function (e) { return e.results.length; });
  if (!scored.length) return null;
  var last = scored[scored.length - 1];
  return { standings: a.standings.slice(0, 5).map(function (r) { return { name: r.name, team: r.team, avatar: r.avatar, points: r.points, place: r.place }; }),
           event: { icon: last.icon, name: last.name, top: last.results.slice(0, 3).map(function (r) { return { name: r.name, score: r.score, place: r.place }; }) } };
}
