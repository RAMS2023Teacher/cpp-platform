/* Draws every page except the lesson page (lesson.js) from the data the server sends (ML.data).
 * Student-typed text is always escaped (E) or set with textContent. */
(function () {
  'use strict';
  var ML = window.ML, d = ML.data || {}, E = ML.esc, main = document.getElementById('main');
  var A = ML.avatarAttr;
  var due = function (s) {
    if (!s) return '';
    var dt = new Date(s + 'T12:00:00');
    return dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  };
  var shortDate = function (iso) { return iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''; };
  var flash = function (msg, cat) {
    var box = document.createElement('div');
    box.className = 'flashes';
    box.innerHTML = '<div class="flash ' + (cat || 'info') + '"></div>';
    box.firstChild.textContent = msg;
    main.insertBefore(box, main.firstChild);
    window.scrollTo(0, 0);
  };
  // Run a teacher or student action, then reload the page (or show the error)
  var act = function (btn, name, args, then) {
    if (btn) btn.disabled = true;
    return ML.run.apply(null, [name].concat(args)).then(function (r) {
      if (then) then(r); else ML.reload();
    }).catch(function (e) { if (btn) btn.disabled = false; flash((e && e.message) || 'Something went wrong.', 'error'); });
  };
  var levelLine = function (lv) {
    return lv.xp + ' XP' + (lv.max ? '' : ' · ' + (lv.next - lv.xp) + ' to level ' + (lv.level + 1));
  };
  var stageLabel = function (cell) {
    if (cell.status === 'complete') return '✓ done';
    if (cell.stage === 'build') return 'Build ' + cell.steps_done + '/' + cell.steps_total;
    return { mission: 'Mission', quiz: 'Quiz', ship: 'Ship it' }[cell.stage] || '';
  };
  var meter = function (pct) { return '<span class="meter" title="' + pct + '% done"><i style="width:' + pct + '%"></i></span>'; };

  var byGrade = function (list, draw) {      // teacher lists: one heading per grade
    var out = [];
    (d.grades || []).forEach(function (g) {
      var mine = list.filter(function (l) { return l.grade === g.grade; });
      if (mine.length) out.push('<h2 class="grade-head">' + E(g.name) + '</h2>' + draw(mine));
    });
    return out.join('');
  };
  var place = function (n) { return n === 1 ? '🥇' : n === 2 ? '🥈' : n === 3 ? '🥉' : n + '.'; };
  var crest = function (t, size) { return window.TeamCrest.svg(t, size); };
  var face = function (r, size) { return r.team ? crest(r.team, size) : '<span data-avatar="' + A(r.avatar || {}) + '" data-size="' + size + '"></span>'; };
  var who = function (r) {
    return '<span class="grow">' + E(r.name) + (r.team ? '<small class="muted team-names">' + r.team.members.map(function (m) { return E(m.name); }).join(', ') + '</small>' : '') + '</span>';
  };
  // The logo maker: name, mascot, shape, color and motto, with a live preview. teamForm returns the HTML; wireTeamForm runs it.
  var teamForm = function (o, t, verb) {
    t = t || { name: '', mascot: o.mascots[0][0], shape: o.shapes[0][0], color: o.colors[0][0], motto: '' };
    var pick = function (kind, list, label) {
      return '<div class="team-pick" data-kind="' + kind + '" role="radiogroup" aria-label="' + kind + '">' + list.map(function (x) {
        return '<button type="button" role="radio" aria-checked="' + (x[0] === t[kind]) + '" class="' + (x[0] === t[kind] ? 'on' : '') + '" data-v="' + E(x[0]) + '" title="' + E(label(x)) + '"' +
          (kind === 'color' ? ' style="background:' + E(x[1]) + '"' : '') + '>' + (kind === 'mascot' ? E(x[1]) : kind === 'shape' ? crest({ shape: x[0], hex: '#69707d', emoji: ' ' }, 30) : '') + '</button>';
      }).join('') + '</div>';
    };
    return '<div class="team-form"><div class="team-preview" id="tf-preview"></div><div class="grow">' +
      '<label class="field"><span>Team name</span><input id="tf-name" maxlength="24" value="' + E(t.name) + '" placeholder="e.g. The Gear Grinders"></label>' +
      '<div class="field"><span>Mascot</span>' + pick('mascot', o.mascots, function (x) { return x[2]; }) + '</div>' +
      '<div class="row"><div class="field"><span>Logo shape</span>' + pick('shape', o.shapes, function (x) { return x[1]; }) + '</div>' +
      '<div class="field"><span>Color</span>' + pick('color', o.colors, function (x) { return x[0]; }) + '</div></div>' +
      '<label class="field"><span>Motto (optional)</span><input id="tf-motto" maxlength="60" value="' + E(t.motto || '') + '" placeholder="e.g. Built to push"></label>' +
      '<button type="button" class="btn go" id="tf-go">' + verb + '</button> <span class="bad small" id="tf-msg" role="status"></span></div></div>';
  };
  var wireTeamForm = function (o, save) {
    var $ = function (id) { return document.getElementById(id); };
    var val = function (kind) { var b = document.querySelector('.team-pick[data-kind=' + kind + '] .on'); return b ? b.dataset.v : ''; };
    var read = function () { return { name: $('tf-name').value, mascot: val('mascot'), shape: val('shape'), color: val('color'), motto: $('tf-motto').value }; };
    var preview = function () {
      var t = read();
      t.emoji = (o.mascots.filter(function (m) { return m[0] === t.mascot; })[0] || o.mascots[0])[1];
      t.hex = (o.colors.filter(function (m) { return m[0] === t.color; })[0] || o.colors[0])[1];
      $('tf-preview').innerHTML = crest(t, 120) + '<b></b>';
      $('tf-preview').lastChild.textContent = t.name || 'Your team';
    };
    document.querySelectorAll('.team-pick button').forEach(function (b) {
      b.addEventListener('click', function () {
        b.parentNode.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); x.setAttribute('aria-checked', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-checked', 'true'); preview();
      });
    });
    $('tf-name').addEventListener('input', preview);
    $('tf-go').addEventListener('click', function () { save(read(), this, $('tf-msg')); });
    preview();
  };
  var standingsTable = function (rows, empty) {
    if (!rows.length) return '<p class="muted">' + empty + '</p>';
    return '<ol class="arena-board plain">' + rows.map(function (r) {
      return '<li' + (r.me ? ' class="me"' : '') + '><span class="place">' + place(r.place) + '</span>' + face(r, 34) + who(r) + '<small class="muted">' + r.events + ' challenge' + (r.events === 1 ? '' : 's') + '</small><b>' + r.points + ' pts</b></li>';
    }).join('') + '</ol>';
  };
  var guideTable = function (ev) {
    return '<table class="arena-guide"><tbody>' + ev.guide.map(function (g) { return '<tr><td>' + E(g[0]) + '</td><td><b>' + (g[1] > 0 ? '+' : '') + g[1] + '</b></td></tr>'; }).join('') + '</tbody></table>';
  };

  var pages = {};

  pages.arena = function () {
    var a = d.arena, editing = false;
    var after = function (btn, msg) {
      return function (p) {
        btn.disabled = true;
        p.then(function (r) { a = r.arena; editing = false; draw(); if (window.showRewards && r.rewards) window.showRewards(r.rewards); })
          .catch(function (e) { btn.disabled = false; (msg || document.getElementById('team-msg')).textContent = (e && e.message) || 'Something went wrong.'; });
      };
    };
    var teamCard = function () {
      var t = a.my_team, h = ['<section class="card team-card"><h2>🚩 My team</h2>'];
      if (a.teams_locked && !t) return h.join('') + '<p class="muted">Teams are locked. Ask your teacher to put you on a team.</p></section>';
      if (t && !editing) {
        h.push('<div class="team-show">' + crest(t, 120) + '<div class="grow"><h3 class="team-name">' + E(t.name) + '</h3>' + (t.motto ? '<p class="team-motto">“' + E(t.motto) + '”</p>' : '') +
          '<p><b>Teammates:</b> ' + t.members.map(function (m) { return E(m.name) + (m.me ? ' (you)' : ''); }).join(', ') + '</p>' +
          (a.teams_locked ? '<p class="muted small">Teams are locked by your teacher.</p>'
            : '<p class="row"><button type="button" class="btn small" id="team-edit">Change name or logo</button> <button type="button" class="btn small ghost" id="team-leave">Leave team</button></p>') +
          '<p class="muted small">Your team scores together in every arena challenge. Up to ' + a.team_max + ' on a team.</p><span class="bad small" id="team-msg" role="status"></span></div></div>');
      } else if (t) {
        h.push(teamForm(a.options, t, 'Save') + '<p><button type="button" class="linklike small" id="team-cancel">Cancel</button></p>');
      } else {
        h.push('<p>Make a team for the arena, or join one. A team has a name, a mascot and a logo, and scores together. Up to ' + a.team_max + ' on a team.</p>');
        if (a.teams.length) h.push('<h3>Join a team</h3><ul class="plain team-list">' + a.teams.map(function (x) {
          var full = x.members.length >= a.team_max;
          return '<li>' + crest(x, 44) + '<span class="grow"><b>' + E(x.name) + '</b><small class="muted team-names">' + x.members.map(function (m) { return E(m.name); }).join(', ') + '</small></span>' +
            (full ? '<small class="muted">full</small>' : '<button type="button" class="btn small team-join" data-id="' + E(x.id) + '">Join</button>') + '</li>';
        }).join('') + '</ul>');
        h.push('<h3>' + (a.teams.length ? 'Or start a new team' : 'Start a team') + '</h3>' + teamForm(a.options, null, 'Start my team') + '<span class="bad small" id="team-msg" role="status"></span>');
      }
      return h.join('') + '</section>';
    };
    var draw = function () {
      var h = ['<div class="banner red arena-banner"><div class="banner-icon">🏟️</div><div class="grow"><small>' + E(a.grade_name) + '</small><h1>Circuit City Arena</h1>' +
        '<p>Pick a chassis, tune it, and score points for your team in every challenge.</p></div></div>'];
      h.push(teamCard());
      h.push('<div class="grid-2"><section class="card"><h2>🏆 Season standings</h2>' + standingsTable(a.standings, 'No scores yet. The first challenge is coming up!') +
        '<p class="muted small">Season points for each challenge: ' + a.place_points.map(function (p, i) { return (i === a.place_points.length - 1 ? 'everyone else ' : place(i + 1) + ' ') + p; }).join(' · ') + '</p></section>' +
        '<section class="card"><h2>🤖 The chassis</h2><ul class="plain chassis-list">' + a.chassis.map(function (c) { return '<li><b>' + E(c.name) + '</b><br><span class="muted">' + E(c.blurb) + '</span></li>'; }).join('') +
        '</ul><p class="muted small">You can swap the wheels, move the Brain and add parts from the bins.</p></section></div>');
      h.push('<h2 class="grade-head">The challenges</h2><div class="arena-events">');
      a.events.forEach(function (ev) {
        var mine = ev.results.filter(function (r) { return r.me; })[0];
        h.push('<section class="card arena-event"><h3>' + E(ev.icon) + ' ' + E(ev.name) + ' <span class="tag">' + (ev.kind === 'code' ? 'coded' : 'driver') + '</span></h3><p>' + E(ev.blurb) +
          (ev.lesson ? ' <a class="small" href="/lessons/' + E(ev.lesson_id) + '">Lesson ' + E(ev.lesson) + ' →</a>' : '') + '</p>' +
          '<details><summary>How to score</summary>' + guideTable(ev) + '</details>' +
          (ev.results.length ? '<ol class="arena-board plain">' + ev.results.slice(0, 5).map(function (r) {
            return '<li' + (r.me ? ' class="me"' : '') + '><span class="place">' + place(r.place) + '</span>' + (r.team ? crest(r.team, 26) : '') + '<span class="grow">' + E(r.name) + '</span><b>' + r.score + '</b></li>';
          }).join('') + '</ol>' + (mine && mine.place > 5 ? '<p class="small">You: place ' + mine.place + ' with <b>' + mine.score + '</b></p>' : '')
            : '<p class="muted small">Not scored yet.</p>') + '</section>');
      });
      main.innerHTML = h.join('') + '</div>';
      window.RobotAvatar.renderAll(main);
      var $ = function (id) { return document.getElementById(id); };
      if ($('tf-go')) wireTeamForm(a.options, function (t, btn, msg) { after(btn, msg)(ML.run('teamSave', t)); });
      if ($('team-edit')) $('team-edit').addEventListener('click', function () { editing = true; draw(); });
      if ($('team-cancel')) $('team-cancel').addEventListener('click', function () { editing = false; draw(); });
      if ($('team-leave')) $('team-leave').addEventListener('click', function () { if (confirm('Leave ' + a.my_team.name + '?')) after(this)(ML.run('teamLeave')); });
      document.querySelectorAll('.team-join').forEach(function (b) { b.addEventListener('click', function () { after(b)(ML.run('teamJoin', b.dataset.id)); }); });
    };
    draw();
  };

  pages.error = function () {
    main.innerHTML = '<div class="card center"><h1>Hmm</h1><p></p><a class="btn" href="/">Go home</a></div>';
    main.querySelector('p').textContent = d.message;
    if (d.retry) setTimeout(ML.reload, 4000 + Math.random() * 4000);      // busy: try again by itself, spread out
  };

  pages.join = function () {
    main.innerHTML = '<div class="auth-card card"><h1>Join your class</h1>' +
      '<p class="muted">Your teacher will give you a 6-letter class code. You only do this once.</p>' +
      '<label class="field"><span>Class code</span><input id="j-code" maxlength="10" style="text-transform:uppercase;letter-spacing:.2em" autocomplete="off"></label>' +
      '<label class="field"><span>Your name (first name + last initial)</span><input id="j-name" maxlength="40" placeholder="Sam K." value="' + E(d.name) + '"></label>' +
      '<button class="btn wide" id="j-go" type="button">Join</button><p class="bad" id="j-msg" role="status"></p></div>';
    document.getElementById('j-go').addEventListener('click', function () {
      var b = this;
      b.disabled = true;
      ML.run('joinClass', document.getElementById('j-code').value, document.getElementById('j-name').value)
        .then(function () { ML.go('/'); })
        .catch(function (e) { b.disabled = false; document.getElementById('j-msg').textContent = e.message; });
    });
  };

  pages.dashboard = function () {
    var lv = d.level, h = [], nu = d.next_up, earned = d.badges.filter(function (b) { return b.earned; }).length;
    h.push('<section class="card player-card"><a class="avatar-tile" href="/me" title="Customize your robot"><span data-avatar="' + A(d.avatar) + '" data-size="96"></span></a>' +
      '<div style="flex:1"><h1>Hi ' + E(d.name) + '!</h1>' + (d.avatar && d.avatar.name ? '<p class="muted">…and your robot <b>' + E(d.avatar.name) + '</b></p>' : '') +
      '<div class="level-row"><span class="level-badge">' + lv.level + '</span><div class="grow"><div class="level-title"><span>' + E(lv.title) + '</span>' +
      '<span>' + (lv.max ? 'max level!' : 'next: ' + lv.next) + '</span></div><div class="xpbar"><i style="width:' + lv.pct + '%"></i><b>⭐ ' + lv.xp + ' XP</b></div></div></div></div></section>');
    if (nu) h.push('<a class="banner mission-banner ' + E(nu.lesson.color) + '" href="/lessons/' + E(nu.lesson.id) + '"><div class="banner-icon">' + E(nu.lesson.icon) + '</div>' +
      '<div class="grow"><small>' + (nu.verb === 'Keep going' ? 'Keep going' : 'Next mission') + '</small><h1>' + E(nu.lesson.title) + '</h1>' +
      '<p>' + (nu.verb === 'Keep going' ? 'Next up: ' + E(nu.stage) : E(nu.lesson.tagline)) + '</p></div><span class="btn go big">GO ▶</span></a>');
    else h.push('<div class="card" style="padding:18px;margin:18px 0"><h2>🎉 You\'ve finished every lesson so far!</h2><p>Check the skill tree for what\'s coming next.</p></div>');
    h.push('<a class="card team-chip" href="/arena">' + (d.team ? crest(d.team, 56) + '<span class="grow"><small class="muted">My arena team</small><b>' + E(d.team.name) + '</b>' +
      (d.team.motto ? '<small class="muted">“' + E(d.team.motto) + '”</small>' : '') + '</span>' : '<span class="team-chip-icon">🚩</span><span class="grow"><b>Make your arena team</b><small class="muted">Pick a name, a mascot and a logo for Circuit City Arena.</small></span>') +
      '<span class="btn small ghost">Arena ▶</span></a>');
    h.push('<div class="stat-tiles"><div class="card stat"><span>🗺️</span><span class="big">' + d.done + '/' + d.total + '</span><small>Lessons done</small></div>' +
      '<div class="card stat"><span>🏅</span><span class="big">' + earned + '</span><small>Badges</small></div>' +
      '<div class="card stat"><span>⭐</span><span class="big">' + lv.xp + '</span><small>XP</small></div>' +
      '<a class="card stat" href="/map" style="text-decoration:none;color:inherit"><span>🌳</span><span class="big">Tree</span><small>See the skill tree</small></a></div>');
    h.push('<div class="home-grid"><section class="card" style="padding:18px"><h2>📋 My assignments</h2>');
    if (d.rows.length) d.rows.forEach(function (r) {
      h.push('<a class="assign-row" href="/lessons/' + E(r.lesson.id) + '"><span class="icon-tile ' + E(r.lesson.color) + '">' + E(r.lesson.icon) + '</span>' +
        '<span style="flex:1"><b>' + E(r.lesson.number) + '. ' + E(r.lesson.title) + '</b><br><small class="muted">' + E(r.class_name) +
        (r.due ? ' · due ' + E(due(r.due)) : '') + (r.overdue ? ' · <span class="bad">overdue</span>' : '') + (r.feedback ? ' · 💬 feedback' : '') + '</small>' +
        (r.note ? '<br><small>📌 ' + E(r.note) + '</small>' : '') + '</span>' + meter(r.pct) + '<b>' + r.pct + '%</b></a>');
    });
    else h.push('<p class="muted">No assignments yet. Start the next mission above, or pick any lesson.</p>');
    h.push('</section><section class="card" style="padding:18px"><h2>🏅 Badge shelf</h2><div class="badge-shelf">');
    d.badges.forEach(function (b) {
      h.push('<span class="badge-slot' + (b.earned ? '' : ' locked') + '" title="' + E(b.name + ': ' + b.desc) + '">' + (b.earned ? E(b.icon) : '?') + '</span>');
    });
    h.push('</div><p class="muted small">Hover a badge to see how to earn it. <a href="/me">My robot &amp; badges →</a></p>' +
      '<div class="inline-form" style="margin-top:12px"><input id="join-code" placeholder="Join another class: code" maxlength="10"><button class="btn small" id="join-go" type="button">Join</button></div></section></div>');
    main.innerHTML = h.join('');
    document.getElementById('join-go').addEventListener('click', function () {
      act(this, 'joinClass', [document.getElementById('join-code').value, '']);
    });
  };

  pages.catalog = function () {
    var h = ['<h1>Lessons</h1><p class="muted">Pick a chassis, tune it, code it in C++ and test in the simulator. Then take it into Circuit City Arena.</p>'];
    var card = function (c) {
      var inner = '<span class="num">' + E(c.number) + '</span><span class="icon-tile ' + E(c.color) + '">' + E(c.icon) + '</span><h3>' + E(c.title) + '</h3>' +
        (c.soon ? '<p class="muted">Coming soon</p>' : '<p>' + E(c.tagline) + '</p>' + (c.pct ? meter(c.pct) : '')) +
        '<div class="tags"><span class="tag">💡 ' + E(c.python) + '</span><span class="tag">🔌 ' + E(c.hardware) + '</span>' +
        (c.stars ? '<span class="tag">' + '★'.repeat(c.stars) + '</span>' : '') + '</div>';
      return c.soon ? '<div class="card course-card soon">' + inner + '</div>' : '<a class="card course-card" href="/lessons/' + E(c.id) + '">' + inner + '</a>';
    };
    var grid = function (list) { return '<div class="course-grid">' + list.map(card).join('') + '</div>'; };
    main.innerHTML = h.join('') + (d.grade ? grid(d.course) : byGrade(d.course, grid));
  };

  pages.lesson = function () {
    main.className = 'lesson-main';
    window.__lessonPage();
  };

  // About: who made the site and how, and what it saves about students (course/faq.yaml)
  pages.about = function () {
    var f = d.faq, h = ['<div class="about"><h1>' + E(f.title) + '</h1><div class="about-intro">' + f.intro + '</div>' +
      '<p class="about-jump">' + f.sections.map(function (s, i) { return '<a class="btn small ghost" href="#about-' + i + '">' + E(s.title) + '</a>'; }).join(' ') + '</p>'];
    f.sections.forEach(function (s, i) {
      h.push('<section class="card about-sec" id="about-' + i + '"><h2>' + E(s.title) + '</h2>' + s.questions.map(function (q, k) {
        return '<details' + (k === 0 ? ' open' : '') + '><summary>' + E(q.q) + '</summary><div class="about-a">' + q.a + '</div></details>';
      }).join('') + '</section>');
    });
    h.push('<p class="row about-tools"><button type="button" class="btn small ghost" id="about-open">Open every answer</button> <button type="button" class="btn small ghost" id="about-print">Print this page</button></p></div>');
    main.innerHTML = h.join('');
    var openAll = function () { document.querySelectorAll('.about details').forEach(function (x) { x.open = true; }); };
    document.getElementById('about-open').addEventListener('click', openAll);
    document.getElementById('about-print').addEventListener('click', function () { openAll(); window.print(); });
  };

  pages.help = function () {
    var apps = d.apps || {};
    main.innerHTML = '<div class="card" style="padding:22px;max-width:820px;margin:0 auto"><h1>❓ Help</h1>' +
      '<h2>The simulator</h2><ol class="help-steps"><li>Some Build steps have a code editor and a robot field. Type your C++ on the left and press <b>Run</b>.</li>' +
      '<li>Test it boxes marked 🤖 tick themselves when your program passes. A red message names the line with a mistake.</li>' +
      '<li>In a driving step, click the field first. Then <b>W</b>/<b>S</b> move the left stick and <b>↑</b>/<b>↓</b> the right stick.</li></ol>' +
      '<h2>Putting your program on the real robot</h2><ol class="help-steps">' +
      '<li>In the editor, press <b>Copy for VEXcode</b>, then <b>Copy code</b>.</li>' +
      '<li>Open <a href="' + E(apps.vexcode) + '" target="vexcode" rel="noopener">VEXcode IQ</a>. It stays in its own tab, so you can flip back and forth. ' +
      'On a Chromebook, <b>Alt + [</b> and <b>Alt + ]</b> snap the two windows side by side.</li>' +
      '<li>Start a project with <b>File → New Text Project → C++</b>. In <b>Devices</b>, choose the <b>1st gen</b> Brain and add your motors and sensors with the same names your code uses.</li>' +
      '<li>In <b>main.cpp</b>, keep the folded <b>#pragma region</b> block at the top. Select from <b>int main() {</b> to the bottom and paste.</li>' +
      '<li>Plug in the Brain with the USB cable, click <b>Download</b>, then run the program on the Brain.</li></ol>' +
      (apps.cad ? '<h2>CAD Studio</h2><p><a href="' + E(apps.cad) + '" target="cadstudio" rel="noopener">VEX IQ CAD Studio</a> is a 3D building app with the real VEX IQ parts. ' +
        'Use it to plan a build before you grab parts, or to keep designing at home.</p>' : '') +
      '<div class="panel-soft box-tip"><h3>C++ is strict</h3><p>Every statement ends with a semicolon <code>;</code>. Capital letters matter: it\'s <code>Drivetrain</code>, not <code>drivetrain</code>. ' +
      'If something breaks, read the error message and check the line it names first.</p></div></div>';
  };

  pages.map = function () {
    main.className = 'container wide';
    var lv = d.level, h = ['<div class="page-head"><div><h1>Skill tree</h1><p class="muted">Finish a lesson to send power down the paths after it. ' +
      'Where the path splits, either lesson unlocks the next one.</p>' +
      (ML.teacher && d.grades ? '<p class="row">' + d.grades.map(function (g) { return '<a class="btn small' + (g.grade === d.grade ? '' : ' ghost') + '" href="/map/' + g.grade + '">' + E(g.name) + '</a>'; }).join(' ') + '</p>' : '') + '</div>'];
    if (!ML.teacher) h.push('<a class="level-chip card" href="/me"><span data-avatar="' + A(d.avatar) + '" data-size="52"></span><span><b>Level ' + lv.level + ' · ' +
      E(lv.title) + '</b><span class="xpbar"><i style="width:' + lv.pct + '%"></i></span><small class="muted">' + levelLine(lv) + '</small></span></a>');
    h.push('</div><div class="map-layout"><div class="map-scroll card"><div class="map" id="map" aria-label="Lesson map"></div></div><aside class="map-side">' +
      '<div class="card map-detail" id="map-detail" aria-live="polite"></div><div class="card map-legend"><h3>Legend</h3><ul>' +
      '<li><span class="dot complete"></span> Complete</li><li><span class="dot progress"></span> In progress</li><li><span class="dot open"></span> Unlocked — ready to go</li>' +
      '<li><span class="dot locked"></span> Locked</li><li>📌 Assigned by your teacher</li><li>★ The 3 star lights on a chip: perfect quiz · an extension · shipped</li></ul></div></aside></div>');
    main.innerHTML = h.join('');
    window.MAP = d.map;
    window.ME = ML.teacher ? null : d.avatar;
    window.LESSON_URL = '/lessons/__ID__';
    if (window.__runMap) window.__runMap();
  };

  pages.profile = function () {
    var lv = d.level, h = [];
    h.push('<h1>My robot &amp; badges</h1><div class="profile-grid"><section class="card builder-card"><h2>Build your robot</h2><div class="avatar-builder"><div class="avatar-stage">' +
      '<div id="avatar-preview"></div><label class="field"><span>Robot name</span><input id="avatar-name" maxlength="20" placeholder="e.g. Sparky" value="' + E(d.avatar.name) + '"></label>' +
      '<button type="button" class="btn wide" id="avatar-save">Save my robot</button><button type="button" class="btn ghost wide small" id="avatar-random">🎲 Surprise me</button>' +
      '<p class="save-status small" id="avatar-status" role="status"></p>' + (ML.teacher ? '' : '<p class="pill-xp" id="spend">⚡ <b>' + (d.spendable || 0) + '</b> XP to spend</p>') + '</div><div class="avatar-parts"><div class="part-tabs" role="tablist">');
    Object.keys(d.parts).forEach(function (k, i) { h.push('<button type="button" role="tab" class="part-tab' + (i ? '' : ' active') + '" data-part="' + E(k) + '">' + E(d.parts[k]) + '</button>'); });
    h.push('</div><div class="part-options" id="part-options"></div><p class="muted small">🔒 Locked parts unlock as you level up and earn badges. 🛒 Some you can buy with XP to spend.</p></div></div></section>' +
      '<section class="card level-card"><h2>Level ' + lv.level + ': ' + E(lv.title) + '</h2><div class="xpbar big"><i style="width:' + lv.pct + '%"></i></div><p class="muted">' +
      lv.xp + ' XP' + (lv.max ? ' · max level!' : ' · ' + (lv.next - lv.xp) + ' XP to level ' + (lv.level + 1)) + '</p><ol class="level-ladder">');
    d.levels.forEach(function (l, i) {
      h.push('<li class="' + (lv.xp >= l[0] ? 'reached' : '') + (i + 1 === lv.level ? ' here' : '') + '"><b>' + (i + 1) + '</b> ' + E(l[1]) + ' <small>' + l[0] + ' XP</small></li>');
    });
    var x = d.xp_table;
    h.push('</ol><details><summary>How do I earn XP?</summary><table class="xp-table">' +
      [['Mission accepted', x.mission], ['Every build step (all its tests checked)', x.step],
       ['Quiz passed', x.quiz + ' (+' + x.quiz_perfect + ' perfect, +' + x.quiz_first_try + ' perfect first try)'],
       ['Every extension you add', x.extension], ['Project shipped', x.ship], ['Whole lesson complete', x.complete], ['Every badge', x.badge]]
        .map(function (r) { return '<tr><td>' + r[0] + '</td><td>+' + r[1] + '</td></tr>'; }).join('') + '</table></details></section></div>');
    var earned = d.badges.filter(function (b) { return b.earned; }).length;
    h.push('<section class="card"><h2>Badges <small class="muted">' + earned + ' / ' + d.badges.length + '</small></h2><div class="badge-grid">');
    d.badges.forEach(function (b) {
      h.push('<div class="badge-tile' + (b.earned ? '' : ' locked') + '" title="' + E(b.desc) + '"><span class="badge-icon">' + (b.earned ? E(b.icon) : '🔒') + '</span><b>' +
        E(b.name) + '</b><small>' + E(b.desc) + '</small>' + (b.earned ? '<small class="earned">Earned ' + shortDate(b.earned_at) + '</small>' : '') + '</div>');
    });
    h.push('</div></section><section class="card"><h2>Recent XP</h2><ul class="xp-history">');
    if (d.history.length) d.history.slice(0, 15).forEach(function (e) { h.push('<li><b>+' + e.amount + '</b> ' + E(e.reason) + ' <small class="muted">' + shortDate(e.at) + '</small></li>'); });
    else h.push('<li class="muted">No XP yet. Start a lesson on the <a href="/map">skill tree</a>!</li>');
    h.push('</ul></section>');
    main.innerHTML = h.join('');
    window.AVATAR = d.avatar;
    window.CATALOG = d.catalog;
    if (window.__runProfile) window.__runProfile();
  };

  // ---------------------------------------------------------------- Robot Rush: the arcade, its leaderboard and the power-up shop
  var mmss = function (sec) { sec = Math.max(0, Math.floor(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); };
  pages.arcade = function () {
    var h = [], st = d.state || {}, openUntil = st.open ? Date.now() + st.seconds_left * 1000 : null;
    h.push('<div class="page-head"><div><h1>🎮 Robot Rush</h1><p class="muted">Race your robot for ' + d.race_seconds + ' seconds. Dodge bugs, grab bolts, beat your class!</p></div>' +
      (d.practice ? '<span class="pill-xp">Teacher preview: scores aren\'t saved</span>' : '<span class="pill-xp" id="spend">⚡ <b>' + d.spendable + '</b> XP to spend</span>') + '</div>');
    h.push('<div class="arcade-grid"><div><section class="card arcade-play" id="play-card"><div id="play-gate"></div>' +
      '<div class="game-wrap" id="game-wrap" hidden><canvas id="rush" aria-label="Robot Rush race"></canvas>' +
      '<div class="game-pad"><button type="button" class="btn" id="pad-up">▲ Up</button><button type="button" class="btn go" id="pad-dash">🚀 Dash</button>' +
      '<button type="button" class="btn" id="pad-down">▼ Down</button></div></div><div id="result"></div></section>' +
      '<section class="card"><h2>🛒 Power-up shop</h2><p class="muted small">Spend XP on upgrades for your robot. Your level never goes down: it counts all the XP you ever earned.</p>' +
      '<div class="power-grid" id="power-grid"></div><p class="small">🎨 More robot looks to buy in <a href="/me">My robot</a>.</p><p class="bad small" id="shop-msg" role="status"></p></section></div>' +
      '<section class="card board-card"><h2>🏆 Class leaderboard</h2><div class="board-tabs"><button type="button" class="here" data-b="today">Today</button>' +
      '<button type="button" data-b="all">All time</button></div><ol class="board" id="board"></ol>' +
      (d.best ? '<p class="muted small">Your best ever: <b>' + d.best + '</b></p>' : '') + '</section></div>');
    main.innerHTML = h.join('');
    var $ = function (id) { return document.getElementById(id); }, which = 'today', board = d.board || { today: [], all: [] };

    function drawBoard() {
      var rows = board[which] || [], ol = $('board');
      ol.textContent = '';
      if (!rows.length) { ol.innerHTML = '<li class="muted">No races yet' + (which === 'today' ? ' today' : '') + '. Be the first!</li>'; return; }
      rows.forEach(function (r, i) {
        var li = document.createElement('li');
        li.className = r.me ? 'me' : '';
        li.innerHTML = '<span class="rank">' + (['🥇', '🥈', '🥉'][i] || (i + 1)) + '</span><span data-avatar="' + A(r.avatar || {}) + '" data-size="40"></span><b></b><span class="score">' + r.score + '</span>';
        li.querySelector('b').textContent = r.name + (r.me ? ' (you)' : '');
        ol.appendChild(li);
      });
      RobotAvatar.renderAll(ol);
    }
    document.querySelectorAll('.board-tabs button').forEach(function (b) {
      b.addEventListener('click', function () {
        which = b.dataset.b;
        document.querySelectorAll('.board-tabs button').forEach(function (x) { x.classList.toggle('here', x === b); });
        drawBoard();
      });
    });

    function drawShop() {
      var box = $('power-grid');
      box.innerHTML = (d.shop || []).map(function (u) {
        var pips = '';
        for (var i = 0; i < u.max; i++) pips += '<i class="' + (i < u.level ? 'on' : '') + '"></i>';
        var btn = u.next_cost == null ? '<span class="maxed">MAX</span>' :
          '<button type="button" class="btn small' + (d.spendable >= u.next_cost && !d.practice ? ' go' : ' locked') + '" data-buy="' + E(u.id) + '">' + (u.level ? 'Upgrade' : 'Buy') + ' · ' + u.next_cost + ' XP</button>';
        return '<div class="power"><span class="power-icon">' + u.icon + '</span><div><b>' + E(u.name) + '</b><span class="pips">' + pips + '</span><small>' + E(u.desc) + '</small></div>' + btn + '</div>';
      }).join('');
      box.querySelectorAll('[data-buy]').forEach(function (b) {
        b.addEventListener('click', function () {
          var u = d.shop.filter(function (x) { return x.id === b.dataset.buy; })[0];
          if (d.spendable < u.next_cost || d.practice) {
            $('shop-msg').textContent = d.practice ? 'Students buy power-ups with XP they earn.' : 'You need ' + (u.next_cost - d.spendable) + ' more XP to spend. Finish more steps to earn it!';
            if (window.Celebrate) window.Celebrate.nope(b, $('shop-msg'));
            return;
          }
          if (!confirm('Buy ' + u.name + ' level ' + (u.level + 1) + ' for ' + u.next_cost + ' XP?')) return;
          b.disabled = true;
          ML.api('/api/shop/buy', { item: 'power:' + u.id }).then(function (r) {
            $('shop-msg').textContent = r.ok ? '' : (r.error || 'Could not buy that.');
            if (window.Celebrate) { if (r.ok) window.Celebrate.buy(b); else window.Celebrate.nope(b, $('shop-msg')); }
            if (r.ok) { d.shop = r.shop; d.spendable = r.spendable; d.powerups = r.powerups; d.race_seconds = r.race_seconds; $('spend').innerHTML = '⚡ <b>' + r.spendable + '</b> XP to spend'; }
            drawShop();
          });
        });
      });
    }

    var tick = null, bank = st.bank || 0;
    function drawGate() {
      var gate = $('play-gate'), left = openUntil ? Math.max(0, Math.round((openUntil - Date.now()) / 1000)) : 0;
      if (d.practice || (left > 0 && bank > 0)) {
        gate.innerHTML = '<div class="gate open"><div><b>' + (d.practice ? 'Practice race' : 'The arcade is open!') + '</b>' +
          (d.practice ? '' : '<span>You have <b id="gate-bank">' + mmss(bank) + '</b> of play time. Each race uses ' + d.race_seconds + ' seconds.</span>') + '</div>' +
          '<button type="button" class="btn go big" id="start">▶ Start race</button></div>';
        $('start').addEventListener('click', start);
      } else if (left > 0) {
        gate.innerHTML = '<div class="gate"><span class="gate-lock">⏳</span><div><b>The arcade is open, but you\'re out of play time.</b>' +
          '<span>Finish a lesson to earn ' + d.minutes + ' minutes of Robot Rush. Spend XP on power-ups while you work!</span></div></div>';
      } else {
        gate.innerHTML = '<div class="gate"><span class="gate-lock">🔒</span><div><b>The arcade is closed.</b>' +
          '<span>Your teacher opens it in class. Finish a lesson to earn ' + d.minutes + ' minutes of play time' +
          (bank ? ': you have <b>' + mmss(bank) + '</b> saved.' : '.') + '</span></div></div>';
      }
    }
    function countdown() {
      clearInterval(tick);
      tick = setInterval(function () {
        if (openUntil && openUntil <= Date.now()) { clearInterval(tick); openUntil = null; if (!racing) drawGate(); }
      }, 1000);
    }
    var racing = false;
    function start() {
      var btn = $('start');
      btn.disabled = true;
      ML.api('/api/arcade/start', {}).then(function (r) {
        if (!r.ok) { $('play-gate').innerHTML = '<p class="bad"></p>'; $('play-gate').firstChild.textContent = r.error; return; }
        racing = true;
        bank = r.bank || 0;
        $('play-gate').hidden = true; $('result').textContent = ''; $('game-wrap').hidden = false;
        $('game-wrap').scrollIntoView({ block: 'center', behavior: 'smooth' });
        RobotRush.play($('rush'), { avatar: d.avatar, seconds: r.seconds, powerups: r.powerups, controls: function (c) {
          $('pad-up').onclick = c.up; $('pad-down').onclick = c.down; $('pad-dash').onclick = c.dash;
        } }).then(function (res) {
          racing = false;
          $('result').innerHTML = '<div class="result-card"><b>Finished!</b><span class="big-score">' + res.score + '</span><span class="muted small">' +
            res.meters + ' m · 🔩 ' + res.bolts + ' bolts' + (res.smashed ? ' · 💥 ' + res.smashed + ' smashed' : '') + '</span><p id="res-note" class="small">Saving…</p></div>';
          return ML.api('/api/arcade/finish', { run_id: r.run_id, score: res.score }).then(function (f) {
            var note = $('res-note');
            if (!f.ok) { note.className = 'bad small'; note.textContent = f.error; }
            else if (f.practice) note.textContent = 'Practice race: scores are not saved for the teacher.';
            else {
              note.textContent = f.new_best ? '🎉 New personal best!' : f.new_day_best ? '⭐ Your best today!' : 'Your best: ' + f.best;
              board = f.board || board; drawBoard();
              if (f.state) { openUntil = f.state.open ? Date.now() + f.state.seconds_left * 1000 : null; bank = f.state.bank || 0; }
            }
            $('play-gate').hidden = false;
            drawGate();
            var s = $('start');
            if (s) s.textContent = '▶ Race again';
          });
        });
      }).catch(function () { btn.disabled = false; });
    }
    drawBoard();
    drawShop();
    drawGate();
    if (openUntil) countdown();
  };

  // ---------------------------------------------------------------- teacher pages
  pages['teacher-home'] = function () {
    var h = ['<h1>My classes</h1><div class="class-cards">'];
    d.classes.forEach(function (c) {
      h.push('<a class="card class-card" href="/teacher/classes/' + E(c.id) + '"><h2>' + E(c.name) + '</h2><div class="join-code small">Code <b>' + E(c.code) +
        '</b></div><p class="muted">' + E(c.grade_name) + '<br>' + c.students + ' students · ' + c.assignments + ' assignments' + (c.classroom ? '<br>🔗 Google Classroom' : '') + '</p></a>');
    });
    var linked = d.classes.filter(function (c) { return c.classroom; }).length;
    h.push('<div class="card class-card new"><h2>+ New class</h2><input id="new-class" placeholder="e.g. Period 3" maxlength="80"><select id="new-grade" aria-label="Grade"><option value="">Pick a grade…</option><option value="7">Grade 7</option><option value="8">Grade 8</option></select><button class="btn" id="new-go" type="button">Create</button></div>' +
      '<div class="card class-card new"><h2>🔗 Google Classroom</h2><p class="muted small">Bring in your Classroom classes and their students. No join codes needed.</p>' +
      '<a class="btn" href="/teacher/google-import">Import classes</a>' + (linked ? ' <button class="btn ghost small" id="gc-sync-all" type="button">Update all rosters</button>' : '') + '</div></div>' +
      '<section class="card tab-icon-card"><h2>Tab icon</h2><p class="muted small">The little picture in the browser tab, for you and your students.</p>' +
      '<div class="tab-icon-row"><img id="tab-icon-now" alt="" width="32" height="32"><select id="tab-icon-pick"></select>' +
      '<input id="tab-icon-url" placeholder="…or paste a picture address (https://…png)" hidden style="flex:1;min-width:240px">' +
      '<button class="btn small" id="tab-icon-go" type="button">Save</button></div>' +
      '<p class="muted small">After saving, reload the page to see it in the tab.</p>' +
      (d.logo_refused ? '<p class="small bad">Google wouldn\'t accept the logo from your Drive, so the tab shows 🤖. Pick one of the emoji instead.</p>' : '') +
      '</section>' +
      '<section class="card data-card" id="data-card"><h2>🗄️ Your data</h2><p class="muted small">Loading…</p></section>' +
      '<section class="card tip"><h2>Getting started</h2><ol><li><b>Import classes</b> from Google Classroom, or create a class. Each class also gets a 6-letter <b>join code</b>.</li>' +
      '<li>Share this page\'s web address with students. Students on an imported roster are already in. Anyone else types the code and their name once. No passwords.</li>' +
      '<li>Assign lessons with due dates. The gradebook shows who\'s done what.</li><li>Open any lesson to see the <b>teacher answer key</b>. Add videos on the <a href="/teacher/videos">Videos</a> page.</li></ol></section>');
    main.innerHTML = h.join('');
    // Your data: where RoboCode Academy keeps everything, backups, and other "RoboCode Academy data" folders (owner only)
    var drawData = function (info) {
      var box = document.getElementById('data-card'), h2 = [];
      h2.push('<h2>🗄️ Your data</h2>');
      h2.push(info.folder.url ? '<p>RoboCode Academy keeps everything in <a href="' + E(info.folder.url) + '" target="_blank" rel="noopener">' + E(info.folder.name) +
        '</a> in your Google Drive: <b>' + info.students + '</b> students, <b>' + info.classes + '</b> classes.</p>'
        : info.folder.missing ? '<p class="bad">RoboCode Academy can\'t open its data folder right now. Your data is not lost: nothing new was made. Try again in a minute.</p>'
        : '<p class="muted">No data yet.</p>');
      h2.push('<p class="small">' + (info.today ? (info.today.done ? '✅ Today\'s backup is done.' : '⏳ Today\'s backup: ' + info.today.students + ' students so far.') : 'Today\'s backup hasn\'t started yet.') +
        ' <button class="btn small ghost" id="backup-go" type="button">Back up now</button></p>');
      if (info.backups.length) h2.push('<p class="small">Backups: ' + info.backups.map(function (b) {
        return b.url ? '<a href="' + E(b.url) + '" target="_blank" rel="noopener">' + E(b.day) + '</a> (' + b.students + ')' : E(b.day);
      }).join(' · ') + '</p>');
      if (info.others.length) h2.push('<p class="small bad">⚠️ Your Drive has ' + info.others.length + ' other "RoboCode Academy data" folder(s): ' +
        info.others.map(function (o) { return '<a href="' + E(o.url) + '" target="_blank" rel="noopener">open</a>'; }).join(', ') +
        '. RoboCode Academy only uses the one above. Don\'t delete anything; ask Claude if you\'re not sure which is right.</p>');
      box.innerHTML = h2.join('');
      document.getElementById('backup-go').addEventListener('click', function () {
        var b = this; b.disabled = true; b.textContent = 'Backing up…';
        ML.run('backupNow').then(drawData).catch(function (e) { b.disabled = false; b.textContent = 'Back up now'; flash(e.message, 'error'); });
      });
    };
    ML.run('dataInfo').then(drawData).catch(function () { document.getElementById('data-card').querySelector('p').textContent = 'Couldn\'t load right now.'; });
    document.getElementById('new-go').addEventListener('click', function () {
      act(this, 'createClass', [document.getElementById('new-class').value, document.getElementById('new-grade').value], function (c) { ML.go('/teacher/classes/' + c.id); });
    });
    var pick = document.getElementById('tab-icon-pick'), url = document.getElementById('tab-icon-url');
    document.getElementById('tab-icon-now').src = d.tab_icon_url;
    (d.tab_icons || []).forEach(function (t) { var o = pick.appendChild(document.createElement('option')); o.value = t.id; o.textContent = t.label; });
    pick.appendChild(document.createElement('option')).value = 'custom';
    pick.lastChild.textContent = 'My own picture…';
    var custom = /^https:/.test(d.tab_icon);
    pick.value = custom ? 'custom' : d.tab_icon;
    url.hidden = !custom;
    if (custom) url.value = d.tab_icon;
    pick.addEventListener('change', function () { url.hidden = pick.value !== 'custom'; });
    document.getElementById('tab-icon-go').addEventListener('click', function () {
      var btn = this;
      act(btn, 'setTabIcon', [pick.value === 'custom' ? url.value : pick.value], function (r) {
        btn.disabled = false;
        document.getElementById('tab-icon-now').src = r.url;
        flash('Saved. Reload the page to see the new tab icon.', 'success');
      });
    });
    var all = document.getElementById('gc-sync-all');
    if (all) all.addEventListener('click', function () {
      act(this, 'syncAllClassroom', [], function (r) { alert(syncReport(r.classes)); ML.reload(); });
    });
  };

  var syncReport = function (list) {
    return list.map(function (c) {
      if (c.error) return c.name + ': ' + c.error;
      return c.name + ': ' + c.students + ' students' + (c.added ? ', ' + c.added + ' new' : '') + (c.left ? ', ' + c.left + ' left' : '') +
        (c.missing ? '. ' + c.missing + ' had no email shared by Classroom (they can still join with the code)' : '');
    }).join('\n') || 'Nothing to update.';
  };

  pages['gc-import'] = function () {
    var h = ['<a class="muted small" href="/">← My classes</a><h1>Import from Google Classroom</h1>'];
    if (d.problem) {
      h.push('<section class="card"><p class="bad">' + E(d.problem) + '</p><p class="muted small">After fixing it, deploy a new version and reload this page.</p></section>');
      main.innerHTML = h.join('');
      return;
    }
    if (!d.courses.length) {
      h.push('<section class="card"><p>No active Google Classroom classes where you are a teacher.</p></section>');
      main.innerHTML = h.join('');
      return;
    }
    h.push('<section class="card"><p class="muted">Pick what each Classroom class becomes in RoboCode Academy. Students on the roster are in the class ' +
      'the first time they open RoboCode Academy, with the name from Classroom. Nothing is changed in Google Classroom.</p>' +
      '<div class="table-scroll"><table class="gradebook"><thead><tr><th>Google Classroom class</th><th>In RoboCode Academy</th><th>Grade</th></tr></thead><tbody>');
    var guessGrade = function (text) { var m = /(?:^|[^0-9])(7|8)(?:th)?(?:[^0-9]|$)|\b(seven|eigh)/i.exec(text || ''); return !m ? '' : m[1] || (/seven/i.test(m[2]) ? '7' : '8'); };
    d.courses.forEach(function (c) {
      var opts = '<option value="">Skip</option><option value="new"' + (c.linked ? '' : '') + '>New RoboCode Academy class</option>';
      d.classes.forEach(function (k) { opts += '<option value="' + E(k.id) + '"' + (c.linked === k.id ? ' selected' : '') + '>Link to: ' + E(k.name) + '</option>'; });
      h.push('<tr><th class="who"><span><b>' + E(c.name) + '</b>' + (c.section ? '<small>' + E(c.section) + '</small>' : '') + '</span></th>' +
        '<td><select class="gc-pick" data-id="' + E(c.id) + '">' + opts + '</select>' + (c.linked ? ' <small class="muted">already linked</small>' : '') + '</td>' +
        '<td><select class="gc-grade" data-id="' + E(c.id) + '"><option value="">Pick a grade…</option>' + (d.grades || []).map(function (g) {
          var pre = c.linked ? (d.classes.filter(function (k) { return k.id === c.linked; })[0] || {}).grade : guessGrade(c.name + ' ' + c.section);
          return '<option value="' + E(g.id) + '"' + (g.id === pre ? ' selected' : '') + '>' + E(g.name) + '</option>';
        }).join('') + '</select></td></tr>');
    });
    h.push('</tbody></table></div><button class="btn" id="gc-go" type="button">Import</button></section>');
    main.innerHTML = h.join('');
    document.getElementById('gc-go').addEventListener('click', function () {
      var choices = Array.prototype.map.call(document.querySelectorAll('.gc-pick'), function (x) {
        return { course_id: x.dataset.id, target: x.value, grade: document.querySelector('.gc-grade[data-id="' + x.dataset.id + '"]').value };
      }).filter(function (c) { return c.target; });
      if (!choices.length) { flash('Pick at least one class to import.', 'error'); return; }
      if (choices.some(function (c) { return !c.grade; })) { flash('Pick 6th or 7th grade for every class you import.', 'error'); return; }
      act(this, 'importClassroom', [choices], function (r) { alert(syncReport(r.classes)); ML.go('/'); });
    });
  };

  pages.classroom = function () {
    main.className = 'container wide';
    var c = d.cls, h = [];
    h.push('<div class="page-head"><div><a class="muted small" href="/">← My classes</a><h1>' + E(c.name) + '</h1>' +
      '<label class="small">Course <select id="cls-grade">' + d.grades.map(function (g) { return '<option value="' + g.grade + '"' + (g.grade === d.grade ? ' selected' : '') + '>' + E(g.name) + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="row"><a class="btn" href="/teacher/classes/' + E(c.id) + '/screen">📺 Class display</a>' +
      '<a class="btn" href="/teacher/classes/' + E(c.id) + '/arena">🏟️ Arena leaderboard</a>' +
      '<button type="button" class="btn ghost" id="student-view" title="Use the site as a student in this class">👀 Student view</button>' +
      '<a class="btn ghost" href="/teacher/classes/' + E(c.id) + '/google-classroom">Google Classroom grades</a></div>' +
      '<div class="join-code">Join code <b>' + E(c.code) + '</b><small>' + E(d.url) + '</small></div></div>');
    if (c.classroom) {
      h.push('<section class="card tip gc-link"><b>🔗 Linked to Google Classroom:</b> ' + E(c.classroom.name) + (c.classroom.section ? ' (' + E(c.classroom.section) + ')' : '') +
        ' <small class="muted">roster updated ' + E(shortDate(c.classroom.synced_at)) + '</small> ' +
        '<button class="btn small" id="gc-sync" type="button">Update roster</button> <button class="linklike small" id="gc-unlink" type="button">unlink</button>' +
        (c.classroom.missing ? '<p class="small bad">' + c.classroom.missing + ' student(s) had no email shared by Classroom. They can join with the code above.</p>' : '') +
        '<p class="muted small">Students on the roster just open the web address above, signed in to their school account. No code needed.</p></section>');
    }
    h.push('<section class="card"><h2>Gradebook</h2>');
    if (!d.students.length) h.push('<p class="muted">No students yet. Share the web address above and the code <b>' + E(c.code) + '</b>.</p>');
    else if (!d.cols.length) h.push('<p class="muted">No assignments yet — assign lessons below.</p>');
    else {
      h.push('<div class="table-scroll"><table class="gradebook"><thead><tr><th>Student</th>');
      d.cols.forEach(function (a) { h.push('<th title="' + E(a.title) + '">' + E(a.number) + '. ' + E(a.title) + (a.due ? '<small>due ' + E(due(a.due)) + '</small>' : '') + '</th>'); });
      h.push('</tr></thead><tbody>');
      var names = {};
      d.students.forEach(function (s) { names[s.email] = s.name; });
      d.students.forEach(function (s) {
        var link = '/teacher/classes/' + E(c.id) + '/students/' + encodeURIComponent(s.email);
        h.push('<tr' + (s.not_yet ? ' class="muted"' : '') + '><th class="who"><span data-avatar="' + A(s.avatar || {}) + '" data-size="34"></span><span><a href="' + link + '">' + E(s.name) + '</a><small>' +
          (s.not_yet ? 'hasn\'t opened RoboCode Academy yet' : 'Lv ' + s.level + ' · ' + (s.xp || 0) + ' XP') + '</small></span></th>');
        d.cols.forEach(function (a) {
          var cell = d.grid[s.email + '|' + a.id];
          h.push('<td class="cell ' + cell.status + (cell.late ? ' late' : '') + '"><a href="' + link + '#' + E(a.lesson_id) + '">' + meter(cell.pct) + '<span class="cell-detail">' + cell.pct + '%' +
            (cell.status !== 'not-started' ? ' · ' + E(stageLabel(cell)) : '') + (cell.quiz_total ? ' · Q ' + cell.quiz_best + '/' + cell.quiz_total : '') +
            (cell.late ? ' <b class="bad">late</b>' : '') + (cell.partner ? ' · 👥 ' + E(names[cell.partner] || 'partner') : '') + '</span></a>' +
            (cell.share ? '<a class="cell-link" href="' + E(cell.share) + '" target="_blank" rel="noopener" title="Open their MakeCode project">🔗 project</a>' : '') + '</td>');
        });
        h.push('</tr>');
      });
      h.push('</tbody></table></div><p class="muted small">Stage = where they are (Mission, Build step, Quiz, Ship it) · Q = best quiz score · Click a student\'s name to read their programs. ' +
        'The gradebook catches up with new work within about a minute.</p>');
    }
    h.push('</section><section class="card arena-teacher" id="arena-card"></section><section class="card arcade-teacher" id="arcade-card"></section>');
    h.push('<div class="grid-2"><section class="card"><h2>Assign lessons</h2><div class="assign-picker">');
    h.push('<fieldset><legend>The course</legend>');
    d.course.forEach(function (l) {
      if (l.soon) { h.push('<label class="check muted"><input type="checkbox" disabled> ' + E(l.number) + '. ' + E(l.title) + ' <small>(coming soon)</small></label>'); return; }
      var on = d.assigned.indexOf(l.id) >= 0;
      h.push('<label class="check' + (on ? ' muted' : '') + '"><input type="checkbox" class="as-pick" value="' + E(l.id) + '"' + (on ? ' disabled checked' : '') + '> ' +
        E(l.icon) + ' ' + E(l.number) + '. ' + E(l.title) + ' <a href="/lessons/' + E(l.id) + '" class="small">preview</a></label>');
    });
    h.push('</fieldset>');
    h.push('</div><div class="row"><label class="field"><span>Due date (optional)</span><input type="date" id="as-due"></label><label class="field grow"><span>Note to students (optional)</span>' +
      '<input id="as-note" maxlength="500" placeholder="e.g. Bring your breakout board!"></label></div><button class="btn" id="as-go" type="button">Assign selected</button>');
    if (d.cols.length) {
      h.push('<h3>Assigned</h3><ul class="plain">');
      d.cols.forEach(function (a) {
        h.push('<li>' + E(a.number) + '. ' + E(a.title) + (a.due ? ' <small class="muted">due ' + E(due(a.due)) + '</small>' : '') +
          ' <button type="button" class="linklike small un-assign" data-id="' + E(a.id) + '">remove</button></li>');
      });
      h.push('</ul>');
    }
    h.push('</section><section class="card"><h2>Roster (' + d.students.length + ')</h2><ul class="roster plain">');
    if (d.students.length) d.students.forEach(function (s) {
      h.push('<li><span data-avatar="' + A(s.avatar || {}) + '" data-size="26"></span> <a href="/teacher/classes/' + E(c.id) + '/students/' + encodeURIComponent(s.email) + '">' +
        E(s.name) + '</a> <small class="muted">' + E(s.email) + (s.not_yet ? ' · not signed in yet' : ' · Lv ' + s.level) + '</small></li>');
    });
    else h.push('<li class="muted">Nobody yet.</li>');
    h.push('</ul><details class="danger-zone"><summary>Delete this class</summary><p class="small">Type <b>' + E(c.name) + '</b> to confirm. Student work is kept.</p>' +
      '<input id="del-name"> <button class="btn small danger" id="del-go" type="button">Delete class</button></details></section></div>');
    main.innerHTML = h.join('');
    var $ = function (id) { return document.getElementById(id); };
    $('student-view').addEventListener('click', function () { act(this, 'studentView', [c.id], function () { ML.go('/'); }); });
    $('cls-grade').addEventListener('change', function () { act(this, 'setClassGrade', [c.id, this.value]); });
    var arena = d.arena, arenaPick = arena.events.length ? arena.events[0].id : '';
    var drawArena = function () {
      var ev = arena.events.filter(function (e) { return e.id === arenaPick; })[0], h2 = ['<h2>🏟️ Circuit City Arena</h2>'];
      if (!ev) { $('arena-card').innerHTML = h2.join('') + '<p class="muted">No arena challenges for this course.</p>'; return; }
      var scores = {};
      ev.results.forEach(function (r) { scores[r.key] = r; });
      h2.push('<p class="muted small">Type each team\'s points for a challenge and save. A student who is not on a team is scored alone. The site ranks them, and the season standings show on the 📺 Class display and the students\' Arena page.</p>' +
        '<div class="grid-2"><div><label class="field"><span>Challenge</span><select id="arena-ev">' + arena.events.map(function (e) {
          return '<option value="' + E(e.id) + '"' + (e.id === arenaPick ? ' selected' : '') + '>' + E(e.icon + ' ' + e.name) + (e.results.length ? ' ✓' : '') + '</option>'; }).join('') + '</select></label>' +
        '<p class="small">' + E(ev.blurb) + ' <a href="/lessons/' + E(ev.lesson_id) + '">Lesson ' + E(ev.lesson) + '</a></p>' + guideTable(ev) + '</div><div>');
      if (!arena.entrants.length) h2.push('<p class="muted">No students yet.</p>');
      else {
        h2.push('<table class="arena-scores"><thead><tr><th>Team or student</th><th>Points</th><th>Place</th></tr></thead><tbody>');
        arena.entrants.forEach(function (s) {
          var r = scores[s.key];
          h2.push('<tr><td>' + (s.team ? '<span class="team-cell">' + crest(s.team, 28) + '<span><b>' + E(s.name) + '</b><small class="muted team-names">' + s.team.members.map(function (m) { return E(m.name); }).join(', ') + '</small></span></span>' : E(s.name)) +
            '</td><td><input type="number" step="1" class="arena-in" data-key="' + E(s.key) + '" value="' + (r ? r.score : '') + '" aria-label="Points for ' + E(s.name) + '"></td><td>' + (r ? place(r.place) : '') + '</td></tr>');
        });
        h2.push('</tbody></table><button class="btn" id="arena-save" type="button">Save scores</button> <span class="saved small" id="arena-msg" role="status"></span>');
      }
      h2.push('</div></div><h3>Season standings</h3>' + standingsTable(arena.standings, 'No scores yet.'));
      // teams: who is on which, and the class's team rules
      var onTeam = {};
      arena.teams.forEach(function (t) { t.members.forEach(function (m) { onTeam[m.email] = t.id; }); });
      var teamSelect = function (email) {
        return '<select class="team-move" data-email="' + E(email) + '" aria-label="Team"><option value="">No team</option>' + arena.teams.map(function (t) {
          return '<option value="' + E(t.id) + '"' + (onTeam[email] === t.id ? ' selected' : '') + '>' + E(t.name) + '</option>'; }).join('') + '</select>';
      };
      h2.push('<h3>Teams (' + arena.teams.length + ')</h3><p class="muted small">Students start and join teams on their Arena page. You can move anyone here, rename a team or delete it. ' +
        'Deleting a team also removes its arena scores.</p>' +
        '<p class="row"><label class="small">Students per team <select id="team-max">' + [2, 3, 4, 5, 6].map(function (n) { return '<option' + (n === arena.team_max ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label> ' +
        '<label class="check small"><input type="checkbox" id="team-lock"' + (arena.teams_locked ? ' checked' : '') + '> Lock teams (students can\'t change them)</label></p>');
      if (arena.teams.length) h2.push('<div class="team-admin">' + arena.teams.map(function (t) {
        return '<div class="team-admin-card">' + crest(t, 56) + '<div class="grow"><b>' + E(t.name) + '</b>' + (t.motto ? ' <small class="muted">“' + E(t.motto) + '”</small>' : '') +
          '<ul class="plain">' + t.members.map(function (m) { return '<li>' + E(m.name) + ' ' + teamSelect(m.email) + '</li>'; }).join('') + '</ul>' +
          '<button type="button" class="linklike small team-rename" data-id="' + E(t.id) + '" data-name="' + E(t.name) + '">rename</button> · <button type="button" class="linklike small team-del" data-id="' + E(t.id) + '" data-name="' + E(t.name) + '">delete team</button></div></div>';
      }).join('') + '</div>');
      var loose = arena.students.filter(function (st) { return !onTeam[st.email]; });
      if (loose.length && arena.teams.length) h2.push('<p class="small"><b>Not on a team:</b></p><ul class="plain team-loose">' + loose.map(function (st) { return '<li>' + E(st.name) + ' ' + teamSelect(st.email) + '</li>'; }).join('') + '</ul>');
      else if (loose.length) h2.push('<p class="small muted">No teams yet. ' + loose.length + ' student(s) can start one on their Arena page.</p>');
      $('arena-card').innerHTML = h2.join('');
      window.RobotAvatar.renderAll($('arena-card'));
      var admin = function (el, action, payload) { act(el, 'teamAdmin', [c.id, action, payload], function (r) { arena = r; drawArena(); }); };
      $('arena-ev').addEventListener('change', function () { arenaPick = this.value; drawArena(); });
      if ($('arena-save')) $('arena-save').addEventListener('click', function () {
        var map = {}, b = this;
        document.querySelectorAll('.arena-in').forEach(function (i) { map[i.dataset.key] = i.value.trim(); });
        act(b, 'arenaSave', [c.id, arenaPick, map], function (r) { arena = r; drawArena(); $('arena-msg').textContent = 'Saved ✓'; });
      });
      var settings = function () { admin(null, 'settings', { max: $('team-max').value, locked: $('team-lock').checked }); };
      $('team-max').addEventListener('change', settings);
      $('team-lock').addEventListener('change', settings);
      document.querySelectorAll('.team-move').forEach(function (sel) { sel.addEventListener('change', function () { admin(sel, 'move', { email: sel.dataset.email, team: sel.value }); }); });
      document.querySelectorAll('.team-rename').forEach(function (b) { b.addEventListener('click', function () {
        var name = prompt('New name for ' + b.dataset.name + ':', b.dataset.name);
        if (name) admin(b, 'rename', { team: b.dataset.id, name: name });
      }); });
      document.querySelectorAll('.team-del').forEach(function (b) { b.addEventListener('click', function () {
        if (confirm('Delete the team ' + b.dataset.name + '? Its arena scores are removed too. The students stay in the class.')) admin(b, 'delete', { team: b.dataset.id });
      }); });
    };
    drawArena();
    $('as-go').addEventListener('click', function () {
      var ids = Array.prototype.map.call(document.querySelectorAll('.as-pick:checked:not(:disabled)'), function (x) { return x.value; });
      act(this, 'assignLessons', [c.id, ids, $('as-due').value, $('as-note').value]);
    });
    document.querySelectorAll('.un-assign').forEach(function (b) {
      b.addEventListener('click', function () { if (confirm('Remove this assignment? Student work is kept.')) act(b, 'updateAssignment', [b.dataset.id, '', '', true]); });
    });
    if ($('gc-sync')) $('gc-sync').addEventListener('click', function () { act(this, 'syncClassroom', [c.id], function (r) { alert(syncReport([r])); ML.reload(); }); });
    if ($('gc-unlink')) $('gc-unlink').addEventListener('click', function () {
      if (confirm('Unlink from Google Classroom? Students who never joined with the code leave this class (their work is kept).')) act(this, 'unlinkClassroom', [c.id]);
    });
    $('del-go').addEventListener('click', function () { act(this, 'deleteClass', [c.id, $('del-name').value], function () { ML.go('/'); }); });
    // Robot Rush: closed unless the teacher opens it for this class
    var arc = d.arcade, arcEnd = null, arcTick = null;
    function drawArcade() {
      var left = arcEnd ? Math.max(0, Math.round((arcEnd - Date.now()) / 1000)) : 0, b = arc.board || { today: [] };
      $('arcade-card').innerHTML = '<div class="arcade-teacher-head"><h2>🎮 Robot Rush</h2><a class="btn ghost small" href="/arcade">Try it yourself</a></div>' +
        '<p class="muted small">The arcade is closed unless you open it here or on the 📺 Class display. Finishing a lesson earns a student ' + arc.minutes +
        ' minutes of play time, which they can only use while the arcade is open for this class. Spending XP on power-ups never lowers a level.</p><div class="row">' +
        (left ? '<b class="ok">Open · closes in <span id="arc-left">' + mmss(left) + '</span></b> <button class="btn small ghost" type="button" data-arc="close">Close now</button>'
          : '<button class="btn small" type="button" data-arc="open">Open for this class (1 hour)</button>') +
        ' <button class="btn small ghost" type="button" data-arc="gift">Give everyone ' + arc.minutes + ' minutes</button></div>' +
        '<h3>Today\'s top racers</h3>' + (b.today.length ? '<ol class="board small-board">' + b.today.slice(0, 5).map(function (r, i) {
          return '<li><span class="rank">' + (['🥇', '🥈', '🥉'][i] || (i + 1)) + '</span><span data-avatar="' + A(r.avatar || {}) + '" data-size="30"></span><b>' + E(r.name) + '</b><span class="score">' + r.score + '</span></li>';
        }).join('') + '</ol>' : '<p class="muted small">No races yet today.</p>');
      RobotAvatar.renderAll($('arcade-card'));
      $('arcade-card').querySelectorAll('[data-arc]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (btn.dataset.arc === 'gift' && !confirm('Give every student in this class ' + arc.minutes + ' minutes of play time?')) return;
          act(btn, 'arcadeClass', [c.id, btn.dataset.arc, 60], function (r) {
            arc = r; arcEnd = r.seconds_left ? Date.now() + r.seconds_left * 1000 : null; drawArcade();
            if (r.gifted != null) flash('Gave ' + r.gifted + ' students ' + arc.minutes + ' minutes of play time.', 'ok');
          });
        });
      });
      clearInterval(arcTick);
      if (left) arcTick = setInterval(function () {
        var l = Math.max(0, Math.round((arcEnd - Date.now()) / 1000));
        if ($('arc-left')) $('arc-left').textContent = mmss(l);
        if (!l) drawArcade();
      }, 1000);
    }
    if (arc) { arcEnd = arc.seconds_left ? Date.now() + arc.seconds_left * 1000 : null; drawArcade(); }
  };

  pages.student = function () {
    var s = d.student, h = [];
    h.push('<a class="muted small" href="/teacher/classes/' + E(d.cls.id) + '">← ' + E(d.cls.name) + '</a>' +
      '<section class="card player-card"><span class="avatar-tile"><span data-avatar="' + A(s.avatar) + '" data-size="80"></span></span><div style="flex:1"><h1></h1>' +
      '<p class="muted">' + E(s.email) + ' · Level ' + s.level.level + ' (' + E(s.level.title) + ') · ' + s.xp + ' XP · ' +
      s.badges.map(function (b) { return E(b.icon); }).join(' ') + '</p></div>' +
      '<div class="inline-form"><input id="bx" type="number" min="0" max="200" placeholder="XP" style="width:80px"><input id="br" placeholder="Reason" maxlength="120">' +
      '<label class="small"><input type="checkbox" id="bp"> 🍎 Teacher\'s Pick</label><button class="btn small" id="bgo" type="button">Give</button></div></section>');
    if (!d.items.length) h.push('<p class="muted">No lessons started or assigned yet.</p>');
    d.items.forEach(function (it) {
      var p = it.p || {}, steps = p.steps || {};
      h.push('<section class="card" id="' + E(it.id) + '" style="padding:18px;margin-top:16px"><h2>' + E(it.icon) + ' ' + E(it.number) + '. ' + E(it.title) +
        ' <small class="muted">' + it.pct + '%' + (it.assigned ? ' · assigned' : '') + '</small></h2>' + meter(it.pct) + '<dl class="work">' +
        (it.partner ? '<dt>Partner</dt><dd>👥 Worked with ' + E(it.partner) + '</dd>' : '') +
        '<dt>Mission</dt><dd><small class="muted">' + E(it.talk_q.replace(/<[^>]+>/g, '')) + '</small><br><span data-text="talk"></span></dd><dt>Build</dt><dd><ol class="small">');
      it.steps.forEach(function (st, k) {
        var r = steps[k] || {};
        h.push('<li>' + (r.done ? '✅' : '⬜') + ' ' + E(st.title) + (st.ask && r.answer ? '<br><small class="muted">' + E(st.ask) + '</small> <span class="ans">' + E(r.answer) + '</span>' : '') +
          (st.fields.length && r.fields ? '<br><small>' + st.fields.map(function (f, i) { return E(f) + ': <b>' + E((r.fields || [])[i] || '') + '</b>'; }).join(' · ') + '</small>' : '') +
          (r.code ? '<details><summary class="small">💻 code in this step</summary><pre class="ship-code">' + E(r.code) + '</pre></details>' : '') + '</li>');
      });
      h.push('</ol></dd><dt>Quiz</dt><dd>' + (p.quiz_total ? 'best ' + p.quiz_best + '/' + p.quiz_total + ' · ' + p.quiz_attempts + ' attempt(s)' : '—') + '</dd>' +
        '<dt>Ship it</dt><dd>' + (p.shipped_at ? '📦 shipped ' + E(shortDate(p.shipped_at)) : 'not yet') +
        (p.share ? ' · <a href="' + E(p.share) + '" target="_blank" rel="noopener">🔗 open their MakeCode project</a>' : '') +
        (p.shown ? ' · showed the teacher' : '') +
        (p.code ? '<details><summary>💻 Their program</summary><pre class="ship-code">' + E(p.code) + '</pre></details>' : '') +
        (it.extensions.length ? '<br><small>Extensions: ' + (it.extensions.filter(function (e, k) { return (p.ext || {})[k]; }).map(E).join(', ') || 'none yet') + '</small>' : '') +
        it.reflect_q.map(function (q, k) { return '<br><small class="muted">' + E(q) + '</small> <span class="ans">' + E((p.reflect || [])[k] || '—') + '</span>'; }).join('') + '</dd></dl>' +
        '<div class="feedback-form"><label class="field"><span>Feedback (the student sees it in the lesson)</span><textarea rows="2" class="fb-text" data-lesson="' + E(it.id) + '">' +
        E(it.feedback) + '</textarea></label><button class="btn small fb-go" type="button" data-lesson="' + E(it.id) + '">Save feedback</button></div></section>');
    });
    main.innerHTML = h.join('');
    main.querySelector('h1').textContent = s.name;
    d.items.forEach(function (it) {
      var t = document.querySelector('#' + CSS.escape(it.id) + ' [data-text="talk"]');
      if (t) t.textContent = (it.p && it.p.talk) || '—';
    });
    document.querySelectorAll('.fb-go').forEach(function (b) {
      b.addEventListener('click', function () {
        var text = document.querySelector('.fb-text[data-lesson="' + b.dataset.lesson + '"]').value;
        act(b, 'saveFeedback', [s.email, b.dataset.lesson, text], function () { b.disabled = false; flash('Feedback saved.', 'success'); });
      });
    });
    document.getElementById('bgo').addEventListener('click', function () {
      act(this, 'giveBonus', [s.email, document.getElementById('bx').value, document.getElementById('br').value, document.getElementById('bp').checked],
        function (r) { flash('Given! ' + (r.xp ? r.xp + ' XP' : '') + ' It shows up next time ' + s.name + ' opens RoboCode Academy.', 'success'); document.getElementById('bgo').disabled = false; });
    });
  };

  pages.videos = function () {
    var h = ['<h1>Lesson videos</h1><p class="muted">Paste a link for any lesson: YouTube, Google Drive ("Anyone with the link" or your school), Vimeo, or a direct .mp4 link. ' +
      'It appears in the lesson\'s Mission.</p><div class="card" style="padding:18px">'];
    h.push(byGrade(d.course.filter(function (l) { return !l.soon; }), function (list) { return list.map(function (l) {
      return '<label class="field video-field"><span>' + E(l.icon) + ' ' + E(l.number) + '. ' + E(l.title) + '</span><input type="url" class="vid" data-lesson="' + E(l.id) + '" value="' +
        E((d.urls || {})[l.id] || '') + '" placeholder="https://youtu.be/…"></label>';
    }).join(''); }));
    h.push('<button class="btn" id="vid-go" type="button">Save videos</button></div>');
    main.innerHTML = h.join('');
    document.getElementById('vid-go').addEventListener('click', function () {
      var map = {};
      document.querySelectorAll('.vid').forEach(function (i) { if (i.value.trim()) map[i.dataset.lesson] = i.value.trim(); });
      act(this, 'saveVideos', [map], function (r) { flash('Saved ' + r.count + ' video link(s).', 'success'); document.getElementById('vid-go').disabled = false; });
    });
  };

  pages.google = function () {
    var c = d.cls, h = ['<a class="muted small" href="/teacher/classes/' + E(c.id) + '">← ' + E(c.name) + '</a><h1>Send grades to Google Classroom</h1>' +
      '<div class="card"><p>This copies grades for the <b>RoboCode Academy to Google Classroom</b> sender (<code>robocode-classroom.gs</code>, see docs/GOOGLE_CLASSROOM.md). ' +
      'Paste them there to save draft grades.</p><h3>1. Pick lessons</h3>'];
    if (!d.cols.length) h.push('<p class="muted">Assign some lessons first.</p>');
    d.cols.forEach(function (a) { h.push('<label class="check"><input type="checkbox" class="gc-l" value="' + E(a.lesson_id) + '" checked> ' + E(a.number) + '. ' + E(a.title) + '</label>'); });
    h.push('<h3>2. How to score</h3><select id="gc-how"><option value="both">Average of % complete and quiz</option><option value="complete">% complete</option><option value="quiz">Best quiz score</option></select>' +
      '<div class="row"><button class="btn" id="gc-go" type="button">Copy grades</button><span class="save-status small" id="gc-msg"></span></div>' +
      '<textarea id="gc-out" rows="4" readonly hidden aria-label="Grades package"></textarea><p class="muted small">The copied grades include student names. Paste them only into the sender.</p></div>');
    main.innerHTML = h.join('');
    document.getElementById('gc-go').addEventListener('click', function () {
      var ids = Array.prototype.map.call(document.querySelectorAll('.gc-l:checked'), function (x) { return x.value; });
      act(this, 'classroomPackage', [c.id, document.getElementById('gc-how').value, ids], function (pkg) {
        var out = document.getElementById('gc-out'), text = JSON.stringify(pkg);
        out.value = text; out.hidden = false; out.select();
        document.getElementById('gc-go').disabled = false;
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
          function () { document.getElementById('gc-msg').textContent = 'Copied ✓ Paste it into the sender.'; },
          function () { document.getElementById('gc-msg').textContent = 'Select the text below and copy it.'; });
      });
    });
  };

  // ---------------------------------------------------------------- lesson feedback, and the report to paste to Claude
  pages.feedback = function () {
    main.className = 'container wide';
    var R = d.reasons || {}, FACES = ['😣', '😕', '😐', '🙂', '🤩'];
    var reasonText = function (rs) { return Object.keys(rs).sort(function (a, b) { return rs[b] - rs[a]; }).map(function (k) { return (R[k] || k).toLowerCase() + ' ' + rs[k]; }).join(', '); };
    var pct = function (a, b) { return b ? Math.round(100 * a / b) + '%' : '–'; };
    var hasData = function (l) { return l.rated || l.steps.some(function (x) { return x.flags || x.help; }) || l.quiz.some(function (q) { return q.answered || q.flags; }); };
    var hotSteps = function (l) { return l.steps.filter(function (x) { return x.flags || x.help; }).sort(function (a, b) { return (b.flags * 2 + b.help) - (a.flags * 2 + a.help); }); };
    var hotQuiz = function (l) { return l.quiz.filter(function (q) { return q.flags || (q.answered && q.missed / q.answered >= 0.3); }); };

    function markdown(only) {
      var out = ['# RoboCode Academy lesson feedback', '', d.grade_name + ' · ' + d.generated + ' · ' + d.students + ' students in RoboCode Academy · student names removed', '',
        'Please use this to improve the lessons in the RoboCode Academy repository. Each lesson is a YAML file (path given). ' +
        'Steps are numbered the way students see them (Step 1 = the first build step). Quiz "missed" counts first tries only.', ''];
      d.lessons.filter(function (l) { return only ? l.id === only : hasData(l); }).forEach(function (l) {
        out.push('## Lesson ' + l.number + ': ' + l.title, '', 'File: `' + l.file + '`', '');
        out.push('- Students started: ' + l.started + ', finished: ' + l.finished);
        out.push('- Rating: ' + (l.rated ? l.avg + ' / 5 from ' + l.rated + ' students (' + l.ratings.map(function (c, i) { return (i + 1) + '★ ' + c; }).join(', ') + ')' : 'no ratings yet'), '');
        var hs = hotSteps(l);
        if (hs.length) {
          out.push('### Build steps students found confusing or needed help with', '', '| Step | Title | Confusing flags | Reasons | Help requests |', '|---|---|---|---|---|');
          hs.forEach(function (x) { out.push('| ' + x.n + ' | ' + x.title + ' | ' + x.flags + ' | ' + (reasonText(x.reasons) || '–') + ' | ' + x.help + ' |'); });
          out.push('');
          hs.filter(function (x) { return x.notes.length; }).forEach(function (x) { x.notes.forEach(function (n) { out.push('- Step ' + x.n + ': "' + n + '"'); }); });
          if (hs.some(function (x) { return x.notes.length; })) out.push('');
        }
        var hq = l.quiz.filter(function (q) { return q.answered || q.flags; });
        if (hq.length) {
          out.push('### Quiz', '', '| Q | Question | Missed on first try | Confusing flags |', '|---|---|---|---|');
          hq.forEach(function (q) { out.push('| ' + q.n + ' | ' + q.question.replace(/\|/g, '/') + ' | ' + pct(q.missed, q.answered) + ' (' + q.missed + '/' + q.answered + ') | ' + q.flags + (q.flags ? ' (' + reasonText(q.reasons) + ')' : '') + ' |'); });
          out.push('');
          hq.forEach(function (q) { q.notes.forEach(function (n) { out.push('- Q' + q.n + ': "' + n + '"'); }); });
          if (hq.some(function (q) { return q.notes.length; })) out.push('');
        }
        if (l.hardest.length) { out.push('### "What was the hardest part?"', ''); l.hardest.forEach(function (t) { out.push('- ' + t.replace(/\s+/g, ' ')); }); out.push(''); }
        if (l.change.length) { out.push('### "What would make this lesson better?"', ''); l.change.forEach(function (t) { out.push('- ' + t.replace(/\s+/g, ' ')); }); out.push(''); }
      });
      return out.join('\n');
    }

    var h = ['<div class="page-head"><div><h1>Lesson feedback</h1><p class="muted">What students flagged as confusing, how they rated each lesson, ' +
      'and which quiz questions they missed on the first try. No names are shown or copied.</p><p class="row">' +
      (d.grades || []).map(function (g) { return '<a class="btn small' + (g.id === d.grade ? '' : ' ghost') + '" href="/teacher/feedback/' + E(g.id) + '">' + E(g.name) + '</a>'; }).join(' ') +
      '</p></div><div class="row"><button class="btn go" id="fb-copy" type="button">📋 Copy report for Claude</button>' +
      '<button class="btn ghost" id="fb-dl" type="button">⬇ Download .md</button></div></div>' +
      '<p class="muted small">Paste the report into Claude and ask it to improve the lessons. Student notes are copied as they typed them, so skim them for names first.</p>'];
    var any = false;
    d.lessons.forEach(function (l) {
      if (!hasData(l)) return;
      any = true;
      var hs = hotSteps(l).slice(0, 5), hq = hotQuiz(l);
      h.push('<section class="card fb-card"><div class="fb-head"><h2>' + E(l.number) + '. ' + E(l.title) + '</h2><span class="fb-stars">' +
        (l.rated ? FACES[Math.max(0, Math.round(l.avg) - 1)] + ' <b>' + l.avg + '</b> / 5 <small class="muted">(' + l.rated + ')</small>' : '<small class="muted">no ratings yet</small>') +
        '</span><button class="btn small ghost fb-one" type="button" data-id="' + E(l.id) + '">📋 Copy this lesson</button></div>' +
        '<p class="muted small">' + l.started + ' started · ' + l.finished + ' finished</p><div class="grid-2">');
      h.push('<div><h3>🤔 Confusing steps</h3>' + (hs.length ? '<ul class="fb-list">' + hs.map(function (x) {
        return '<li><b>Step ' + x.n + ':</b> ' + E(x.title) + ' <span class="fb-n">' + (x.flags ? x.flags + ' 🤔' : '') + (x.help ? ' ' + x.help + ' ✋' : '') + '</span>' +
          (x.flags ? '<small>' + E(reasonText(x.reasons)) + '</small>' : '') + x.notes.slice(0, 3).map(function (n) { return '<q>' + E(n) + '</q>'; }).join('') + '</li>';
      }).join('') + '</ul>' : '<p class="muted small">Nothing flagged.</p>') + '</div>');
      h.push('<div><h3>🧠 Quiz trouble</h3>' + (hq.length ? '<ul class="fb-list">' + hq.map(function (q) {
        return '<li><b>Q' + q.n + ':</b> ' + E(q.question) + ' <span class="fb-n">' + pct(q.missed, q.answered) + ' missed</span>' + (q.flags ? '<small>' + q.flags + ' 🤔 ' + E(reasonText(q.reasons)) + '</small>' : '') + '</li>';
      }).join('') + '</ul>' : '<p class="muted small">No question missed by 30% or more.</p>') + '</div></div>');
      var words = l.hardest.slice(0, 3).map(function (t) { return '<q>' + E(t) + '</q>'; }).concat(l.change.slice(0, 3).map(function (t) { return '<q class="change">' + E(t) + '</q>'; }));
      if (words.length) h.push('<h3>💬 In their words</h3><div class="fb-quotes">' + words.join('') + '</div>');
      h.push('</section>');
    });
    if (!any) h.push('<section class="card"><p class="muted">No feedback yet for this grade. Students flag confusing steps with 🤔 and rate each lesson at the end.</p></section>');
    main.innerHTML = h.join('');
    var copyText = function (text, btn) {
      var done = function () { var t = btn.textContent; btn.textContent = '✓ Copied'; setTimeout(function () { btn.textContent = t; }, 1600); };
      var fallback = function () { var ta = document.body.appendChild(document.createElement('textarea')); ta.value = text; ta.select(); try { document.execCommand('copy'); done(); } catch (e) { /* select it */ } ta.remove(); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    };
    document.getElementById('fb-copy').addEventListener('click', function () { copyText(markdown(), this); });
    document.querySelectorAll('.fb-one').forEach(function (b) { b.addEventListener('click', function () { copyText(markdown(b.dataset.id), b); }); });
    document.getElementById('fb-dl').addEventListener('click', function () {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([markdown()], { type: 'text/markdown' }));
      a.download = 'maker-lab-feedback-' + d.grade + '-' + d.generated + '.md';
      document.body.appendChild(a); a.click(); a.remove();
    });
  };

  pages.standards = function () {
    var h = ['<h1>MA DLCS standards</h1><p class="muted">What each lesson covers, and how.</p>'];
    h.push(byGrade(d.lessons, function (list) { return list.map(function (l) {
      return '<section class="card" style="padding:16px;margin-bottom:14px"><h3>' + E(l.number) + '. ' + E(l.title) + '</h3><ul>' +
        l.standards.map(function (st) { return '<li><b>' + E(st.code) + '</b> ' + E(st.text) + '<br><small class="muted">In this lesson: ' + E(st.how) + '</small></li>'; }).join('') + '</ul></section>';
    }).join(''); }));
    main.innerHTML = h.join('');
  };

  // ---------------------------------------------------------------- class display (projector)
  // The Circuit City Leaderboard: a projector page for arena days
  pages.board = function () {
    var b = d.board, cid = b.cls.id, busy = false;
    var ORD = ['1st', '2nd', '3rd', '4th', '5th'];
    var card = function (e, extra) {
      return '<span class="bd-team">' + (e.team ? crest(e.team, 54) : '<span class="bd-solo">🤖</span>') + '<span class="bd-team-name">' + E(e.name) + '</span>' + (extra || '') + '</span>';
    };
    var slot = function (e, round, match, won, clickable) {
      if (!e) return '<span class="bd-slot empty"></span>';
      return '<button type="button" class="bd-slot' + (won ? ' won' : '') + '"' + (clickable ? ' data-win="' + round + ':' + match + ':' + E(e.key) + '" title="Click the winner"' : ' disabled') + '>' +
        (e.team ? crest(e.team, 26) : '') + '<span>' + E(e.name) + '</span></button>';
    };
    var match = function (a, c, round, m, winner) {
      var both = !!(a && c);
      return '<div class="bd-match">' + slot(a, round, m, a && winner && winner.key === a.key, both) + slot(c, round, m, c && winner && winner.key === c.key, both) + '</div>';
    };
    var draw = function () {
      var ev = b.event, h = [];
      h.push('<div class="bd"><header class="bd-head"><h1>Circuit City Leaderboard</h1><div class="bd-tools">' +
        '<select id="bd-event" aria-label="Challenge">' + b.events.map(function (e) { return '<option value="' + E(e.id) + '"' + (ev && e.id === ev.id ? ' selected' : '') + '>' + E(e.icon + ' ' + e.name) + (e.scored ? ' ✓' : '') + '</option>'; }).join('') + '</select>' +
        '<button type="button" class="btn small ghost" id="bd-full">⛶ Full screen</button><a class="btn small ghost" href="/teacher/classes/' + E(cid) + '">Exit</a></div></header>');
      if (!ev) { main.innerHTML = h.join('') + '<p class="bd-empty">This course has no arena challenges.</p></div>'; return; }
      h.push('<section class="bd-top"><div class="bd-box"><h2>Today\'s challenge:</h2><div class="bd-white"><b>' + E(ev.icon + ' ' + ev.name) + '</b><span>' + E(ev.blurb) + '</span>' +
        '<small>' + E(b.cls.name) + ' · ' + (ev.kind === 'code' ? 'coded, no driver' : 'driver control') + '</small></div></div>' +
        '<div class="bd-box"><h2>Scoring method:</h2><div class="bd-white bd-guide">' + ev.guide.map(function (g) { return '<span><i>' + E(g[0]) + '</i><b>' + (g[1] > 0 ? '+' : '') + g[1] + '</b></span>'; }).join('') + '</div></div></section>');
      // places 1st to 5th (ties share a row), then The Pack
      var rows = [[], [], [], [], []], pack = [];
      b.results.forEach(function (r) { if (r.place <= 5) rows[r.place - 1].push(r); else pack.push(r); });
      h.push('<section class="bd-main"><div class="bd-left"><div class="bd-places">');
      rows.forEach(function (list, i) {
        h.push('<div class="bd-place p' + (i + 1) + '"><span class="bd-medal">' + ORD[i] + '</span><div class="bd-row">' +
          (list.length ? list.map(function (r) { return card(r, '<b class="bd-score">' + r.score + '</b>'); }).join('') : '<span class="bd-team blank"></span>') + '</div></div>');
      });
      h.push('</div><div class="bd-pack"><h3>The Pack</h3><div class="bd-pack-list">' +
        (pack.length || b.unscored.length ? pack.map(function (r) { return '<span class="bd-chip">' + (r.team ? crest(r.team, 22) : '') + E(r.name) + ' <b>' + r.score + '</b></span>'; }).join('') +
          b.unscored.map(function (e) { return '<span class="bd-chip waiting">' + (e.team ? crest(e.team, 22) : '') + E(e.name) + '</span>'; }).join('')
          : '<span class="bd-note">Everyone is on the board!</span>') + '</div></div></div>');
      // the bracket: left side, the final, right side
      var br = b.bracket;
      h.push('<div class="bd-right"><div class="bd-bracket"><h2>Single elimination tournament bracket</h2>');
      if (br) {
        var s = br.slots, w1 = br.w1, w2 = br.w2;
        h.push('<div class="bd-tree"><div class="bd-col">' + match(s[0], s[1], 1, 0, w1[0]) + match(s[2], s[3], 1, 1, w1[1]) + '</div>' +
          '<div class="bd-col semi">' + match(w1[0], w1[1], 2, 0, w2[0]) + '</div>' +
          '<div class="bd-col final"><span class="bd-final-label">Final</span>' + match(w2[0], w2[1], 3, 0, br.champ) + '</div>' +
          '<div class="bd-col semi">' + match(w1[2], w1[3], 2, 1, w2[1]) + '</div>' +
          '<div class="bd-col">' + match(s[4], s[5], 1, 2, w1[2]) + match(s[6], s[7], 1, 3, w1[3]) + '</div></div>' +
          '<p class="bd-controls"><span class="bd-note">Click the winner of each match.</span> <button type="button" class="linklike" data-seed="scores">Re-seed from scores</button> · ' +
          '<button type="button" class="linklike" data-seed="random">Random draw</button> · <button type="button" class="linklike" id="bd-clear">Clear</button></p>');
      } else {
        h.push('<div class="bd-setup"><p>' + (b.entrants < 2 ? 'A bracket needs at least 2 teams. Students make teams on their Arena page.'
          : 'Set up a bracket for up to 8 teams. With more than 8, the top 8 by score play.') + '</p>' +
          (b.entrants < 2 ? '' : '<p><button type="button" class="btn go" data-seed="scores">Seed from scores</button> <button type="button" class="btn ghost" data-seed="random">Random draw</button></p>') + '</div>');
      }
      var champ = br && br.champ, f1 = br && br.w2[0], f2 = br && br.w2[1];
      h.push('</div><div class="bd-box bd-champ"><h2>Championship match:</h2><div class="bd-white">' +
        (champ ? '<span class="bd-winner">🏆 ' + (champ.team ? crest(champ.team, 64) : '') + '<b>' + E(champ.name) + '</b><small>Champions!</small></span>'
          : f1 && f2 ? '<span class="bd-versus">' + card(f1) + '<i>vs</i>' + card(f2) + '</span>'
            : '<span class="bd-note dark">' + (br ? 'Waiting for the finalists…' : 'Set up the bracket to play for the championship.') + '</span>') + '</div></div></div></section>');
      h.push('<p class="bd-msg bad" id="bd-msg" role="status"></p></div>');
      main.innerHTML = h.join('');
      var $ = function (id) { return document.getElementById(id); };
      var go = function (action, payload, eventId) {
        if (busy) return;
        busy = true;
        ML.run('arenaBracket', cid, eventId || ev.id, action, payload || {}).then(function (r) { busy = false; b = r; draw(); })
          .catch(function (e) { busy = false; $('bd-msg').textContent = (e && e.message) || 'Something went wrong.'; });
      };
      $('bd-event').addEventListener('change', function () { go('event', {}, this.value); });
      $('bd-full').addEventListener('click', function () { var el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) el.requestFullscreen().catch(function () {}); });
      document.querySelectorAll('[data-seed]').forEach(function (x) { x.addEventListener('click', function () {
        if (!b.bracket || confirm('Start the bracket over?')) go('seed', { mode: x.dataset.seed });
      }); });
      if ($('bd-clear')) $('bd-clear').addEventListener('click', function () { if (confirm('Clear the bracket?')) go('clear'); });
      document.querySelectorAll('[data-win]').forEach(function (x) { x.addEventListener('click', function () {
        var p = x.dataset.win.split(':');
        go('win', { round: +p[0], match: +p[1], key: p.slice(2).join(':') });
      }); });
    };
    draw();
    // new scores typed on the class page show up by themselves (not from a background tab)
    setInterval(function () {
      if (document.hidden || busy) return;
      ML.run('arenaBoard', cid, b.event ? b.event.id : '').then(function (r) { if (!busy) { b = r; draw(); } }).catch(function () {});
    }, 30000);
  };

  pages.screen = function () {
    main.innerHTML = '<div id="screen-root"></div>';
    var id = d.cls.id;
    window.ClassScreen.start({
      classId: id, className: d.cls.name, backHref: '/teacher/classes/' + id, units: d.units, refreshMs: 20000,
      load: function () { return ML.run('screenData', id); },
      save: function (body) { return ML.run('screenSave', id, body); },
      arcade: function (action, minutes) { return ML.run('arcadeClass', id, action, minutes); },
      help: function () { return ML.run('helpList', id); },
      helped: function (who) { return ML.run('helpResolve', id, who); },
    });
  };

  window.MLStart = function () {
    if (pages[ML.page]) pages[ML.page]();
    if (window.RobotAvatar) window.RobotAvatar.renderAll();
    if (window.Visuals) window.Visuals.renderAll();
    ML.fixLinks(document);
  };
})();
