// Sorts VEX IQ parts into the editor's library categories by name. First match wins.
const RULES = [
  ['Pins', /\bpin\b|bushing pin|ball pin/i],
  ['Shafts & Collars', /shaft|collar|bushing|washer|spacer/i],
  ['Standoffs', /standoff/i],
  ['Gears & Sprockets', /gear|sprocket|ratchet|chain|tread|tank|traction link|tiebar|pawl|worm|differential/i],
  ['Wheels & Tires', /wheel|tire|hub|pulley|puck|belt|rubber band/i],
  ['Connectors', /connector|corner|gusset/i],
  ['Plates', /plate|sheet/i],
  ['Beams', /beam|linkage|girder|arm|fork/i],
  ['Panels', /panel|cab|windshield|windscreen|shell|nose|wing|hood/i],
  ['Motion', /linear|slide|rack|turntable|cam|actuator|knob|spring|shock|crank|screw|auger|clutch|propeller|fan|flywheel/i],
  ['Electronics', /brain|smart motor|battery|sensor|controller|touch led|bumper/i]
];
function categorize(name) {
  for (const [cat, re] of RULES) if (re.test(name)) return cat;
  return 'Special & Themed';
}
const ORDER = ['Beams', 'Plates', 'Connectors', 'Pins', 'Standoffs', 'Shafts & Collars', 'Gears & Sprockets', 'Wheels & Tires', 'Motion', 'Panels', 'Electronics', 'Special & Themed'];
module.exports = { categorize, ORDER };
