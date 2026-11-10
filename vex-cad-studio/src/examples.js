// Example models students can open from More → Example models.
// Positions are in mm with Y up. 1 pitch = 12.7 mm, and holes sit on the half-pitch grid.
(function () {
  const P = 12.7;
  const C = { red: '#d32f2f', orange: '#f57c00', yellow: '#fbc02d', green: '#2e9d4a', blue: '#1e63c6', purple: '#7b3fb5', gray: '#b9bec6', dark: '#4f5660', black: '#22252a', white: '#f2f2f2', teal: '#00897b' };
  // part(id, [x, y, z], colour, ...turns) where each turn is ['x' | 'y' | 'z', degrees], applied in order.
  function part(p, t, c, ...turns) {
    const q = new THREE.Quaternion();
    for (const [axis, deg] of turns) {
      const v = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
      q.premultiply(new THREE.Quaternion().setFromAxisAngle(v, THREE.MathUtils.degToRad(deg)));
    }
    return { p, t: t.map(x => Math.round(x * 1000) / 1000), q: q.toArray().map(x => Math.round(x * 1e6) / 1e6), c };
  }
  const model = (name, parts, camera) => ({ format: 'vex-iq-cad', version: 1, name, parts, camera });
  const holeX = (n, i) => (i - (n - 1) / 2) * P; // x of hole i on a plate n holes long

  // Gear train: 12 → 36 → 60 → 12 tooth gears on a 4x12 plate.
  function gearTrain() {
    const list = [part('045', [0, 3.05, 0], C.gray)];
    const top = 6.1 + 3.175 + 0.4;
    const gears = [['213', 1, C.red], ['214', 3, C.green], ['215', 7, C.blue], ['213', 10, C.red]];
    for (const [id, hole, color] of gears) {
      const x = holeX(12, hole), z = -P / 2;
      list.push(part(id, [x, top, z], color));
      list.push(part('120', [x, 24.5, z], C.black));
    }
    return model('Gear Train', list, { position: [160, 170, 210], target: [0, 10, 0] });
  }

  // A tower of beams joined by pins, showing how layers stack 1/2 pitch apart.
  function tower() {
    const list = [];
    const layers = 6;
    for (let i = 0; i < layers; i++) {
      const y = 3.05 + i * P / 2;
      if (i % 2 === 0) list.push(part('023', [0, y, 0], i % 4 === 0 ? C.blue : C.orange));
      else list.push(part('023', [0, y, 0], C.white, ['y', 90]));
    }
    for (let i = 0; i < layers - 1; i++) {
      const y = 3.05 + i * P / 2 + P / 4;
      list.push(part('060', [-P / 2, y, -P / 2], C.teal));
      list.push(part('060', [P / 2, y, P / 2], C.teal));
    }
    return model('Criss-Cross Tower', list, { position: [150, 230, 190], target: [0, 15, 0] });
  }

  // A simple drive base: two plates side by side, four wheels on shafts, stand-in motors and Brain.
  function driveBase() {
    const list = [];
    const axleY = 23.87;                 // tire radius, so the tires touch the grid
    const plateY = axleY + 6.35;         // plates sit just above the axles
    for (const sz of [-1, 1]) list.push(part('045', [0, plateY, sz * 2 * P], C.gray));          // 4x12 plates
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const x = sx * 4.5 * P, z = sz * 5 * P;
      list.push(part('210', [x, axleY, z], C.black, ['x', 90]));                                   // tire
      list.push(part('208', [x, axleY, z + (sz < 0 ? 6.41 : -6.41)], C.white, ['x', sz < 0 ? -90 : 90])); // hub
      list.push(part('122', [x, axleY, sz * (5 * P + 9.4 - 37.2)], C.black, ['x', 90]));          // 6x shaft
    }
    for (const sz of [-1, 1]) list.push(part('e-motor', [-4.5 * P, plateY - 3.05 - P, sz * 2 * P], C.dark));
    list.push(part('e-brain', [0, plateY + 3.05 + 1.5 * P, 0], C.dark, ['y', 90]));
    list.push(part('e-battery', [0, plateY - 3.05 - P, 0], C.dark));
    return model('Simple Drive Base', list, { position: [270, 230, 330], target: [0, 30, 0] });
  }

  window.VIQ_EXAMPLES = [
    { name: 'Gear Train', about: 'A 12, 36, 60 and 12 tooth gear meshing on a 4x12 plate. Change the gears to see how the ratio changes.', data: gearTrain() },
    { name: 'Criss-Cross Tower', about: 'Beams stacked in alternating directions and joined with connector pins.', data: tower() },
    { name: 'Simple Drive Base', about: 'A plate chassis with four wheels on shafts, plus stand-in motors, battery and Brain.', data: driveBase() }
  ];
})();
