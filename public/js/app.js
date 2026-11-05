/* RoboCode Academy – single page app */
(function () {
  const $app = document.getElementById('app'), $nav = document.getElementById('nav');
  let ME = null, MYCLASS = null;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const UNIT_NAMES = { 1: 'Meet Your Robot', 2: 'C++ Foundations', 3: 'Algorithms', 4: 'Artificial Intelligence', 5: 'Capstone' };
  const UNIT_ICONS = { 1: '🔧', 2: '💻', 3: '🧩', 4: '🧠', 5: '🏆' };
  const KIND = { warmup: ['⚡', 'Warm-up'], learn: ['📘', 'Learn'], build: ['🔧', 'Build'], activity: ['🎯', 'Activity'], unplugged: ['✂️', 'Unplugged'], code: ['💻', 'Code'], wrapup: ['✅', 'Wrap-up'] };

  async function api(url, opts = {}) {
    const r = await fetch(url, { method: opts.method || (opts.body ? 'POST' : 'GET'), headers: opts.body ? { 'Content-Type': 'application/json' } : {}, body: opts.body ? JSON.stringify(opts.body) : undefined });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  }
  function toast(t) { const el = document.getElementById('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2600); }
  function modal(html) {
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal">${html}</div>`;
    bg.addEventListener('click', e => { if (e.target === bg) bg.remove(); });
    document.body.append(bg); return bg;
  }
  const tags = t => (t || []).map(x => `<span class="tag ${esc(x)}">${esc(x)}</span>`).join(' ');

  // ---------------------------------------------------------------- nav + router
  function renderNav() {
    if (!ME) { $nav.innerHTML = `<a href="#/">Log in</a><a href="#/join">Join a class</a>`; return; }
    const links = ME.role === 'teacher'
      ? `<a href="#/teacher">Classes</a><a href="#/teacher/lessons">Lessons</a><a href="#/playground">Code Lab</a>`
      : `<a href="#/">My Course</a><a href="#/playground">Code Lab</a>`;
    $nav.innerHTML = `${links}<span class="who">${esc(ME.name)}${ME.role === 'teacher' ? ' (teacher)' : ''}</span><button id="logout">Log out</button>`;
    document.getElementById('logout').onclick = async () => { await api('/api/logout', { body: {} }); ME = null; location.hash = '#/'; boot(); };
    const h = location.hash || '#/';
    $nav.querySelectorAll('a').forEach(a => a.classList.toggle('active', h === a.getAttribute('href')));
  }
  let cleanup = null;
  async function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    const h = (location.hash || '#/').slice(1); const parts = h.split('/').filter(Boolean);
    renderNav(); window.scrollTo(0, 0);
    try {
      if (!ME) {
        if (parts[0] === 'join') return authPage('student');
        if (parts[0] === 'teacher-signup') return authPage('teacher');
        return authPage('login');
      }
      if (parts[0] === 'lesson') return lessonPage(parts[1]);
      if (parts[0] === 'playground') return playground();
      if (ME.role === 'teacher') {
        if (parts[0] === 'teacher' && parts[1] === 'class') return classPage(parts[2]);
        if (parts[0] === 'teacher' && parts[1] === 'lessons') return lessonsAdmin();
        return teacherHome();
      }
      return studentHome();
    } catch (e) { $app.innerHTML = `<div class="panel"><h2>Oops</h2><p>${esc(e.message)}</p><a class="btn" href="#/">Back home</a></div>`; }
  }
  window.addEventListener('hashchange', route);
  async function boot() { const r = await api('/api/me'); ME = r.user; MYCLASS = r.class || null; route(); }

  // ---------------------------------------------------------------- auth
  function authPage(mode) {
    $app.innerHTML = `
    <section class="hero">
      <div>
        <span class="tag ai">Grade 8 · VEX IQ · C++</span>
        <h1>Code real robots.<br>Think like an engineer.<br>Build smarter machines.</h1>
        <p class="lead">25 hands-on lessons that take you from your first <code>Brain.Screen.print</code> to robots that search, sort, find paths and <b>learn</b> — in a C++ editor with a built-in robot simulator.</p>
      </div>
      <div class="hero-art"><span class="c">// Your robot, your rules</span>
<span class="k">int</span> main() {
  <span class="k">while</span> (DistanceSensor.objectDistance(inches) &gt; <span class="s">6</span>) {
    Drivetrain.drive(forward);
  }
  Drivetrain.stop();
  Brain.Screen.print(<span class="s">"Mission complete!"</span>);
}</div>
    </section>
    <div class="pillars">
      <div class="pillar"><div class="ico">🔧</div><b>Build</b><p class="small muted">Construct and configure a VEX IQ robot with your team.</p></div>
      <div class="pillar"><div class="ico">💻</div><b>Code</b><p class="small muted">Write real C++ and test it instantly in the simulator.</p></div>
      <div class="pillar"><div class="ico">🧩</div><b>Algorithms</b><p class="small muted">Line following, search, sorting, pathfinding, control.</p></div>
      <div class="pillar"><div class="ico">🧠</div><b>AI</b><p class="small muted">Decision trees, state machines, machine learning & ethics.</p></div>
    </div>
    <div class="auth-wrap panel">
      <div class="tabs"><button data-m="login">Log in</button><button data-m="student">Join a class</button><button data-m="teacher">Teacher sign-up</button></div>
      <div class="err" id="err"></div>
      <form id="f"></form>
    </div>`;
    const forms = {
      login: `<label class="f">Username<input name="username" autocomplete="username" required></label>
              <label class="f">Password<input name="password" type="password" autocomplete="current-password" required></label>
              <button class="btn primary" style="width:100%">Log in</button>`,
      student: `<label class="f">Class code <span class="muted small">(6 letters from your teacher)</span><input name="classCode" maxlength="6" style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--mono)" required></label>
              <label class="f">Your name <span class="muted small">(first name + last initial)</span><input name="name" required></label>
              <label class="f">Pick a username<input name="username" autocomplete="username" required></label>
              <label class="f">Pick a password<input name="password" type="password" autocomplete="new-password" required></label>
              <button class="btn primary" style="width:100%">Enroll 🚀</button>`,
      teacher: `<label class="f">Teacher code <span class="muted small">(shown when the server starts)</span><input name="teacherCode" required></label>
              <label class="f">Your name<input name="name" placeholder="Mr. Perkins" required></label>
              <label class="f">Username<input name="username" required></label>
              <label class="f">Password<input name="password" type="password" required></label>
              <button class="btn primary" style="width:100%">Create teacher account</button>`
    };
    const show = m => {
      mode = m; document.getElementById('f').innerHTML = forms[m]; document.getElementById('err').textContent = '';
      document.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.m === m));
    };
    document.querySelectorAll('.tabs button').forEach(b => b.onclick = () => show(b.dataset.m));
    document.getElementById('f').onsubmit = async e => {
      e.preventDefault(); const body = Object.fromEntries(new FormData(e.target));
      try {
        const url = mode === 'login' ? '/api/login' : mode === 'student' ? '/api/register/student' : '/api/register/teacher';
        await api(url, { body }); location.hash = '#/'; boot();
      } catch (err) { document.getElementById('err').textContent = err.message; }
    };
    show(mode);
  }

  // ---------------------------------------------------------------- student home
  async function studentHome() {
    const { lessons } = await api('/api/lessons');
    const done = lessons.filter(l => l.status === 'complete').length;
    const quizPts = lessons.reduce((s, l) => s + (l.quizScore ? +l.quizScore.split('/')[0] : 0), 0);
    const xp = done * 50 + quizPts * 10;
    const level = Math.floor(xp / 250) + 1;
    const next = lessons.find(l => l.unlocked && l.status !== 'complete');
    const units = [...new Set(lessons.map(l => l.unit))];
    const unitDone = u => lessons.filter(l => l.unit === u).every(l => l.status === 'complete');
    const BADGES = [
      ['🔧', 'Robot Builder', unitDone(1)], ['💻', 'C++ Coder', unitDone(2)], ['🧩', 'Algorithm Ace', unitDone(3)],
      ['🧠', 'AI Engineer', unitDone(4)], ['🏆', 'Capstone Champion', unitDone(5)], ['⭐', 'First Lesson', done >= 1], ['🔥', '10 Lessons', done >= 10]
    ];
    $app.innerHTML = `
      <div class="row" style="margin-bottom:16px"><div><h1>Hi, ${esc(ME.name.split(' ')[0])}! 👋</h1><p class="muted" style="margin:0">${esc(MYCLASS?.name || '')}</p></div><div class="spacer"></div>
        ${next ? `<a class="btn primary" href="#/lesson/${next.id}">${next.status === 'started' ? 'Continue' : 'Start'}: ${esc(next.title)} →</a>` : ''}</div>
      <div class="stats">
        <div class="stat"><span class="muted small">Lessons complete</span><b>${done} / ${lessons.length}</b><div class="bar"><i style="width:${100 * done / lessons.length}%"></i></div></div>
        <div class="stat"><span class="muted small">Robot XP</span><b>${xp} XP</b><span class="small muted">Level ${level} · ${250 - (xp % 250)} XP to next level</span></div>
        <div class="stat"><span class="muted small">Quiz points</span><b>${quizPts}</b></div>
        <div class="stat"><span class="muted small">Badges</span><b>${BADGES.filter(b => b[2]).length} / ${BADGES.length}</b></div>
      </div>
      <div class="badges">${BADGES.map(([i, n, on]) => `<span class="badge ${on ? '' : 'off'}">${i} ${n}</span>`).join('')}</div>
      ${units.map(u => `
        <section class="unit">
          <div class="unit-head"><h2>${UNIT_ICONS[u] || '📦'} Unit ${u}: ${UNIT_NAMES[u] || ''}</h2><span class="muted small">${lessons.filter(l => l.unit === u && l.status === 'complete').length}/${lessons.filter(l => l.unit === u).length} done</span></div>
          <div class="cards">${lessons.filter(l => l.unit === u).map(card).join('')}</div>
        </section>`).join('')}`;
  }
  function card(l) {
    const icon = !l.unlocked ? '🔒' : l.status === 'complete' ? '✅' : l.status === 'started' ? '🟡' : '';
    return `<a class="lcard ${l.unlocked ? '' : 'locked'} ${l.status}" href="#/lesson/${l.id}">
      <span class="status">${icon}</span><span class="num">LESSON ${l.order} · ${l.minutes} MIN</span>
      <h3>${esc(l.title)}</h3><p>${esc(l.summary)}</p><div>${tags(l.tags)}</div>
      ${l.quizScore ? `<span class="small muted">Quiz: ${l.quizScore}</span>` : ''}</a>`;
  }

  // ---------------------------------------------------------------- lesson page
  function videoEmbed(url) {
    if (!url) return '';
    let src = url, m;
    if ((m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/))) src = `https://www.youtube-nocookie.com/embed/${m[1]}`;
    else if ((m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/))) src = `https://drive.google.com/file/d/${m[1]}/preview`;
    else if ((m = url.match(/vimeo\.com\/(\d+)/))) src = `https://player.vimeo.com/video/${m[1]}`;
    else if (!/^https:\/\//.test(url)) return '';
    return `<div class="video-wrap"><iframe src="${esc(src)}" allowfullscreen allow="encrypted-media; picture-in-picture"></iframe></div>`;
  }

  async function lessonPage(id) {
    const { lesson: L, progress: P, prev, next } = await api('/api/lessons/' + id);
    const teacher = ME.role === 'teacher';
    const secs = L.sections || [];
    $app.innerHTML = `
      <div class="lesson-head">
        <div style="flex:1;min-width:260px">
          <a href="${teacher ? '#/teacher/lessons' : '#/'}" class="small">← ${teacher ? 'All lessons' : 'My course'}</a>
          <div class="muted small" style="margin-top:8px">UNIT ${L.unit} · ${esc(UNIT_NAMES[L.unit] || '')} · LESSON ${L.order} · ⏱ ${L.minutes} min</div>
          <h1>${esc(L.title)}</h1><div>${tags(L.tags)}</div>
        </div>
        <div class="row">${prev ? `<a class="btn sm" href="#/lesson/${prev}">← Prev</a>` : ''}${next ? `<a class="btn sm" href="#/lesson/${next}">Next →</a>` : ''}</div>
      </div>
      <div class="lesson-layout">
        <aside class="toc">
          <a href="#" data-jump="goals"><span>🎯 Goals</span></a>
          ${L.video ? `<a href="#" data-jump="video"><span>🎬 Video</span></a>` : ''}
          ${secs.map((s, i) => `<a href="#" data-jump="s${i}"><span>${(KIND[s.kind] || ['•'])[0]} ${esc(s.title)}</span><span class="min">${s.minutes || ''}′</span></a>`).join('')}
          ${L.challenge ? `<a href="#" data-jump="challenge"><span>🤖 Code Challenge</span></a>` : ''}
          <a href="#" data-jump="quiz"><span>📝 Exit Ticket</span></a>
          <div class="timer"><span class="small">Class timer</span><b id="tmr">${String(L.minutes).padStart(2, '0')}:00</b><button class="btn sm" id="tmrb" style="margin-top:6px">Start</button></div>
        </aside>
        <div>
          ${teacher && L.teacherNote ? `<div class="callout warn"><b>Teacher note:</b> ${esc(L.teacherNote)}</div>` : ''}
          ${P?.feedback ? `<div class="feedback sec"><b>💬 Feedback from your teacher</b>${P.grade != null ? ` · Grade: <b>${P.grade}</b>` : ''}<p style="margin:6px 0 0">${esc(P.feedback)}</p></div>` : ''}
          <div class="panel sec" id="goals">
            <div class="sec-kind">🎯 Overview</div>
            <p style="margin-top:0;font-size:1.05rem">${esc(L.summary)}</p>
            <h3>🎯 Learning goals</h3><ul>${(L.objectives || []).map(o => `<li>${esc(o)}</li>`).join('')}</ul>
            ${L.materials?.length ? `<h3>🧰 You'll need</h3><p>${L.materials.map(esc).join(' · ')}</p>` : ''}
            ${L.vocab?.length ? `<h3>📖 Vocabulary</h3><div class="vocab">${L.vocab.map(v => `<div><b>${esc(v.term)}</b>${esc(v.def)}</div>`).join('')}</div>` : ''}
          </div>
          ${L.video ? `<div class="panel sec" id="video"><div class="sec-kind">🎬 Watch</div>${videoEmbed(L.video)}</div>` : ''}
          ${secs.map((s, i) => `<div class="panel sec ${esc(s.kind)}" id="s${i}"><div class="sec-kind">${(KIND[s.kind] || ['•', s.kind]).join(' ')} <span class="m">· ${s.minutes || '?'} min</span></div><h2>${esc(s.title)}</h2><div class="body">${s.html}</div></div>`).join('')}
          ${L.challenge ? `<div class="panel sec code" id="challenge"><div class="sec-kind">🤖 Code Challenge</div><h2>${esc(L.challenge.title)}</h2><div class="body">${L.challenge.prompt}</div>
              <div class="hints">${(L.challenge.hints || []).map((h, i) => `<details><summary>💡 Hint ${i + 1}</summary>${esc(h)}</details>`).join('')}</div>
              ${teacher && L.challenge.solution ? `<details class="callout warn"><summary><b>👩‍🏫 Reference solution (teachers only)</b></summary><pre class="code">${esc(L.challenge.solution)}</pre></details>` : ''}
              <div id="ide"></div></div>` : ''}
          <div class="panel sec wrapup" id="quiz"><div class="sec-kind">📝 Exit Ticket</div><h2>Check your understanding</h2><div id="quizbox"></div></div>
          <div class="row">${prev ? `<a class="btn" href="#/lesson/${prev}">← Previous lesson</a>` : ''}<div class="spacer"></div>${next ? `<a class="btn primary" href="#/lesson/${next}">Next lesson →</a>` : ''}</div>
        </div>
      </div>`;
    $app.querySelectorAll('[data-jump]').forEach(a => a.onclick = e => { e.preventDefault(); document.getElementById(a.dataset.jump).scrollIntoView({ behavior: 'smooth' }); });
    window.mountWidgets($app);
    // class timer
    let left = L.minutes * 60, int = null; const tm = document.getElementById('tmr'), tb = document.getElementById('tmrb');
    tb.onclick = () => {
      if (int) { clearInterval(int); int = null; tb.textContent = 'Resume'; return; }
      tb.textContent = 'Pause';
      int = setInterval(() => { left = Math.max(0, left - 1); tm.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`; if (!left) { clearInterval(int); tm.textContent = "⏰ 00:00"; } }, 1000);
    };
    let ide = null;
    if (L.challenge) {
      const ck = 'draft:' + ME.id + ':' + L.id;
      let saved = P?.draft; try { saved = saved || localStorage.getItem(ck); } catch (e) {}
      ide = createIDE(document.getElementById('ide'), {
        code: saved || L.challenge.starterCode, starter: L.challenge.starterCode, field: L.challenge.field, checks: L.challenge.checks,
        submitLabel: teacher ? 'Check (preview)' : 'Check & Submit',
        onChange: teacher ? null : code => { try { localStorage.setItem(ck, code); } catch (e) {} clearTimeout(ide._d); ide._d = setTimeout(() => api(`/api/lessons/${L.id}/draft`, { body: { code } }).catch(() => {}), 2500); },
        onSubmit: teacher ? null : async (code, checks, output) => {
          await api(`/api/lessons/${L.id}/submit`, { body: { code, checks, output } });
          toast(checks.every(c => c.pass) ? '🎉 Challenge passed and submitted!' : '📤 Submitted — keep improving and resubmit anytime.');
        }
      });
      if (P?.challenge) ide.note(P.challenge.passed ? '✅ You already passed this challenge. You can keep experimenting and resubmit.' : `Last submission: ${P.challenge.passCount}/${P.challenge.total} checks passed.`);
      cleanup = () => ide.destroy();
    }
    renderQuiz(L, P, teacher);
  }

  function renderQuiz(L, P, teacher) {
    const box = document.getElementById('quizbox'); const done = !!P?.quiz && !teacher;
    const quiz = L.quiz || [];
    box.innerHTML = `
      ${done ? `<div class="msg good" style="margin-bottom:12px">You scored <b>${P.quiz.score}/${P.quiz.total}</b>${P.quizAttempts > 1 ? ` (attempt ${P.quizAttempts})` : ''}. ${P.quiz.score < P.quiz.total ? 'Review the explanations below — you can retake it.' : 'Perfect! 🌟'}</div>` : ''}
      <form id="qf">
        ${quiz.map((q, i) => `<div class="q"><b>${i + 1}. ${esc(q.q)}</b><div class="opts">
          ${q.choices.map((c, j) => {
            const picked = done && Number(P.quiz.answers[i]) === j; const cls = (done || teacher) && q.answer !== undefined ? (j === q.answer ? (done || teacher ? 'right' : '') : picked ? 'wrong' : '') : '';
            return `<label class="${done || teacher ? cls : ''}"><input type="radio" name="q${i}" value="${j}" ${picked ? 'checked' : ''} required> <span>${esc(c)}</span></label>`;
          }).join('')}</div>
          ${(done || teacher) && q.explain ? `<div class="explain">💡 ${esc(q.explain)}</div>` : ''}</div>`).join('')}
        ${L.reflection ? `<label class="f">✍️ Reflection: ${esc(L.reflection)}<textarea name="reflection" rows="3" required>${esc(P?.reflection || '')}</textarea></label>` : ''}
        ${teacher ? '<p class="muted small">Teacher preview — correct answers are highlighted.</p>' : `<button class="btn primary">${done ? 'Retake & resubmit' : 'Submit exit ticket'}</button>`}
        ${!teacher && L.challenge && !P?.challenge ? '<p class="muted small">Remember to <b>Check & Submit</b> the code challenge too — both are needed to complete the lesson.</p>' : ''}
      </form>`;
    if (teacher) return;
    box.querySelector('#qf').onsubmit = async e => {
      e.preventDefault(); const fd = new FormData(e.target);
      const answers = quiz.map((_, i) => Number(fd.get('q' + i)));
      try {
        const r = await api(`/api/lessons/${L.id}/quiz`, { body: { answers, reflection: fd.get('reflection') || '' } });
        toast(`Exit ticket: ${r.progress.quiz.score}/${r.progress.quiz.total}`); renderQuiz(r.lesson, r.progress, false);
      } catch (err) { toast(err.message); }
    };
  }

  // ---------------------------------------------------------------- IDE
  const API_REF = `
  <details><summary>🚗 Drivetrain</summary><pre class="code">Drivetrain.driveFor(forward, 12, inches);   // reverse, mm
Drivetrain.turnFor(right, 90, degrees);     // left
Drivetrain.drive(forward);   Drivetrain.turn(right);   Drivetrain.stop();
Drivetrain.setDriveVelocity(50, percent);   Drivetrain.setTurnVelocity(50, percent);
Drivetrain.turnToHeading(90, degrees);      Drivetrain.heading(degrees);</pre></details>
  <details><summary>📡 Sensors</summary><pre class="code">DistanceSensor.objectDistance(inches)   // how far is the wall in front?
DistanceSensor.isObjectDetected()
BumperA.pressing()                      // true when the front bumper is touching
Optical.color() == red                  // red green blue yellow black white ...
Optical.brightness()                    // 0-100  (black ≈ 5, white ≈ 90)
BrainInertial.heading(degrees)          Brain.Timer.time(seconds)</pre></details>
  <details><summary>🖥️ Brain screen & output</summary><pre class="code">Brain.Screen.print("Score: %d", score);  Brain.Screen.newLine();
Brain.Screen.clearScreen();             Brain.Screen.setCursor(1, 1);
std::cout &lt;&lt; "x = " &lt;&lt; x &lt;&lt; std::endl;
wait(1, seconds);   wait(200, msec);
TouchLED.setColor(green);</pre></details>
  <details><summary>🦾 Claw & arm</summary><pre class="code">ClawMotor.spinFor(forward, 90, degrees);  // close: grabs a cube right in front
ClawMotor.spinFor(reverse, 90, degrees);  // open: drops it
ArmMotor.spinFor(forward, 180, degrees);</pre></details>
  <details><summary>🧮 C++ you can use</summary><pre class="code">int double bool string char  · arrays: int a[5] = {1,2,3,4,5};
std::vector&lt;int&gt; v;  v.push_back(4);  v.size();
if / else if / else · while · for · do-while · switch · functions
abs sqrt pow min max round  rand()  to_string(x)</pre></details>`;

  function createIDE(host, opts) {
    host.innerHTML = `
      <div class="ide-bar">
        <button class="btn go" data-a="run">▶ Run</button><button class="btn stop" data-a="stop" disabled>■ Stop</button>
        <button class="btn" data-a="reset">↺ Reset robot</button>
        <select class="input" data-a="speed" style="width:auto;margin:0"><option value="1">1× speed</option><option value="2">2×</option><option value="4">4×</option><option value="10">10×</option></select>
        <div class="spacer"></div>
        ${opts.starter ? '<button class="btn sm" data-a="restore">Restore starter code</button>' : ''}
        ${opts.checks?.length ? `<button class="btn primary" data-a="check">✔ ${esc(opts.submitLabel || 'Check')}</button>` : ''}
      </div>
      <div class="ide">
        <div><textarea></textarea><div class="ref" style="margin-top:10px"><b class="small">📚 Quick reference</b>${API_REF}</div></div>
        <div class="simbox">
          <canvas width="960" height="720"></canvas>
          <div class="hud"></div>
          <div class="brain"><span class="small muted">🧠 Brain screen / output</span><div class="brain-screen"></div></div>
          <div class="msg" data-m></div>
          <ul class="checks"></ul>
        </div>
      </div>`;
    const q = s => host.querySelector(s);
    const cm = CodeMirror.fromTextArea(q('textarea'), { mode: 'text/x-c++src', theme: 'retro', lineNumbers: true, indentUnit: 2, tabSize: 2, matchBrackets: true, autoCloseBrackets: true, readOnly: !!opts.readOnly, extraKeys: { 'Ctrl-Enter': () => doRun(), 'Cmd-Enter': () => doRun() } });
    cm.setValue(opts.code || '');
    const sim = new VexSim.Sim(q('canvas'), opts.field);
    const scr = q('.brain-screen'), hud = q('.hud'), msg = q('[data-m]');
    sim.on('screen', () => { scr.textContent = sim.screen.lines.join('\n'); scr.scrollTop = scr.scrollHeight; });
    let frame = 0;
    sim.on('frame', () => { if (frame++ % 6) return; const d = sim.rayDistance(); const [ox, oy] = sim.opticalPt();
      hud.innerHTML = `<span>⏱ ${sim.t.toFixed(1)}s</span><span>🧭 ${sim.r.h.toFixed(0)}°</span><span>📍 (${sim.r.x.toFixed(1)}, ${sim.r.y.toFixed(1)}) in</span><span>📡 ${d === null ? '—' : d.toFixed(1) + ' in'}</span><span>🎨 ${sim.floorAt(ox, oy).color}</span>${sim.collisions ? `<span style="color:var(--bad)">💥 ${sim.collisions} bump${sim.collisions > 1 ? 's' : ''}</span>` : ''}`; });
    let errMark = null;
    const setMsg = (t, kind) => { msg.className = 'msg ' + (kind || ''); msg.textContent = t || ''; };
    sim.on('error', e => setMsg(e.message, 'bad'));
    cm.on('change', () => { if (errMark !== null) { cm.removeLineClass(errMark, 'background', 'err-line'); errMark = null; } opts.onChange && opts.onChange(cm.getValue()); });
    let running = false;
    async function doRun(withChecks) {
      if (running) return; running = true;
      q('[data-a=run]').disabled = true; q('[data-a=stop]').disabled = false; q('.checks').innerHTML = ''; setMsg(withChecks ? '🏁 Running your program for the auto-check…' : '');
      const code = cm.getValue();
      const r = await VexSim.run(sim, code);
      running = false; q('[data-a=run]').disabled = false; q('[data-a=stop]').disabled = true;
      if (!r.ok) {
        setMsg((r.line ? `Line ${r.line}: ` : '') + r.error, 'bad');
        if (r.line) { errMark = r.line - 1; cm.addLineClass(errMark, 'background', 'err-line'); cm.scrollIntoView({ line: errMark, ch: 0 }); }
        if (!withChecks) return;
      } else if (r.stopped) { setMsg('Program stopped.'); if (withChecks) return; }
      else if (!withChecks) setMsg('✅ Program finished.', 'good');
      if (withChecks) {
        const res = VexSim.evaluate(sim, code, opts.checks);
        if (!r.ok) res.unshift({ message: 'Program runs without errors', pass: false });
        q('.checks').innerHTML = res.map(c => `<li>${c.pass ? '✅' : '❌'} ${esc(c.message)}</li>`).join('');
        const all = res.every(c => c.pass);
        setMsg(all ? '🎉 All checks passed!' : `${res.filter(c => c.pass).length}/${res.length} checks passed — read the ❌ items, adjust, and try again.`, all ? 'good' : 'bad');
        if (opts.onSubmit) { try { await opts.onSubmit(code, res, sim.output); } catch (e) { setMsg('Could not submit: ' + e.message, 'bad'); } }
      }
    }
    host.addEventListener('click', e => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'run') doRun(false);
      if (a === 'check') doRun(true);
      if (a === 'stop') sim.halt();
      if (a === 'reset') { sim.halt(); sim.reset(); setMsg(''); q('.checks').innerHTML = ''; }
      if (a === 'restore' && confirm('Replace your code with the starter code? Your current code will be lost.')) cm.setValue(opts.starter);
    });
    q('[data-a=speed]').onchange = e => { sim.speed = +e.target.value; };
    return {
      cm, sim, note: t => setMsg(t),
      setField: f => { sim.halt(); sim.setField(f); },
      destroy: () => sim.destroy()
    };
  }
  window.createIDE = createIDE;

  // ---------------------------------------------------------------- playground
  const FIELDS = {
    'Open field': {},
    'Wall ahead': { start: { x: 48, y: 60, heading: 0 }, walls: [{ x: 30, y: 16, w: 36, h: 4 }] },
    'Line track': { start: { x: 12, y: 62, heading: 0 }, lines: [{ points: [[12, 66], [12, 12], [84, 12], [84, 60], [36, 60]], width: 1.5 }] },
    'Color tiles': { start: { x: 10, y: 36, heading: 90 }, tiles: [{ x: 18, y: 30, w: 12, h: 12, color: 'red' }, { x: 36, y: 30, w: 12, h: 12, color: 'green' }, { x: 54, y: 30, w: 12, h: 12, color: 'blue' }, { x: 72, y: 30, w: 12, h: 12, color: 'yellow' }] },
    'Maze': { start: { x: 12, y: 60, heading: 0 }, walls: [{ x: 24, y: 24, w: 4, h: 48 }, { x: 48, y: 0, w: 4, h: 48 }, { x: 72, y: 24, w: 4, h: 48 }], goal: { x: 86, y: 60, r: 7 } },
    'Cube sorting': { start: { x: 48, y: 62, heading: 0 }, cubes: [{ x: 48, y: 40, color: 'red' }, { x: 48, y: 22, color: 'blue' }], zones: [{ x: 4, y: 10, w: 16, h: 16, color: 'red' }, { x: 76, y: 10, w: 16, h: 16, color: 'blue' }] }
  };
  const PLAY_CODE = `#include "vex.h"
using namespace vex;

// 🧪 Code Lab — experiment freely! Pick a field on the right.
int main() {
  Brain.Screen.print("Hello, robot!");
  Brain.Screen.newLine();

  for (int i = 0; i < 4; i++) {
    Drivetrain.driveFor(forward, 18, inches);
    Drivetrain.turnFor(right, 90, degrees);
  }
  return 0;
}
`;
  function playground() {
    let code = PLAY_CODE; try { code = localStorage.getItem('playground:' + ME.id) || PLAY_CODE; } catch (e) {}
    $app.innerHTML = `<div class="row"><div><h1>🧪 Code Lab</h1><p class="muted" style="margin-top:0">A free sandbox to try ideas. Your code is saved in this browser.</p></div><div class="spacer"></div>
      <label class="small">Field: <select class="input" id="fsel" style="display:inline-block;width:auto">${Object.keys(FIELDS).map(k => `<option>${k}</option>`).join('')}</select></label></div>
      <div class="panel" id="ide"></div>`;
    const ide = createIDE(document.getElementById('ide'), { code, starter: PLAY_CODE, field: FIELDS['Open field'], onChange: c => { try { localStorage.setItem('playground:' + ME.id, c); } catch (e) {} } });
    document.getElementById('fsel').onchange = e => ide.setField(FIELDS[e.target.value]);
    cleanup = () => ide.destroy();
  }

  // ---------------------------------------------------------------- teacher
  async function teacherHome() {
    const { classes } = await api('/api/teacher/classes');
    $app.innerHTML = `
      <div class="row"><h1>👩‍🏫 Teacher Dashboard</h1><div class="spacer"></div><a class="btn" href="#/teacher/lessons">📚 Lessons & videos</a></div>
      <div class="cards" style="margin-top:12px">
        ${classes.map(c => `<a class="lcard class-card" href="#/teacher/class/${c.id}"><span class="num">CLASS</span><h3>${esc(c.name)}</h3>
          <span class="muted small">Join code</span><span class="joincode">${esc(c.code)}</span><span class="small muted">${c.studentCount} student${c.studentCount === 1 ? '' : 's'} enrolled${c.closed ? ' · enrollment closed' : ''}</span></a>`).join('')}
        <form class="lcard" id="newc" style="justify-content:center"><h3>➕ New class</h3><input class="input" name="name" placeholder="e.g. Period 3 — Robotics" required><button class="btn primary">Create class</button></form>
      </div>
      <div class="panel" style="margin-top:22px"><h3>How students enroll</h3>
        <ol><li>Create a class above to get a 6-letter <b>join code</b>.</li><li>Students go to this website → <b>Join a class</b>, type the code, their name, a username and password.</li><li>Open the class to watch progress live, read submitted code, and leave feedback & grades.</li></ol>
        <p class="muted small">Lessons unlock in order: a student finishes a lesson by submitting its exit ticket and code challenge. You can unlock lessons for a class at any time.</p></div>`;
    document.getElementById('newc').onsubmit = async e => { e.preventDefault(); try { await api('/api/teacher/classes', { body: Object.fromEntries(new FormData(e.target)) }); teacherHome(); } catch (err) { toast(err.message); } };
  }

  async function classPage(cid) {
    const data = await api(`/api/teacher/classes/${cid}/progress`);
    const { class: C, lessons, students } = data;
    const units = [...new Set(lessons.map(l => l.unit))];
    const avg = l => { const xs = students.map(s => s.progress[l.id]?.quiz).filter(Boolean); return xs.length ? Math.round(100 * xs.reduce((a, q) => a + q.score / (q.total || 1), 0) / xs.length) : null; };
    const toReview = students.reduce((n, s) => n + Object.values(s.progress).filter(p => p.needsReview).length, 0);
    $app.innerHTML = `
      <a href="#/teacher" class="small">← All classes</a>
      <div class="row" style="margin:6px 0 14px"><h1 style="margin:0">${esc(C.name)}</h1><span class="joincode" style="font-size:1.1rem">${esc(C.code)}</span><div class="spacer"></div>
        <a class="btn sm" href="/api/teacher/classes/${C.id}/export.csv">⬇ Export CSV</a><button class="btn sm" id="settings">⚙ Class settings</button></div>
      <div class="stats">
        <div class="stat"><span class="muted small">Students</span><b>${students.length}</b></div>
        <div class="stat"><span class="muted small">Lessons completed (all students)</span><b>${students.reduce((n, s) => n + Object.values(s.progress).filter(p => p.status === 'complete').length, 0)}</b></div>
        <div class="stat"><span class="muted small">Waiting for your review</span><b>${toReview}</b></div>
        <div class="stat"><span class="muted small">Progression</span><b style="font-size:1.1rem">${C.unlockAll ? '🔓 All unlocked' : '🔒 In order'}</b></div>
      </div>
      ${students.length ? `
      <div class="legend"><span><span class="cell complete">8/10</span> complete (quiz score)</span><span><span class="cell started">…</span> started</span><span><span class="cell none">·</span> not started</span><span><span class="cell complete review">✓</span> blue outline = new work to review</span><span>Click any cell to view the student's work.</span></div>
      <div class="gridtbl"><table>
        <thead><tr><th class="l">Student</th><th>Done</th>${lessons.map(l => `<th class="vert" title="${esc(l.title)}">${l.order}. ${esc(l.title)}</th>`).join('')}</tr>
          <tr><th class="l small muted">Class quiz average</th><th></th>${lessons.map(l => { const a = avg(l); return `<th class="small muted">${a === null ? '' : a + '%'}</th>`; }).join('')}</tr></thead>
        <tbody>${students.map(s => `<tr><td class="l"><b>${esc(s.name)}</b><br><span class="small muted">@${esc(s.username)}</span> <button class="btn sm" data-stu="${s.id}" style="padding:2px 6px">⋯</button></td>
          <td><b>${Object.values(s.progress).filter(p => p.status === 'complete').length}</b></td>
          ${lessons.map(l => { const p = s.progress[l.id];
            if (!p) return `<td><button class="cell none" data-s="${s.id}" data-l="${l.id}">·</button></td>`;
            const label = p.grade != null ? p.grade : p.quiz ? `${p.quiz.score}/${p.quiz.total}` : '…';
            const ch = l.hasChallenge ? (p.challenge ? (p.challenge.passed ? '' : '⚠') : '') : '';
            return `<td><button class="cell ${p.status} ${p.needsReview ? 'review' : ''}" data-s="${s.id}" data-l="${l.id}" title="${p.challenge ? 'Challenge: ' + (p.challenge.passed ? 'passed' : p.challenge.passCount + '/' + p.challenge.total) : 'No code submitted'}">${label}${ch}</button></td>`; }).join('')}
        </tr>`).join('')}</tbody></table></div>` : `<div class="panel"><h3>No students yet</h3><p>Share the join code <span class="joincode">${esc(C.code)}</span> with your class. Students click <b>Join a class</b> on the home page.</p></div>`}`;
    $app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => reviewModal(b.dataset.s, b.dataset.l, () => classPage(cid)));
    $app.querySelectorAll('[data-stu]').forEach(b => b.onclick = () => studentModal(students.find(s => s.id === b.dataset.stu), cid));
    document.getElementById('settings').onclick = () => settingsModal(C, lessons, units);
  }

  function settingsModal(C, lessons) {
    const m = modal(`<h2>⚙ ${esc(C.name)} settings</h2>
      <label class="f">Class name<input name="name" value="${esc(C.name)}"></label>
      <label class="row"><input type="checkbox" name="unlockAll" ${C.unlockAll ? 'checked' : ''}> Unlock <b>all</b> lessons (students can jump ahead)</label>
      <label class="row" style="margin-top:8px"><input type="checkbox" name="closed" ${C.closed ? 'checked' : ''}> Close enrollment (join code stops working)</label>
      <h3 style="margin-top:18px">Unlock specific lessons</h3><p class="small muted">Useful if you want the whole class on the same lesson today.</p>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:6px">${lessons.map(l => `<label class="small row"><input type="checkbox" name="u" value="${l.id}" ${(C.unlocked || []).includes(l.id) ? 'checked' : ''}> ${l.order}. ${esc(l.title)}</label>`).join('')}</div>
      <div class="row" style="margin-top:18px"><button class="btn primary" id="sv">Save</button><button class="btn" id="nc">🔁 New join code</button><button class="btn" id="dl">🗑 Delete class</button><div class="spacer"></div><button class="btn" id="cx">Close</button></div>`);
    const get = n => m.querySelector(`[name=${n}]`);
    m.querySelector('#cx').onclick = () => m.remove();
    m.querySelector('#sv').onclick = async () => {
      await api(`/api/teacher/classes/${C.id}`, { method: 'PATCH', body: { name: get('name').value, unlockAll: get('unlockAll').checked, closed: get('closed').checked, unlocked: [...m.querySelectorAll('[name=u]:checked')].map(x => x.value) } });
      m.remove(); toast('Saved'); classPage(C.id);
    };
    m.querySelector('#nc').onclick = async () => { if (!confirm('Make a new join code? The old one will stop working.')) return; await api(`/api/teacher/classes/${C.id}`, { method: 'PATCH', body: { newCode: true } }); m.remove(); classPage(C.id); };
    m.querySelector('#dl').onclick = async () => { if (!confirm('Delete this class?')) return; try { await api(`/api/teacher/classes/${C.id}`, { method: 'DELETE' }); m.remove(); location.hash = '#/teacher'; } catch (e) { toast(e.message); } };
  }

  async function studentModal(s, cid) {
    const { classes } = await api('/api/teacher/classes');
    const m = modal(`<h2>${esc(s.name)} <span class="muted small">@${esc(s.username)}</span></h2>
      <p class="small muted">Last login: ${s.lastLogin ? new Date(s.lastLogin).toLocaleString() : 'never'}</p>
      <h3>Reset password</h3><div class="row"><input class="input" id="pw" placeholder="New password" style="max-width:240px;margin:0"><button class="btn" id="rp">Set password</button></div>
      <h3 style="margin-top:16px">Move to another class</h3><div class="row"><select class="input" id="mc" style="max-width:240px;margin:0">${classes.map(c => `<option value="${c.id}" ${c.id === cid ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><button class="btn" id="mv">Move</button></div>
      <h3 style="margin-top:16px">Remove</h3><button class="btn stop" id="rm">Remove student & all their work</button>
      <div class="row" style="margin-top:18px"><div class="spacer"></div><button class="btn" id="cx">Close</button></div>`);
    m.querySelector('#cx').onclick = () => m.remove();
    m.querySelector('#rp').onclick = async () => { try { await api(`/api/teacher/students/${s.id}/reset-password`, { body: { password: m.querySelector('#pw').value } }); toast('Password updated'); } catch (e) { toast(e.message); } };
    m.querySelector('#mv').onclick = async () => { await api(`/api/teacher/students/${s.id}/move`, { body: { classId: m.querySelector('#mc').value } }); m.remove(); classPage(cid); };
    m.querySelector('#rm').onclick = async () => { if (!confirm(`Remove ${s.name}? This deletes all of their work.`)) return; await api(`/api/teacher/students/${s.id}`, { method: 'DELETE' }); m.remove(); classPage(cid); };
  }

  async function reviewModal(sid, lid, after) {
    const { student: S, lesson: L, progress: P } = await api(`/api/teacher/students/${sid}/lessons/${lid}`);
    const subs = P?.submissions || [];
    const last = subs[subs.length - 1];
    const m = modal(`
      <div class="row"><div><span class="muted small">LESSON ${L.order}</span><h2 style="margin:0">${esc(S.name)} — ${esc(L.title)}</h2></div><div class="spacer"></div><button class="btn" id="cx">✕</button></div>
      <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:14px">
        <div class="stat"><span class="muted small">Exit ticket</span><b>${P?.quiz ? `${P.quiz.score}/${P.quiz.total}` : '—'}</b><span class="small muted">${P?.quizAttempts ? P.quizAttempts + ' attempt(s)' : 'not submitted'}</span></div>
        <div class="stat"><span class="muted small">Code challenge</span><b>${L.challenge ? (P?.challenge ? (P.challenge.passed ? '✅ Passed' : `${P.challenge.passCount}/${P.challenge.total} checks`) : '—') : 'n/a'}</b><span class="small muted">${subs.length} submission(s)</span></div>
      </div>
      ${P?.reflection ? `<h3 style="margin-top:16px">✍️ Reflection</h3><p class="muted small">${esc(L.reflection || '')}</p><div class="callout">${esc(P.reflection)}</div>` : ''}
      ${P?.quiz && !P.quiz.excused ? `<h3>📝 Quiz answers</h3><ol class="small">${(L.quiz || []).map((q, i) => { const a = Number(P.quiz.answers[i]); return `<li>${esc(q.q)}<br>${a === q.answer ? '✅' : '❌'} ${esc(q.choices[a] ?? '(blank)')}${a !== q.answer ? ` <span class="muted">— correct: ${esc(q.choices[q.answer])}</span>` : ''}</li>`; }).join('')}</ol>` : ''}
      ${L.challenge ? `<h3>💻 Submitted code</h3>
        ${subs.length ? `<div class="row small" style="margin-bottom:6px">Version: <select class="input" id="ver" style="width:auto;margin:0">${subs.map((s, i) => `<option value="${i}" ${i === subs.length - 1 ? 'selected' : ''}>#${i + 1} · ${new Date(s.at).toLocaleString()} · ${s.checks.filter(c => c.pass).length}/${s.checks.length}</option>`).join('')}</select><button class="btn sm" id="runit">▶ Run it in the simulator</button></div>
          <ul class="checks small" id="vchecks"></ul><div class="code-view" id="vcode"></div><div id="vide"></div>`
        : `<p class="muted">No code submitted yet.${P?.draft ? ' Latest autosaved draft:' : ''}</p>${P?.draft ? `<div class="code-view">${esc(P.draft)}</div>` : ''}`}` : ''}
      <h3 style="margin-top:16px">🧑‍🏫 Your feedback</h3>
      <div class="row"><label class="small">Grade (0–100) <input class="input" id="gr" type="number" min="0" max="100" value="${P?.grade ?? ''}" style="width:110px"></label></div>
      <textarea class="input" id="fb" rows="3" placeholder="Glow: … Grow: …">${esc(P?.feedback || '')}</textarea>
      <div class="row" style="margin-top:10px"><button class="btn primary" id="save">Save feedback</button><label class="small row"><input type="checkbox" id="mc"> Mark lesson complete (excuse / unlock next)</label></div>`);
    m.querySelector('#cx').onclick = () => { m.remove(); };
    if (subs.length) {
      const show = i => { const s = subs[i]; m.querySelector('#vcode').textContent = s.code; m.querySelector('#vchecks').innerHTML = s.checks.map(c => `<li>${c.pass ? '✅' : '❌'} ${esc(c.message)}</li>`).join(''); };
      show(subs.length - 1);
      m.querySelector('#ver').onchange = e => show(+e.target.value);
      m.querySelector('#runit').onclick = () => {
        const i = +m.querySelector('#ver').value; m.querySelector('#vcode').style.display = 'none';
        const ide = createIDE(m.querySelector('#vide'), { code: subs[i].code, field: L.challenge.field, checks: L.challenge.checks, submitLabel: 'Re-check', readOnly: false });
        setTimeout(() => ide.cm.refresh(), 50);
      };
    }
    m.querySelector('#save').onclick = async () => {
      await api(`/api/teacher/students/${sid}/lessons/${lid}/review`, { body: { grade: m.querySelector('#gr').value, feedback: m.querySelector('#fb').value, markComplete: m.querySelector('#mc').checked } });
      toast('Feedback saved'); m.remove(); after && after();
    };
  }

  async function lessonsAdmin() {
    const { lessons } = await api('/api/lessons');
    const full = await Promise.all(lessons.map(l => api('/api/lessons/' + l.id).then(r => r.lesson)));
    $app.innerHTML = `<h1>📚 Lessons, videos & notes</h1>
      <p class="muted">Preview any lesson (as a teacher everything is unlocked and quiz answers are shown). Paste a YouTube, Google Drive or Vimeo link to embed a video at the top of a lesson.</p>
      ${[...new Set(lessons.map(l => l.unit))].map(u => `<h2 style="margin-top:22px">${UNIT_ICONS[u]} Unit ${u}: ${UNIT_NAMES[u]}</h2>
        <div class="grid">${full.filter(l => l.unit === u).map(l => `<div class="panel" style="padding:14px">
          <div class="row"><b>${l.order}. ${esc(l.title)}</b> <span class="muted small">${l.minutes} min</span> ${tags(l.tags)}<div class="spacer"></div><a class="btn sm" href="#/lesson/${l.id}">Open lesson →</a></div>
          <div class="row" style="margin-top:8px"><input class="input" data-v="${l.id}" placeholder="Video URL (optional)" value="${esc(l.video || '')}" style="flex:2;min-width:220px;margin:0">
            <input class="input" data-n="${l.id}" placeholder="Private teacher note (optional)" value="${esc(l.teacherNote || '')}" style="flex:2;min-width:220px;margin:0"><button class="btn sm" data-save="${l.id}">Save</button></div>
          ${l.materials?.length ? `<p class="small muted" style="margin:8px 0 0">Materials: ${l.materials.map(esc).join(' · ')}</p>` : ''}</div>`).join('')}</div>`).join('')}`;
    $app.querySelectorAll('[data-save]').forEach(b => b.onclick = async () => {
      const id = b.dataset.save;
      try { await api('/api/teacher/lessons/' + id, { method: 'PUT', body: { video: $app.querySelector(`[data-v="${id}"]`).value, teacherNote: $app.querySelector(`[data-n="${id}"]`).value } }); toast('Saved ✔'); } catch (e) { toast(e.message); }
    });
  }

  boot();
})();
