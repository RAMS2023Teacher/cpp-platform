// Pictures from VEX Robotics (the VEX Library and vexrobotics.com), shown by linking to VEX's own servers.
// They are not copied into this project. Use them in lesson HTML with
//   <div data-vex="brain2 smartmotor"></div>
// and each one is shown with its caption and an "Image: VEX Robotics" credit.
// A 4th value of 1 or 2 means the part only belongs to that kit generation; the page hides it for the other kit.
const KB = id => `https://kb.vex.com/hc/article_attachments/${id}`;
const SHOP = p => `https://www.vexrobotics.com/media/catalog/product/cache/207e23213cf636ccdef205098cf3c8a3/${p}`;

module.exports = {
  brain2: [SHOP('2/2/228-6480_iqrobotbraingen2_lqc_rev1.jpg'), 'The VEX IQ Robot Brain (2nd gen), with its screen, buttons and numbered Smart Ports', 'Robot Brain (2nd gen)', 2],
  smartmotor: [SHOP('2/2/228-2560_iq_smartmotor_rqc_rev1.jpg'), 'A VEX IQ Smart Motor (2nd gen), a gray box with a square shaft hole on top', 'Smart Motor (2nd gen)', 2],
  smartmotor1: [KB('18130185881876'), 'A VEX IQ Smart Motor (1st gen) with mounting holes on top', 'Smart Motor (1st gen)', 1],
  battery: [SHOP('v/e/vex_228-7045_robot_battery_li-ion__main_v01_06172022.jpg'), 'The VEX IQ Robot Battery (2nd gen), a flat gray lithium-ion pack', 'Robot Battery (2nd gen)', 2],
  controller2: [SHOP('2/2/228-6470_iq_controller2nd_gen_left_render_rev_01.jpg'), 'The VEX IQ Controller (2nd gen) with two joysticks and buttons', 'Controller (2nd gen)', 2],
  omniwheel: [SHOP('2/2/228_2536_200mm_travel_omni_directional_wheel_2_pack_together_render_08222022.jpg'), 'Two VEX IQ omni wheels, each with small rollers around the edge', 'Omni wheels (200 mm travel)'],
  distance: [KB('14013427162132'), 'The VEX IQ Distance Sensor (2nd gen), a gray block with two round lenses on the front', 'Distance Sensor (2nd gen)', 2],
  optical: [KB('14012590048404'), 'The VEX IQ Optical Sensor, a gray cube with three small windows on top', 'Optical Sensor', 2],
  bumper: [KB('14012003948436'), 'The VEX IQ Bumper Switch on its mounting base, with a square button on top', 'Bumper Switch'],
  touchled: [KB('14012286543124'), 'The VEX IQ Touch LED, a cube with a white top that lights up and can be pressed', 'Touch LED'],
  gyro: [KB('14013326317076'), 'The VEX IQ Gyro Sensor, a cube marked with a curved arrow around the letter Z', 'Gyro Sensor (1st gen kits)', 1],
  beams: [KB('4407417040660'), 'A chart of VEX IQ beams and plates: 1x beams, 2x beams, 4x plates and specialty angle beams', 'Beams and plates'],
  beamlengths: [KB('44170442543508'), 'VEX IQ 1x beams lined up by length, from 2 holes up to 20 holes', 'Beams come in many lengths'],
  pins: [KB('18130195360276'), 'A chart of VEX IQ pins and standoffs, from 6x pitch standoffs down to small connector pins', 'Pins and standoffs'],
  connectors: [KB('4407415687316'), 'A chart of VEX IQ corner connectors, pins and standoffs', 'Connectors, pins and standoffs'],
  shafts: [KB('18130247723028'), 'A chart of VEX IQ shafts: capped shafts, motor shafts and plastic shafts of different lengths', 'Shafts'],
  shaftlock: [KB('360042724952'), 'A 2x2 Shaft Lock Plate with a square center hole next to a 2x2 Beam with a round center hole', 'Square hole grips a shaft; round hole lets it spin'],
  basebot: [KB('360042727012'), 'A finished VEX IQ BaseBot with four wheels and the Brain on top, sitting on a field', 'The BaseBot'],
  basebotbuild: [KB('360042725012'), 'An exploded view of building the BaseBot, with lines showing where the Brain and frame attach', 'BaseBot build: where the parts go'],
  plowbot: [KB('360042756071'), 'A VEX IQ robot with a wide front plow, two drive wheels and the Brain on top', 'A robot with a front plow'],
  claw: [KB('360042725552'), 'A close-up of a VEX IQ claw made of beams, with gears driving the arm', 'A claw up close'],
  clawarm: [KB('360042725532'), 'A close-up of a curved claw arm built from beams and corner connectors', 'Claw arm'],
  armbuild: [KB('360042725072'), 'An exploded view of building a robot arm with large blue gears and a Smart Motor', 'Arm build: gears lift the arm'],
  clawbuild: [KB('360042725032'), 'An exploded view of building a claw from beams and corner connectors', 'Claw build']
};
