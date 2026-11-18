/* A team's logo: a shape in the team color with the mascot on it.
 *   TeamCrest.svg({shape, hex, emoji, name}, 48)  ->  an SVG string */
(function () {
  'use strict';
  var SHAPES = {
    shield: '<path d="M50 4 92 16V52C92 76 72 92 50 98 28 92 8 76 8 52V16Z"',
    circle: '<circle cx="50" cy="50" r="46"',
    hex: '<path d="M50 3 91 26V74L50 97 9 74V26Z"',
    diamond: '<path d="M50 2 98 50 50 98 2 50Z"'
  };
  function svg(t, size) {
    t = t || {};
    var shape = SHAPES[t.shape] || SHAPES.shield, hex = /^#[0-9a-f]{6}$/i.test(t.hex || '') ? t.hex : '#d92d20';
    var name = String(t.name || 'Team').replace(/[&<>"]/g, '');
    return '<svg class="crest" viewBox="0 0 100 100" width="' + (size || 48) + '" height="' + (size || 48) + '" role="img" aria-label="' + name + ' logo">' +
      shape + ' fill="' + hex + '" stroke="#16181d" stroke-width="5" stroke-linejoin="round"/>' +
      '<g transform="translate(50 50) scale(.8) translate(-50 -50)">' + shape + ' fill="none" stroke="rgba(255,255,255,.6)" stroke-width="2.5" stroke-linejoin="round"/></g>' +
      '<text x="50" y="' + (t.shape === 'shield' ? 49 : 52) + '" font-size="44" text-anchor="middle" dominant-baseline="central">' + String(t.emoji || '🤖') + '</text></svg>';
  }
  window.TeamCrest = { svg: svg };
})();
