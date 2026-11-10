/* RoboCode Academy – VEX IQ C++ simulator
 * 1) Translates a classroom subset of VEX IQ C++ into async JavaScript
 * 2) Runs it against a top-down 2D model of a VEX IQ BaseBot
 */
(function () {
  'use strict';
  const FIELD_W = 96, FIELD_H = 72, ROBOT_R = 5.2, FRONT = 5.5;
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  // ------------------------------------------------------------------ Translator
  class CppError extends Error { constructor(msg, line) { super(msg); this.line = line; this.cpp = true; } }

  function splitLiterals(src) {
    // returns {code, strings} — strings/chars become __S<n>__ placeholders, comments become whitespace
    const strings = []; let out = ''; let i = 0;
    while (i < src.length) {
      const c = src[i], n = src[i + 1];
      if (c === '/' && n === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
      if (c === '/' && n === '*') {
        i += 2; while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') out += '\n'; i++; }
        i += 2; continue;
      }
      if (c === '"' || c === "'") {
        let j = i + 1, s = '';
        while (j < src.length && src[j] !== c) {
          if (src[j] === '\n') throw new CppError('A text string is missing its closing quote ' + c, lineAt(src, i));
          if (src[j] === '\\') { s += src[j] + src[j + 1]; j += 2; } else s += src[j++];
        }
        if (j >= src.length) throw new CppError('A text string is missing its closing quote ' + c, lineAt(src, i));
        strings.push(c === '"' ? '"' + s + '"' : JSON.stringify(eval("'" + s + "'")));
        out += '__S' + (strings.length - 1) + '__'; i = j + 1; continue;
      }
      out += c; i++;
    }
    return { code: out, strings };
  }
  function lineAt(src, idx) { return src.slice(0, idx).split('\n').length; }

  function matchClose(s, openIdx, open, close) {
    let d = 0;
    for (let i = openIdx; i < s.length; i++) {
      if (s[i] === open) d++; else if (s[i] === close) { d--; if (d === 0) return i; }
    }
    return -1;
  }

  function precheck(code) {
    // brace / paren balance
    const stack = []; const lines = code.split('\n');
    const pairs = { ')': '(', ']': '[', '}': '{' };
    lines.forEach((ln, li) => {
      for (const ch of ln) {
        if ('([{'.includes(ch)) stack.push({ ch, line: li + 1 });
        else if (')]}'.includes(ch)) {
          const top = stack.pop();
          if (!top || top.ch !== pairs[ch]) throw new CppError(`Unexpected '${ch}' — check that every ( { [ has a matching ) } ]`, li + 1);
        }
      }
    });
    if (stack.length) { const t = stack.pop(); throw new CppError(`'${t.ch}' is never closed — you are missing a ${{ '(': ')', '[': ']', '{': '}' }[t.ch]}`, t.line); }
    // missing semicolons (C++ needs them; JavaScript would silently allow it)
    let depth = 0, head = '', headLine = 0;
    const control = /^(if|else|for|while|do|switch|case|default|#|}|{|public|private|struct|class|enum|template|namespace|using)\b/;
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim(); if (!t) continue;
      if (depth === 0) { head = t; headLine = i; }
      for (const ch of t) { if (ch === '(' || ch === '[') depth++; else if (ch === ')' || ch === ']') depth--; }
      if (depth > 0) continue;
      const endsBad = /[\w)\]"]$|\+\+$|--$/.test(t) && !/^#/.test(t);
      if (!endsBad) continue;
      if (control.test(head) || /^(else|do)$/.test(t) || /\belse$/.test(t)) continue;
      let k = i + 1; while (k < lines.length && !lines[k].trim()) k++;
      const nx = (lines[k] || '').trim();
      if (/^({|\.|<<|>>|\?|:|&&|\|\||\+|-|\*|\/|%|==|!=|<|>|,|\))/.test(nx)) continue;
      // function header like  void go(int x)  followed by { on next line
      if (nx.startsWith('{')) continue;
      throw new CppError("Missing semicolon ';' at the end of this line. (In C++ every statement ends with ;)", i + 1);
    }
  }

  const TYPES = '(?:long\\s+long|long\\s+double|long\\s+int|unsigned\\s+int|int|double|float|bool|char|string|auto|long|short|size_t|uint8_t|uint32_t|int32_t|colorType|directionType|turnType)';
  // ---------- Robot Setup: the devices a robot has, like the Devices window in VEXcode.
  // `canon` is the name lessons are written with; students can call a device anything.
  const SETUP_JOBS = {
    gyro: { label: 'Gyro Sensor', canon: 'BrainInertial', name: 'Gyro', port: 4, known: ['BrainInertial', 'Inertial', 'Gyro'] },
    distance: { label: 'Distance Sensor', canon: 'DistanceSensor', name: 'DistanceSensor', port: 7, known: ['DistanceSensor', 'Distance'] },
    color: { label: 'Color Sensor', canon: 'Optical', name: 'ColorSensor', port: 8, known: ['Optical', 'ColorSensor', 'Color'] },
    bumper: { label: 'Bumper Switch', canon: 'BumperA', name: 'BumperA', port: 9, known: ['BumperA', 'Bumper'] },
    touchled: { label: 'Touch LED', canon: 'TouchLED', name: 'TouchLED', port: 2, known: ['TouchLED'] },
    claw: { label: 'Claw motor', canon: 'ClawMotor', name: 'ClawMotor', port: 3, known: ['ClawMotor'] },
    arm: { label: 'Arm motor', canon: 'ArmMotor', name: 'ArmMotor', port: 10, known: ['ArmMotor'] }
  };
  function defaultSetup(gen) {
    const devices = {};
    for (const [job, j] of Object.entries(SETUP_JOBS)) devices[job] = { on: false, port: j.port, name: j.name };
    devices.color.kind = gen === 2 ? 'optical' : 'color';
    if (gen === 2) devices.color.name = 'Optical';
    return { gen, confirmed: false, drive: { left: 1, right: 6 }, devices };
  }
  function normalizeSetup(raw, gen) {
    const s = defaultSetup(gen || (raw && raw.gen) || 1);
    if (!raw) return s;
    s.confirmed = !!raw.confirmed;
    if (raw.drive) s.drive = { left: +raw.drive.left || 1, right: +raw.drive.right || 6 };
    for (const job of Object.keys(SETUP_JOBS)) if (raw.devices && raw.devices[job]) Object.assign(s.devices[job], raw.devices[job]);
    return s;
  }
  // Used when no setup is given: every device present under its lesson name.
  function fullSetup() { const s = defaultSetup(2); s.confirmed = true; for (const [job, d] of Object.entries(s.devices)) { d.on = job !== 'gyro'; d.name = SETUP_JOBS[job].canon; } return s; }
  function validateSetup(s) {
    const ports = [s.drive.left, s.drive.right], names = ['Drivetrain', 'Brain', 'main'];
    for (const [job, d] of Object.entries(s.devices)) {
      if (!d.on || (job === 'gyro' && s.gen === 2)) continue;
      if (!/^[A-Za-z_][A-Za-z0-9_]{0,19}$/.test(d.name)) return `"${d.name}" can't be a device name. Use letters, numbers and _, starting with a letter.`;
      if (names.includes(d.name)) return `The name ${d.name} is used twice.`;
      names.push(d.name); ports.push(d.port);
    }
    const twice = ports.find((p, i) => ports.indexOf(p) !== i);
    return twice ? `Port ${twice} is used twice. Each device needs its own Smart Port.` : null;
  }
  const activeJobs = s => Object.keys(SETUP_JOBS).filter(job => s.devices[job].on && !(job === 'gyro' && s.gen === 2));
  /** The C++ a project needs for this setup. VEXcode writes the same thing from its Devices window. */
  function generatedConfig(s) {
    const d = s.devices, lines = [`// VEX IQ ${s.gen === 1 ? '1st' : '2nd'} gen`, 'brain Brain;', `motor LeftDriveSmart = motor(PORT${s.drive.left}, false);`, `motor RightDriveSmart = motor(PORT${s.drive.right}, true);`];
    const gyro = s.gen === 1 ? (activeJobs(s).includes('gyro') ? d.gyro.name : null) : 'BrainInertial';
    if (s.gen === 2) lines.push('inertial BrainInertial = inertial();');
    const make = { distance: 'distance', bumper: 'bumper', touchled: 'touchled', gyro: 'gyro', claw: 'motor', arm: 'motor' };
    for (const job of activeJobs(s)) {
      const type = job === 'color' ? (d.color.kind === 'optical' ? 'optical' : 'colorsensor') : make[job];
      lines.push(`${type} ${d[job].name} = ${type}(PORT${d[job].port}${type === 'motor' ? ', false' : ''});`);
    }
    lines.push(gyro ? `smartdrive Drivetrain = smartdrive(LeftDriveSmart, RightDriveSmart, ${gyro});` : 'drivetrain Drivetrain = drivetrain(LeftDriveSmart, RightDriveSmart);');
    return lines.join('\n');
  }
  const codeOnly = src => src.replace(/\r/g, '').replace(/\/\*[\s\S]*?\*[\/]/g, m => m.replace(/[^\n]/g, ' ')).replace(/\/\/.*$/gm, '').replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
  /** Finds code that uses a device the robot doesn't have, the way a real build would fail. */
  function checkDevices(src, s) {
    const c = codeOnly(src), find = name => c.search(new RegExp('(?<![\\w.])' + name + '\\s*\\.'));
    const at = i => c.slice(0, i).split('\n').length;
    for (const [job, j] of Object.entries(SETUP_JOBS)) {
      if (job === 'gyro' && s.gen === 2) continue;
      const d = s.devices[job], label = job === 'color' && d.kind === 'optical' ? 'Optical Sensor' : j.label;
      for (const name of j.known) {
        const i = find(name);
        if (i < 0 || (d.on && name === d.name)) continue;
        if (d.on) return { error: `${name} isn't on your robot. Your ${label} is named ${d.name} in Robot Setup.`, line: at(i) };
        if (name === 'BrainInertial') return { error: 'The 1st gen Brain has no built-in inertial sensor. Add a Gyro Sensor in Robot Setup and use its name instead.', line: at(i) };
        return { error: `Your code uses ${name}, but your robot has no ${label}. Add it in Robot Setup.`, line: at(i) };
      }
    }
    const col = s.devices.color;
    if (col.on && col.kind === 'color') { const i = c.search(new RegExp('(?<![\\w.])' + col.name + '\\s*\\.\\s*color\\s*\\(')); if (i >= 0) return { error: `The Color Sensor reads colors with ${col.name}.colorname(), not color().`, line: at(i) }; }
    return null;
  }
  /** Catches two beginner mistakes: moves with no units, and = where == was meant. */
  function checkHabits(src) {
    const c = codeOnly(src), at = i => c.slice(0, i).split('\n').length;
    for (const m of c.matchAll(/\.(driveFor|turnFor|spinFor)\s*\(([^;]*)\)\s*;/g)) {
      if (!/\b(inches|mm|degrees|turns|rev)\b/.test(m[2])) return { error: `${m[1]} needs units, like ${m[1] === 'driveFor' ? 'inches' : 'degrees'}. Example: Drivetrain.${m[1]}(${m[1] === 'driveFor' ? 'forward, 10, inches' : m[1] === 'turnFor' ? 'right, 90, degrees' : 'forward, 90, degrees'});`, line: at(m.index) };
    }
    for (const m of c.matchAll(/\b(if|while)\s*\(/g)) {
      let depth = 1, i = m.index + m[0].length, start = i;
      while (i < c.length && depth) { if (c[i] === '(') depth++; else if (c[i] === ')') depth--; i++; }
      if (/(?<![=!<>+\-*\/%])=(?!=)/.test(c.slice(start, i - 1))) return { error: 'Use == to compare two values. A single = changes the value instead of checking it.', line: at(m.index) };
    }
    return null;
  }
  /** Rewrites a student's code into lesson names, so auto-checks work whatever they called their devices. */
  function canonicalize(src, s) {
    let c = src;
    for (const job of activeJobs(s)) { const d = s.devices[job]; c = c.replace(new RegExp('(?<![\\w.])' + d.name + '\\b', 'g'), SETUP_JOBS[job].canon); }
    return c.replace(/\bOptical\s*\.\s*colorname\b/g, 'Optical.color');
  }
  /** Rewrites lesson text and starter code for this robot's kit and device names. */
  function adaptText(text, s) {
    const d = s.devices, isColor = d.color.kind === 'color', gen1 = s.gen === 1;
    const rename = (from, to) => { if (from !== to) t = t.replace(new RegExp('\\b' + from + '(?=\\s*\\.|</code>)', 'g'), to); };
    let t = text.split('Our simulator already has these devices set up with the same names.').join('Then set up the same devices in Robot Setup, next to the Run button.');
    t = t.replace(/\bOptical\s*\.\s*color\(\)/g, d.color.name + (isColor ? '.colorname()' : '.color()'));
    rename('Optical', d.color.name); rename('DistanceSensor', d.distance.name); rename('BumperA', d.bumper.name);
    rename('TouchLED', d.touchled.name); rename('ClawMotor', d.claw.name); rename('ArmMotor', d.arm.name);
    if (isColor) t = t.replace(/Optical [Ss]ensor/g, 'Color Sensor').replace(/\bOptical sees/g, 'Color Sensor sees');
    if (gen1) {
      t = t.split('The 2nd gen Brain has a built-in <strong>inertial sensor</strong>, so').join('With a <strong>Gyro Sensor</strong> on your robot,')
        .split('turn on the <strong>BrainInertial</strong> for turning').join('add a <strong>Gyro Sensor</strong> for turning')
        .split('<td>Built-in Inertial</td><td>(inside Brain)</td>').join(`<td>Gyro Sensor</td><td>${d.gyro.port}</td>`)
        .split('A sensor built into the 2nd gen Brain (BrainInertial) that').join('A sensor added to the robot that')
        .replace(/Inertial sensor/g, 'Gyro Sensor').replace(/\bBrainInertial\b/g, d.gyro.name).replace(/2nd gen/g, '1st gen');
    }
    return t;
  }


  function translate(src, deviceNames) {
    const { code: raw, strings } = splitLiterals(src.replace(/\r/g, ''));
    precheck(raw);
    let c = raw;
    if (!/\bint\s+main\s*\(/.test(c)) throw new CppError('Your program needs an  int main() { ... }  function — that is where the robot starts.', 1);

    // preprocessor & namespaces
    c = c.replace(/^[ \t]*#define[ \t]+(\w+)[ \t]+(.+)$/gm, 'const $1 = $2;');
    c = c.replace(/^[ \t]*#.*$/gm, '');
    c = c.replace(/\busing\s+namespace\s+\w+\s*;/g, '');
    c = c.replace(/\b\w+::/g, '');

    // cout / cin
    c = c.replace(/\bcout\s*<<([^;]*);/g, (m, rest) => '__cout(' + rest.split('<<').map(s => s.trim()).join(', ') + ');');
    if (/\bcin\s*>>/.test(c)) throw new CppError('cin (keyboard input) is not available on the robot — use sensors instead!', lineAt(c, c.search(/\bcin\s*>>/)));

    // casts
    c = c.replace(/static_cast\s*<\s*(int|long|short)\s*>\s*\(/g, '__int(').replace(/static_cast\s*<\s*(double|float)\s*>\s*\(/g, 'Number(');
    c = c.replace(/\(\s*(int|long)\s*\)\s*([\w.]+(?:\([^()]*\))?)/g, '__int($2)').replace(/\(\s*(double|float)\s*\)(?:\s*)/g, '');
    c = c.replace(/\b(int|long)\s*\(/g, '__int(').replace(/\b(double|float)\s*\(/g, 'Number(');

    // forward declarations  void f(int x);
    c = c.replace(new RegExp('\\b(?:void|' + TYPES + ')\\s*[&*]?\\s+(\\w+)\\s*\\(([^()]*)\\)\\s*;', 'g'), (m, name) => name === 'main' ? m : '');
    // function definitions
    const funcs = [];
    c = c.replace(new RegExp('\\b(?:static\\s+|inline\\s+)?(?:void|' + TYPES + '|vector\\s*<[^>]*>)\\s*[&*]?\\s+(\\w+)\\s*\\(([^()]*)\\)\\s*(?:const\\s*)?\\{', 'g'), (m, name, params) => {
      funcs.push(name);
      const ps = params.trim() === '' || params.trim() === 'void' ? '' : params.split(',').map(p => {
        p = p.replace(/\bconst\b/g, '').replace(/[&*]/g, ' ').trim();
        const [decl, def] = p.split('=');
        const nm = decl.trim().split(/\s+/).pop().replace(/\[\s*\w*\s*\]/g, '');
        return def !== undefined ? nm + ' = ' + def.trim() : nm;
      }).join(', ');
      return 'async function ' + name + '(' + ps + ') {';
    });

    // vectors
    c = c.replace(/\b(?:const\s+)?vector\s*<[^;{=()]*?>\s*&?\s*(\w+)\s*(\(([^()]*)\))?\s*(?=[;={])/g, (m, name, _p, args) =>
      args !== undefined ? `let ${name} = __vec(${args})` : `let@T:vector@ ${name}`);
    // range-for
    c = c.replace(new RegExp('for\\s*\\(\\s*(?:const\\s+)?' + TYPES + '\\s*&?\\s*(\\w+)\\s*:', 'g'), 'for (let $1 of ');
    // typed declarations
    c = c.replace(new RegExp('\\b((?:const|static|unsigned|signed)\\s+)*(' + TYPES + ')\\b\\s*&?\\s+(?=[A-Za-z_]\\w*\\s*(?:[=;,\\[)]|$))', 'gm'), (m, q, t) => `let@T:${t.split(/\s+/)[0]}@ `);
    // multiple declarators  int a = 1, b;  -> keep type marker for each
    // arrays  let x[3][4] = {...}   /   let x[5];
    c = c.replace(/let@T:(\w+)@ (\w+)((?:\s*\[[^\]]*\])+)\s*(=|;)/g, (m, t, name, dims, op) => {
      if (op === '=') return `let@T:arr@ ${name} =`;
      const ds = dims.match(/\[([^\]]*)\]/g).map(d => d.slice(1, -1) || '0');
      return `let@T:arr@ ${name} = __arr([${ds.join(',')}], ${t === 'string' ? '""' : t === 'bool' ? 'false' : '0'});`;
    });
    // brace initialisers  = { ... }  ->  [ ... ]
    let idx;
    while ((idx = c.search(/=\s*\{/)) !== -1) {
      const open = c.indexOf('{', idx); const close = matchClose(c, open, '{', '}');
      const inner = c.slice(open + 1, close).replace(/\{/g, '[').replace(/\}/g, ']');
      c = c.slice(0, idx) + '= [' + inner + ']' + c.slice(close + 1);
    }
    // default values for uninitialised scalars
    const ints = new Set(); const INT_T = /^(int|long|short|size_t|uint8_t|uint32_t|int32_t)$/;
    c = c.replace(/let@T:(\w+)@ (\w+)\s*(?=[;,])/g, (m, t, n) => { if (INT_T.test(t)) ints.add(n); return `let ${n} = ${t === 'string' ? '""' : t === 'bool' ? 'false' : t === 'vector' ? '[]' : t === 'char' ? '""' : '0'}`; });
    // integer semantics:  int x = 7 / 2;  ->  3
    const declRe = /let@T:(int|long|short|size_t|uint8_t|uint32_t|int32_t)@ (\w+)\s*=\s{0,}/g; let dm; let rebuilt = '', last = 0;
    while ((dm = declRe.exec(c))) {
      let k = declRe.lastIndex, d = 0;
      while (k < c.length) { const ch = c[k]; if ('([{'.includes(ch)) d++; else if (')]}'.includes(ch)) { if (d === 0) break; d--; } else if ((ch === ';' || ch === ',') && d === 0) break; k++; }
      const e = c.slice(declRe.lastIndex, k); ints.add(dm[2]);
      rebuilt += c.slice(last, dm.index) + (/^\s*-?\d+\s*$/.test(e) ? `let ${dm[2]} = ${e}` : `let ${dm[2]} = __int(${e})`);
      last = k; declRe.lastIndex = k;
    }
    c = rebuilt + c.slice(last);
    ints.forEach(n => {
      c = c.replace(new RegExp('(^|[;{}\\s])' + n + '\\s*=(?!=)\\s*([^;]+);', 'g'), (m, pre, e) => /^-?\d+$/.test(e.trim()) || e.trim().startsWith("__int(") ? m : `${pre}${n} = __int(${e});`);
      c = c.replace(new RegExp('\\b' + n + '\\s*\\/=\\s*([^;]+);', 'g'), `${n} = __int(${n} / ($1));`);
    });
    c = c.replace(/let@T:\w+@/g, 'let');

    // strings: s.length()
    c = c.replace(/\.length\(\)/g, '.length');
    c = c.replace(/\bNULL\b|\bnullptr\b/g, 'null');

    // awaits for robot calls, waits and user functions
    c = c.replace(new RegExp('(?<![\\w.])(' + deviceNames.join('|') + ')\\s*\\.', 'g'), 'await $1.');
    c = c.replace(/(?<![\w.])(wait|__cout|printf|vexDelay|task_sleep)\s*\(/g, 'await $1(');
    if (funcs.length) c = c.replace(new RegExp('(?<![\\w.])(?<!function )(' + funcs.join('|') + ')\\s*\\(', 'g'), 'await $1(');

    // loop ticks (keep the page responsive + let the stop button work)
    c = c.replace(/\bdo\s*\{/g, 'do { await __tick();');
    let out = '', pos = 0; const loopRe = /\b(while|for)\s*\(/g; let m;
    while ((m = loopRe.exec(c))) {
      const open = c.indexOf('(', m.index); const close = matchClose(c, open, '(', ')');
      if (close < 0) break;
      let j = close + 1; while (/\s/.test(c[j])) j++;
      if (c[j] === '{') { out += c.slice(pos, j + 1) + ' await __tick();'; pos = j + 1; }
      else if (c[j] === ';') {
        const before = c.slice(0, m.index).trimEnd();
        if (before.endsWith('}')) { out += c.slice(pos, j); pos = j; } // do { } while (x);
        else { out += c.slice(pos, j) + '{ await __tick(); }'; pos = j + 1; }
      } else {
        let k = j, d = 0; while (k < c.length && !(c[k] === ';' && d === 0)) { if ('([{'.includes(c[k])) d++; if (')]}'.includes(c[k])) d--; k++; }
        out += c.slice(pos, j) + '{ await __tick(); ' + c.slice(j, k + 1) + ' }'; pos = k + 1;
      }
      loopRe.lastIndex = Math.max(close + 1, pos);
    }
    c = out + c.slice(pos);

    // restore string literals
    c = c.replace(/__S(\d+)__/g, (m, n) => strings[+n]);
    return c;
  }

  // ------------------------------------------------------------------ Field + robot model
  const COLORS = {
    red: { b: 40, hue: 0, css: '#e5484d' }, green: { b: 45, hue: 120, css: '#30a46c' }, blue: { b: 30, hue: 220, css: '#3e63dd' },
    yellow: { b: 80, hue: 55, css: '#f5d90a' }, orange: { b: 60, hue: 30, css: '#f76b15' }, purple: { b: 25, hue: 275, css: '#8e4ec6' },
    white: { b: 90, hue: 0, css: '#f4f4f0' }, black: { b: 5, hue: 0, css: '#1c1c1c' }
  };
  const defaultField = () => ({ start: { x: 48, y: 50, heading: 0 }, walls: [], lines: [], tiles: [], cubes: [], zones: [], goal: null });

  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay; const L = dx * dx + dy * dy;
    let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  // ------------------------------------------------------------------ robot appearance (cosmetic only: never affects driving, sensors or collisions)
  const LOOK_OPTIONS = {
    shape: { rounded: 'Rounded box', box: 'Square box', wedge: 'Wedge', round: 'Round' },
    wheels: { standard: 'Standard', big: 'Big wheels', treads: 'Tank treads' },
    deco: { none: 'None', stripe: 'Racing stripe', flames: 'Flames', eyes: 'Eyes', star: 'Star' }
  };
  const DEFAULT_LOOK = { name: '', shape: 'rounded', wheels: 'standard', deco: 'none', body: '#f2f2f2', brain: '#0b5cad', decoColor: '#f76b15', trail: '#3e63dd' };
  function normalizeLook(raw) {
    const out = { ...DEFAULT_LOOK }; if (!raw || typeof raw !== 'object') return out;
    for (const k of ['shape', 'wheels', 'deco']) if (Object.hasOwn(LOOK_OPTIONS[k], raw[k])) out[k] = raw[k];
    for (const k of ['body', 'brain', 'decoColor', 'trail']) if (/^#[0-9a-f]{6}$/i.test(raw[k])) out[k] = raw[k];
    if (typeof raw.name === 'string') out.name = raw.name.trim().slice(0, 12);
    return out;
  }
  // Draws the robot centered on the origin, facing up. k = canvas pixels per inch.
  // state.parts (optional Set): only draw these of 'wheels', 'brain', 'led', 'claw'. Used for a robot still being built.
  function drawRobot(ctx, k, look, state = {}) {
    const has = part => !state.parts || state.parts.has(part);
    const poly = pts => { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x * k, y * k) : ctx.moveTo(x * k, y * k)); ctx.closePath(); };
    ctx.fillStyle = '#222';
    if (!has('wheels')) { /* not installed yet */ }
    else if (look.wheels === 'treads') {
      [-5.4, 3.9].forEach(x => { ctx.fillStyle = '#222'; ctx.fillRect(x * k, -5 * k, 1.5 * k, 10 * k); ctx.fillStyle = '#666'; for (let y = -4.4; y < 5; y += 1.4) ctx.fillRect(x * k, y * k, 1.5 * k, .4 * k); });
    } else if (look.wheels === 'big') {
      [[-5.8, -4.4], [3.9, -4.4], [-5.8, .9], [3.9, .9]].forEach(([x, y]) => ctx.fillRect(x * k, y * k, 1.9 * k, 3.6 * k));
    } else {
      [[-5.4, -3.8], [3.9, -3.8], [-5.4, 1.4], [3.9, 1.4]].forEach(([x, y]) => ctx.fillRect(x * k, y * k, 1.5 * k, 2.6 * k));
    }
    ctx.fillStyle = state.colliding ? '#e5484d' : look.body; ctx.strokeStyle = '#3a404a'; ctx.lineWidth = 2;
    if (look.shape === 'wedge') poly([[-2.2, -5], [2.2, -5], [3.9, -1.2], [3.9, 5], [-3.9, 5], [-3.9, -1.2]]);
    else if (look.shape === 'round') { ctx.beginPath(); ctx.ellipse(0, 0, 4.2 * k, 5.2 * k, 0, 0, 7); }
    else { ctx.beginPath(); ctx.roundRect(-3.9 * k, -5 * k, 7.8 * k, 10 * k, (look.shape === 'box' ? .2 : 1.2) * k); }
    ctx.fill(); ctx.stroke();
    if (look.deco === 'stripe') { ctx.fillStyle = look.decoColor; ctx.fillRect(-.9 * k, -4.9 * k, 1.8 * k, 9.8 * k); }
    if (has('brain')) { ctx.fillStyle = look.brain; ctx.beginPath(); ctx.roundRect(-2.6 * k, -1.2 * k, 5.2 * k, 4 * k, .6 * k); ctx.fill(); }
    if (look.deco === 'flames') { ctx.fillStyle = look.decoColor; [-1, 1].forEach(d => { poly([[d * 1.2, 4.8], [d * 3.6, 4.8], [d * 3.2, .6], [d * 2.7, 2.6], [d * 2.2, 1.4], [d * 1.8, 3.2]]); ctx.fill(); }); }
    if (look.deco === 'star') { ctx.fillStyle = look.decoColor; ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = (i % 2 ? .7 : 1.6) * k, a = -Math.PI / 2 + i * Math.PI / 5; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, .8 * k + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
    if (look.deco === 'eyes') { [-1, 1].forEach(d => { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(d * 2.3 * k, -3 * k, 1 * k, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = look.decoColor; ctx.beginPath(); ctx.arc(d * 2.3 * k, -3.3 * k, .5 * k, 0, 7); ctx.fill(); }); }
    if (has('led')) { ctx.fillStyle = state.led ? (COLORS[state.led] || COLORS.white).css : '#9aa3ad'; ctx.beginPath(); ctx.arc(0, 3.9 * k, .8 * k, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#e5484d'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; poly([[0, -4.6], [-1.3, -2.6], [1.3, -2.6]]); ctx.stroke(); ctx.fill(); // front arrow
    const cl = state.claw > 0.5 ? 0.6 : 1.8; ctx.fillStyle = '#7c8691';
    if (has('claw')) { ctx.fillRect((-cl - .7) * k, -7.2 * k, .7 * k, 2.4 * k); ctx.fillRect(cl * k, -7.2 * k, .7 * k, 2.4 * k); }
    if (state.arm > 0) { ctx.fillStyle = 'rgba(124,134,145,.6)'; ctx.fillRect(-.6 * k, -5 * k, 1.2 * k, -state.arm * 2 * k); }
  }

  class Sim {
    constructor(canvas, field) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.look = normalizeLook();
      this.speed = 1; this.listeners = {};
      this.setField(field);
      this._loop = this._loop.bind(this); this._last = performance.now(); requestAnimationFrame(this._loop);
    }
    setLook(look) { this.look = normalizeLook(look); this.draw(); }
    on(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); }
    emit(ev, ...a) { (this.listeners[ev] || []).forEach(f => f(...a)); }
    setField(field) {
      this.field = Object.assign(defaultField(), JSON.parse(JSON.stringify(field || {})));
      this.field.start = Object.assign({ x: 48, y: 50, heading: 0 }, this.field.start);
      this.reset();
    }
    reset() {
      const s = this.field.start;
      this.r = { x: s.x, y: s.y, h: s.heading || 0, rot: 0 };
      this.cubes = (this.field.cubes || []).map(c => ({ ...c }));
      this.t = 0; this.timerStart = 0; this.motion = null; this.waiters = [];
      this.driveVel = 50; this.turnVel = 50; this.holding = null; this.claw = 0; this.arm = 0;
      this.collisions = 0; this.colliding = false; this.trail = [[s.x, s.y]]; this.visited = new Set();
      this.led = null; this.running = false;
      this.screen = { lines: [''], row: 0, col: 0 }; this.output = '';
      this.emit('screen'); this.draw();
    }
    // ---------- geometry
    rects() {
      const B = 2; const w = this.field.walls || [];
      return [{ x: -B, y: -B, w: FIELD_W + 2 * B, h: B }, { x: -B, y: FIELD_H, w: FIELD_W + 2 * B, h: B },
        { x: -B, y: 0, w: B, h: FIELD_H }, { x: FIELD_W, y: 0, w: B, h: FIELD_H }, ...w];
    }
    hitsWall(x, y, rad) {
      return this.rects().some(R => {
        const cx = Math.max(R.x, Math.min(x, R.x + R.w)), cy = Math.max(R.y, Math.min(y, R.y + R.h));
        return Math.hypot(x - cx, y - cy) < rad;
      });
    }
    inWall(x, y) { return this.rects().some(R => x >= R.x && x <= R.x + R.w && y >= R.y && y <= R.y + R.h); }
    dir() { const a = this.r.h * Math.PI / 180; return [Math.sin(a), -Math.cos(a)]; }
    frontPt(d = FRONT) { const [dx, dy] = this.dir(); return [this.r.x + dx * d, this.r.y + dy * d]; }
    rayDistance() {
      const [dx, dy] = this.dir(); const [fx, fy] = this.frontPt();
      for (let d = 0; d <= 80; d += 0.2) if (this.inWall(fx + dx * d, fy + dy * d)) return d;
      return null;
    }
    floorAt(x, y) {
      const tiles = this.field.tiles || [];
      for (let i = tiles.length - 1; i >= 0; i--) { const T = tiles[i]; if (x >= T.x && x <= T.x + T.w && y >= T.y && y <= T.y + T.h) return { color: T.color, tile: i }; }
      for (const L of this.field.lines || []) {
        const p = L.points; for (let i = 0; i < p.length - 1; i++) if (segDist(x, y, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1]) <= (L.width || 1) / 2 + 0.15) return { color: 'black' };
      }
      return { color: 'white' };
    }
    opticalPt() { return this.frontPt(3.5); }
    // ---------- physics
    async _loop(now) {
      if (this._dead) return;
      const real = Math.min(0.1, (now - this._last) / 1000); this._last = now;
      if (this.running) {
        let simDt = real * this.speed; const step = 1 / 200;
        while (simDt > 0 && this.running) {
          const d = Math.min(step, simDt); this.step(d); simDt -= d;
          // let the student program react before simulating further (keeps sensor loops accurate at any speed)
          if (this._woke) {
            this._woke = false; let n = 0;
            // wait until the program is blocked again (waiting on a wait()/driveFor) before simulating more time
            while (this.running && !this._blocked() && n++ < 40) await (n < 12 ? yieldTask() : new Promise(r => setTimeout(r, 0)));
          }
        }
      }
      this.draw();
      requestAnimationFrame(this._loop);
    }
    destroy() { this._dead = true; this.halt(); }
    _blocked() { return this.waiters.length > 0 || !!(this.motion && this.motion.blocking); }
    step(dt) {
      this.t += dt;
      const m = this.motion;
      if (m) {
        if (m.type === 'drive') {
          const v = 16 * this.driveVel / 100; let ds = v * dt;
          if (m.remaining !== undefined) { ds = Math.min(ds, m.remaining); m.remaining -= ds; }
          const [dx, dy] = this.dir(); const nx = this.r.x + dx * ds * m.sign, ny = this.r.y + dy * ds * m.sign;
          if (this.hitsWall(nx, ny, ROBOT_R)) { if (!this.colliding) { this.collisions++; this.emit('collide'); } this.colliding = true; }
          else { this.colliding = false; this.r.x = nx; this.r.y = ny; if (this.holding) this._carry(); }
          if (m.remaining !== undefined && m.remaining <= 1e-6) this._finishMotion();
        } else if (m.type === 'turn') {
          const w = 180 * this.turnVel / 100; let da = w * dt;
          if (m.remaining !== undefined) { da = Math.min(da, m.remaining); m.remaining -= da; }
          this.r.h = ((this.r.h + da * m.sign) % 360 + 360) % 360; this.r.rot += da * m.sign;
          if (this.holding) this._carry();
          if (m.remaining !== undefined && m.remaining <= 1e-6) this._finishMotion();
        }
        const last = this.trail[this.trail.length - 1];
        if (Math.hypot(last[0] - this.r.x, last[1] - this.r.y) > 0.8) this.trail.push([this.r.x, this.r.y]);
      }
      const [ox, oy] = this.opticalPt(); const f = this.floorAt(ox, oy); if (f.tile !== undefined) this.visited.add(f.tile);
      this.waiters = this.waiters.filter(w => { if (this.t >= w.until) { w.resolve(); this._woke = true; return false; } return true; });
      if (this.t > 180) this.halt('Time limit reached (3 simulated minutes) — program stopped. Is there an endless loop?');
    }
    _finishMotion() { const m = this.motion; this.motion = null; this._woke = true; if (m && m.done) m.done(); }
    _carry() { const [fx, fy] = this.frontPt(FRONT + 1.6); this.holding.x = fx; this.holding.y = fy; }
    sleep(sec) { return new Promise((resolve, reject) => { if (this.stopped) return reject(STOP); this.waiters.push({ until: this.t + Math.max(0, sec), resolve }); }); }
    setMotion(m, block) {
      if (this.motion && this.motion.done) this.motion.done();
      return new Promise((resolve) => { m.done = resolve; m.blocking = !!block; this.motion = m; if (!block) resolve(); });
    }
    halt(msg) {
      if (!this.running) return;
      const m = this.motion; // finish a move in progress so the program can see it was stopped and exit
      this.running = false; this.stopped = true; this.motion = null;
      if (m && m.done) m.done();
      this.waiters.forEach(w => w.resolve()); this.waiters = [];
      if (msg) this.emit('error', { message: msg });
    }
    // ---------- screen
    print(text) {
      const s = this.screen; text = String(text);
      this.output += text;
      const parts = text.split('\n');
      parts.forEach((p, i) => {
        if (i > 0) this.newLine(true);
        const line = s.lines[s.row] || ''; s.lines[s.row] = (line.padEnd(s.col, ' ').slice(0, s.col) + p + line.slice(s.col + p.length));
        s.col += p.length;
      });
      this.emit('screen');
    }
    newLine(internal) { const s = this.screen; s.row++; s.col = 0; if (s.lines.length <= s.row) s.lines.push(''); if (s.lines.length > 60) { s.lines.shift(); s.row--; } if (!internal) { this.output += '\n'; } this.emit('screen'); }
    // ---------- drawing
    draw() {
      const cv = this.canvas, ctx = this.ctx; const W = cv.width, H = cv.height; const k = W / FIELD_W;
      ctx.save(); ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#d9dde3'; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#c2c8d0'; ctx.lineWidth = 1;
      for (let x = 12; x < FIELD_W; x += 12) { ctx.beginPath(); ctx.moveTo(x * k, 0); ctx.lineTo(x * k, H); ctx.stroke(); }
      for (let y = 12; y < FIELD_H; y += 12) { ctx.beginPath(); ctx.moveTo(0, y * k); ctx.lineTo(W, y * k); ctx.stroke(); }
      const F = this.field;
      (F.tiles || []).forEach((T, i) => { ctx.fillStyle = (COLORS[T.color] || COLORS.white).css; ctx.fillRect(T.x * k, T.y * k, T.w * k, T.h * k); if (this.visited.has(i)) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = `${3 * k}px sans-serif`; ctx.fillText('✓', (T.x + 1) * k, (T.y + 3.5) * k); } });
      (F.lines || []).forEach(L => { ctx.strokeStyle = '#151515'; ctx.lineWidth = (L.width || 1) * k; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); L.points.forEach((p, i) => i ? ctx.lineTo(p[0] * k, p[1] * k) : ctx.moveTo(p[0] * k, p[1] * k)); ctx.stroke(); });
      (F.zones || []).forEach(Z => { ctx.setLineDash([6, 4]); ctx.strokeStyle = (COLORS[Z.color] || COLORS.black).css; ctx.lineWidth = 3; ctx.strokeRect(Z.x * k, Z.y * k, Z.w * k, Z.h * k); ctx.setLineDash([]); ctx.fillStyle = (COLORS[Z.color] || COLORS.black).css + '22'; ctx.fillRect(Z.x * k, Z.y * k, Z.w * k, Z.h * k); });
      if (F.goal) { ctx.fillStyle = 'rgba(48,164,108,.25)'; ctx.strokeStyle = '#30a46c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(F.goal.x * k, F.goal.y * k, F.goal.r * k, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#1e7a4f'; ctx.font = `bold ${3 * k}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('GOAL', F.goal.x * k, F.goal.y * k); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; }
      (F.walls || []).forEach(R => { ctx.fillStyle = '#5b6370'; ctx.fillRect(R.x * k, R.y * k, R.w * k, R.h * k); });
      ctx.strokeStyle = '#3a404a'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, W - 4, H - 4);
      // trail
      ctx.strokeStyle = this.look.trail; ctx.globalAlpha = .45; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath();
      this.trail.forEach((p, i) => i ? ctx.lineTo(p[0] * k, p[1] * k) : ctx.moveTo(p[0] * k, p[1] * k)); ctx.lineTo(this.r.x * k, this.r.y * k); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      // cubes
      this.cubes.forEach(c => { ctx.fillStyle = (COLORS[c.color] || COLORS.red).css; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.5; ctx.fillRect((c.x - 1.5) * k, (c.y - 1.5) * k, 3 * k, 3 * k); ctx.strokeRect((c.x - 1.5) * k, (c.y - 1.5) * k, 3 * k, 3 * k); });
      // distance ray
      const d = this.rayDistance();
      if (d !== null && d < 80) { const [fx, fy] = this.frontPt(); const [dx, dy] = this.dir(); ctx.strokeStyle = 'rgba(229,72,77,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(fx * k, fy * k); ctx.lineTo((fx + dx * d) * k, (fy + dy * d) * k); ctx.stroke(); }
      // robot
      ctx.translate(this.r.x * k, this.r.y * k); ctx.rotate(this.r.h * Math.PI / 180);
      drawRobot(ctx, k, this.look, { colliding: this.colliding, led: this.led, claw: this.claw, arm: this.arm });
      ctx.restore();
      if (this.look.name) { // name tag stays upright above the robot (below it near the top wall)
        ctx.font = `bold ${2.2 * k}px Tahoma, Arial, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const w = ctx.measureText(this.look.name).width + k, x = Math.max(w / 2, Math.min(W - w / 2, this.r.x * k)), y = (this.r.y < 12 ? this.r.y + 9.5 : this.r.y - 9.5) * k;
        ctx.fillStyle = '#ffffe1'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.fillRect(x - w / 2, y - 1.6 * k, w, 3.2 * k); ctx.strokeRect(x - w / 2, y - 1.6 * k, w, 3.2 * k);
        ctx.fillStyle = '#000'; ctx.fillText(this.look.name, x, y); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      }
      if (this.holding) { const c = this.holding; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect((c.x - 1.7) * k, (c.y - 1.7) * k, 3.4 * k, 3.4 * k); }
      this.emit('frame');
    }
  }
  const STOP = new Error('__stopped__');
  const yieldTask = (() => {
    if (typeof MessageChannel === 'undefined') return () => new Promise(r => setTimeout(r, 0));
    const ch = new MessageChannel(); const q = []; ch.port1.onmessage = () => q.shift()();
    return () => new Promise(r => { q.push(r); ch.port2.postMessage(0); });
  })();

  // ------------------------------------------------------------------ runtime API exposed to student code
  function fmt(f, args) {
    let i = 0; f = String(f);
    return f.replace(/%(-?\d*)(?:\.(\d+))?([difsclu%])/g, (m, w, p, t) => {
      if (t === '%') return '%';
      let v = args[i++]; let s;
      if (t === 'd' || t === 'i' || t === 'u' || t === 'l') s = String(Math.trunc(Number(v)));
      else if (t === 'f') s = Number(v).toFixed(p === undefined ? 6 : +p);
      else if (t === 'c') s = typeof v === 'number' ? String.fromCharCode(v) : String(v);
      else s = String(v);
      if (w) { const n = Math.abs(+w); s = +w < 0 ? s.padEnd(n) : s.padStart(n); }
      return s;
    });
  }
  function show(v) {
    if (typeof v === 'boolean') return v ? '1' : '0';
    if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(+v.toPrecision(6));
    if (Array.isArray(v)) return '[' + v.map(show).join(', ') + ']';
    return String(v);
  }

  function makeApi(sim) {
    const inch = (v, u) => (u === 'mm' ? v / 25.4 : u === 'cm' ? v / 2.54 : u === 'turns' ? v * 7.87 : v);
    const deg = (v, u) => (u === 'turns' ? v * 360 : v);
    let ticks = 0;
    const live = () => { if (sim.stopped) throw STOP; };
    const api = {
      forward: 'forward', fwd: 'forward', reverse: 'reverse', rev: 'reverse', left: 'left', right: 'right',
      inches: 'inches', mm: 'mm', cm: 'cm', degrees: 'degrees', deg: 'degrees', turns: 'turns', rev_: 'turns',
      seconds: 'seconds', sec: 'seconds', msec: 'msec', percent: 'percent', pct: 'percent', rpm: 'rpm', velocityUnits: {}, coast: 'coast', brake: 'brake', hold: 'hold',
      red: 'red', green: 'green', blue: 'blue', yellow: 'yellow', orange: 'orange', purple: 'purple', white: 'white', black: 'black', transparent: 'transparent', none: 'none', blue_green: 'green',
      endl: '\n', true: true, false: false,
      __int: v => Math.trunc(Number(v)),
      __vec: (n = 0, v = 0) => Array.from({ length: n }, () => v),
      __arr: function mk(ds, v) { const [d, ...rest] = ds; return Array.from({ length: Number(d) || 0 }, () => rest.length ? mk(rest, v) : v); },
      __tick: async () => { live(); if (++ticks % 300 === 0) { await new Promise(r => setTimeout(r, 0)); live(); } },
      __cout: async (...a) => { live(); sim.print(a.map(show).join('')); },
      printf: async (f, ...a) => { live(); sim.print(fmt(f, a)); },
      wait: async (v, u = 'msec') => { live(); await sim.sleep(u === 'seconds' ? v : v / 1000); live(); },
      vexDelay: async (ms) => { await sim.sleep(ms / 1000); live(); },
      task_sleep: async (ms) => { await sim.sleep(ms / 1000); live(); },
      abs: Math.abs, fabs: Math.abs, sqrt: Math.sqrt, pow: Math.pow, min: Math.min, max: Math.max, round: Math.round, floor: Math.floor, ceil: Math.ceil,
      sin: Math.sin, cos: Math.cos, tan: Math.tan, atan2: Math.atan2, atan: Math.atan, exp: Math.exp, log: Math.log, hypot: Math.hypot, M_PI: Math.PI,
      rand: () => Math.floor(Math.random() * 32768), srand: () => {}, time: () => Date.now(), RAND_MAX: 32767,
      to_string: v => show(v), stoi: s => parseInt(s, 10), stod: s => parseFloat(s), swap: () => { throw new Error('swap(a, b) is not supported here — use a temp variable: int temp = a; a = b; b = temp;'); },
      Drivetrain: {
        driveFor: async (dir, dist, units = 'inches', waitDone = true) => { live(); const d = inch(dist, units); await sim.setMotion({ type: 'drive', sign: (dir === 'reverse' ? -1 : 1) * Math.sign(d || 1), remaining: Math.abs(d) }, waitDone !== false); live(); },
        turnFor: async (dir, ang, units = 'degrees', waitDone = true) => { live(); const a = deg(ang, units); await sim.setMotion({ type: 'turn', sign: (dir === 'left' ? -1 : 1) * Math.sign(a || 1), remaining: Math.abs(a) }, waitDone !== false); live(); },
        turnToHeading: async (h, units = 'degrees', waitDone = true) => { live(); let diff = ((h - sim.r.h) % 360 + 540) % 360 - 180; await sim.setMotion({ type: 'turn', sign: diff < 0 ? -1 : 1, remaining: Math.abs(diff) }, waitDone !== false); live(); },
        turnToRotation: async (r) => { live(); const diff = r - sim.r.rot; await sim.setMotion({ type: 'turn', sign: diff < 0 ? -1 : 1, remaining: Math.abs(diff) }, true); live(); },
        drive: async (dir, v) => { live(); if (typeof v === 'number') sim.driveVel = Math.max(0, Math.min(100, v)); sim.setMotion({ type: 'drive', sign: dir === 'reverse' ? -1 : 1 }, false); },
        turn: async (dir, v) => { live(); if (typeof v === 'number') sim.turnVel = Math.max(0, Math.min(100, v)); sim.setMotion({ type: 'turn', sign: dir === 'left' ? -1 : 1 }, false); },
        stop: async () => { live(); if (sim.motion && sim.motion.done) sim.motion.done(); sim.motion = null; },
        setDriveVelocity: async (v) => { live(); sim.driveVel = Math.max(-100, Math.min(100, Number(v))); if (sim.driveVel < 0) { sim.driveVel = -sim.driveVel; if (sim.motion && sim.motion.type === 'drive') sim.motion.sign *= -1; } },
        setTurnVelocity: async (v) => { live(); sim.turnVel = Math.max(0, Math.min(100, Math.abs(Number(v)))); },
        setStopping: async () => {}, setTimeout: async () => {}, setHeading: async (h) => { sim.r.h = h; },
        heading: async () => +sim.r.h.toFixed(2), rotation: async () => +sim.r.rot.toFixed(2),
        isMoving: async () => !!sim.motion, isDone: async () => !sim.motion,
        velocity: async () => (sim.motion ? sim.driveVel : 0)
      },
      Brain: {
        Screen: {
          print: async (f, ...a) => { live(); sim.print(typeof f === 'string' ? fmt(f, a) : show(f)); },
          newLine: async () => { live(); sim.newLine(); },
          clearScreen: async () => { live(); sim.screen = { lines: [''], row: 0, col: 0 }; sim.output += '\n'; sim.emit('screen'); },
          clearLine: async () => { const s = sim.screen; s.lines[s.row] = ''; s.col = 0; sim.emit('screen'); },
          setCursor: async (r, c) => { const s = sim.screen; s.row = Math.max(0, r - 1); s.col = Math.max(0, c - 1); while (s.lines.length <= s.row) s.lines.push(''); sim.emit('screen'); },
          setFont: async () => {}, setPenColor: async () => {}, setFillColor: async () => {}, drawRectangle: async () => {}, drawCircle: async () => {}
        },
        Timer: {
          time: async (u = 'msec') => { const t = sim.t - sim.timerStart; return u === 'seconds' ? +t.toFixed(3) : Math.round(t * 1000); },
          clear: async () => { sim.timerStart = sim.t; }, reset: async () => { sim.timerStart = sim.t; }
        },
        playSound: async () => {}, buttonCheck: { pressing: async () => false }, buttonLeft: { pressing: async () => false }, buttonRight: { pressing: async () => false }
      },
      DistanceSensor: {
        objectDistance: async (u = 'inches') => { live(); const d = sim.rayDistance(); const v = d === null ? 9999 / 25.4 : d; return u === 'mm' ? Math.round(v * 25.4) : u === 'cm' ? +(v * 2.54).toFixed(1) : +v.toFixed(2); },
        isObjectDetected: async () => { const d = sim.rayDistance(); return d !== null && d < 78; },
        installed: async () => true, foundObject: async () => { const d = sim.rayDistance(); return d !== null && d < 78; }
      },
      BumperA: {
        pressing: async () => { live(); const [fx, fy] = sim.frontPt(); return sim.colliding || sim.hitsWall(fx, fy, 0.6); }
      },
      Optical: {
        color: async () => { live(); const [x, y] = sim.opticalPt(); return sim.floorAt(x, y).color; },
        brightness: async () => { live(); const [x, y] = sim.opticalPt(); return (COLORS[sim.floorAt(x, y).color] || COLORS.white).b; },
        hue: async () => { live(); const [x, y] = sim.opticalPt(); return (COLORS[sim.floorAt(x, y).color] || COLORS.white).hue; },
        isNearObject: async () => { const d = sim.rayDistance(); return d !== null && d < 3; },
        setLight: async () => {}, setLightPower: async () => {}, installed: async () => true
      },
      TouchLED: { setColor: async (c) => { sim.led = c; }, on: async () => {}, off: async () => { sim.led = null; }, pressing: async () => false, setFade: async () => {}, setBrightness: async () => {} },
      BrainInertial: {
        heading: async () => +sim.r.h.toFixed(2), rotation: async () => +sim.r.rot.toFixed(2),
        setHeading: async (h) => { sim.r.h = h; }, setRotation: async (r) => { sim.r.rot = r; }, calibrate: async () => {}, isCalibrating: async () => false, resetHeading: async () => { sim.r.h = 0; }, resetRotation: async () => { sim.r.rot = 0; }
      },
      ClawMotor: {
        spinFor: async (dir, amt, units = 'degrees', waitDone = true) => {
          live(); const secs = Math.min(2, Math.abs(deg(amt, units)) / 360 + 0.1); if (waitDone !== false) await sim.sleep(secs); live();
          if (dir !== 'reverse') {
            sim.claw = 1;
            if (!sim.holding) {
              const [fx, fy] = sim.frontPt(FRONT + 1.6); let best = null, bd = 6;
              sim.cubes.forEach(c => { const dd = Math.hypot(c.x - fx, c.y - fy); if (dd < bd) { bd = dd; best = c; } });
              if (best) { sim.holding = best; sim._carry(); }
            }
          } else { sim.claw = 0; sim.holding = null; }
        },
        spin: async (dir) => { sim.claw = dir === 'reverse' ? 0 : 1; }, stop: async () => {}, setVelocity: async () => {}, setStopping: async () => {}, setMaxTorque: async () => {}, spinToPosition: async () => {}
      },
      ArmMotor: {
        spinFor: async (dir, amt, units = 'degrees', waitDone = true) => { live(); const a = deg(amt, units); if (waitDone !== false) await sim.sleep(Math.min(3, Math.abs(a) / 360 + 0.1)); sim.arm = Math.max(0, Math.min(3, sim.arm + (dir === 'reverse' ? -1 : 1) * a / 90)); },
        spin: async () => {}, stop: async () => {}, setVelocity: async () => {}, setStopping: async () => {}, spinToPosition: async () => {}, position: async () => sim.arm * 90
      }
    };
    const mot = { spinFor: async () => { await sim.sleep(0.5); }, spin: async () => {}, stop: async () => {}, setVelocity: async () => {}, position: async () => 0, setStopping: async () => {} };
    api.LeftMotor = mot; api.RightMotor = mot;
    return api;
  }
  // Only the devices in this robot's setup exist for its program.
  const DEVICE_KEYS = ['BrainInertial', 'DistanceSensor', 'Optical', 'BumperA', 'TouchLED', 'ClawMotor', 'ArmMotor'];
  function robotApi(sim, s) {
    const all = makeApi(sim), out = { ...all }, names = ['Drivetrain', 'Brain', 'LeftMotor', 'RightMotor'];
    DEVICE_KEYS.forEach(k => delete out[k]);
    const O = all.Optical, detects = async c => (await O.color()) === c;
    const colorApi = s.devices.color.kind === 'color'
      ? { colorname: O.color, brightness: O.brightness, hue: O.hue, detects, isNearObject: O.isNearObject, setLight: O.setLight, installed: O.installed }
      : { ...O, colorname: O.color, detects };
    const objects = { gyro: all.BrainInertial, distance: all.DistanceSensor, color: colorApi, bumper: all.BumperA, touchled: all.TouchLED, claw: all.ClawMotor, arm: all.ArmMotor };
    for (const job of activeJobs(s)) { out[s.devices[job].name] = objects[job]; names.push(s.devices[job].name); }
    if (s.gen === 2) { out.BrainInertial = all.BrainInertial; names.push('BrainInertial'); }
    if (s.gen === 1 && !activeJobs(s).includes('gyro')) {
      const needsGyro = name => async () => { throw new Error(`Drivetrain.${name} needs a Gyro Sensor. Add one in Robot Setup.`); };
      out.Drivetrain = { ...all.Drivetrain };
      ['turnToHeading', 'turnToRotation', 'heading', 'rotation', 'setHeading'].forEach(n => { out.Drivetrain[n] = needsGyro(n); });
    }
    return { api: out, names };
  }

  // vector-style helpers on arrays / strings (non-enumerable)
  const def = (o, n, f) => { if (!o.prototype[n]) Object.defineProperty(o.prototype, n, { value: f, writable: true, configurable: true }); };
  def(Array, 'push_back', function (v) { this.push(v); }); def(Array, 'pop_back', function () { this.pop(); });
  def(Array, 'size', function () { return this.length; }); def(Array, 'empty', function () { return this.length === 0; });
  def(Array, 'front', function () { return this[0]; }); def(Array, 'back', function () { return this[this.length - 1]; });
  def(Array, 'clear', function () { this.length = 0; });
  def(String, 'size', function () { return this.length; }); def(String, 'empty', function () { return this.length === 0; });

  // Trusts the stack only if it points inside the student's code; otherwise finds the name the error mentions.
  function errorLine(e, msg, src) {
    const lm = /<anonymous>:(\d+)/.exec(e.stack || ''), total = src.split('\n').length, line = lm ? +lm[1] - 2 : 0;
    if (line > 0 && line <= total) return line;
    const name = /'([\w.]+)'/.exec(msg);
    if (!name) return undefined;
    const c = codeOnly(src), i = c.indexOf(name[1]);
    return i < 0 ? undefined : c.slice(0, i).split('\n').length;
  }

  async function run(sim, src, setup) {
    const robot = setup || fullSetup();
    const problem = checkDevices(src, robot) || checkHabits(src);
    if (problem) return { ok: false, ...problem };
    const { api, names: deviceNames } = robotApi(sim, robot);
    let js;
    try { js = translate(src, deviceNames); } catch (e) { return { ok: false, error: e.message, line: e.line }; }
    const names = Object.keys(api).filter(n => /^[A-Za-z_]\w*$/.test(n) && n !== 'true' && n !== 'false');
    let fn;
    try { fn = new AsyncFunction(...names, '"use strict";{' + js + '\n;return await main();}'); }
    catch (e) { return { ok: false, error: 'Syntax error: ' + e.message.replace(/Unexpected token/, 'unexpected symbol') + ' — check spelling, brackets and semicolons near your last change.', js }; }
    sim.reset(); sim.running = true; sim.stopped = false;
    try {
      await fn(...names.map(n => api[n]));
      if (sim.stopped) return { ok: true, stopped: true };
      if (sim.motion && sim.motion.remaining === undefined) await sim.sleep(0.05);
      sim.motion = null; sim.running = false;
      return { ok: true };
    } catch (e) {
      sim.running = false; sim.motion = null;
      if (e === STOP) return { ok: true, stopped: true };
      let msg = e.message || String(e);
      const m = /(\w+) is not defined/.exec(msg); if (m) msg = `'${m[1]}' was not declared in this scope — check the spelling or declare it first (e.g. int ${m[1]} = 0;)`;
      if (/is not a function/.test(msg)) msg = msg.replace(/(.+) is not a function/, "'$1' is not a function the robot knows — check the spelling/capital letters");
      if (/Assignment to constant/.test(msg)) msg = 'You tried to change a const variable.';
      return { ok: false, error: msg, line: errorLine(e, msg, src) };
    } finally { sim.stopped = true; }
  }

  function evaluate(sim, src, checks) {
    return (checks || []).map(ch => {
      let pass = false;
      try {
        if (ch.type === 'goal') { const g = sim.field.goal; pass = !!g && Math.hypot(sim.r.x - g.x, sim.r.y - g.y) <= g.r; }
        else if (ch.type === 'noCollision') pass = sim.collisions === 0;
        else if (ch.type === 'output') pass = new RegExp(ch.pattern, ch.flags || 'i').test(sim.output);
        else if (ch.type === 'code') pass = new RegExp(ch.pattern, ch.flags || '').test(src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*[\/]/g, ''));
        else if (ch.type === 'cubesInZones') pass = sim.cubes.length > 0 && !sim.holding && sim.cubes.every(c => (sim.field.zones || []).some(Z => Z.color === c.color && c.x >= Z.x && c.x <= Z.x + Z.w && c.y >= Z.y && c.y <= Z.y + Z.h));
        else if (ch.type === 'visitedTiles') pass = (sim.field.tiles || []).length > 0 && sim.visited.size === sim.field.tiles.length;
      } catch (e) { pass = false; }
      return { message: ch.message || ch.type, pass };
    });
  }

  window.VexSim = { Sim, run, translate, evaluate, FIELD_W, FIELD_H, drawRobot, normalizeLook, LOOK_OPTIONS, DEFAULT_LOOK, SETUP_JOBS, normalizeSetup, validateSetup, generatedConfig, adaptText, canonicalize };
})();
