/* The code editor and robot simulator inside a lesson step.
 *
 *   const ide = RoboIDE.create(host, { code, starter, field, checks, drive, speed, onChange, onResult });
 *   ide.destroy()
 *
 * checks   the step's checks (type, pattern...). After a run, onResult gets [true, false, ...], one per check.
 * drive    a driving step: the keyboard is the controller, and checks are tried again and again while driving.
 */
(function () {
  'use strict';
  var E = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  // Keys that move the controller's joysticks and press its buttons.
  var AXIS_KEYS = { w: ['A', 100], s: ['A', -100], a: ['B', -100], d: ['B', 100],
    arrowup: ['D', 100], arrowdown: ['D', -100], arrowleft: ['C', -100], arrowright: ['C', 100] };
  var BUTTON_KEYS = { q: 'LUp', z: 'LDown', e: 'RUp', c: 'RDown', '1': 'EUp', '2': 'EDown', '9': 'FUp', '0': 'FDown' };

  /** What VEXcode IQ's main.cpp needs: only int main() and below. VEXcode already has the device setup,
   *  #include "iq_cpp.h" and using namespace vex at the top of the file. */
  function forVexcode(source) {
    var c = String(source || '').trim(), extra = [];
    if (/\bcout\b/.test(c)) extra.push('#include <iostream>', 'using std::cout;', 'using std::endl;');
    c = c.replace(/^[ \t]*#include\s*"(vex|iq_cpp)\.h"[ \t]*\n?/gm, '').replace(/^[ \t]*using\s+namespace\s+vex\s*;[ \t]*\n?/m, '').trim();
    if (!/vexcodeInit/.test(c)) c = c.replace(/int\s+main\s*\(\s*\)\s*\{/, function (m) { return m + '\n  // Initializing Robot Configuration. DO NOT REMOVE!\n  vexcodeInit();'; });
    return ['// From RoboCode Academy: paste this over int main() and everything below it.'].concat(extra, ['', c, '']).join('\n');
  }

  function copyText(text, done) {
    var fallback = function () {
      var t = document.body.appendChild(document.createElement('textarea'));
      t.value = text; t.select();
      try { document.execCommand('copy'); done(true); } catch (e) { done(false); }
      t.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, fallback); else fallback();
  }

  function vexcodeDialog(code, vexcodeUrl) {
    var text = forVexcode(code), bg = document.body.appendChild(document.createElement('div'));
    bg.className = 'ide-modal-bg';
    bg.innerHTML = '<div class="ide-modal panel" role="dialog" aria-modal="true" aria-label="Copy for VEXcode"><h2>📋 Copy for VEXcode</h2>' +
      '<ol class="do-list"><li>Press <b>Copy code</b>.</li>' +
      '<li>Open <a class="btn small go" href="' + E(vexcodeUrl) + '" target="vexcode" rel="noopener">VEXcode IQ ↗</a> and your project.</li>' +
      '<li>Keep the folded <code>#pragma region VEXcode Generated Robot Configuration</code> block at the top of <b>main.cpp</b>.</li>' +
      '<li>Select from <code>int main() {</code> to the bottom, paste, then <b>Download</b>.</li></ol>' +
      '<textarea class="ide-copy" rows="10" readonly spellcheck="false" aria-label="Code to paste into VEXcode"></textarea>' +
      '<div class="step-nav"><span class="saved" role="status"></span><button type="button" class="btn ghost" data-x>Close</button>' +
      '<button type="button" class="btn go" data-copy>Copy code</button></div></div>';
    var area = bg.querySelector('textarea'), state = bg.querySelector('.saved'), close = function () { bg.remove(); };
    area.value = text;
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
    bg.querySelector('[data-x]').addEventListener('click', close);
    bg.querySelector('[data-copy]').addEventListener('click', function () {
      area.focus(); area.select();
      copyText(text, function (ok) { state.textContent = ok ? 'Copied ✓ Now paste it into VEXcode IQ.' : 'Press Ctrl+C to copy.'; });
    });
    bg.querySelector('[data-copy]').focus();
  }

  function create(host, opts) {
    var drive = !!opts.drive, checks = opts.checks || [];
    host.innerHTML =
      '<div class="ide"><div class="ide-bar">' +
      '<button type="button" class="btn go" data-a="run">▶ Run</button>' +
      '<button type="button" class="btn danger" data-a="stop" disabled>■ Stop</button>' +
      '<button type="button" class="btn ghost small" data-a="reset">↺ Reset robot</button>' +
      (drive ? '' : '<label class="ide-speed">Speed <select data-a="speed"><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label>') +
      '<span class="ide-gap"></span>' +
      (opts.starter ? '<button type="button" class="btn ghost small" data-a="restore">Starter code</button>' : '') +
      '<button type="button" class="btn ghost small" data-a="vexcode">📋 Copy for VEXcode</button></div>' +
      '<div class="ide-grid"><div class="ide-code"><textarea aria-label="Your C++ program"></textarea></div>' +
      '<div class="ide-sim"><div class="ide-field" tabindex="0" aria-label="Robot simulator' + (drive ? '. Click here, then drive with the keyboard.' : '') + '"><canvas width="960" height="720"></canvas>' +
      (drive ? '<div class="ide-focus">Click the field, then drive with the keys</div>' : '') + '</div>' +
      '<div class="ide-side">' +
      (drive ? '<div class="ide-keys"><span><kbd>W</kbd><kbd>S</kbd> left stick</span><span><kbd>↑</kbd><kbd>↓</kbd> right stick</span>' +
        '<span><kbd>A</kbd><kbd>D</kbd> <kbd>←</kbd><kbd>→</kbd> sideways</span><span><kbd>Q</kbd><kbd>Z</kbd> L buttons</span><span><kbd>E</kbd><kbd>C</kbd> R buttons</span>' +
        '<span class="ide-pad" aria-live="off"></span></div>' : '') +
      '<div class="ide-hud" aria-hidden="true"></div>' +
      '<div class="ide-brain"><span class="ide-brain-label">Brain screen</span><pre class="ide-screen" aria-live="polite"></pre></div><div class="ide-tune" aria-live="off"></div>' +
      '<div class="ide-msg" role="status"></div></div></div></div></div>';
    var q = function (s) { return host.querySelector(s); };
    var cm = window.CodeMirror.fromTextArea(q('textarea'), { mode: 'text/x-c++src', lineNumbers: true, indentUnit: 2, tabSize: 2,
      matchBrackets: true, autoCloseBrackets: true, lineWrapping: true, viewportMargin: Infinity, readOnly: !!opts.readOnly,
      extraKeys: { 'Ctrl-Enter': function () { run(); }, 'Cmd-Enter': function () { run(); }, Tab: function (c) { c.replaceSelection('  '); } } });
    cm.setValue(opts.code || opts.starter || '');
    var sim = new window.VexSim.Sim(q('canvas'), opts.field || {});
    if (drive) sim.limit = 600;
    var screen = q('.ide-screen'), hud = q('.ide-hud'), msg = q('.ide-msg'), fieldBox = q('.ide-field'), padBox = q('.ide-pad');
    var running = false, errLine = null, frame = 0, poll = null, dead = false;

    var say = function (text, kind) { msg.className = 'ide-msg' + (kind ? ' ' + kind : ''); msg.textContent = text || ''; };
    sim.on('screen', function () { screen.textContent = sim.screen.lines.slice(-6).join('\n'); });
    // Brain notes: a beep in the browser, and the note names under the Brain screen
    var NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], SEMIS = [0, 2, 4, 5, 7, 9, 11], audio = null, tune = q('.ide-tune'), played = [];
    sim.on('note', function (n) {
      played.push(n.sound !== undefined ? '(' + n.sound + ')' : NOTE_NAMES[n.note] + n.octave);
      tune.textContent = '♪ ' + played.slice(-16).join(' ');
      if (n.sound !== undefined) return;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audio = audio || new AC();
        var o = audio.createOscillator(), g = audio.createGain(), len = Math.max(0.05, n.ms / 1000 / (sim.speed || 1));
        o.type = 'square'; o.frequency.value = 261.63 * Math.pow(2, (SEMIS[n.note] + 12 * (n.octave - 1)) / 12);
        g.gain.value = 0.06; g.gain.setTargetAtTime(0, audio.currentTime + len * 0.85, 0.01);
        o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + len);
      } catch (e) { audio = null; }
    });
    sim.on('error', function (e) { say(e.message, 'bad'); });
    sim.on('frame', function () {
      if (frame++ % 6) return;
      var d = sim.rayDistance(), o = sim.opticalPt();
      hud.textContent = 'time ' + sim.t.toFixed(1) + 's · heading ' + sim.r.h.toFixed(0) + '° · distance ' + (d === null ? '—' : d.toFixed(1) + ' in') +
        ' · floor ' + sim.floorAt(o[0], o[1]).color + (sim.collisions ? ' · bumps ' + sim.collisions : '');
      if (padBox) padBox.textContent = 'L ' + (sim.pad.A || 0) + '  R ' + (sim.pad.D || 0);
    });
    cm.on('change', function () {
      if (errLine !== null) { cm.removeLineClass(errLine, 'background', 'ide-err-line'); errLine = null; }
      if (opts.onChange) opts.onChange(cm.getValue());
    });

    function report() {
      if (!checks.length || !opts.onResult) return;
      opts.onResult(window.VexSim.evaluate(sim, cm.getValue(), checks).map(function (c) { return c.pass; }), cm.getValue(), sim.output);
    }
    function setRunning(on) {
      running = on;
      q('[data-a=run]').disabled = on; q('[data-a=stop]').disabled = !on;
      host.classList.toggle('ide-running', on);
      clearInterval(poll); poll = null;
      if (on && drive) poll = setInterval(report, 400);
    }
    async function run() {
      if (running || dead) return;
      setRunning(true);
      played = []; tune.textContent = '';
      say(drive ? 'Running. Click the field and drive!' : 'Running…');
      if (drive) fieldBox.focus();
      var code = cm.getValue();
      var r = await window.VexSim.run(sim, code);
      if (dead) return;
      setRunning(false);
      if (!r.ok) {
        say((r.line ? 'Line ' + r.line + ': ' : '') + r.error, 'bad');
        if (r.line && r.line <= cm.lineCount()) { errLine = r.line - 1; cm.addLineClass(errLine, 'background', 'ide-err-line'); cm.scrollIntoView({ line: errLine, ch: 0 }); }
        return;
      }
      report();
      if (r.stopped) say(drive ? 'Stopped. Press Run to drive again.' : 'Stopped.');
      else say('Program finished.', 'good');
    }
    function stop() { sim.halt(); }

    // The keyboard is the controller in a driving step.
    var held = {};
    function padFromKeys() {
      var pad = { A: 0, B: 0, C: 0, D: 0 };
      Object.keys(held).forEach(function (k) {
        if (AXIS_KEYS[k]) pad[AXIS_KEYS[k][0]] += AXIS_KEYS[k][1];
        if (BUTTON_KEYS[k]) pad[BUTTON_KEYS[k]] = true;
      });
      sim.pad = pad;
    }
    function key(e, down) {
      var k = e.key.toLowerCase();
      if (!AXIS_KEYS[k] && !BUTTON_KEYS[k]) return;
      e.preventDefault();
      if (down) held[k] = true; else delete held[k];
      padFromKeys();
    }
    if (drive) {
      fieldBox.addEventListener('keydown', function (e) { key(e, true); });
      fieldBox.addEventListener('keyup', function (e) { key(e, false); });
      fieldBox.addEventListener('blur', function () { held = {}; padFromKeys(); });
    }

    host.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-a]') : null, a = b && b.dataset.a;
      if (a === 'run') run();
      if (a === 'stop') stop();
      if (a === 'reset') { stop(); sim.reset(); say(''); }
      if (a === 'restore' && window.confirm('Replace your code with the starter code? Your code will be lost.')) cm.setValue(opts.starter);
      if (a === 'vexcode') vexcodeDialog(cm.getValue(), opts.vexcodeUrl || 'https://codeiq.vex.com/');
    });
    var speed = q('[data-a=speed]');
    if (speed) { sim.speed = opts.speed || 1; speed.value = String(sim.speed); speed.addEventListener('change', function () { sim.speed = +speed.value; }); }
    setTimeout(function () { if (!dead) cm.refresh(); }, 30);

    return {
      getCode: function () { return cm.getValue(); },
      setCode: function (code) { cm.setValue(code); },
      destroy: function () { dead = true; clearInterval(poll); sim.destroy(); }
    };
  }

  window.RoboIDE = { create: create, forVexcode: forVexcode };
})();
