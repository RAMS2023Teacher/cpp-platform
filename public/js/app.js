/* RoboCode Academy – single page app */
(function () {
  const $app = document.getElementById('app'), $nav = document.getElementById('nav');
  let ME = null, MYCLASS = null, ACCOUNT = '';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const UNIT_NAMES = { 1: 'Meet Your Robot', 2: 'C++ Foundations', 3: 'Algorithms', 4: 'Artificial Intelligence', 5: 'Capstone' };
  const UNIT_ICONS = { 1: '🔧', 2: '💻', 3: '🧩', 4: '🧠', 5: '🏆' };
  const KIND = { warmup: ['⚡', 'Warm-up'], learn: ['📘', 'Learn'], build: ['🔧', 'Build'], activity: ['🎯', 'Activity'], unplugged: ['✂️', 'Unplugged'], code: ['💻', 'Code'], wrapup: ['✅', 'Wrap-up'] };

  // Every call goes through the one server function. Answers that arrive after the
  // student has moved to another page are dropped so they can't overwrite it.
  let routeSeq = 0, inFlight = 0;
  const busy = d => { inFlight += d; document.body.classList.toggle('busy', inFlight > 0); };
  function api(url, opts = {}) {
    const method = opts.method || (opts.body ? 'POST' : 'GET'), seq = routeSeq;
    busy(1);
    return new Promise((resolve, reject) => {
      const send = tries => google.script.run
        .withSuccessHandler(text => {
          busy(-1);
          if (seq !== routeSeq) return;
          const data = JSON.parse(text);
          data && data.__error ? reject(new Error(data.__error)) : resolve(data);
        })
        .withFailureHandler(() => {
          if (method === 'GET' && tries < 1) return setTimeout(() => send(tries + 1), 1500);
          busy(-1);
          if (seq === routeSeq) reject(new Error('Could not reach the server. Check your connection and try again.'));
        })
        .api(method, url, opts.body ? JSON.stringify(opts.body) : '');
      send(0);
    });
  }
  // Apps Script pages run inside an iframe, so the current page is tracked here
  // and mirrored to the browser's address bar for the back button.
  const Nav = {
    hash: '#/',
    go(h) { this.hash = h; try { google.script.history.push(null, {}, h.slice(1)); } catch (e) {} route(); },
    listen() {
      document.addEventListener('click', e => {
        const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
        const h = a.getAttribute('href');
        if (a.classList.contains('skip')) { e.preventDefault(); $app.focus(); return; }
        if (h.startsWith('#')) { e.preventDefault(); if (h !== '#') Nav.go(h); }
        else if (/^https?:/.test(h) && !a.target) a.target = '_blank';
      });
      google.script.history.setChangeHandler(e => { Nav.hash = '#' + (e.location.hash || '/'); route(); });
    },
    start() {
      let started = false;
      const begin = hash => { if (started) return; started = true; if (hash) Nav.hash = '#' + hash; boot(); };
      // A Classroom assignment links to ?lesson=<id>, which opens that lesson.
      const fromLink = l => l.hash || (l.parameter && /^[\w-]+$/.test(l.parameter.lesson || '') ? '/lesson/' + l.parameter.lesson : '');
      try { google.script.url.getLocation(l => begin(fromLink(l))); } catch (e) { begin(''); }
      setTimeout(() => begin(''), 2000);
    }
  };
  function toast(t) { const el = document.getElementById('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove('on'), 2600); }
  function modal(html) {
    const opener = document.activeElement;
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = `<div class="modal" role="dialog" aria-modal="true" tabindex="-1">${html}</div>`;
    const box = bg.firstChild, heading = box.querySelector('h2');
    if (heading) { heading.id = 'modal-title'; box.setAttribute('aria-labelledby', 'modal-title'); }
    const focusable = () => [...box.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select,textarea,summary')];
    const originalRemove = bg.remove.bind(bg);
    bg.remove = () => { originalRemove(); if (opener && opener.isConnected) opener.focus(); };
    bg.addEventListener('click', e => { if (e.target === bg) bg.remove(); });
    bg.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); bg.remove(); return; }
      if (e.key !== 'Tab') return;
      const items = focusable(); if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.body.append(bg); box.focus(); return bg;
  }
  const tags = t => (t || []).map(x => `<span class="tag ${esc(x)}">${esc(x)}</span>`).join(' ');

  // ---------------------------------------------------------------- nav + router
  // VEXcode IQ always opens in the same tab (named "vexcode"), so students flip between the two instead of piling up tabs.
  const VEXCODE_URL = 'https://codeiq.vex.com/';
  const VEXCODE_LINK = (label, cls = '') => `<a class="${cls}" href="${VEXCODE_URL}" target="vexcode" rel="noopener" title="Open VEXcode IQ in its own tab">${label}</a>`;
  function sideBySideHelp() {
    const m = modal(`<h2 style="margin-top:0">⧉ VEXcode IQ + RoboCode, side by side</h2>
      <div class="split-pic" aria-hidden="true"><div>VEXcode IQ</div><div>RoboCode</div></div>
      <ol class="steps"><li>Click ${VEXCODE_LINK('VEXcode IQ ↗', 'btn sm')} to open VEXcode IQ.</li><li>In VEXcode, press <kbd>Alt</kbd> + <kbd>[</kbd> to snap it to the <b>left</b>.</li><li>Come back here and press <kbd>Alt</kbd> + <kbd>]</kbd> to snap RoboCode to the <b>right</b>.</li></ol>
      <p class="small muted">Not on a Chromebook? Windows: <kbd>⊞ Win</kbd> + <kbd>←</kbd> / <kbd>→</kbd>. Mac: drag the windows side by side.</p>
      <div class="row"><div class="spacer"></div><button class="btn primary" id="cx">Got it!</button></div>`);
    m.querySelector('#cx').onclick = () => m.remove();
  }
  function renderNav() {
    if (!ME) { $nav.innerHTML = ''; return; }
    const links = ME.role === 'teacher'
      ? `<a href="#/teacher">Classes</a><a href="#/map">Map</a><a href="#/teacher/lessons">Lessons</a><a href="#/teacher/standards">Standards</a><a href="#/playground">Code Lab</a>`
      : `<a href="#/">My Course</a><a href="#/robot">My Robot</a><a href="#/team">Team</a><a href="#/map">Map</a><a href="#/playground">Code Lab</a>`;
    $nav.innerHTML = `${links}${VEXCODE_LINK('VEXcode IQ ↗')}<span class="who">${esc(ME.name)}${ME.role === 'teacher' ? ' (teacher)' : ''}</span>`;
    $nav.querySelectorAll('a').forEach(a => a.classList.toggle('active', Nav.hash === a.getAttribute('href')));
  }
  let cleanup = null;
  // Read aloud, using the voices built into the browser.
  const canSpeak = 'speechSynthesis' in window;
  let readingBtn = null;
  function stopReading() { if (!canSpeak) return; speechSynthesis.cancel(); if (readingBtn) { readingBtn.textContent = '🔊 Read aloud'; readingBtn.setAttribute('aria-pressed', 'false'); readingBtn = null; } }
  function addReadAloud(root) {
    if (!canSpeak) return;
    root.querySelectorAll('.panel.sec > .sec-kind').forEach(head => {
      const panel = head.parentElement, source = panel.querySelector('[data-read]') || panel.querySelector('.body');
      if (!source) return;
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'read-btn'; btn.textContent = '🔊 Read aloud'; btn.setAttribute('aria-pressed', 'false');
      btn.onclick = () => {
        const wasMe = readingBtn === btn; stopReading(); if (wasMe) return;
        const copy = source.cloneNode(true); copy.querySelectorAll('pre,[data-widget],svg').forEach(x => x.remove());
        const say = new SpeechSynthesisUtterance(copy.textContent.replace(/\s+/g, ' ').trim());
        say.onend = () => { if (readingBtn === btn) stopReading(); };
        readingBtn = btn; btn.textContent = '⏹ Stop reading'; btn.setAttribute('aria-pressed', 'true'); speechSynthesis.speak(say);
      };
      head.append(btn);
    });
  }
  function dispatch(parts) {
    if (!ME) return joinPage();
    if (parts[0] === 'lesson') return lessonPage(parts[1]);
    if (parts[0] === 'playground') return playground();
    if (parts[0] === 'map') return mapPage(parts[1]);
    if (ME.role === 'teacher') {
      if (parts[0] === 'teacher' && parts[1] === 'class' && parts[3] === 'event') return eventAdmin(parts[2], parts[4]);
      if (parts[0] === 'teacher' && parts[1] === 'class' && parts[3] === 'screen') return classScreen(parts[2], parts[4]);
      if (parts[0] === 'teacher' && parts[1] === 'class') return classPage(parts[2]);
      if (parts[0] === 'teacher' && parts[1] === 'lessons') return lessonsAdmin();
      if (parts[0] === 'teacher' && parts[1] === 'standards') return standardsPage();
      return teacherHome();
    }
    if (parts[0] === 'robot') return robotPage();
    if (parts[0] === 'team') return teamPage();
    if (parts[0] === 'event') return eventPage(parts[1]);
    return studentHome();
  }
  async function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    stopReading();
    routeSeq++;
    const parts = Nav.hash.slice(1).split('/').filter(Boolean);
    renderNav(); window.scrollTo(0, 0);
    $app.innerHTML = '<div class="loading">⏳ Loading…</div>';
    const firstPage = !route.ran; route.ran = true;
    try { await dispatch(parts); if (!firstPage) $app.focus({ preventScroll: true }); }
    catch (e) { $app.innerHTML = `<div class="panel"><h2>Oops</h2><p>${esc(e.message)}</p><a class="btn" href="#/">Back home</a></div>`; }
  }
  async function boot() {
    try { const r = await api('/api/me'); ME = r.user; MYCLASS = r.class || null; ACCOUNT = r.email || ''; route(); }
    catch (e) { $app.innerHTML = `<div class="panel"><h2>Can't open RoboCode Academy</h2><p>${esc(e.message)}</p></div>`; }
  }

  // ---------------------------------------------------------------- auth
  function joinPage() {
    $app.innerHTML = `
    <section class="hero">
      <div>
        <span class="tag ai">Grade 8 · VEX IQ · C++</span>
        <h1>Code real robots.<br>Think like an engineer.<br>Build smarter machines.</h1>
        <p class="lead">Hands-on lessons that take you from your first <code>Brain.Screen.print</code> to robots that search, sort, find paths and <b>learn</b> — in a C++ editor with a built-in robot simulator.</p>
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
      <h2 style="margin-top:0">Join your class</h2>
      <p class="small muted">Signed in as <b>${esc(ACCOUNT)}</b>. You only do this once.</p>
      <div class="err" id="err"></div>
      <form id="f">
        <label class="f">Class code <span class="muted small">(6 letters from your teacher)</span><input name="classCode" maxlength="6" style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--mono)" required></label>
        <label class="f">First name<input name="firstName" maxlength="30" autocomplete="given-name" required></label>
        <label class="f">Last name <span class="muted small">(classmates only see your first initial)</span><input name="lastName" maxlength="30" autocomplete="family-name" required></label>
        <button class="btn primary" style="width:100%">Join class 🚀</button>
      </form>
    </div>`;
    document.getElementById('f').onsubmit = async e => {
      e.preventDefault();
      try { await api('/api/join', { body: Object.fromEntries(new FormData(e.target)) }); Nav.hash = '#/'; boot(); }
      catch (err) { document.getElementById('err').textContent = err.message; }
    };
  }

  // ---------------------------------------------------------------- student home
  async function studentHome() {
    const { lessons, events } = await api('/api/lessons');
    const main = lessons.filter(l => l.track === 'main'), extra = lessons.filter(l => l.track === 'extra');
    const isDone = l => l.status === 'complete';
    const done = main.filter(isDone).length, extraDone = extra.filter(isDone).length;
    const quizPts = lessons.reduce((s, l) => s + (l.quizScore ? +l.quizScore.split('/')[0] : 0), 0);
    const xp = (done + extraDone) * 50 + quizPts * 10;
    const level = Math.floor(xp / 250) + 1;
    const next = main.find(l => l.unlocked && !isDone(l));
    const units = [...new Set(main.map(l => l.unit))];
    const built = completedIds(lessons);
    const parts = buildParts(lessons), partsDone = parts.filter(isDone).length, nextPart = Quest.part(parts.find(l => !isDone(l))?.id);
    const allIn = (list, u) => { const inUnit = list.filter(l => l.unit === u); return inUnit.length > 0 && inUnit.every(isDone); };
    const BADGES = [
      ['🔧', 'Robot Builder', allIn(main, 1)], ['💻', 'C++ Coder', allIn(main, 2)], ['🏆', 'Rescue Certified', allIn(main, 5)],
      ['🧩', 'Algorithm Ace', allIn(lessons, 3)], ['🧠', 'AI Engineer', allIn(lessons, 4)], ['⭐', 'First Lesson', done + extraDone >= 1], ['🚀', 'Went Further', extraDone >= 1]
    ];
    $app.innerHTML = `
      <div class="row" style="margin-bottom:16px"><div><h1>Hi, ${esc(ME.name.split(' ')[0])}! 👋</h1><p class="muted" style="margin:0">${esc(MYCLASS?.name || '')}</p></div><div class="spacer"></div>
        ${next ? `<a class="btn primary" href="#/lesson/${next.id}">${next.status === 'started' ? 'Continue' : 'Start'}: ${esc(next.title)} →</a>` : ''}</div>
      <div class="stats">
        <div class="stat"><span class="muted small">Lessons complete</span><b>${done} / ${main.length}</b><div class="bar"><i style="width:${100 * done / main.length}%"></i></div>${extraDone ? `<span class="small muted">+ ${extraDone} Go Further</span>` : ''}</div>
        <div class="stat"><span class="muted small">Robot XP</span><b>${xp} XP</b><span class="small muted">Level ${level} · ${250 - (xp % 250)} XP to next level</span></div>
        <div class="stat"><span class="muted small">Quiz points</span><b>${quizPts}</b></div>
        <div class="stat"><span class="muted small">Badges</span><b>${BADGES.filter(b => b[2]).length} / ${BADGES.length}</b></div>
      </div>
      ${(waitEvent => waitEvent ? `<div class="event-banner panel"><span style="font-size:2rem" aria-hidden="true">${waitEvent.icon}</span><div style="flex:1;min-width:200px"><b>Class event: ${esc(waitEvent.title)}</b><br><span class="small">All teams meet here before moving on. While you wait, try a Go Further lesson.</span></div><a class="btn primary" href="#/event/${waitEvent.id}">Get ready →</a></div>` : '')(events.find(e => e.ready && e.status !== 'done'))}
      ${!ME.team ? `<p class="small">🤝 Working with a partner? <a href="#/team">Create or join a team</a> to share one robot.</p>` : ''}
      <div class="quest-strip panel">
        <canvas id="home-robot" width="132" height="132" aria-label="Your Rescue Robot so far"></canvas>
        <div style="flex:1;min-width:200px"><b>🤖 Your Rescue Robot</b>
          <div class="bar" style="margin:6px 0"><i style="width:${100 * partsDone / (parts.length || 1)}%"></i></div>
          <span class="small muted">${partsDone} of ${parts.length} parts installed${nextPart ? ` · Next: ${nextPart.icon} ${esc(nextPart.name)}` : ' · Ready for the rescue mission!'}</span></div>
        ${events.map(e => `<a class="btn" href="#/event/${e.id}">${e.icon} ${esc(e.title)}${e.status === 'done' ? ' ✓' : ''}</a>`).join('')}
        <a class="btn" href="#/robot">🔧 My Robot</a><a class="btn" href="#/map">🚀 Moon Mission</a>
      </div>
      <div class="badges">${BADGES.map(([i, n, on]) => `<span class="badge ${on ? '' : 'off'}">${i} ${n}</span>`).join('')}</div>
      ${units.map(u => `
        <section class="unit">
          <div class="unit-head"><h2>${UNIT_ICONS[u] || '📦'} Unit ${u}: ${UNIT_NAMES[u] || ''}</h2><span class="muted small">${main.filter(l => l.unit === u && isDone(l)).length}/${main.filter(l => l.unit === u).length} done</span></div>
          <div class="cards">${main.filter(l => l.unit === u).map(card).join('')}</div>
        </section>`).join('')}
      ${extra.length ? `<section class="unit">
        <div class="unit-head"><h2>🚀 Go Further</h2><span class="muted small">${extraDone}/${extra.length} done</span></div>
        <p class="muted" style="margin-top:0">Extra lessons for anyone who wants more. They open as you finish the lessons they build on, and each one adds an upgrade to your robot.</p>
        <div class="cards">${extra.map(card).join('')}</div></section>` : ''}`;
    Quest.drawBuild(document.getElementById('home-robot'), ME.robot, built, true);
  }
  const completedIds = lessons => new Set(lessons.filter(l => l.status === 'complete').map(l => l.id));
  // The parts that make up this term's robot: the main path before the rescue mission.
  const buildParts = lessons => lessons.filter(l => l.track === 'main' && !Quest.part(l.id)?.mission);
  function card(l) {
    const icon = !l.unlocked ? '🔒' : l.status === 'complete' ? '✅' : l.status === 'started' ? '🟡' : '';
    return `<a class="lcard ${l.unlocked ? '' : 'locked'} ${l.status}" href="#/lesson/${l.id}">
      <span class="status" role="img" aria-label="${!l.unlocked ? 'Locked' : l.status === 'complete' ? 'Complete' : l.status === 'started' ? 'In progress' : 'Not started'}">${icon}</span><span class="num">${l.track === 'extra' ? 'GO FURTHER' : 'LESSON ' + l.num}${ME.role === 'teacher' ? ` · ${l.minutes} MIN` : ''}</span>
      <h3>${esc(l.title)}</h3><p>${esc(l.summary)}</p><div>${tags(l.tags)}</div>
      ${l.requires?.length ? `<span class="small muted">Opens after: ${l.requires.map(esc).join(', ')}</span>` : ''}
      ${l.photo ? '<span class="small muted">📸 Team photo required</span>' : ''}
      ${l.quizScore ? `<span class="small muted">Quiz: ${l.quizScore}</span>` : ''}</a>`;
  }

  // ---------------------------------------------------------------- lesson page
  function videoEmbed(url) {
    if (!url) return '';
    let src = url, m;
    if ((m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/))) src = `https://www.youtube-nocookie.com/embed/${m[1]}`;
    else if ((m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/))) src = `https://drive.google.com/file/d/${m[1]}/preview`;
    else if ((m = url.match(/vimeo\.com\/(\d+)/))) src = `https://player.vimeo.com/video/${m[1]}`;
    else if (!/^https:[\/]{2}/.test(url)) return '';
    return `<div class="video-wrap"><iframe src="${esc(src)}" allowfullscreen allow="encrypted-media; picture-in-picture"></iframe></div>`;
  }

  async function lessonPage(id) {
    const { lesson: raw, progress: P, prev, next, place, photo } = await api('/api/lessons/' + id);
    const L = adaptLesson(raw, mySetup());
    const teacher = ME.role === 'teacher';
    const secs = L.sections || [];
    celebrated = P?.completed ? L.id : null; lessonPlace = place;
    $app.innerHTML = `
      <div class="lesson-head">
        <div style="flex:1;min-width:260px">
          <a href="${teacher ? '#/teacher/lessons' : '#/'}" class="small">← ${teacher ? 'All lessons' : 'My course'}</a>
          <div class="muted small" style="margin-top:8px">UNIT ${L.unit} · ${esc(UNIT_NAMES[L.unit] || '')} · ${place.track === 'extra' ? 'GO FURTHER' : 'LESSON ' + place.num}${teacher ? ` · ${L.minutes} min` : ''}</div>
          <h1>${esc(L.title)}</h1><div>${tags(L.tags)}</div>
        </div>
        <div class="row">${prev ? `<a class="btn sm" href="#/lesson/${prev}">← Prev</a>` : ''}${next ? `<a class="btn sm" href="#/lesson/${next}">Next →</a>` : ''}</div>
      </div>
      <div class="lesson-layout">
        <aside class="toc">
          <a href="#" data-jump="goals"><span>🎯 Goals</span></a>
          <a href="#" data-jump="brief"><span>📖 Engineer's Brief</span></a>
          ${L.video ? `<a href="#" data-jump="video"><span>🎬 Video</span></a>` : ''}
          ${secs.map((s, i) => `<a href="#" data-jump="s${i}"><span>${(KIND[s.kind] || ['•'])[0]} ${esc(s.title)}</span>${teacher ? `<span class="min">${s.minutes || ''}′</span>` : ''}</a>`).join('')}
          ${L.challenge ? `<a href="#" data-jump="challenge"><span>🤖 Code Challenge</span></a>` : ''}
          ${photo ? '<a href="#" data-jump="photo"><span>📸 Team Photo</span></a>' : ''}
          <a href="#" data-jump="quiz"><span>📝 Exit Ticket</span></a>
          ${teacher ? '<p class="small muted" style="margin:8px 6px 0">The class timer is on each class\'s 📺 Class Screen.</p>' : ''}
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
            <details class="standards"><summary class="small"><b>MA DLCS standards for this lesson</b></summary>
              ${L.standards.anchor.map(s => `<p class="small"><b>${esc(s.code)}</b> ${esc(s.text)}</p>`).join('')}
              ${L.standards.supporting.length ? `<p class="small muted" style="margin-bottom:2px"><b>Also practiced:</b></p>${L.standards.supporting.map(s => `<p class="small"><b>${esc(s.code)}</b> ${esc(s.text)}</p>`).join('')}` : ''}
            </details>
          </div>
          <div class="panel sec" id="brief"><div class="sec-kind">📖 Engineer's Brief</div>
            <p class="think"><b>Think about it as you read:</b> ${esc(L.supports.think)}</p>
            ${Visuals.render(L.supports.visual)}
            <div data-read><p class="brief-text">${esc(L.supports.brief)}</p></div>
          </div>
          ${L.video ? `<div class="panel sec" id="video"><div class="sec-kind">🎬 Watch</div>${videoEmbed(L.video)}</div>` : ''}
          ${secs.map((s, i) => `<div class="panel sec ${esc(s.kind)}" id="s${i}"><div class="sec-kind">${(KIND[s.kind] || ['•', s.kind]).join(' ')}${teacher ? ` <span class="m">· ${s.minutes || '?'} min</span>` : ''}</div><h2>${esc(s.title)}</h2><div class="body">${s.html}</div></div>`).join('')}
          ${L.challenge ? `<div class="panel sec code" id="challenge"><div class="sec-kind">🤖 Code Challenge</div><h2>${esc(L.challenge.title)}</h2><div class="body">${L.challenge.prompt}</div>
              ${L.supports.worked ? `<details class="callout tip"><summary><b>👀 See a worked example</b></summary><p class="small">This solves a similar problem, not your challenge.</p><pre class="code">${esc(L.supports.worked.code)}</pre><ol class="small">${L.supports.worked.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ol></details>` : ''}
              <details class="callout think"><summary><b>🧗 Stuck? Try these in order</b></summary><ol class="small"><li>Read the error message and go to the line it names.</li><li>Read your code out loud, one line at a time. What does the robot do on each line?</li><li>Compare your code with the worked example.</li><li>Open one hint below.</li><li>Explain the problem to a partner, then ask your teacher.</li></ol></details>
              <div class="hints">${(L.challenge.hints || []).map((h, i) => `<details><summary>💡 Hint ${i + 1}</summary>${esc(h)}</details>`).join('')}</div>
              ${teacher && L.challenge.solution ? `<details class="callout warn"><summary><b>👩‍🏫 Reference solution (teachers only)</b></summary><pre class="code">${esc(L.challenge.solution)}</pre></details>` : ''}
              <div id="ide"></div></div>` : ''}
          ${photo ? '<div class="panel sec" id="photo"><div class="sec-kind">📸 Team Build Photo</div><div id="photobox"></div></div>' : ''}
          <div class="panel sec wrapup" id="quiz"><div class="sec-kind">📝 Exit Ticket</div><h2>Check your understanding</h2><div id="quizbox"></div></div>
          <div class="row">${prev ? `<a class="btn" href="#/lesson/${prev}">← Previous lesson</a>` : ''}<div class="spacer"></div>${next ? `<a class="btn primary" href="#/lesson/${next}">Next lesson →</a>` : ''}</div>
        </div>
      </div>`;
    $app.querySelectorAll('[data-jump]').forEach(a => a.onclick = e => { e.preventDefault(); document.getElementById(a.dataset.jump).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
    // VEX part pictures that belong to the other kit generation are hidden.
    $app.querySelectorAll('.vexpic[data-gen]').forEach(f => { if (+f.dataset.gen !== mySetup().gen) f.hidden = true; });
    window.mountWidgets($app);
    addReadAloud($app);
    if (photo) mountPhoto(document.getElementById('photobox'), { checkpoint: L.id, prompt: photo.prompt, photoId: photo.photoId, excused: photo.excused, onDone: r => { if (r.progress) celebrate(L, r.progress); } });
    let ide = null;
    if (L.challenge) {
      const ck = 'draft:' + ME.id + ':' + L.id;
      // Whichever copy is newer wins: the one in this browser or the one saved to the server.
      let saved = P?.draft; try { const at = localStorage.getItem(ck + ':at') || ''; if (!saved || at > (P?.draftAt || '')) saved = localStorage.getItem(ck) || saved; } catch (e) {}
      let unsaved = null;
      const saveDraft = () => { if (unsaved === null) return; const code = unsaved; unsaved = null; clearTimeout(ide._d); api(`/api/lessons/${L.id}/draft`, { body: { code } }).catch(() => {}); };
      ide = createIDE(document.getElementById('ide'), {
        code: saved || L.challenge.starterCode, starter: L.challenge.starterCode, field: L.challenge.field, checks: L.challenge.checks,
        submitLabel: teacher ? 'Check (preview)' : 'Check & Submit',
        onNewNames: () => route(),
        onChange: teacher ? null : code => { try { localStorage.setItem(ck, code); localStorage.setItem(ck + ':at', new Date().toISOString()); } catch (e) {} unsaved = code; clearTimeout(ide._d); ide._d = setTimeout(saveDraft, 20000); },
        onSubmit: teacher ? null : async (code, checks, output) => {
          unsaved = null; clearTimeout(ide._d);
          const r = await api(`/api/lessons/${L.id}/submit`, { body: { code, checks, output } });
          celebrate(L, r.progress);
          toast(checks.every(c => c.pass) ? '🎉 Challenge passed!' : '📤 Saved. Pass every check to complete this lesson.');
        }
      });
      if (P?.challenge) ide.note((P.challengePassed || P.challenge.passed) ? '✅ You already passed this challenge. You can keep experimenting and resubmit.' : `Last try: ${P.challenge.passCount}/${P.challenge.total} checks passed. Pass every check to complete this lesson.`);
      if (ME.robot) ide.sim.setLook(ME.robot);
      cleanup = () => { saveDraft(); ide.destroy(); };
    }
    renderQuiz(L, P, teacher);
  }

  // ---- team photos: shrunk in the browser, then saved privately to the teacher's Drive
  function shrinkPhoto(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) return reject(new Error('Please choose a photo.'));
      const url = URL.createObjectURL(file), img = new Image();
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file could not be opened as a photo.')); };
      img.onload = () => {
        const scale = Math.min(1, 1000 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', .72));
      };
      img.src = url;
    });
  }
  function showPhoto(img, id) { api('/api/photos/' + id).then(r => { img.src = r.image; }).catch(() => { img.alt = 'This photo could not be loaded.'; }); }
  function mountPhoto(box, o) {
    let photoId = o.photoId;
    const paint = () => {
      box.innerHTML = `<p style="margin-top:0"><b>${photoId ? '✅ Photo added.' : o.excused ? 'Your teacher has excused this photo.' : 'Required:'}</b> ${esc(o.prompt)}</p>
        <p class="small muted">One teammate uploads for the whole team. Robots only, please: no faces or names.</p>
        ${photoId ? `<img class="robot-photo" alt="Your team's robot photo">` : ''}
        <label class="btn file-btn">📷 ${photoId ? 'Replace photo' : 'Add a photo'}<input class="sr-only" type="file" accept="image/*" capture="environment"></label>
        <span class="small" role="status" data-state></span>`;
      if (photoId) showPhoto(box.querySelector('img'), photoId);
      box.querySelector('input').onchange = async e => {
        const state = box.querySelector('[data-state]'), file = e.target.files[0];
        if (!file) return;
        state.textContent = ' Uploading…';
        try {
          const r = await api('/api/photos', { body: { checkpoint: o.checkpoint, image: await shrinkPhoto(file) } });
          photoId = r.photo.id; paint(); toast('📸 Photo saved'); if (o.onDone) o.onDone(r);
        } catch (err) { state.textContent = ' ' + err.message; }
      };
    };
    paint();
  }

  let celebrated = null, lessonPlace = null;
  async function celebrate(L, progress) {
    if (!progress.completed || celebrated === L.id) return;
    celebrated = L.id;
    const part = Quest.part(L.id); if (!part) return;
    const heading = lessonPlace?.track === 'extra' ? '🚀 Upgrade installed!' : part.mission ? '🚩 Mission stage complete!' : '🔧 New part installed!';
    const m = modal(`<h2 style="margin-top:0">${heading}</h2>
      <div class="celebrate"><canvas width="220" height="220" role="img" aria-label="Your robot with its newest part installed"></canvas><div><p style="font-size:1.2rem;margin:0 0 6px"><b>${part.icon} ${esc(part.name)}</b></p><p>${esc(part.does)}</p>
      <div class="row"><a class="btn primary" href="#/robot">See my robot</a><a class="btn" href="#/map">Moon map</a><button class="btn" id="cx">Keep going</button></div></div></div>`);
    m.querySelector('#cx').onclick = () => m.remove();
    m.querySelectorAll('a').forEach(a => a.addEventListener('click', () => m.remove()));
    const { lessons } = await api('/api/lessons');
    Quest.drawBuild(m.querySelector('canvas'), ME.robot, completedIds(lessons), true);
  }

  function renderQuiz(L, P, teacher) {
    const box = document.getElementById('quizbox'); const done = !!P?.quiz && !teacher;
    const quiz = L.quiz || [], rules = L.quizRules || { tries: 3, pass: .7 };
    const revealed = quiz.some(q => q.answer !== undefined); // the server sends answers only when the ticket is finished
    const needed = Math.ceil(rules.pass * quiz.length), tries = P?.quizAttempts || 0, left = Math.max(0, rules.tries - tries);
    const best = done ? Math.max(P.quiz.score, P.quizBest || 0) : 0, passed = best >= needed;
    const scoreNote = !done ? '' : P.quiz.score === P.quiz.total ? 'Perfect! 🌟'
      : revealed && !passed ? `You've used all ${rules.tries} tries. Read the explanations below, then talk to your teacher so you can move on.`
      : revealed ? 'Read the explanations below to see what you missed.'
      : `${passed ? 'You passed. ' : `You need ${needed} correct to complete this lesson. `}Look again at question${P.quiz.missed?.length === 1 ? '' : 's'} ${(P.quiz.missed || []).join(', ')}. ${left} ${left === 1 ? 'try' : 'tries'} left.`;
    box.innerHTML = `
      ${teacher ? '' : `<p class="small muted" style="margin-top:0">Get at least ${needed} of ${quiz.length} correct. You have ${rules.tries} tries, and the answers appear when you finish.</p>`}
      ${done ? `<div class="msg ${passed ? 'good' : 'bad'}" style="margin-bottom:12px">You scored <b>${P.quiz.score}/${P.quiz.total}</b>${tries > 1 ? ` (try ${tries})` : ''}. ${scoreNote}</div>` : ''}
      <form id="qf">
        ${quiz.map((q, i) => `<div class="q" role="group" aria-labelledby="q${i}-label"><b id="q${i}-label">${i + 1}. ${esc(q.q)}</b>${q.code ? `<pre class="code">${esc(q.code)}</pre>` : ''}<div class="opts">
          ${q.choices.map((c, j) => {
            const picked = done && Number(P.quiz.answers[i]) === j; const cls = (done || teacher) && q.answer !== undefined ? (j === q.answer ? (done || teacher ? 'right' : '') : picked ? 'wrong' : '') : '';
            return `<label class="${done || teacher ? cls : ''}"><input type="radio" name="q${i}" value="${j}" ${picked ? 'checked' : ''} required> <span>${esc(c)}</span>${(done || teacher) && j === q.answer ? ' <b>✓ Correct answer</b>' : picked && q.answer !== undefined && j !== q.answer ? ' <b>✗ Your answer</b>' : ''}</label>`;
          }).join('')}</div>
          ${(done || teacher) && q.explain ? `<div class="explain">💡 ${esc(q.explain)}</div>` : ''}</div>`).join('')}
        ${L.reflection ? `<label class="f">✍️ Reflection: ${esc(L.reflection)}<textarea name="reflection" rows="3" required>${esc(P?.reflection || '')}</textarea></label>
          ${L.supports?.frames?.length ? `<p class="small muted" style="margin-top:-6px"><b>Need a start?</b> ${L.supports.frames.map(esc).join(' &nbsp;·&nbsp; ')}</p>` : ''}` : ''}
        ${teacher ? '<p class="muted small">Teacher preview — correct answers are highlighted.</p>' : (revealed ? '' : `<button class="btn primary">${done ? 'Try again' : 'Submit exit ticket'}</button>`)}
        ${!teacher && document.getElementById('photobox') ? '<p class="muted small">This lesson also needs your team\'s build photo before it counts as complete.</p>' : ''}
        ${!teacher && L.challenge && !P?.challenge ? '<p class="muted small">Remember to <b>Check & Submit</b> the code challenge too — both are needed to complete the lesson.</p>' : ''}
      </form>`;
    if (teacher || revealed) return;
    box.querySelector('#qf').onsubmit = async e => {
      e.preventDefault(); const fd = new FormData(e.target);
      const answers = quiz.map((_, i) => Number(fd.get('q' + i)));
      try {
        const r = await api(`/api/lessons/${L.id}/quiz`, { body: { answers, reflection: fd.get('reflection') || '' } });
        toast(`Exit ticket: ${r.progress.quiz.score}/${r.progress.quiz.total}`); renderQuiz(adaptLesson(r.lesson, mySetup()), r.progress, false); celebrate(L, r.progress);
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

  const ADAPT_SAMPLE = 'Optical.color() DistanceSensor. BumperA. TouchLED. ClawMotor. ArmMotor. BrainInertial 2nd gen';
  // Saved per user in this browser and shared by every editor on the site.
  const EDITOR_DEFAULTS = { fontSize: 14, theme: 'retro', indent: 2, lineNumbers: true, wrap: false, closeBrackets: true, matchBrackets: true };
  const EDITOR_THEMES = { retro: 'Match the site', paper: 'Notepad white', terminal: 'Terminal green', night: 'Night' };
  const EDITOR_FONT_SIZES = [12, 14, 16, 18, 20, 24], EDITOR_INDENTS = [2, 4];
  const editorKey = () => 'editor:' + (ME?.id || 'guest');
  function loadEditorPrefs() {
    let p = {}; try { p = JSON.parse(localStorage.getItem(editorKey())) || {}; } catch (e) {}
    const out = { ...EDITOR_DEFAULTS };
    if (EDITOR_FONT_SIZES.includes(p.fontSize)) out.fontSize = p.fontSize;
    if (Object.hasOwn(EDITOR_THEMES, p.theme)) out.theme = p.theme;
    if (EDITOR_INDENTS.includes(p.indent)) out.indent = p.indent;
    for (const k of ['lineNumbers', 'wrap', 'closeBrackets', 'matchBrackets']) if (typeof p[k] === 'boolean') out[k] = p[k];
    return out;
  }
  const options = (values, current, label = v => v) => values.map(v => `<option value="${v}" ${String(v) === String(current) ? 'selected' : ''}>${esc(label(v))}</option>`).join('');

  // Students use their class's kit; teachers pick theirs in Robot Setup.
  const myGen = () => MYCLASS ? +MYCLASS.kit : (ME.setup?.gen || 1);
  const mySetup = () => VexSim.normalizeSetup(ME.setup, myGen());
  function adaptLesson(lesson, setup) {
    const checks = lesson.challenge?.checks, out = JSON.parse(VexSim.adaptText(JSON.stringify(lesson), setup));
    if (checks) out.challenge.checks = checks; // always written in lesson names; student code is mapped to them when checked
    return out;
  }

  // VEXcode needs a few lines the simulator doesn't, so they're added here.
  function forVexcode(source) {
    let c = source.trim();
    const includes = [], usings = [];
    if (/\bcout\b/.test(c)) includes.push('#include <iostream>');
    if (/\bstring\b/.test(c)) { includes.push('#include <string>'); if (!/std::string/.test(c)) usings.push('using std::string;'); }
    if (/\bvector\b/.test(c)) { includes.push('#include <vector>'); if (!/std::vector/.test(c)) usings.push('using std::vector;'); }
    if (/(^|[^:\w])cout\b/.test(c)) usings.push('using std::cout;', 'using std::endl;');
    c = c.replace(/^[ \t]*#include\s*"vex\.h"[ \t]*\n?/m, '').replace(/^[ \t]*using\s+namespace\s+vex\s*;[ \t]*\n?/m, '').trim();
    if (!/vexcodeInit/.test(c)) c = c.replace(/int\s+main\s*\(\s*\)\s*\{/, m => m + '\n  vexcodeInit();');
    return ['#include "vex.h"', ...includes, 'using namespace vex;', ...usings, '', c, ''].join('\n');
  }
  function copyForVexcode(source, setup) {
    const code = forVexcode(source);
    const m = modal(`<h2 style="margin-top:0">📋 Copy for VEXcode</h2>
      <ol class="small"><li>Press <b>Copy code</b>, then open ${VEXCODE_LINK('VEXcode IQ ↗', 'btn sm')} <button class="btn sm" type="button" id="split" title="Put VEXcode IQ and RoboCode side by side">⧉ Side by side</button></li><li>In VEXcode IQ, open a new C++ text project for your robot's Brain.</li><li>In <b>Devices</b>, add the same devices, ports and names as your Robot Setup.</li><li>Replace everything in <b>main.cpp</b> with your code, then download it to your robot.</li></ol>
      <p class="small muted">First time? The lesson <a href="#/lesson/u1v1">From Simulator to Robot: VEXcode IQ</a> shows every step with pictures.</p>
      <textarea id="vex-code" class="input" rows="12" readonly spellcheck="false" aria-label="Code to paste into VEXcode" style="font-family:var(--mono)">${esc(code)}</textarea>
      <details style="margin-top:8px"><summary class="small">Devices to add in VEXcode</summary><pre class="code">${esc(VexSim.generatedConfig(setup))}</pre></details>
      <div class="row" style="margin-top:12px"><button class="btn primary" id="do-copy">Copy code</button><span class="small" role="status" id="copy-state"></span><div class="spacer"></div><button class="btn" id="cx">Close</button></div>`);
    const area = m.querySelector('#vex-code'), state = m.querySelector('#copy-state');
    m.querySelector('#cx').onclick = () => m.remove();
    m.querySelector('#split').onclick = sideBySideHelp;
    m.querySelectorAll('a[href^="#"]').forEach(x => x.addEventListener('click', () => m.remove()));
    m.querySelector('#do-copy').onclick = async () => {
      area.focus(); area.select();
      let ok = false;
      try { await navigator.clipboard.writeText(code); ok = true; } catch (e) { try { ok = document.execCommand('copy'); } catch (e2) {} } // Apps Script pages may block the newer clipboard
      state.textContent = ok ? 'Copied ✔ Now paste it into VEXcode IQ.' : 'Press Ctrl+C to copy.';
    };
  }

  function createIDE(host, opts) {
    let prefs = loadEditorPrefs(), setup = opts.setup || mySetup();
    host.innerHTML = `
      <div class="ide-bar">
        <button class="btn go" data-a="run">▶ Run</button><button class="btn stop" data-a="stop" disabled>■ Stop</button>
        <button class="btn" data-a="reset">↺ Reset robot</button>
        <select class="input" data-a="speed" style="width:auto;margin:0"><option value="1">1× speed</option><option value="2">2×</option><option value="4">4×</option><option value="10">10×</option></select>
        <button class="btn" data-a="setup" aria-expanded="false">🔌 Robot Setup</button>
        ${opts.setup ? '' : `<button class="btn" data-a="copy">📋 Copy for VEXcode</button>${VEXCODE_LINK('VEXcode IQ ↗', 'btn')}<button class="btn" data-a="split" title="Put VEXcode IQ and RoboCode side by side" aria-label="Put VEXcode IQ and RoboCode side by side">⧉</button>`}
        <button class="btn" data-a="settings" aria-expanded="false">⚙ Editor settings</button>
        <div class="spacer"></div>
        ${opts.starter ? '<button class="btn sm" data-a="restore">Restore starter code</button>' : ''}
        ${opts.checks?.length ? `<button class="btn primary" data-a="check">✔ ${esc(opts.submitLabel || 'Check')}</button>` : ''}
      </div>
      <form class="ide-setup" hidden></form>
      <form class="ide-settings" hidden>
        <label class="f">Text size<select name="fontSize">${options(EDITOR_FONT_SIZES, prefs.fontSize, v => v + ' pt')}</select></label>
        <label class="f">Colors<select name="theme">${options(Object.keys(EDITOR_THEMES), prefs.theme, v => EDITOR_THEMES[v])}</select></label>
        <label class="f">Indent size<select name="indent">${options(EDITOR_INDENTS, prefs.indent, v => v + ' spaces')}</select></label>
        <label class="small row"><input type="checkbox" name="lineNumbers" ${prefs.lineNumbers ? 'checked' : ''}> Line numbers</label>
        <label class="small row"><input type="checkbox" name="wrap" ${prefs.wrap ? 'checked' : ''}> Wrap long lines</label>
        <label class="small row"><input type="checkbox" name="closeBrackets" ${prefs.closeBrackets ? 'checked' : ''}> Auto-close brackets</label>
        <label class="small row"><input type="checkbox" name="matchBrackets" ${prefs.matchBrackets ? 'checked' : ''}> Highlight matching brackets</label>
        <button class="btn sm" type="button" data-a="settings-reset">Reset to defaults</button>
      </form>
      <div class="ide">
        <div><textarea></textarea><div class="ref" style="margin-top:10px"><b class="small">📚 Quick reference</b>${VexSim.adaptText(API_REF, setup)}${setup.gen === 1 ? '<p class="small muted">1st gen Brain screen: 5 rows, 21 columns.</p>' : ''}</div></div>
        <div class="simbox">
          <canvas width="960" height="720" role="img" aria-label="Robot simulator field. The robot's position, heading and results are written as text beside it."></canvas>
          <div class="hud"></div>
          <div class="brain"><span class="small muted">🧠 Brain screen / output</span><div class="brain-screen"></div></div>
          <div class="msg" data-m role="status" aria-live="polite"></div>
          <ul class="checks" aria-live="polite"></ul>
          <p class="sr-only" data-summary aria-live="polite"></p>
        </div>
      </div>`;
    const q = s => host.querySelector(s);
    const cm = CodeMirror.fromTextArea(q('textarea'), { mode: 'text/x-c++src', readOnly: !!opts.readOnly, extraKeys: { 'Ctrl-Enter': () => doRun(), 'Cmd-Enter': () => doRun() } });
    cm.setValue(opts.code || '');
    function applyPrefs() {
      cm.setOption('theme', prefs.theme); cm.setOption('indentUnit', prefs.indent); cm.setOption('tabSize', prefs.indent);
      cm.setOption('lineNumbers', prefs.lineNumbers); cm.setOption('lineWrapping', prefs.wrap);
      cm.setOption('autoCloseBrackets', prefs.closeBrackets); cm.setOption('matchBrackets', prefs.matchBrackets);
      cm.getWrapperElement().style.fontSize = prefs.fontSize + 'px'; cm.refresh();
    }
    applyPrefs();
    const settings = q('.ide-settings');
    function syncSettingsForm() {
      for (const el of settings.elements) { if (!el.name) continue; if (el.type === 'checkbox') el.checked = prefs[el.name]; else el.value = prefs[el.name]; }
    }
    settings.onsubmit = e => e.preventDefault();
    settings.onchange = () => {
      const f = settings.elements;
      prefs = { fontSize: +f.fontSize.value, theme: f.theme.value, indent: +f.indent.value, lineNumbers: f.lineNumbers.checked, wrap: f.wrap.checked, closeBrackets: f.closeBrackets.checked, matchBrackets: f.matchBrackets.checked };
      try { localStorage.setItem(editorKey(), JSON.stringify(prefs)); } catch (e) {}
      applyPrefs();
    };
    const setupBox = q('.ide-setup'), setupBtn = q('[data-a=setup]');
    const showSetup = open => { setupBox.hidden = !open; setupBtn.setAttribute('aria-expanded', String(open)); };
    const PORTS = Array.from({ length: 12 }, (_, i) => i + 1);
    const portSelect = (name, current) => `<select name="${name}" aria-label="${name} port">${options(PORTS, current, v => 'Port ' + v)}</select>`;
    function renderSetup() {
      const readOnly = !!opts.setup, s = setup;
      const jobs = Object.keys(VexSim.SETUP_JOBS).filter(job => job !== 'gyro' || s.gen === 1);
      const row = job => { const d = s.devices[job], J = VexSim.SETUP_JOBS[job]; return `<tr>
        <td><label class="row"><input type="checkbox" name="${job}.on" ${d.on ? 'checked' : ''}> ${job === 'color' ? `<select name="color.kind" aria-label="Color sensor type">${options(['color', 'optical'], d.kind, v => v === 'color' ? 'Color Sensor' : 'Optical Sensor')}</select>` : J.label}</label></td>
        <td>${portSelect(job + '.port', d.port)}</td>
        <td><input name="${job}.name" value="${esc(d.name)}" maxlength="20" spellcheck="false" aria-label="${J.label} name"></td></tr>`; };
      setupBox.innerHTML = `<p style="margin-top:0"><b>🔌 Robot Setup</b> · Tell your program what's plugged into your robot, just like the Devices window in VEXcode. Only add what your robot has.</p>
        ${!MYCLASS && !readOnly ? `<label class="f" style="max-width:220px">Brain<select name="gen">${options([1, 2], s.gen, v => `VEX IQ ${v === 1 ? '1st' : '2nd'} gen`)}</select></label>` : `<p class="small muted">Brain: VEX IQ ${s.gen === 1 ? '1st gen (no built-in inertial sensor, so add a Gyro Sensor for accurate turns)' : '2nd gen (inertial sensor built in)'}</p>`}
        <table class="tbl setup-tbl"><tr><th>Device</th><th>Smart Port</th><th>Name in your code</th></tr>
          <tr><td><b>Drivetrain</b> (left motor)</td><td>${portSelect('drive.left', s.drive.left)}</td><td rowspan="2"><code>Drivetrain</code></td></tr>
          <tr><td><b>Drivetrain</b> (right motor)</td><td>${portSelect('drive.right', s.drive.right)}</td></tr>
          ${jobs.map(row).join('')}</table>
        <div class="err" data-setup-err></div>
        ${readOnly ? '' : '<button class="btn primary">Save setup</button>'}
        <details style="margin-top:8px"><summary class="small">See the C++ this creates</summary><pre class="code">${esc(VexSim.generatedConfig(s))}</pre></details>`;
      if (readOnly) setupBox.querySelectorAll('input,select').forEach(el => { el.disabled = true; });
    }
    function readSetupForm() {
      const f = setupBox.elements, gen = f.gen ? +f.gen.value : setup.gen, out = VexSim.normalizeSetup({ ...setup, gen }, gen);
      out.drive = { left: +f['drive.left'].value, right: +f['drive.right'].value };
      for (const job of Object.keys(out.devices)) {
        if (!f[job + '.on']) continue;
        Object.assign(out.devices[job], { on: f[job + '.on'].checked, port: +f[job + '.port'].value, name: f[job + '.name'].value.trim() });
        if (job === 'color') out.devices.color.kind = f['color.kind'].value;
      }
      return out;
    }
    setupBox.onsubmit = async e => {
      e.preventDefault();
      const next = readSetupForm(), err = setupBox.querySelector('[data-setup-err]'), problem = VexSim.validateSetup(next);
      if (problem) { err.textContent = problem; return; }
      const textChanged = VexSim.adaptText(ADAPT_SAMPLE, next) !== VexSim.adaptText(ADAPT_SAMPLE, setup);
      try {
        const r = await api('/api/me/setup', { method: 'PUT', body: { setup: next } });
        ME.setup = r.setup; setup = VexSim.normalizeSetup(r.setup, next.gen);
        toast('Robot Setup saved 🔌'); renderSetup(); showSetup(false); setMsg('');
        if (textChanged && opts.onNewNames) opts.onNewNames();
      } catch (ex) { err.textContent = ex.message; }
    };
    renderSetup();
    const sim = new VexSim.Sim(q('canvas'), opts.field);
    const scr = q('.brain-screen'), hud = q('.hud'), msg = q('[data-m]');
    sim.on('screen', () => { scr.textContent = sim.screen.lines.join('\n'); scr.scrollTop = scr.scrollHeight; });
    let frame = 0;
    sim.on('frame', () => { if (frame++ % 6) return; const d = sim.rayDistance(); const [ox, oy] = sim.opticalPt();
      hud.innerHTML = `<span title="How long the program has been running in the simulator">sim time ${sim.t.toFixed(1)}s</span><span>🧭 ${sim.r.h.toFixed(0)}°</span><span>📍 (${sim.r.x.toFixed(1)}, ${sim.r.y.toFixed(1)}) in</span><span>📡 ${d === null ? '—' : d.toFixed(1) + ' in'}</span><span>🎨 ${sim.floorAt(ox, oy).color}</span>${sim.collisions ? `<span style="color:var(--bad)">💥 ${sim.collisions} bump${sim.collisions > 1 ? 's' : ''}</span>` : ''}`; });
    let errMark = null;
    const setMsg = (t, kind) => { msg.className = 'msg ' + (kind || ''); msg.textContent = t || ''; };
    sim.on('error', e => setMsg(e.message, 'bad'));
    cm.on('change', () => { if (errMark !== null) { cm.removeLineClass(errMark, 'background', 'err-line'); errMark = null; } opts.onChange && opts.onChange(cm.getValue()); });
    let running = false;
    async function doRun(withChecks) {
      if (running) return;
      if (!setup.confirmed) { showSetup(true); setMsg('Set up your robot first: choose its devices in Robot Setup, then press Save setup.', 'bad'); return; }
      running = true;
      q('[data-a=run]').disabled = true; q('[data-a=stop]').disabled = false; q('.checks').innerHTML = ''; setMsg(withChecks ? '🏁 Running your program for the auto-check…' : '');
      const code = cm.getValue();
      const r = await VexSim.run(sim, code, setup);
      q('[data-summary]').textContent = `Robot is now ${sim.r.x.toFixed(0)} inches across and ${sim.r.y.toFixed(0)} inches down the field, facing ${sim.r.h.toFixed(0)} degrees, with ${sim.collisions} collisions.`;
      if (!r.ok && /Robot Setup/.test(r.error || '')) showSetup(true);
      running = false; q('[data-a=run]').disabled = false; q('[data-a=stop]').disabled = true;
      if (!r.ok) {
        setMsg((r.line ? `Line ${r.line}: ` : '') + r.error, 'bad');
        if (r.line) { errMark = r.line - 1; cm.addLineClass(errMark, 'background', 'err-line'); cm.scrollIntoView({ line: errMark, ch: 0 }); }
        if (!withChecks) return;
      } else if (r.stopped) { setMsg('Program stopped.'); if (withChecks) return; }
      else if (!withChecks) setMsg('✅ Program finished.', 'good');
      if (withChecks) {
        const res = VexSim.evaluate(sim, VexSim.canonicalize(code, setup), opts.checks);
        if (!r.ok) res.unshift({ message: 'Program runs without errors', pass: false });
        q('.checks').innerHTML = res.map(c => `<li>${c.pass ? '✅' : '❌'} ${esc(c.message)}</li>`).join('');
        const all = res.every(c => c.pass);
        setMsg(all ? '🎉 All checks passed!' : `${res.filter(c => c.pass).length}/${res.length} checks passed — read the ❌ items, adjust, and try again.`, all ? 'good' : 'bad');
        if (opts.onSubmit) { try { await opts.onSubmit(code, res, sim.output); } catch (e) { setMsg('Could not submit: ' + e.message, 'bad'); } }
      }
    }
    host.addEventListener('click', e => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'setup') showSetup(setupBox.hidden);
      if (a === 'copy') copyForVexcode(cm.getValue(), setup);
      if (a === 'split') sideBySideHelp();
      if (a === 'settings') { settings.hidden = !settings.hidden; q('[data-a=settings]').setAttribute('aria-expanded', String(!settings.hidden)); }
      if (a === 'settings-reset') { prefs = { ...EDITOR_DEFAULTS }; try { localStorage.removeItem(editorKey()); } catch (e) {} syncSettingsForm(); applyPrefs(); }
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
  const ROBOT_COLORS = ['#f2f2f2', '#c0c0c0', '#222222', '#e5484d', '#f76b15', '#f5d90a', '#30a46c', '#008080', '#0b5cad', '#3e63dd', '#8e4ec6', '#ff69b4'];
  function robotWorkshop(host, onLook) {
    let look = VexSim.normalizeLook(ME.robot), saveTimer = null;
    const remember = () => { ME.robot = look; clearTimeout(saveTimer); saveTimer = setTimeout(() => api('/api/me/robot', { method: 'PUT', body: { robot: look } }).catch(() => {}), 1200); };
    const O = VexSim.LOOK_OPTIONS;
    const color = (name, label) => `<label class="f">${label}<input type="color" name="${name}" value="${look[name]}"></label>`;
    host.innerHTML = `<div class="sec-kind">🤖 Robot Workshop<span class="spacer"></span><button class="ctl close" type="button" id="rw-close" title="Close" aria-label="Close Robot Workshop">✕</button></div>
      <div class="workshop">
        <div><canvas class="robot-preview" width="400" height="400" aria-label="Preview of your robot"></canvas>
          <div class="row" style="margin-top:8px"><button class="btn sm" type="button" id="rw-random">🎲 Surprise me</button><button class="btn sm" type="button" id="rw-reset">Reset</button></div></div>
        <form id="rw-form">
          <div class="workshop-fields">
            <label class="f">Robot name<input name="name" maxlength="12" placeholder="Name tag (optional)"></label>
            <label class="f">Body shape<select name="shape">${options(Object.keys(O.shape), look.shape, v => O.shape[v])}</select></label>
            <label class="f">Wheels<select name="wheels">${options(Object.keys(O.wheels), look.wheels, v => O.wheels[v])}</select></label>
            <label class="f">Decoration<select name="deco">${options(Object.keys(O.deco), look.deco, v => O.deco[v])}</select></label>
            ${color('body', 'Body color')}${color('brain', 'Brain color')}${color('decoColor', 'Decoration color')}${color('trail', 'Trail color')}
          </div>
          <p class="small muted" style="margin:0">Looks only! Your robot's size, speed and sensors stay the same, so your code behaves the same way. Your classmates see your design on the learning map.</p>
        </form>
      </div>`;
    const form = host.querySelector('#rw-form'), cv = host.querySelector('canvas'), ctx = cv.getContext('2d');
    form.elements.name.value = look.name;
    function preview() {
      const k = cv.width / 17, S = cv.width;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#d9dde3'; ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = '#c2c8d0'; ctx.lineWidth = 1; for (let i = k * 2; i < S; i += k * 3) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, S); ctx.moveTo(0, i); ctx.lineTo(S, i); ctx.stroke(); }
      ctx.translate(S / 2, S / 2 + k); VexSim.drawRobot(ctx, k, look); 
    }
    function commit() { remember(); onLook(look); preview(); }
    function fill() { for (const el of form.elements) if (el.name) el.value = look[el.name]; }
    form.onsubmit = e => e.preventDefault();
    form.oninput = () => { look = VexSim.normalizeLook(Object.fromEntries(new FormData(form))); commit(); };
    host.querySelector('#rw-random').onclick = () => {
      const pick = a => a[Math.floor(Math.random() * a.length)];
      look = VexSim.normalizeLook({ name: look.name, shape: pick(Object.keys(O.shape)), wheels: pick(Object.keys(O.wheels)), deco: pick(Object.keys(O.deco).slice(1)), body: pick(ROBOT_COLORS), brain: pick(ROBOT_COLORS), decoColor: pick(ROBOT_COLORS), trail: pick(ROBOT_COLORS) });
      fill(); commit();
    };
    host.querySelector('#rw-reset').onclick = () => { look = VexSim.normalizeLook(); fill(); commit(); };
    onLook(look); preview();
  }
  function playground() {
    let code = PLAY_CODE; try { code = localStorage.getItem('playground:' + ME.id) || PLAY_CODE; } catch (e) {}
    $app.innerHTML = `<div class="row"><div><h1>🧪 Code Lab</h1><p class="muted" style="margin-top:0">A free sandbox to try ideas. Your code is saved in this browser.</p></div><div class="spacer"></div>
      <label class="small">Field: <select class="input" id="fsel" style="display:inline-block;width:auto">${Object.keys(FIELDS).map(k => `<option>${k}</option>`).join('')}</select></label>
      <button class="btn" id="rw-open" aria-expanded="false">🤖 Customize robot</button></div>
      <div class="panel sec" id="workshop" hidden></div>
      <div class="panel" id="ide"></div>`;
    const ide = createIDE(document.getElementById('ide'), { code, starter: PLAY_CODE, field: FIELDS['Open field'], onChange: c => { try { localStorage.setItem('playground:' + ME.id, c); } catch (e) {} } });
    document.getElementById('fsel').onchange = e => ide.setField(FIELDS[e.target.value]);
    const shop = document.getElementById('workshop'), shopBtn = document.getElementById('rw-open');
    robotWorkshop(shop, look => ide.sim.setLook(look));
    const toggleShop = open => { shop.hidden = !open; shopBtn.setAttribute('aria-expanded', String(open)); };
    shopBtn.onclick = () => toggleShop(shop.hidden);
    document.getElementById('rw-close').onclick = () => { toggleShop(false); shopBtn.focus(); };
    cleanup = () => ide.destroy();
  }

  // ---------------------------------------------------------------- teacher
  const PLANS = { 10: '11-lesson term', 12: '13-lesson term', 15: '16-lesson term', all: 'Full course (29 lessons)' }; // keys are stored on classes, so they keep their original names
  const KITS = { 1: 'VEX IQ 1st gen', 2: 'VEX IQ 2nd gen' };
  const PLAN_OPTIONS = current => options(Object.keys(PLANS), current, v => PLANS[v]);
  const KIT_OPTIONS = current => options(Object.keys(KITS), current, v => KITS[v]);
  async function teacherHome() {
    const { classes } = await api('/api/teacher/classes');
    $app.innerHTML = `
      <div class="row"><h1>👩‍🏫 Teacher Dashboard</h1><div class="spacer"></div><a class="btn" href="#/teacher/lessons">📚 Lessons & videos</a></div>
      <div class="cards" style="margin-top:12px">
        ${classes.map(c => `<a class="lcard class-card" href="#/teacher/class/${c.id}"><span class="num">CLASS</span><h3>${esc(c.name)}</h3>
          <span class="muted small">Join code</span><span class="joincode">${esc(c.code)}</span><span class="small muted">${c.studentCount} student${c.studentCount === 1 ? '' : 's'} enrolled${c.closed ? ' · enrollment closed' : ''}</span></a>`).join('')}
        <form class="lcard" id="newc" style="justify-content:center"><h3>➕ New class</h3><input class="input" name="name" placeholder="e.g. Period 3 — Robotics" required><select class="input" name="plan" aria-label="Term length">${PLAN_OPTIONS('15')}</select><select class="input" name="kit" aria-label="Robot kit">${KIT_OPTIONS('1')}</select><button class="btn primary">Create class</button></form>
        <div class="lcard" style="justify-content:center"><h3>🎓 From Google Classroom</h3><p>Import a Classroom class and its roster. Students on the roster are enrolled automatically, with no join code.</p><button class="btn primary" id="importgc" type="button">Import a class</button></div>
      </div>
      <div class="panel" style="margin-top:22px"><h3>How students enroll</h3>
        <ol><li>Create a class above to get a 6-letter <b>join code</b>, or import one from Google Classroom so rostered students are enrolled automatically.</li><li>Students open this website while signed in to their school Google account, then type the code and their name.</li><li>Open the class to watch progress live, read submitted code, and leave feedback & grades.</li></ol>
        <p class="muted small">Lessons unlock in order: a student finishes a lesson by submitting its exit ticket and code challenge. You can unlock lessons for a class at any time.</p></div>`;
    document.getElementById('importgc').onclick = () => importClassroomModal().catch(err => toast(err.message));
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
        ${data.events.map(e => `<a class="btn sm" href="#/teacher/class/${C.id}/event/${e.id}">${e.icon} ${esc(e.title)}${e.status === 'done' ? ' ✓' : ''}</a>`).join('')}<a class="btn sm primary" href="#/teacher/class/${C.id}/screen">📺 Class Screen</a><button class="btn sm" id="teams">👥 Teams</button><button class="btn sm" id="photos">📸 Photos</button><button class="btn sm" id="gc">🎓 Google Classroom</button><a class="btn sm" href="#/map/${C.id}">🚀 Moon map</a><button class="btn sm" id="export">📊 Export to Google Sheets</button><button class="btn sm" id="settings">⚙ Class settings</button></div>
      <div class="stats">
        <div class="stat"><span class="muted small">Students</span><b>${students.length}</b></div>
        <div class="stat"><span class="muted small">Lessons completed (all students)</span><b>${students.reduce((n, s) => n + Object.values(s.progress).filter(p => p.status === 'complete').length, 0)}</b></div>
        <div class="stat"><span class="muted small">Waiting for your review</span><b>${toReview}</b></div>
        <div class="stat"><span class="muted small">Progression</span><b style="font-size:1.1rem">${esc(PLANS[C.plan])} · ${esc(KITS[C.kit])}</b></div>
      </div>
      ${students.length ? `
      <div class="legend"><span><span class="cell complete">8/10</span> complete (quiz score)</span><span><span class="cell started">…</span> started</span><span><span class="cell none">·</span> not started</span><span><span class="cell complete review">✓</span> blue outline = new work to review</span><span><span class="cell started stuck">!</span> red outline = used all exit ticket tries, needs you</span><span>★ = Go Further lesson</span><span>Click any cell to view the student's work.</span></div>
      <div class="gridtbl"><table>
        <thead><tr><th class="l">Student</th><th>Done</th>${lessons.map(l => `<th class="vert" title="${esc(l.title)}">${l.track === 'extra' ? '★' : l.num + '.'} ${esc(l.title)}</th>`).join('')}</tr>
          <tr><th class="l small muted">Class quiz average</th><th></th>${lessons.map(l => { const a = avg(l); return `<th class="small muted">${a === null ? '' : a + '%'}</th>`; }).join('')}</tr></thead>
        <tbody>${students.map(s => `<tr><td class="l"><b>${esc(s.name)}</b><br><span class="small muted">@${esc(s.username)}</span> <button class="btn sm" data-stu="${s.id}" style="padding:2px 6px">⋯</button></td>
          <td><b>${lessons.filter(l => l.track === 'main' && s.progress[l.id]?.status === 'complete').length}</b></td>
          ${lessons.map(l => { const p = s.progress[l.id];
            if (!p) return `<td><button class="cell none" data-s="${s.id}" data-l="${l.id}" aria-label="${esc(s.name)}, ${esc(l.title)}: not started">·</button></td>`;
            const label = p.grade != null ? p.grade : p.quiz ? `${p.quiz.score}/${p.quiz.total}` : '…';
            const ch = l.hasChallenge ? (p.challenge ? (p.challenge.passed ? '' : '⚠') : '') : '';
            return `<td><button class="cell ${p.status} ${p.needsReview ? 'review' : ''} ${p.stuck ? 'stuck' : ''}" data-s="${s.id}" data-l="${l.id}" aria-label="${esc(s.name)}, ${esc(l.title)}: ${p.stuck ? 'needs help, ' : ''}${p.status}, ${label}" title="${p.challenge ? 'Challenge: ' + (p.challenge.passed ? 'passed' : p.challenge.passCount + '/' + p.challenge.total) : 'No code submitted'}">${label}${ch}</button></td>`; }).join('')}
        </tr>`).join('')}</tbody></table></div>` : `<div class="panel"><h3>No students yet</h3><p>Share the join code <span class="joincode">${esc(C.code)}</span> with your class. Students enter it the first time they open this website.</p></div>`}`;
    $app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => reviewModal(b.dataset.s, b.dataset.l, () => classPage(cid)));
    $app.querySelectorAll('[data-stu]').forEach(b => b.onclick = () => studentModal(students.find(s => s.id === b.dataset.stu), cid));
    document.getElementById('settings').onclick = () => settingsModal(C, lessons, units);
    const guarded = fn => () => fn().catch(err => toast(err.message));
    document.getElementById('teams').onclick = guarded(() => teamsModal(C));
    document.getElementById('photos').onclick = guarded(() => photosModal(C));
    document.getElementById('gc').onclick = guarded(() => classroomModal(C));
    document.getElementById('export').onclick = async e => {
      e.target.disabled = true;
      try {
        const { url } = await api(`/api/teacher/classes/${C.id}/export`, { body: {} });
        const m = modal(`<h2 style="margin-top:0">📊 Grades exported</h2><p><a class="btn primary" href="${esc(url)}">Open the Google Sheet</a></p><div class="row"><div class="spacer"></div><button class="btn" id="cx">Close</button></div>`);
        m.querySelector('#cx').onclick = () => m.remove();
      } catch (err) { toast(err.message); }
      e.target.disabled = false;
    };
  }

  function settingsModal(C, lessons) {
    const m = modal(`<h2>⚙ ${esc(C.name)} settings</h2>
      <label class="f">Class name<input name="name" value="${esc(C.name)}"></label>
      <div class="row" style="margin-bottom:10px"><label class="f" style="flex:1;min-width:180px">Term length<select name="plan">${PLAN_OPTIONS(C.plan)}</select></label><label class="f" style="flex:1;min-width:180px">Robot kit<select name="kit">${KIT_OPTIONS(C.kit)}</select></label></div>
      <p class="small muted" style="margin:-4px 0 10px">Lessons outside the term stay available as Go Further lessons. Changing the term never removes student work.</p>
      <label class="row"><input type="checkbox" name="unlockAll" ${C.unlockAll ? 'checked' : ''}> Unlock <b>all</b> lessons (students can jump ahead)</label>
      <label class="row" style="margin-top:8px"><input type="checkbox" name="closed" ${C.closed ? 'checked' : ''}> Close enrollment (join code stops working)</label>
      <label class="row" style="margin-top:8px"><input type="checkbox" name="showPeers" ${C.showPeers !== false ? 'checked' : ''}> Show classmates on the learning map (first name + last initial)</label>
      <h3 style="margin-top:18px">Unlock specific lessons</h3><p class="small muted">Useful if you want the whole class on the same lesson today.</p>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:6px">${lessons.map(l => `<label class="small row"><input type="checkbox" name="u" value="${l.id}" ${(C.unlocked || []).includes(l.id) ? 'checked' : ''}> ${l.track === 'extra' ? '★' : l.num + '.'} ${esc(l.title)}</label>`).join('')}</div>
      <div class="row" style="margin-top:18px"><button class="btn primary" id="sv">Save</button><button class="btn" id="nc">🔁 New join code</button><button class="btn" id="dl">🗑 Delete class</button><div class="spacer"></div><button class="btn" id="cx">Close</button></div>`);
    const get = n => m.querySelector(`[name=${n}]`);
    m.querySelector('#cx').onclick = () => m.remove();
    m.querySelector('#sv').onclick = async () => {
      await api(`/api/teacher/classes/${C.id}`, { method: 'PATCH', body: { name: get('name').value, unlockAll: get('unlockAll').checked, closed: get('closed').checked, showPeers: get('showPeers').checked, plan: get('plan').value, kit: get('kit').value, unlocked: [...m.querySelectorAll('[name=u]:checked')].map(x => x.value) } });
      m.remove(); toast('Saved'); classPage(C.id);
    };
    m.querySelector('#nc').onclick = async () => { if (!confirm('Make a new join code? The old one will stop working.')) return; await api(`/api/teacher/classes/${C.id}`, { method: 'PATCH', body: { newCode: true } }); m.remove(); classPage(C.id); };
    m.querySelector('#dl').onclick = async () => { if (!confirm('Delete this class?')) return; try { await api(`/api/teacher/classes/${C.id}`, { method: 'DELETE' }); m.remove(); location.hash = '#/teacher'; } catch (e) { toast(e.message); } };
  }

  async function studentModal(s, cid) {
    const { classes } = await api('/api/teacher/classes');
    const m = modal(`<h2>${esc(s.name)} <span class="muted small">@${esc(s.username)}</span></h2>
      <p class="small muted">Last login: ${s.lastLogin ? new Date(s.lastLogin).toLocaleString() : 'never'}</p>
      <h3>Name</h3><p class="small muted" style="margin:0 0 6px">Classmates see the first name and last initial on the learning map.</p><div class="row"><input class="input" id="nm" value="${esc(s.name)}" maxlength="60" style="max-width:240px;margin:0"><button class="btn" id="rn">Save name</button></div>
      <h3 style="margin-top:16px">Move to another class</h3><div class="row"><select class="input" id="mc" style="max-width:240px;margin:0">${classes.map(c => `<option value="${c.id}" ${c.id === cid ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><button class="btn" id="mv">Move</button></div>
      <h3 style="margin-top:16px">Remove</h3><button class="btn stop" id="rm">Remove student & all their work</button>
      <div class="row" style="margin-top:18px"><div class="spacer"></div><button class="btn" id="cx">Close</button></div>`);
    m.querySelector('#cx').onclick = () => m.remove();
    m.querySelector('#rn').onclick = async () => { try { await api(`/api/teacher/students/${s.id}/rename`, { body: { name: m.querySelector('#nm').value } }); m.remove(); toast('Name updated'); classPage(cid); } catch (e) { toast(e.message); } };
    m.querySelector('#mv').onclick = async () => { await api(`/api/teacher/students/${s.id}/move`, { body: { classId: m.querySelector('#mc').value } }); m.remove(); classPage(cid); };
    m.querySelector('#rm').onclick = async () => { if (!confirm(`Remove ${s.name}? This deletes all of their work.`)) return; await api(`/api/teacher/students/${s.id}`, { method: 'DELETE' }); m.remove(); classPage(cid); };
  }

  async function reviewModal(sid, lid, after) {
    const { student: S, lesson: L, progress: P } = await api(`/api/teacher/students/${sid}/lessons/${lid}`);
    const subs = P?.submissions || [];
    const last = subs[subs.length - 1];
    const m = modal(`
      <div class="row"><div><span class="muted small">UNIT ${L.unit}</span><h2 style="margin:0">${esc(S.name)} — ${esc(L.title)}</h2></div><div class="spacer"></div><button class="btn" id="cx">✕</button></div>
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
      <div class="row" style="margin-top:10px"><button class="btn primary" id="save">Save feedback</button><label class="small row"><input type="checkbox" id="mc"> Mark lesson complete (lets this student move on)</label></div>`);
    m.querySelector('#cx').onclick = () => { m.remove(); };
    if (subs.length) {
      const show = i => { const s = subs[i]; m.querySelector('#vcode').textContent = s.code; m.querySelector('#vchecks').innerHTML = s.checks.map(c => `<li>${c.pass ? '✅' : '❌'} ${esc(c.message)}</li>`).join(''); };
      show(subs.length - 1);
      m.querySelector('#ver').onchange = e => show(+e.target.value);
      m.querySelector('#runit').onclick = () => {
        const i = +m.querySelector('#ver').value; m.querySelector('#vcode').style.display = 'none';
        const ide = createIDE(m.querySelector('#vide'), { setup: S.setup ? VexSim.normalizeSetup(S.setup, S.setup.gen) : undefined, code: subs[i].code, field: L.challenge.field, checks: L.challenge.checks, submitLabel: 'Re-check', readOnly: false });
        setTimeout(() => ide.cm.refresh(), 50);
      };
    }
    m.querySelector('#save').onclick = async () => {
      await api(`/api/teacher/students/${sid}/lessons/${lid}/review`, { body: { grade: m.querySelector('#gr').value, feedback: m.querySelector('#fb').value, markComplete: m.querySelector('#mc').checked } });
      toast('Feedback saved'); m.remove(); after && after();
    };
  }

  async function lessonsAdmin() {
    const { lessons: full } = await api('/api/teacher/lessons-full');
    const lessons = full;
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

  // ---------------------------------------------------------------- teams
  async function teamPage() {
    const { team, photos, maxSize } = await api('/api/team');
    const act = async (url, body) => { try { await api(url, { body: body || {} }); const r = await api('/api/me'); ME = r.user; route(); } catch (e) { toast(e.message); } };
    if (!team) {
      $app.innerHTML = `<h1>🤝 Team</h1><p class="muted">Partners share one robot: its design, Robot Setup, photos and class events. You still do your own code and exit tickets.</p>
        <div class="cards"><div class="panel"><h3 style="margin-top:0">Start a team</h3><p class="small">You'll get a code to give your partners.</p><button class="btn primary" id="make">Create a team</button></div>
        <form class="panel" id="join"><h3 style="margin-top:0">Join a team</h3><label class="f">Team code<input name="code" maxlength="6" required style="text-transform:uppercase;letter-spacing:.2em;font-family:var(--mono)"></label><button class="btn primary">Join</button></form></div>`;
      document.getElementById('make').onclick = () => act('/api/team');
      document.getElementById('join').onsubmit = e => { e.preventDefault(); act('/api/team/join', { code: e.target.code.value }); };
      return;
    }
    $app.innerHTML = `<h1>🤝 ${esc(team.name)}</h1>
      <div class="panel"><p style="margin-top:0">Team code: <span class="joincode">${esc(team.code)}</span> <span class="small muted">Up to ${maxSize} teammates. Share this code with your partners.</span></p>
        <h3>Teammates</h3><div class="roster">${team.members.map(m => `<span class="chip ${m.id === ME.id ? 'me' : ''}">${esc(m.id === ME.id ? 'You' : m.name)}</span>`).join('')}</div>
        <div class="row" style="margin-top:14px"><button class="btn" id="name">🎲 New team name</button><a class="btn" href="#/robot">🔧 Our robot</a><div class="spacer"></div><button class="btn" id="leave">Leave team</button></div></div>
      <h2 style="margin-top:18px">📸 Our robot photos</h2>
      <div class="photo-grid">${photos.map(p => `<div class="photo-card"><img data-photo="${p.id}" alt="Robot photo for ${esc(p.label)}"><span class="small">${esc(p.label)}</span></div>`).join('') || '<p class="muted">Photos appear here as your team adds them in build lessons and events.</p>'}</div>`;
    document.getElementById('name').onclick = () => act('/api/team/rename');
    document.getElementById('leave').onclick = () => { if (confirm('Leave this team? You will go back to your own robot.')) act('/api/team/leave'); };
    $app.querySelectorAll('[data-photo]').forEach(img => showPhoto(img, img.dataset.photo));
  }
  async function teamsModal(C) {
    const { teams, solo } = await api(`/api/teacher/classes/${C.id}/teams`);
    const m = modal(`<h2 style="margin-top:0">👥 ${esc(C.name)} teams</h2>
      ${teams.map(t => `<h3>${esc(t.name)} <span class="small muted">code ${esc(t.code)}</span></h3><div class="roster">${t.members.map(s => `<span class="chip">${esc(s.name)} <button class="btn sm" data-rm="${s.id}" aria-label="Remove ${esc(s.name)} from ${esc(t.name)}">✕</button></span>`).join('')}</div>`).join('') || '<p class="muted">No teams yet. Students create them from the Team page.</p>'}
      <h3>Working alone (${solo.length})</h3><p class="small">${solo.map(esc).join(', ') || 'Nobody'}</p>
      <div class="row"><div class="spacer"></div><button class="btn" id="cx">Close</button></div>`);
    m.querySelector('#cx').onclick = () => m.remove();
    m.querySelectorAll('[data-rm]').forEach(b => b.onclick = async () => { try { await api(`/api/teacher/classes/${C.id}/teams/remove`, { body: { userId: b.dataset.rm } }); m.remove(); teamsModal(C); } catch (e) { toast(e.message); } });
  }
  async function photosModal(C) {
    const { photos } = await api(`/api/teacher/classes/${C.id}/photos`);
    const m = modal(`<h2 style="margin-top:0">📸 ${esc(C.name)} robot photos</h2>
      <div class="photo-grid">${photos.map(p => `<div class="photo-card"><img data-photo="${p.id}" alt="${esc(p.who)}: ${esc(p.label)}"><b class="small">${esc(p.who)}</b><br><span class="small">${esc(p.label)}</span><br><button class="btn sm" data-del="${p.id}">Delete</button></div>`).join('') || '<p class="muted">No photos yet.</p>'}</div>
      <div class="row" style="margin-top:12px"><span class="small muted">Deleting a photo means the team has to upload a new one.</span><div class="spacer"></div><button class="btn" id="cx">Close</button></div>`);
    m.querySelector('#cx').onclick = () => m.remove();
    m.querySelectorAll('[data-photo]').forEach(img => showPhoto(img, img.dataset.photo));
    m.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => { if (!confirm('Delete this photo?')) return; try { await api('/api/photos/' + b.dataset.del, { method: 'DELETE' }); b.closest('.photo-card').remove(); } catch (e) { toast(e.message); } });
  }

  // ---------------------------------------------------------------- class screen (for the projector)
  // The timer lives outside the page, so it keeps running while the teacher looks at other pages.
  const screenTimers = {};
  const fmtClock = sec => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
  function chime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.35, 0.7].forEach(t => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.25, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.3); });
    } catch (e) {}
  }
  const defaultInstructions = L => [
    ...L.sections.map(sec => `${(KIND[sec.kind] || ['•'])[0]} ${sec.title}`),
    L.hasChallenge ? '🤖 Finish the code challenge and press Check & Submit' : null,
    L.hasPhoto ? '📸 Upload your team build photo' : null,
    '📝 Turn in your exit ticket'
  ].filter(Boolean).join('\n');
  async function classScreen(cid, lessonId) {
    const load = () => api(`/api/teacher/classes/${cid}/screen${lessonId ? '/' + lessonId : ''}`);
    let d = await load();
    const T = screenTimers[cid] = screenTimers[cid] || { total: d.lesson.sections[0]?.minutes * 60 || 300, left: d.lesson.sections[0]?.minutes * 60 || 300, endAt: null, label: d.lesson.sections[0]?.title || 'Timer' };
    const L = d.lesson;
    $app.innerHTML = `<div class="cscreen">
      <div class="row cs-top">
        <a class="small" href="#/teacher/class/${cid}">← ${esc(d.class.name)}</a>
        <div class="spacer"></div>
        <label class="small">Today's lesson <select class="input" id="cs-lesson" style="display:inline-block;width:auto;margin:0 0 0 6px">${d.lessons.map(l => `<option value="${l.id}" ${l.id === L.id ? 'selected' : ''}>${l.num}. ${esc(l.title)}</option>`).join('')}</select></label>
        <button class="btn sm" id="cs-full" type="button">⛶ Full screen</button>
      </div>
      <div class="muted cs-kicker">Lesson ${L.num} · Unit ${L.unit}: ${esc(UNIT_NAMES[L.unit] || '')}</div>
      <h1 class="cs-title">${esc(L.title)}</h1>
      <div class="cs-grid">
        <div class="cs-main">
          <section class="panel cs-q"><div class="sec-kind">❓ Question of the Day</div><p>${esc(L.question || L.summary)}</p></section>
          <section class="panel"><div class="row"><div class="sec-kind" style="margin:0">📋 What to do today</div><div class="spacer"></div><button class="btn sm" id="cs-edit" type="button">✏️ Edit</button></div>
            <div id="cs-instr"></div></section>
          <section class="panel"><div class="sec-kind">🎯 Today's standards (MA DLCS)</div>
            ${L.standards.anchor.map(st => `<p class="cs-std"><b>${esc(st.code.replace('6-8.', ''))}</b> ${esc(st.text)}</p>`).join('')}
            ${L.standards.supporting.length ? `<p class="small muted" style="margin:8px 0 2px">Also practicing</p>${L.standards.supporting.map(st => `<p class="cs-std small"><b>${esc(st.code.replace('6-8.', ''))}</b> ${esc(st.text)}</p>`).join('')}` : ''}
            <p class="small muted" style="margin-bottom:0"><b>Goal:</b> ${L.objectives.map(esc).join(' ')}</p></section>
        </div>
        <div class="cs-side">
          <section class="panel cs-timer" id="cs-timer">
            <div class="sec-kind">⏲ Class timer</div>
            <div class="cs-label" id="cs-tlabel"></div>
            <div class="cs-clock" id="cs-clock" role="timer" aria-live="off"></div>
            <div class="bar"><i id="cs-tbar"></i></div>
            <div class="row" style="margin-top:10px"><button class="btn primary" id="cs-go" type="button"></button><button class="btn" id="cs-reset" type="button">↺ Reset</button><button class="btn" id="cs-plus" type="button">+1 min</button></div>
            <div class="row small" style="margin-top:8px">${L.sections.map((sec, i) => `<button class="btn sm" type="button" data-preset="${i}" title="${esc(sec.title)}" aria-label="${esc(sec.title)}, ${sec.minutes} minutes">${(KIND[sec.kind] || ['•'])[0]} ${sec.minutes}′</button>`).join('')}
              <button class="btn sm" type="button" data-preset="all">Whole lesson ${L.minutes}′</button>
              <label class="small row">Other <input class="input" id="cs-mins" type="number" min="1" max="120" value="10" style="width:64px;margin:0"> min <button class="btn sm" type="button" id="cs-set">Set</button></label></div>
          </section>
          <section class="panel"><div class="sec-kind">📊 Class progress</div><div id="cs-progress"></div></section>
          <section class="panel"><div class="sec-kind">🏆 Recent achievements</div><div id="cs-ach"></div></section>
        </div>
      </div></div>`;
    const $ = sel => $app.querySelector(sel);
    // --- instructions
    const drawInstr = () => {
      const lines = (d.instructions || defaultInstructions(L)).split('\n').map(x => x.trim()).filter(Boolean);
      $('#cs-instr').innerHTML = `<ol class="cs-steps">${lines.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`;
    };
    drawInstr();
    $('#cs-edit').onclick = () => {
      $('#cs-instr').innerHTML = `<textarea class="input" id="cs-text" rows="8" aria-label="Instructions for students, one step per line">${esc(d.instructions || defaultInstructions(L))}</textarea>
        <div class="row" style="margin-top:8px"><button class="btn primary sm" id="cs-save" type="button">Save</button><button class="btn sm" id="cs-default" type="button">Use the lesson's steps</button><button class="btn sm" id="cs-cancel" type="button">Cancel</button><span class="small muted">One step per line. Saved for this class and lesson.</span></div>`;
      const save = async text => { try { await api(`/api/teacher/classes/${cid}/screen`, { body: { lessonId: L.id, instructions: text } }); d.instructions = text.trim(); drawInstr(); toast('Instructions saved'); } catch (e) { toast(e.message); } };
      $('#cs-save').onclick = () => save($('#cs-text').value);
      $('#cs-default').onclick = () => save('');
      $('#cs-cancel').onclick = drawInstr;
    };
    // --- lesson picker (remembered for the class)
    $('#cs-lesson').onchange = async e => { try { await api(`/api/teacher/classes/${cid}/screen`, { body: { lessonId: e.target.value } }); } catch (err) {} delete screenTimers[cid]; Nav.go(`#/teacher/class/${cid}/screen/${e.target.value}`); };
    $('#cs-full').onclick = () => { const el = document.documentElement; try { (document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen()).catch(() => toast('Press F11 (or the full screen key) instead.')); } catch (e) { toast('Press F11 (or the full screen key) instead.'); } };
    // --- timer
    const remaining = () => T.endAt ? Math.max(0, (T.endAt - Date.now()) / 1000) : T.left;
    const drawTimer = () => {
      const left = remaining(), box = $('#cs-timer'); if (!box) return;
      $('#cs-clock').textContent = fmtClock(Math.ceil(left));
      $('#cs-tlabel').textContent = T.label;
      $('#cs-tbar').style.width = `${T.total ? 100 * left / T.total : 0}%`;
      $('#cs-go').textContent = T.endAt ? '⏸ Pause' : left > 0 ? '▶ Start' : '▶ Start';
      box.classList.toggle('done', left <= 0);
      if (T.endAt && left <= 0) { T.endAt = null; T.left = 0; chime(); drawTimer(); }
    };
    const setTimer = (sec, label) => { T.total = T.left = sec; T.endAt = null; T.label = label; drawTimer(); };
    $('#cs-go').onclick = () => { if (T.endAt) { T.left = remaining(); T.endAt = null; } else if (remaining() > 0) T.endAt = Date.now() + T.left * 1000; drawTimer(); };
    $('#cs-reset').onclick = () => setTimer(T.total, T.label);
    $('#cs-plus').onclick = () => { if (T.endAt) T.endAt += 60000; else T.left += 60; T.total += 60; drawTimer(); };
    $app.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => {
      const sec = b.dataset.preset === 'all' ? { minutes: L.minutes, title: 'Whole lesson' } : L.sections[+b.dataset.preset];
      setTimer(sec.minutes * 60, sec.title);
    });
    $('#cs-set').onclick = () => { const m = Math.max(1, Math.min(120, +$('#cs-mins').value || 10)); setTimer(m * 60, `${m} minutes`); };
    drawTimer();
    const tick = setInterval(drawTimer, 250);
    // --- progress and achievements, refreshed every minute
    const drawLive = () => {
      const p = d.progress, pct = n => p.total ? Math.round(100 * n / p.total) : 0;
      $('#cs-progress').innerHTML = p.total ? `
        <p class="small" style="margin-top:0">On <b>${esc(L.title)}</b>:</p>
        <div class="cs-stack" role="img" aria-label="${p.complete} finished, ${p.started} working, ${p.notStarted} not started"><i class="c" style="width:${pct(p.complete)}%"></i><i class="w" style="width:${pct(p.started)}%"></i></div>
        <div class="row small cs-legend"><span><i class="c"></i> ${p.complete} finished</span><span><i class="w"></i> ${p.started} working</span><span><i></i> ${p.notStarted} not started</span></div>
        <p class="small" style="margin:12px 0 4px">Where everyone is:</p>
        <div class="cs-where">${d.lessons.filter(l => d.at[l.id]).map(l => `<div><span>${l.num}. ${esc(l.title)}</span><b>${d.at[l.id]}</b></div>`).join('')}${d.at.done ? `<div><span>🏁 Finished the term</span><b>${d.at.done}</b></div>` : ''}</div>`
        : '<p class="muted">No students have joined yet.</p>';
      $('#cs-ach').innerHTML = d.achievements.length ? `<ul class="cs-ach">${d.achievements.map(a => {
        if (a.unit) return `<li>🏅 <b>${esc(a.who)}</b> earned the Unit ${a.unit} badge: ${esc(UNIT_NAMES[a.unit] || '')}</li>`;
        const part = Quest.part(a.lessonId);
        return `<li>${part ? part.icon : '✅'} <b>${esc(a.who)}</b> finished ${a.extra ? 'Go Further: ' : ''}${esc(a.title)}${part && !part.mission ? ` <span class="muted">· installed the ${esc(part.name)}</span>` : ''}</li>`;
      }).join('')}</ul>` : '<p class="muted">Finished lessons from the last 7 days show up here.</p>';
    };
    drawLive();
    const refresh = setInterval(async () => { try { d = await load(); drawLive(); } catch (e) {} }, 60000);
    cleanup = () => { clearInterval(tick); clearInterval(refresh); };
  }

  // ---------------------------------------------------------------- Google Classroom
  const COURSE_OPTIONS = (courses, current) => courses.map(c => `<option value="${esc(c.id)}" ${c.id === current ? 'selected' : ''}>${esc(c.name)}${c.section ? ' · ' + esc(c.section) : ''}</option>`).join('');
  const isoDate = d => d.toLocaleDateString('en-CA');
  async function importClassroomModal() {
    const { courses } = await api('/api/teacher/classroom/courses');
    const m = modal(`<h2 style="margin-top:0">🎓 Import from Google Classroom</h2>
      ${courses.length ? `<label class="f">Google Classroom class<select id="course">${COURSE_OPTIONS(courses)}</select></label>
      <label class="f">Term length<select id="plan">${PLAN_OPTIONS('15')}</select></label>
      <label class="f">Robot kit<select id="kit">${KIT_OPTIONS('1')}</select></label>
      <p class="small">Students on this Classroom roster are put in the class the first time they open the RoboCode link, signed in to their school account. Students who join Classroom later are added when you press <b>Refresh roster</b>. The join code still works too.</p>` : '<p>No active Google Classroom classes were found where you are a teacher.</p>'}
      <div class="err" id="ic-err"></div>
      <div class="row"><button class="btn primary" id="go" ${courses.length ? '' : 'disabled'}>Import class</button><div class="spacer"></div><button class="btn" id="cx">Cancel</button></div>`);
    m.querySelector('#cx').onclick = () => m.remove();
    m.querySelector('#go').onclick = async e => {
      e.target.disabled = true; m.querySelector('#ic-err').textContent = '';
      try {
        const r = await api('/api/teacher/classroom/import', { body: { courseId: m.querySelector('#course').value, plan: m.querySelector('#plan').value, kit: m.querySelector('#kit').value } });
        m.remove(); toast(`Imported ${r.class.name} with ${r.rosterCount} student${r.rosterCount === 1 ? '' : 's'} on the roster`);
        Nav.go('#/teacher/class/' + r.class.id);
      } catch (ex) { m.querySelector('#ic-err').textContent = ex.message; e.target.disabled = false; }
    };
  }
  async function classroomModal(C, startTab) {
    const [{ courses }, status] = await Promise.all([api('/api/teacher/classroom/courses'), api(`/api/teacher/classes/${C.id}/classroom/status`)]);
    let st = status, tab = startTab || (st.courseId ? 'assign' : 'link');
    const today = new Date(), inAWeek = new Date(Date.now() + 7 * 864e5);
    const m = modal(`<h2 style="margin-top:0">🎓 Google Classroom</h2>
      <div class="tabs" role="tablist"><button data-tab="link">Class & roster</button><button data-tab="assign">Post assignments</button><button data-tab="grades">Send grades</button></div>
      <div id="gc-body"></div><div class="err" id="gc-err"></div><div id="gc-result" role="status"></div>
      <div class="row" style="margin-top:12px"><div class="spacer"></div><button class="btn" id="cx">Close</button></div>`);
    const body = m.querySelector('#gc-body'), err = m.querySelector('#gc-err'), out = m.querySelector('#gc-result');
    const linked = () => st.courseId ? `<p>Linked to <b>${esc(st.courseName || 'a Classroom class')}</b>.</p>` : '<p class="msg bad">This class is not linked to Google Classroom yet. Choose its Classroom class on the <b>Class & roster</b> tab.</p>';
    const busy = (btn, text) => { btn.disabled = true; err.textContent = ''; out.textContent = text; };
    const draw = () => {
      m.querySelectorAll('[data-tab]').forEach(b => { b.classList.toggle('on', b.dataset.tab === tab); b.setAttribute('aria-selected', b.dataset.tab === tab); });
      out.textContent = ''; err.textContent = '';
      if (tab === 'link') {
        body.innerHTML = `${linked()}
          <label class="f">Google Classroom class<select id="course">${COURSE_OPTIONS(courses, st.courseId)}</select></label>
          <div class="row"><button class="btn primary" id="link" ${courses.length ? '' : 'disabled'}>${st.courseId ? 'Save & refresh roster' : 'Link class & load roster'}</button></div>
          ${st.courseId ? `<p class="small" style="margin-top:12px"><b>${st.rosterCount}</b> student${st.rosterCount === 1 ? '' : 's'} on the Classroom roster. They join this class automatically when they first open the RoboCode link.</p>
            ${st.notJoined.length ? `<p class="small"><b>Haven't opened RoboCode yet (${st.notJoined.length}):</b> ${st.notJoined.map(esc).join(', ')}</p>` : '<p class="small">Everyone on the roster has joined. ✅</p>'}` : ''}`;
        body.querySelector('#link').onclick = async e => {
          busy(e.target, 'Loading the roster…');
          try {
            await api(`/api/teacher/classes/${C.id}/classroom/link`, { body: { courseId: body.querySelector('#course').value } });
            st = await api(`/api/teacher/classes/${C.id}/classroom/status`); C.courseId = st.courseId; draw(); toast('Roster updated');
          } catch (ex) { out.textContent = ''; err.textContent = ex.message; e.target.disabled = false; }
        };
      } else if (tab === 'assign') {
        const next = st.lessons.find(l => !l.posted);
        body.innerHTML = `${linked()}
          <p class="small">Each lesson becomes a Classroom assignment out of 100, with a link that opens the lesson in RoboCode. <b>Send grades</b> fills in the scores later.</p>
          <div class="row small"><button class="btn sm" type="button" id="pick-next">Select next lesson</button><button class="btn sm" type="button" id="pick-none">Clear</button></div>
          <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:4px;margin:8px 0;max-height:260px;overflow:auto">
            ${st.lessons.map(l => `<label class="small row"><input type="checkbox" value="${esc(l.id)}" ${l.posted ? 'disabled' : ''} ${next && l.id === next.id ? 'checked' : ''}> ${l.num}. ${esc(l.title)}${l.posted ? ` <span class="muted">· ${{ publish: 'posted', schedule: 'scheduled', draft: 'draft in Classroom' }[l.mode] || 'in Classroom'}${l.due ? ', due ' + esc(l.due) : ''}</span>` : ''}</label>`).join('')}
          </div>
          <label class="f">Due date<input id="due" type="date" value="${isoDate(inAWeek)}" min="${isoDate(today)}"></label>
          <fieldset class="f" style="border:0;padding:0"><legend>When should students see it?</legend>
            <label class="row small"><input type="radio" name="mode" value="publish" checked> Post now</label>
            <label class="row small"><input type="radio" name="mode" value="schedule"> Schedule for <input id="at" type="datetime-local" value="${isoDate(new Date(Date.now() + 864e5))}T07:30" style="width:auto;display:inline-block;margin:0 0 0 6px"></label>
            <label class="row small"><input type="radio" name="mode" value="draft"> Save as a draft in Classroom (I'll post it there)</label>
          </fieldset>
          <div class="row"><button class="btn primary" id="post" ${st.courseId ? '' : 'disabled'}>Post to Classroom</button></div>`;
        const boxes = () => [...body.querySelectorAll('input[type=checkbox]:not(:disabled)')];
        body.querySelector('#pick-next').onclick = () => boxes().forEach((b, i) => { b.checked = i === 0; });
        body.querySelector('#pick-none').onclick = () => boxes().forEach(b => { b.checked = false; });
        body.querySelector('#post').onclick = async e => {
          const lessonIds = boxes().filter(b => b.checked).map(b => b.value);
          if (!lessonIds.length) { err.textContent = 'Choose at least one lesson.'; return; }
          const mode = body.querySelector('input[name=mode]:checked').value, at = body.querySelector('#at').value;
          busy(e.target, `Posting ${lessonIds.length} assignment${lessonIds.length === 1 ? '' : 's'}…`);
          try {
            const r = await api(`/api/teacher/classes/${C.id}/classroom/assign`, { body: { lessonIds, dueDate: body.querySelector('#due').value, mode, scheduleAt: mode === 'schedule' && at ? new Date(at).toISOString() : '' } });
            st = await api(`/api/teacher/classes/${C.id}/classroom/status`); draw();
            out.innerHTML = `<div class="msg ${r.errors.length ? 'bad' : 'good'}"><b>${r.posted} assignment${r.posted === 1 ? '' : 's'} ${mode === 'publish' ? 'posted' : mode === 'schedule' ? 'scheduled' : 'saved as drafts'}</b>${r.skipped ? `, ${r.skipped} already in Classroom` : ''}.</div>
              ${r.partial ? '<p class="small"><b>Not finished.</b> Press Post again to continue.</p>' : ''}
              ${r.noLink ? '<p class="small">The assignments have no link to the lesson, because the app\'s address could not be read. Students can open RoboCode from your usual link.</p>' : ''}
              ${r.errors.length ? `<ul class="small">${r.errors.slice(0, 10).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}`;
          } catch (ex) { out.textContent = ''; err.textContent = ex.message; e.target.disabled = false; }
        };
      } else {
        body.innerHTML = `${linked()}
          <label class="f">Due date for lessons not yet posted <span class="muted small">(must be inside your PowerSchool grading period)</span><input id="due" type="date" value="${isoDate(today)}"></label>
          <p class="small">Sends a grade out of 100 for each main-path lesson a student has tried. Each grade is yours if you entered one. Otherwise it's the student's exit ticket and code challenge score once they've tried both. Lessons you posted use their existing assignment. Others get a new one. Go Further lessons aren't sent.</p>
          ${st.lastSync ? `<p class="small muted">Last sent: ${new Date(st.lastSync).toLocaleString()}</p>` : ''}
          <div class="row"><button class="btn primary" id="go" ${st.courseId ? '' : 'disabled'}>Send grades</button></div>`;
        body.querySelector('#go').onclick = async e => {
          busy(e.target, 'Sending grades. This can take a few minutes…');
          try {
            const r = await api(`/api/teacher/classes/${C.id}/classroom/sync`, { body: { dueDate: body.querySelector('#due').value } });
            st = await api(`/api/teacher/classes/${C.id}/classroom/status`);
            out.innerHTML = `<div class="msg ${r.errors.length ? 'bad' : 'good'}"><b>${r.sent} grades sent</b>, ${r.unchanged} already up to date, ${r.assignments} new assignments.</div>
              ${r.partial ? '<p class="small"><b>Not finished.</b> Press Send grades again to continue.</p>' : ''}
              ${r.notOnRoster.length ? `<p class="small"><b>Not on the Classroom roster:</b> ${r.notOnRoster.map(esc).join(', ')}</p>` : ''}
              ${r.errors.length ? `<ul class="small">${r.errors.slice(0, 10).map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
              <p class="small"><b>Next:</b> in Google Classroom, open <b>Grades</b> and choose <b>SIS export</b> to send them to PowerSchool.</p>`;
          } catch (ex) { out.textContent = ''; err.textContent = ex.message; }
          e.target.disabled = false;
        };
      }
    };
    m.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; draw(); });
    m.querySelector('#cx').onclick = () => m.remove();
    draw();
  }

  // ---------------------------------------------------------------- class events
  const EVENT_STATUS = { upcoming: 'Coming up', live: 'Happening now', done: 'Finished' };
  const entrantName = (v, key) => key ? (v.entrants.find(x => x.key === key)?.name || 'Former team') : '…';
  function bracketHtml(v, editable) {
    if (!v.bracket) return `<p class="muted">The bracket appears here when your teacher creates it.</p>`;
    const n = v.bracket.rounds.length, title = r => r === n - 1 ? 'Final' : r === n - 2 ? 'Semifinals' : `Round ${r + 1}`;
    return `<div class="bracket">${v.bracket.rounds.map((round, r) => `<div class="bracket-round"><b class="small">${title(r)}</b>${round.map((match, i) => {
      const side = key => {
        const cls = `side ${match.winner && match.winner === key ? 'won' : ''} ${key && key === v.myKey ? 'mine' : ''}`;
        if (r === 0 && !key) return `<span class="${cls}"><i>Bye</i></span>`;
        return editable && match.a && match.b ? `<button class="${cls}" data-r="${r}" data-m="${i}" data-w="${esc(key)}" aria-label="${esc(entrantName(v, key))} wins">${esc(entrantName(v, key))}</button>` : `<span class="${cls}">${esc(entrantName(v, key))}</span>`;
      };
      return `<div class="match">${side(match.a)}${side(match.b)}</div>`;
    }).join('')}</div>`).join('')}</div>${n && v.bracket.rounds[n - 1][0].winner ? `<p><b>🏆 Champion: ${esc(entrantName(v, v.bracket.rounds[n - 1][0].winner))}</b></p>` : ''}`;
  }
  function leaderboardHtml(v) {
    if (!v.best.length) return '<p class="muted">No race times yet.</p>';
    return `<div class="gridtbl"><table class="tbl std"><thead><tr><th scope="col">Place</th><th scope="col">Team</th><th scope="col">Time</th><th scope="col">Wall touches</th><th scope="col">Final time</th></tr></thead><tbody>${v.best.map((b, i) => `<tr ${b.key === v.myKey ? 'style="font-weight:700"' : ''}><td>${i + 1}</td><td class="l">${esc(entrantName(v, b.key))}</td><td>${b.seconds.toFixed(1)} s</td><td>${b.touches}</td><td>${b.total.toFixed(1)} s</td></tr>`).join('')}</tbody></table></div>`;
  }
  const eventHead = v => `<div class="row"><h1 style="margin:0">${v.event.icon} ${esc(v.event.title)}</h1><span class="status-pill">${EVENT_STATUS[v.event.status]}</span></div>`;
  const eventRules = v => `<h3>Rules</h3><ul>${v.event.rules.map(r => `<li>${esc(r)}</li>`).join('')}</ul>`;
  async function eventPage(id) {
    const v = await api('/api/events/' + id), mine = v.entrants.find(e => e.key === v.myKey);
    $app.innerHTML = `<a class="small" href="#/">← My course</a>${eventHead(v)}
      <p class="muted">All teams meet for this event after <b>${esc(v.event.after)}</b>. The next lessons open when your teacher finishes it.</p>
      <div class="panel">${eventRules(v)}</div>
      <div class="panel sec"><div class="sec-kind">📸 Check in</div><div id="photobox"></div></div>
      <div class="panel sec"><div class="sec-kind">${v.event.kind === 'bracket' ? '🤼 Bracket' : '⏱ Leaderboard'}</div>${v.event.kind === 'bracket' ? bracketHtml(v, false) : leaderboardHtml(v)}<button class="btn sm" id="refresh" style="margin-top:8px">↻ Refresh</button></div>
      <h3>Teams (${v.entrants.length})</h3><div class="roster">${v.entrants.map(e => `<span class="chip ${e === mine ? 'me' : ''}">${e.checkedIn ? '✅' : '⏳'} ${esc(e.name)}</span>`).join('')}</div>`;
    mountPhoto(document.getElementById('photobox'), { checkpoint: 'event_' + id, prompt: v.event.photo, photoId: v.myPhotoId, onDone: () => route() });
    document.getElementById('refresh').onclick = () => route();
  }
  async function eventAdmin(cid, id) {
    const base = `/api/teacher/classes/${cid}/events/${id}`;
    let v = await api(base);
    const send = async (path, body) => { try { v = await api(base + path, { body }); paint(); } catch (e) { toast(e.message); } };
    function paint() {
      const missing = v.entrants.filter(e => !e.checkedIn);
      const results = v.event.kind === 'bracket' ? `
        <div class="row"><button class="btn primary" id="build">${v.bracket ? 'Redo bracket' : 'Create bracket'}</button><span class="small muted">Uses checked-in teams. Click a team to mark it the winner.</span></div>
        <div style="margin-top:10px">${bracketHtml(v, true)}</div>` : `
        <form id="race" class="row" style="align-items:flex-end"><label class="f" style="flex:2;min-width:160px">Team<select name="key" required>${v.entrants.map(e => `<option value="${esc(e.key)}">${esc(e.name)}</option>`).join('')}</select></label>
          <label class="f" style="flex:1;min-width:90px">Seconds<input name="seconds" type="number" min="0.1" step="0.1" required></label>
          <label class="f" style="flex:1;min-width:90px">Wall touches<input name="touches" type="number" min="0" step="1" value="0" required></label><button class="btn primary">Add run</button></form>
        ${leaderboardHtml(v)}
        ${v.times.length ? `<details style="margin-top:8px"><summary class="small">All runs (${v.times.length})</summary><ul class="small">${v.times.map(t => `<li>${esc(entrantName(v, t.key))}: ${t.seconds} s, ${t.touches} touches <button class="btn sm" data-del="${t.id}">Remove</button></li>`).join('')}</ul></details>` : ''}`;
      $app.innerHTML = `<a class="small" href="#/teacher/class/${cid}">← Back to class</a>${eventHead(v)}
        <div class="panel"><div class="row"><button class="btn" data-s="upcoming">Coming up</button><button class="btn" data-s="live">Start event</button><button class="btn primary" data-s="done">Finish and open next lessons</button></div>
        <p class="small muted" style="margin-bottom:0">The next lessons stay closed until you finish this event.</p></div>
        <div class="panel sec"><div class="sec-kind">${v.event.kind === 'bracket' ? '🤼 Bracket' : '⏱ Race times'}</div>${results}</div>
        <div class="panel sec"><div class="sec-kind">✅ Check-in (${v.entrants.length - missing.length} of ${v.entrants.length})</div>
          <div class="roster">${v.entrants.map(e => `<span class="chip">${e.checkedIn ? '✅' : '⏳'} ${esc(e.name)} <span class="small muted">${e.members.map(esc).join(', ')}</span>${e.checkedIn ? '' : ` <button class="btn sm" data-waive="${esc(e.key)}">Check in without photo</button>`}</span>`).join('') || '<span class="muted">No students yet.</span>'}</div></div>
        <div class="panel">${eventRules(v)}</div>`;
      $app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => {
        const noResult = v.event.kind === 'times' ? v.entrants.filter(e => !v.best.some(x => x.key === e.key)).length : v.bracket ? 0 : v.entrants.length;
        if (b.dataset.s === 'done' && noResult && !confirm(`${noResult} team(s) have no result. Finish anyway?`)) return;
        send('/status', { status: b.dataset.s });
      });
      $app.querySelectorAll('[data-waive]').forEach(b => b.onclick = () => send('/waive', { key: b.dataset.waive }));
      $app.querySelectorAll('[data-w]').forEach(b => b.onclick = () => send('/match', { round: +b.dataset.r, match: +b.dataset.m, winner: b.dataset.w }));
      $app.querySelectorAll('[data-del]').forEach(b => b.onclick = () => send('/time/remove', { id: b.dataset.del }));
      const build = document.getElementById('build'); if (build) build.onclick = () => { if (!v.bracket || confirm('Replace the current bracket?')) send('/bracket', {}); };
      const race = document.getElementById('race'); if (race) race.onsubmit = e => { e.preventDefault(); send('/time', Object.fromEntries(new FormData(e.target))); };
    }
    paint();
  }

  // ---------------------------------------------------------------- standards map
  async function standardsPage() {
    const { standards, lessons, plans } = await api('/api/teacher/standards');
    const short = c => c.replace('6-8.', '');
    const draw = plan => {
      const inPlan = lessons.filter(l => plan === 'all' || plans[plan].includes(l.id));
      const anchorSet = new Set(inPlan.flatMap(l => l.anchor)), anySet = new Set(inPlan.flatMap(l => [...l.anchor, ...l.supporting]));
      const nums = (code, key) => inPlan.filter(l => l[key].includes(code)).map(l => l.order).join(', ') || '—';
      const strands = [...new Set(standards.map(s => s.strand))];
      document.getElementById('std-body').innerHTML = `
        <div class="stats">
          <div class="stat"><span class="muted small">Lessons in this term</span><b>${inPlan.length}</b></div>
          <div class="stat"><span class="muted small">Standards assessed</span><b>${anchorSet.size}</b></div>
          <div class="stat"><span class="muted small">Standards addressed</span><b>${anySet.size} / ${standards.length}</b></div>
          <div class="stat"><span class="muted small">Lessons with an assessed standard</span><b>${inPlan.filter(l => l.anchor.length).length} / ${inPlan.length}</b></div>
        </div>
        <h2>By lesson</h2>
        <div class="gridtbl"><table class="tbl std"><thead><tr><th scope="col">#</th><th scope="col">Lesson</th><th scope="col">Assessed</th><th scope="col">Also practiced</th></tr></thead>
          <tbody>${inPlan.map(l => `<tr><td>${l.order}</td><td class="l">${esc(l.title)}</td><td class="l">${l.anchor.map(short).join(', ')}</td><td class="l">${l.supporting.map(short).join(', ') || '—'}</td></tr>`).join('')}</tbody></table></div>
        <h2 style="margin-top:20px">By standard</h2>
        ${strands.map(strand => `<h3>${esc(strand)}</h3><div class="gridtbl"><table class="tbl std"><thead><tr><th scope="col">Code</th><th scope="col">Standard</th><th scope="col">Assessed in lesson</th><th scope="col">Practiced in lesson</th></tr></thead>
          <tbody>${standards.filter(s => s.strand === strand).map(s => `<tr class="${anySet.has(s.code) ? '' : 'gap'}"><td>${short(s.code)}</td><td class="l">${esc(s.text)}</td><td>${nums(s.code, 'anchor')}</td><td>${nums(s.code, 'supporting')}</td></tr>`).join('')}</tbody></table></div>`).join('')}`;
    };
    $app.innerHTML = `<div class="row"><h1 style="margin:0">📋 MA DLCS Standards Map</h1><div class="spacer"></div>
      <label class="small">Term: <select class="input" id="std-plan" style="display:inline-block;width:auto">${PLAN_OPTIONS('15')}</select></label></div>
      <p class="muted">Massachusetts Digital Literacy and Computer Science standards, grades 6-8. Lesson numbers are positions in the full course. Rows in gray aren't addressed in this term.</p>
      <div id="std-body"></div>`;
    document.getElementById('std-plan').onchange = e => draw(e.target.value);
    draw('15');
  }

  // ---------------------------------------------------------------- my robot
  async function robotPage() {
    const { lessons } = await api('/api/lessons');
    const built = completedIds(lessons), isDone = l => built.has(l.id);
    const parts = buildParts(lessons), mission = lessons.filter(l => l.track === 'main' && Quest.part(l.id)?.mission), upgrades = lessons.filter(l => l.track === 'extra');
    const installed = parts.filter(isDone).length, total = parts.length;
    const nextLesson = parts.find(l => !isDone(l)), nextPart = Quest.part(nextLesson?.id);
    const finished = installed === total, certified = finished && mission.every(isDone);
    const status = certified ? '🏅 Rescue Certified! Your robot finished the mission.' : finished ? '🚩 Build complete. Your rescue mission is open!' : `Next part: ${nextPart.icon} ${esc(nextPart.name)}, earned by finishing Lesson ${nextLesson.num}.`;
    const row = l => { const p = Quest.part(l.id), on = isDone(l); return `<a class="part ${on ? 'on' : ''} ${l.unlocked ? '' : 'locked'}" href="#/lesson/${l.id}">
      <span class="ico">${on ? p.icon : l.unlocked ? '○' : '🔒'}</span><span><b>${esc(p.name)}</b><br><span class="small muted">${l.track === 'extra' ? '' : `Lesson ${l.num}: `}${esc(l.title)}</span><br><span class="small">${esc(p.does)}</span></span></a>`; };
    $app.innerHTML = `<h1>🔧 My Rescue Robot</h1>
      <div class="hangar">
        <div><canvas class="robot-preview" id="build" width="480" height="480" aria-label="Your robot with ${installed} of ${total} parts"></canvas>
          <button class="btn" id="custom" style="width:100%;margin-top:8px" aria-expanded="false">🎨 Customize colors and style</button></div>
        <div>
          <div class="panel"><b style="font-size:1.3rem">${installed} / ${total} parts installed</b><div class="bar" style="margin:8px 0"><i style="width:${100 * installed / (total || 1)}%"></i></div><p style="margin:0">${status}</p>
            ${nextLesson?.unlocked ? `<a class="btn primary" style="margin-top:10px" href="#/lesson/${nextLesson.id}">Go earn it →</a>` : ''}</div>
          <div class="panel sec" id="workshop" hidden style="margin-top:12px"></div>
        </div>
      </div>
      <h2 style="margin-top:20px">🧩 This term's build</h2>
      <div class="parts">${parts.map(row).join('')}</div>
      <h2 style="margin-top:20px">🚩 The Rescue Mission</h2>
      <p class="muted" style="margin-top:0">Your finished robot proves itself in the capstone.</p>
      <div class="parts">${mission.map(row).join('')}</div>
      ${upgrades.length ? `<h2 style="margin-top:20px">🚀 Go Further upgrades</h2>
      <p class="muted" style="margin-top:0">Optional. Finish a Go Further lesson to add its upgrade to your robot.</p>
      <div class="parts">${upgrades.map(row).join('')}</div>` : ''}`;
    const canvas = document.getElementById('build'), shop = document.getElementById('workshop'), btn = document.getElementById('custom');
    const draw = look => Quest.drawBuild(canvas, look, built, true);
    robotWorkshop(shop, draw);
    const toggle = open => { shop.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
    btn.onclick = () => toggle(shop.hidden);
    document.getElementById('rw-close').onclick = () => { toggle(false); btn.focus(); };
  }

  // ---------------------------------------------------------------- learning map
  async function mapPage(cid) {
    const teacher = ME.role === 'teacher';
    let classes = [];
    if (teacher) {
      ({ classes } = await api('/api/teacher/classes'));
      cid = cid || classes[0]?.id;
      if (!cid) { $app.innerHTML = `<div class="panel"><h2>No classes yet</h2><p>Create a class to see its learning map.</p><a class="btn" href="#/teacher">Go to classes</a></div>`; return; }
    }
    const data = await api(teacher ? '/api/map/' + cid : '/api/map');
    const { stops, svg } = Quest.renderMap(data);
    const peers = data.class.showPeers;
    const stopName = i => stops[i]?.finish ? '🌕 Moon Base' : stops[i].lesson.event ? `${stops[i].lesson.icon} ${stops[i].lesson.title}` : `Lesson ${stops[i].lesson.num}`;
    $app.innerHTML = `<div class="row" style="margin-bottom:10px"><div><h1 style="margin:0">🚀 Mission to the Moon</h1><p class="muted" style="margin:0">${esc(data.class.name)}${!teacher && !peers ? ' · Your teacher has turned off classmates on this map.' : ''}</p></div><div class="spacer"></div>
      ${teacher ? `<label class="small">Class: <select class="input" id="mapc" style="display:inline-block;width:auto">${classes.map(c => `<option value="${c.id}" ${c.id === cid ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>` : ''}</div>
      ${(me => me ? `<p style="margin:0 0 8px"><b>${Math.round(Quest.MOON_KM * Math.min(1, me.at / (stops.length - 1))).toLocaleString()} km</b> of ${Quest.MOON_KM.toLocaleString()} km to the Moon</p>` : '')(data.students.find(s => s.me))}
      <div class="map-wrap">${svg}</div>
      <div class="legend" style="margin-top:8px"><span><i class="key done"></i> finished</span><span><i class="key here"></i> you are here</span><span><i class="key open"></i> open</span><span><i class="key locked"></i> locked</span><span>Click a stop to see who is there.</span></div>
      <h2 style="margin-top:18px">Where everyone is</h2>
      <div class="roster">${data.students.map(s => `<span class="chip ${s.me ? 'me' : ''}"><b>${esc(s.me ? 'You' : s.name)}</b>${s.team ? ` <span class="small">(${esc(s.team)})</span>` : ''} · ${stopName(s.at)}${s.extras ? ` · ★${s.extras}` : ''}</span>`).join('') || '<span class="muted">No students have joined yet.</span>'}</div>
      ${data.extras.length ? `<h2 style="margin-top:18px">🚀 Your Go Further lessons</h2>
      <div class="roster">${data.extras.map(l => l.unlocked ? `<a class="chip ${l.complete ? 'me' : ''}" href="#/lesson/${l.id}">${l.complete ? '✓' : '○'} ${esc(l.title)}</a>` : `<span class="chip locked">🔒 ${esc(l.title)}</span>`).join('')}</div>` : ''}`;
    if (teacher) document.getElementById('mapc').onchange = e => Nav.go('#/map/' + e.target.value);
    const open = el => {
      const i = +el.dataset.stop, s = stops[i], here = data.students.filter(x => x.at === i);
      const m = modal(`<h2 style="margin-top:0">${s.finish ? '🌕 Moon Base' : s.lesson.event ? `${s.lesson.icon} ${esc(s.lesson.title)}` : `${s.lesson.num}. ${esc(s.lesson.title)}`}</h2>
        ${s.finish ? '<p>Everyone here has landed and finished this term\'s path.</p>' : s.lesson.event ? `<p><b>${esc(Quest.EVENT_STORY[s.lesson.id] || '')}</b></p><p>A whole-class event. All teams meet here before moving on.</p>` : (p => `<p>${p.icon} ${p.mission ? 'Mission stage:' : 'Earns'} <b>${esc(p.name)}</b></p>`)(Quest.part(s.lesson.id))}
        ${!s.finish && Quest.ZONES[s.lesson.unit] ? `<p class="small muted">${Quest.ZONES[s.lesson.unit].icon} ${esc(Quest.ZONES[s.lesson.unit].name)}: ${esc(Quest.ZONES[s.lesson.unit].story)}</p>` : ''}
        <h3>Here now (${here.length})</h3><div class="roster">${here.map(x => `<span class="chip ${x.me ? 'me' : ''}">${esc(x.me ? 'You' : x.name)}</span>`).join('') || '<span class="muted small">Nobody is on this stop right now.</span>'}</div>
        <div class="row" style="margin-top:16px"><div class="spacer"></div>${!s.finish && s.lesson.event ? `<a class="btn primary" href="${teacher ? `#/teacher/class/${cid}/event/${s.lesson.id}` : `#/event/${s.lesson.id}`}">Open event</a>` : !s.finish && s.lesson.unlocked ? `<a class="btn primary" href="#/lesson/${s.lesson.id}">Open lesson</a>` : ''}<button class="btn" id="cx">Close</button></div>`);
      m.querySelector('#cx').onclick = () => m.remove();
      m.querySelector('a')?.addEventListener('click', () => m.remove());
    };
    $app.querySelectorAll('[data-stop]').forEach(el => {
      el.addEventListener('click', () => open(el));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); } });
    });
  }

  Nav.listen();
  Nav.start();
})();
