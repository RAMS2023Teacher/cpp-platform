// Proves every simulator step in the lessons can be passed: runs each step's solution through the real
// simulator and checks that every check passes, and that the starter code alone does not.
//   node tools/check_sims.js < steps.json      (tools/build.py does this)
// steps.json: [{where, starter, solution, field, checks, drive, pilot}]
const fs = require('fs'), path = require('path');
let fake = 0;
global.window = global; global.performance = { now: () => fake };
global.requestAnimationFrame = (f) => setTimeout(() => { fake += 16; f(fake); }, 0);
const noop = new Proxy(function () {}, { get: (t, k) => (k === 'canvas' ? {} : noop), apply: () => noop, set: () => true });
eval(fs.readFileSync(path.join(__dirname, '..', 'apps_script', 'client', 'lib', 'sim.js'), 'utf8'));

async function runOne(code, step) {
  const sim = new VexSim.Sim({ width: 960, height: 720, getContext: () => noop }, step.field);
  sim.speed = 60;
  const pilot = step.drive ? step.pilot : null;
  const limit = pilot ? pilot[pilot.length - 1][0] + 0.5 : 0;
  const r = await VexSim.run(sim, code, { pilot, limit });
  const res = VexSim.evaluate(sim, code, step.checks);
  sim.destroy();
  return { r, res };
}

(async () => {
  const steps = JSON.parse(fs.readFileSync(0, 'utf8')), problems = [];
  for (const step of steps) {
    const sol = await runOne(step.solution, step);
    if (!sol.r.ok) problems.push(`${step.where}: the solution has an error${sol.r.line ? ' on line ' + sol.r.line : ''}: ${sol.r.error}`);
    sol.res.filter((c) => !c.pass).forEach((c) => problems.push(`${step.where}: the solution does not pass "${c.message}"`));
    if (step.starter) {
      const st = await runOne(step.starter, step);
      if (st.r.ok && st.res.every((c) => c.pass)) problems.push(`${step.where}: the starter code already passes every check`);
    }
  }
  if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
  console.log(`  ${steps.length} simulator step(s) checked`);
  process.exit(0);
})().catch((e) => { console.log('check_sims failed: ' + (e && e.stack || e)); process.exit(1); });
