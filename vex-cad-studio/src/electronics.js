// Simple stand-in shapes for VEX IQ electronics, which aren't in the CAD folder.
// They're blocks with roughly the right footprint so students can plan where things go.
// Sizes are approximate. Units are mm, Y is up, and the origin is the centre of the block.
(function () {
  const P = 12.7;
  function box(w, h, d, x = 0, y = 0, z = 0) {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(x, y, z);
    return g;
  }
  function cyl(r, h, x = 0, y = 0, z = 0, axis = 'y', seg = 24) {
    const g = new THREE.CylinderGeometry(r, r, h, seg);
    if (axis === 'x') g.rotateZ(Math.PI / 2);
    if (axis === 'z') g.rotateX(Math.PI / 2);
    g.translate(x, y, z);
    return g;
  }
  function merge(list) {
    const parts = list.map(g => g.index ? g.toNonIndexed() : g);
    parts.forEach(g => { g.deleteAttribute('uv'); });
    return THREE.BufferGeometryUtils.mergeBufferGeometries(parts, false);
  }
  const BUILD = {
    'e-brain': () => merge([
      box(8 * P, 3 * P, 11 * P),
      box(5 * P, 0.4 * P, 3 * P, 0, 1.6 * P, -2.5 * P),          // screen
      cyl(0.9 * P, 0.4 * P, 0, 1.6 * P, 1.8 * P),               // button
      box(7 * P, 0.3 * P, 0.6 * P, 0, 1.0 * P, 5.6 * P)         // port strip
    ]),
    'e-battery': () => merge([box(5 * P, 2 * P, 2.5 * P), box(1.6 * P, 1.2 * P, 0.4 * P, 0, 0, 1.4 * P)]),
    'e-motor': () => merge([
      box(2 * P, 2 * P, 4 * P),
      cyl(0.55 * P, 0.3 * P, 0, 0, -1 * P, 'x').translate(1.05 * P, 0, 0),    // shaft socket ring
      box(0.9 * P, 0.6 * P, 0.25 * P, 0, 0.3 * P, 2.05 * P)                  // port
    ]),
    'e-touchled': () => merge([box(2 * P, 1.2 * P, 2 * P), cyl(0.8 * P, 0.5 * P, 0, 0.8 * P, 0)]),
    'e-bumper': () => merge([box(2 * P, 1.6 * P, 2 * P), box(1.4 * P, 0.6 * P, 1.4 * P, 0, 1.1 * P, 0)]),
    'e-distance': () => merge([box(3 * P, 1.6 * P, 2 * P), cyl(0.35 * P, 0.4 * P, -0.6 * P, 0, 1.15 * P, 'z'), cyl(0.35 * P, 0.4 * P, 0.6 * P, 0, 1.15 * P, 'z')]),
    'e-optical': () => merge([box(2 * P, 1.2 * P, 2 * P), cyl(0.45 * P, 0.4 * P, 0, 0, 1.15 * P, 'z')]),
    'e-gyro': () => merge([box(2 * P, 1 * P, 2 * P), box(0.8 * P, 0.2 * P, 0.8 * P, 0, 0.6 * P, 0)])
  };
  const LIST = [
    ['e-brain', 'Robot Brain (stand-in)'],
    ['e-battery', 'Battery (stand-in)'],
    ['e-motor', 'Smart Motor (stand-in)'],
    ['e-touchled', 'Touch LED (stand-in)'],
    ['e-bumper', 'Bumper Switch (stand-in)'],
    ['e-distance', 'Distance Sensor (stand-in)'],
    ['e-optical', 'Optical Sensor (stand-in)'],
    ['e-gyro', 'Gyro Sensor (stand-in)']
  ];
  window.VIQ_ELECTRONICS = {
    list: LIST.map(([id, name]) => ({ id, name, pn: '', cat: 'Electronics', stand: true })),
    build(id) {
      const g = BUILD[id]();
      g.computeVertexNormals();
      return g;
    }
  };
})();
