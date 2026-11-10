// Unit 1: Meet Your Robot
module.exports = [
  // ───────────────────────────────────────────── u1l1
  {
    id: "u1l1",
    unit: 1,
    order: 1,
    title: "What Is a Robot?",
    minutes: 35,
    tags: ["build", "code"],
    summary: "Discover the Sense-Think-Act loop, tour the VEX IQ kit with a parts scavenger hunt, and make the Brain say hello.",
    objectives: [
      "I can explain the Sense-Think-Act loop and give a real-world example.",
      "I can name and identify at least 8 parts in the VEX IQ kit.",
      "I can follow our class safety and cleanup routine.",
      "I can run my first program that prints to the Brain screen."
    ],
    vocab: [
      { term: "Robot", def: "A machine that can sense its surroundings, decide what to do, and act on its own using a program." },
      { term: "Sensor", def: "A part that collects information about the world, like distance, color, or touch." },
      { term: "Actuator", def: "A part that makes the robot move or do something, like a motor." },
      { term: "Brain", def: "The VEX IQ controller that runs your program and connects to motors and sensors through Smart Ports." },
      { term: "Program", def: "A list of instructions written in a language (like C++) that a computer follows exactly." },
      { term: "Sense-Think-Act", def: "The loop every robot follows: gather information, make a decision, then do something." }
    ],
    materials: [
      "VEX IQ (2nd gen) kits, one per team",
      "Scavenger hunt sheet (printed or on the board)",
      "Sticky notes",
      "Bins/trays for each team",
      "Chromebooks/laptops with this site open"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Robot or Not?",
        minutes: 5,
        html: `<p>On a sticky note, write <strong>YES</strong> or <strong>NO</strong> for each item: is it a robot?</p>
<ol>
  <li>A toaster</li>
  <li>A Roomba vacuum (made by iRobot, from right here in Bedford, MA!)</li>
  <li>A remote-control car</li>
  <li>A self-checkout machine</li>
  <li>Spot, the dog-like robot from Boston Dynamics (Waltham, MA)</li>
</ol>
<div class="callout think"><p><strong>Turn and talk:</strong> Pick the one your table argued about the most. What would it need to have to <em>definitely</em> be a robot?</p></div>`
      },
      {
        kind: "learn",
        title: "Sense, Think, Act",
        minutes: 8,
        html: `<p>Engineers argue about the exact definition, but most agree a robot does three things over and over:</p>
<table class="tbl">
  <tr><th>Step</th><th>What it means</th><th>Roomba example</th><th>VEX IQ part</th></tr>
  <tr><td><strong>Sense</strong></td><td>Collect information</td><td>Bumper hits the couch</td><td>Distance Sensor, Bumper Switch, Optical Sensor, Inertial sensor</td></tr>
  <tr><td><strong>Think</strong></td><td>Decide what to do</td><td>"I hit something, so turn"</td><td>The Brain running <em>your</em> C++ program</td></tr>
  <tr><td><strong>Act</strong></td><td>Do something in the world</td><td>Spin wheels to turn away</td><td>Smart Motors, Touch LED, Brain screen</td></tr>
</table>
<p>A remote-control car senses nothing and thinks nothing: a <em>human</em> does the thinking. That is why most people say it is <strong>not</strong> a robot. A toaster with a timer? It "thinks" a tiny bit, but it does not sense the toast. Borderline!</p>
<div class="callout tip"><p><strong>Fun fact:</strong> The word "robot" comes from a 1920 Czech play. <em>Robota</em> means "forced work." This year <strong>you</strong> are the boss and the robot does the work.</p></div>
<div class="callout think"><p><strong>Discuss:</strong> Think of a robot you would want in your house or school. What would it sense? What would it decide? What would it do?</p></div>`
      },
      {
        kind: "activity",
        title: "Kit Tour Scavenger Hunt",
        minutes: 12,
        html: `<div data-vex="brain2 smartmotor battery controller2 omniwheel distance optical bumper touchled gyro"></div>
<div class="callout robot">
<p><strong>Team challenge (teams of 3):</strong> Find each part in your kit, hold it up, and have your teacher or a neighbor team check it off. First team to find all 10 correctly gets first pick of field time next class!</p>
<ol class="steps">
  <li>Pick roles: <strong>Finder</strong> (searches the kit), <strong>Checker</strong> (compares with the picture/description), <strong>Recorder</strong> (writes it on the sheet).</li>
  <li>Find the <strong>Brain</strong> (the big rectangle with a screen and 12 Smart Ports).</li>
  <li>Find a <strong>Smart Motor</strong> and the <strong>Battery</strong>. Where does the battery plug in?</li>
  <li>Find the <strong>Distance Sensor</strong>, <strong>Optical Sensor</strong>, <strong>Bumper Switch</strong> and <strong>Touch LED</strong>. Sort them: which are sensors and which are actuators? (Trick: the Touch LED is both!)</li>
  <li>Find a <strong>Smart Cable</strong>. Look at the clip: it only goes in one way.</li>
  <li>Find a <strong>beam</strong>, a <strong>connector pin</strong>, a <strong>standoff</strong>, a <strong>shaft</strong>, and a <strong>wheel</strong>.</li>
  <li>Find the <strong>pin tool</strong>. Practice pulling one pin out of a beam with it.</li>
  <li>Rotate: swap roles and race to put all 10 parts back exactly where they belong.</li>
</ol>
</div>
<div class="callout warn"><p><strong>Safety &amp; cleanup routine (every single class):</strong></p>
<ul>
  <li>Parts stay <strong>in the tray</strong>, never loose on the floor (pins under shoes = slip hazard).</li>
  <li>Never yank cables by the wire; press the tab and pull the plug.</li>
  <li>Robots only drive on the <strong>field</strong> or the floor, never off the edge of a table.</li>
  <li>Hands off the robot while it runs. If it goes wild, press the Brain's <strong>X</strong> button.</li>
  <li>Last 3 minutes: battery on the charger, parts in the right spots, kit checked by your Inspector.</li>
</ul></div>`
      },
      {
        kind: "code",
        title: "Your First Program",
        minutes: 7,
        html: `<p>Every robot needs a program to do the <em>Think</em> step. Here is the smallest useful VEX IQ C++ program:</p>
<pre class="code">#include "vex.h"
using namespace vex;

int main() {
  Brain.Screen.print("Hello, robot world!");
}</pre>
<p><code>Brain.Screen.print(...)</code> writes text on the Brain's screen. The words go inside <strong>double quotes</strong>, and the line ends with a <strong>semicolon</strong> <code>;</code>.</p>
<p>Open the challenge below, make the Brain say hello, and press <strong>Run</strong>. Then try it on a real Brain if your team has one ready.</p>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Run the cleanup routine. Then, with your team, finish this sentence out loud: <em>"Our robot will sense ____, think ____, and act ____."</em></p>
<p>Complete the exit quiz and reflection.</p>`
      }
    ],
    challenge: {
      title: "Hello, Brain!",
      prompt: `<p>Make the robot's Brain print a greeting that starts with <strong>Hello</strong>. Example: <code>Hello, I am RoboTeam 3!</code></p>
<p>Bonus: add your team name to the greeting.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  // TODO: Print a greeting on the Brain screen.
  // It must start with the word Hello.
  // Example: Brain.Screen.print("Hello ...");

}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  Brain.Screen.print("Hello, I am RoboTeam 3!");
}
`,
      hints: [
        "Use Brain.Screen.print(\"Hello\"); inside the curly braces of main.",
        "Don't forget the double quotes around your words and the semicolon at the end."
      ],
      field: {
        start: { x: 48, y: 36, heading: 0 }
      },
      checks: [
        { type: "output", pattern: "Hello", message: "Prints Hello on the Brain screen" },
        { type: "code", pattern: "Brain\\.Screen\\.print\\s*\\(", message: "Uses Brain.Screen.print" }
      ]
    },
    reflection: "Pick any robot from the real world (a Roomba, a self-driving car, a factory arm...). Describe what it senses, how it thinks, and how it acts.",
    quiz: [
      {
        q: "Which part of the VEX IQ robot does the THINK step?",
        choices: ["The Smart Motor", "The Brain running your program", "The battery, because it gives every other part its power", "The Distance Sensor"],
        answer: 1,
        explain: "The Brain runs your C++ program, which makes the decisions."
      },
      {
        q: "Why do most people say a remote-control car is NOT a robot?",
        choices: ["It has no wheels", "It is too small to hold a Brain, and only machines with a Brain are able to be controlled at all", "A human does all the sensing and thinking", "It uses batteries"],
        answer: 2,
        explain: "A robot senses and decides by itself. An RC car only acts on a human's commands."
      },
      {
        q: "Which of these is a SENSOR?",
        choices: ["Smart Motor", "Distance Sensor", "Wheel", "Beam"],
        answer: 1,
        explain: "A Distance Sensor collects information (how far away things are). Motors are actuators."
      },
      {
        q: "Your robot starts driving off the table! What should you do?",
        choices: ["Grab the wheels", "Pull the battery cable by the wire", "Press the X button on the Brain to stop the program", "Wait for the program to end, since robots stop by themselves near edges"],
        answer: 2,
        explain: "The X button stops the program safely. Never yank cables, and keep robots on the field."
      }
    ]
  },

  // ───────────────────────────────────────────── u1b1
  {
    id: "u1b1",
    unit: 1,
    order: 2,
    title: "Build Basics: Beams, Plates & Pins",
    minutes: 35,
    tags: ["build"],
    summary: "Learn how VEX IQ pieces fit on a grid, connect beams and plates with pins, and take a build apart without breaking anything.",
    objectives: [
      "I can name the main VEX IQ structure parts: beams, plates, connector pins and standoffs.",
      "I can count holes to find the size of a part and pick the right one.",
      "I can join parts with pins and remove pins safely with the pin tool."
    ],
    vocab: [
      { term: "Beam", def: "A long, narrow piece full of holes. Beams are the bones of a robot." },
      { term: "Plate", def: "A wide, flat piece full of holes, used to make strong, flat surfaces." },
      { term: "Connector pin", def: "A small snap-in peg that joins parts through their holes." },
      { term: "Standoff", def: "A post that holds two parts apart with a space between them." },
      { term: "Pin tool", def: "The small tool used to pull out pins and pry parts apart without hurting your fingers." },
      { term: "Pitch", def: "The distance from the center of one hole to the center of the next. On VEX IQ it is 12.7 mm (half an inch)." }
    ],
    materials: [
      "VEX IQ (2nd gen) kits, one per team",
      "Pin tools",
      "Parts trays",
      "Rulers",
      "Printed copy of the Name Tag Stand goals (or show them on the board)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Why So Many Holes?",
        minutes: 5,
        html: `<p>Pick up any beam from your kit and look closely at it. With a partner, answer:</p>
<ol>
  <li>Why do you think the part is covered in holes?</li>
  <li>Hold two different beams side by side. Do their holes line up?</li>
</ol>
<div class="callout think"><p>Share out: what would be harder to build if every part had holes in different places?</p></div>`
      },
      {
        kind: "learn",
        title: "Everything Fits on a Grid",
        minutes: 8,
        html: `<p>Every VEX IQ structure part uses the same spacing between holes, called the <strong>pitch</strong>: 12.7 mm, or half an inch. Because the spacing is always the same, any part can line up with any other part.</p>
<p>A part's size is simply its number of holes. A <strong>2x8 beam</strong> is 2 holes wide and 8 holes long.</p>
<table class="tbl">
  <tr><th>Part</th><th>What it does</th><th>Use it when</th></tr>
  <tr><td><strong>Beam</strong></td><td>Long frame piece</td><td>You need length, like the sides of a chassis</td></tr>
  <tr><td><strong>Plate</strong></td><td>Wide, flat piece</td><td>You need a stiff surface or want to tie beams together</td></tr>
  <tr><td><strong>Connector pin</strong></td><td>Snaps parts together</td><td>Two parts touch and need to stay joined</td></tr>
  <tr><td><strong>Standoff</strong></td><td>Holds parts apart</td><td>You need a gap, like room for a wheel or cable</td></tr>
  <tr><td><strong>Corner connector</strong></td><td>Joins parts at an angle</td><td>You want to turn a flat build into a 3D one</td></tr>
</table>
<div class="callout tip"><p><strong>Pins come in different lengths.</strong> A longer pin can reach through more layers. Check your kit's parts poster for the name of each one.</p></div>
<div class="callout warn"><p><strong>Save your fingers and your parts:</strong> pull pins out with the <strong>pin tool</strong>, never your teeth or fingernails. Never force a pin. If it won't go in, the holes probably don't line up.</p></div>
<div data-vex="beams beamlengths"></div>`
      },
      {
        kind: "build",
        title: "Pin Practice",
        minutes: 7,
        html: `<div data-vex="pins connectors"></div>
<div class="callout robot">
<p><strong>Warm up your hands.</strong> Everyone on the team does each step.</p>
<ol class="steps">
  <li>Find a beam and count its holes. Say its size out loud, then measure it with a ruler. Does the length match the number of holes times 12.7 mm, roughly?</li>
  <li>Join two beams in a straight line, overlapping them by 2 holes, using 2 pins. Try to bend the joint.</li>
  <li>Take out one pin and try to bend it again. What changed?</li>
  <li>Join a beam to a plate. Then use standoffs to hold a second beam above it.</li>
  <li>Take everything apart using the pin tool. Sort the parts back into the tray.</li>
</ol>
</div>`
      },
      {
        kind: "activity",
        title: "Build Challenge: Name Tag Stand",
        minutes: 12,
        html: `<div class="callout tip"><p><strong>Design it first in CAD Studio.</strong> Before you grab parts, open <a class="btn sm" data-app="cad">CAD Studio ↗</a> <button class="btn sm" type="button" data-side="cad" title="Put CAD Studio and RoboCode side by side">⧉</button> and sketch your stand. Count how many holes long each beam needs to be. Then build it for real and compare.</p></div>
<div class="callout robot">
<p><strong>Team challenge:</strong> Build a stand that displays your team's name on a sticky note or index card. Your stand must:</p>
<ul>
  <li>Stand up by itself on the table</li>
  <li>Hold the name where someone across the room could read it</li>
  <li>Use at least one beam, one plate, one standoff and one corner connector</li>
  <li>Survive a gentle tap from your teacher</li>
</ul>
</div>
<div class="callout tip"><p><strong>Stuck?</strong> A wide base keeps things from tipping over. Two pins at a joint stop it from swinging like a hinge.</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Do a one-minute gallery walk. Which stand looks the most stable, and why? Then take your stand apart with the pin tool and sort every part back into its place. A sorted kit makes the next build faster.</p>`
      }
    ],
    reflection: "What was one thing that made your stand stronger or weaker? What would you change if you built it again?",
    quiz: [
      {
        q: "What does the name of a 2x8 beam tell you?",
        choices: ["It weighs 2 ounces and costs 8 dollars", "It is 2 holes wide and 8 holes long", "It needs 2 pins and 8 standoffs", "It is 2 inches wide and 8 inches long"],
        answer: 1,
        explain: "VEX IQ parts are sized by counting holes."
      },
      {
        q: "A pin will not go into a hole. What should you do first?",
        choices: ["Push the pin harder until it clicks, because a tight fit means the holes are lined up correctly", "Use your teeth", "Check that the holes line up, then wiggle the part into place", "Throw that pin away"],
        answer: 2,
        explain: "A stuck pin usually means the holes are not lined up. Forcing it can damage parts."
      },
      {
        q: "Why can almost any VEX IQ part line up with any other?",
        choices: ["All the holes use the same spacing", "All parts are the same color", "All parts are the same length", "All parts are magnetic"],
        answer: 0,
        explain: "The 12.7 mm pitch is the same across the system, so the holes line up."
      },
      {
        q: "A joint held by a single pin swings back and forth. What is the simplest fix?",
        choices: ["Replace the pin with a longer pin, since long pins stop joints from turning", "Use a shorter beam", "Remove the pin", "Add a second pin in another hole"],
        answer: 3,
        explain: "One pin acts like a hinge. Two pins in different holes lock the angle."
      }
    ]
  },

  // ───────────────────────────────────────────── u1b2
  {
    id: "u1b2",
    unit: 1,
    order: 3,
    title: "Build Basics: Strong Structures",
    minutes: 40,
    tags: ["build"],
    summary: "Find out why triangles and layers make robots strong, then build the strongest bridge your team can from a limited set of parts.",
    objectives: [
      "I can explain why a triangle holds its shape better than a rectangle.",
      "I can use bracing and layering to make a structure stiffer.",
      "I can test a build, find its weakest point, and improve it."
    ],
    vocab: [
      { term: "Structure", def: "The frame that holds a robot together and carries its weight." },
      { term: "Brace", def: "An extra piece added at an angle or across a frame to stop it from bending." },
      { term: "Rigid", def: "Stiff. A rigid part keeps its shape when pushed." },
      { term: "Load", def: "The weight or force a structure has to hold up." },
      { term: "Iterate", def: "To test something, improve it, and test it again." }
    ],
    materials: [
      "VEX IQ (2nd gen) kits, one per team",
      "Pin tools",
      "Two stacks of books per team, set 8 inches apart",
      "Small weights such as a cup filled with spare parts or textbooks",
      "Rulers"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Square vs. Triangle",
        minutes: 5,
        html: `<div class="callout robot">
<ol class="steps">
  <li>Use 4 beams and one pin at each corner to make a square.</li>
  <li>Use 3 beams and one pin at each corner to make a triangle.</li>
  <li>Gently push on a corner of each shape.</li>
</ol>
</div>
<div class="callout think"><p>Which shape folded? Why do you think the other one didn't?</p></div>`
      },
      {
        kind: "learn",
        title: "Three Ways to Make It Stronger",
        minutes: 8,
        html: `<p>A square with one pin at each corner can lean over into a diamond. A triangle can't change shape unless one of its sides changes length. That's why you see triangles in bridges, cranes and roof frames.</p>
<table class="tbl">
  <tr><th>Technique</th><th>How</th><th>What it fixes</th></tr>
  <tr><td><strong>Bracing</strong></td><td>Add a piece across a corner to form a triangle, or add a plate</td><td>Frames that lean or twist</td></tr>
  <tr><td><strong>Layering</strong></td><td>Pin two beams together side by side, with their ends staggered</td><td>Beams that bend or joints that are weak</td></tr>
  <tr><td><strong>Boxing</strong></td><td>Join two frames with standoffs so they act as one 3D box</td><td>Long structures that twist</td></tr>
</table>
<div class="callout tip"><p><strong>Stronger isn't always better.</strong> Every extra part adds weight and takes up space. Good engineers put strength where it's needed.</p></div>`
      },
      {
        kind: "activity",
        title: "Bridge Challenge",
        minutes: 20,
        html: `<div class="callout tip"><p><strong>Plan your bridge in CAD Studio.</strong> Open <a class="btn sm" data-app="cad">CAD Studio ↗</a> <button class="btn sm" type="button" data-side="cad" title="Put CAD Studio and RoboCode side by side">⧉</button> and try two bridge designs before you build. Where would you add triangles or bracing? Build the one your team thinks is stronger.</p></div>
<div class="callout robot">
<p><strong>Team challenge:</strong> Build a bridge that spans an 8-inch gap between two stacks of books and holds as much load as possible.</p>
<p><strong>Rules:</strong> The bridge must rest on the books without being attached to them, and may use at most 12 beams or plates, plus any pins and standoffs.</p>
<ol class="steps">
  <li><strong>Plan (3 min).</strong> Sketch your design and mark where the triangles or layers go.</li>
  <li><strong>Build (7 min).</strong> Rotate the builder role every few minutes.</li>
  <li><strong>Test (3 min).</strong> Add load slowly to the middle. Record how much it held and where it bent first.</li>
  <li><strong>Improve (5 min).</strong> Change the weakest spot. Change only one or two things so you know what helped.</li>
  <li><strong>Test again (2 min).</strong> Did it hold more?</li>
</ol>
</div>
<table class="tbl">
  <tr><th>Test</th><th>Load held</th><th>Where it bent or broke</th><th>What we'll change</th></tr>
  <tr><td>1</td><td></td><td></td><td></td></tr>
  <tr><td>2</td><td></td><td></td><td></td></tr>
</table>
<div class="callout warn"><p>Keep feet and fingers clear when loading, and stop adding weight as soon as the bridge starts to sag badly or pins begin to pop out.</p></div>`
      },
      {
        kind: "wrapup",
        title: "Show & Share",
        minutes: 7,
        html: `<p>Each team shows its bridge and shares one change that helped. As a class, list the techniques that worked best. Then take the bridges apart and sort your parts.</p>
<div class="callout think"><p>Where on a driving robot would you want extra bracing? Think about what gets bumped and what carries the most weight.</p></div>`
      }
    ],
    reflection: "Where did your bridge first start to fail, and what did you change to fix it? Did it work?",
    quiz: [
      {
        q: "Why is a triangle more rigid than a square made the same way?",
        choices: ["It can't change shape unless a side changes length", "It uses more pins", "A triangle uses fewer pins, and joints with fewer pins are always stronger than joints with more", "Its corners are sharper"],
        answer: 0,
        explain: "A square can lean into a diamond, but a triangle's three fixed sides allow only one shape."
      },
      {
        q: "Your robot's rectangular frame leans to one side when pushed. What is the best fix?",
        choices: ["Add stickers to the frame", "Remove two pins so that the frame has more room to flex and absorb the push", "Add a brace across a corner or attach a plate", "Use smaller wheels"],
        answer: 2,
        explain: "Bracing creates triangles, and a plate does the same job across a whole surface."
      },
      {
        q: "What does it mean to iterate on a design?",
        choices: ["Build it once and stop", "Copy another team's design", "Start over from nothing each time", "Test it, improve it, and test it again"],
        answer: 3,
        explain: "Each test shows you what to improve next."
      },
      {
        q: "Why shouldn't you add as much bracing as possible everywhere?",
        choices: ["Bracing makes robots weaker", "Extra parts add weight and take up space", "Pins stop working after 10 uses", "Triangles are not allowed on robots"],
        answer: 1,
        explain: "Good designs add strength where it's needed and keep the robot light."
      }
    ]
  },

  // ───────────────────────────────────────────── u1b3
  {
    id: "u1b3",
    unit: 1,
    order: 4,
    title: "Build Basics: Motors, Shafts & Gears",
    minutes: 40,
    tags: ["build"],
    summary: "Connect a Smart Motor to shafts, wheels and gears, then discover how gear sizes trade speed for strength.",
    objectives: [
      "I can connect a motor to a wheel using a shaft and keep it from sliding out.",
      "I can tell the difference between a driving gear and a driven gear.",
      "I can calculate a gear ratio and predict whether a gear train adds speed or torque."
    ],
    vocab: [
      { term: "Smart Motor", def: "A VEX IQ motor that plugs into the Brain and spins a shaft." },
      { term: "Shaft", def: "A square metal rod that passes spinning motion from a motor to wheels or gears." },
      { term: "Friction", def: "Rubbing between parts that slows them down and wastes energy." },
      { term: "Driving gear", def: "The gear being turned by the motor. It pushes the next gear." },
      { term: "Driven gear", def: "The gear that gets pushed by the driving gear." },
      { term: "Gear ratio", def: "Driven gear teeth divided by driving gear teeth." },
      { term: "Torque", def: "Turning strength. More torque lets a robot lift or push more." }
    ],
    materials: [
      "VEX IQ (2nd gen) kits, one per team",
      "Charged batteries",
      "Pin tools",
      "Small gear set from the kit (for example 12-tooth and 36-tooth gears)",
      "Tape or a sticker to mark gear teeth"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Bike Gears",
        minutes: 5,
        html: `<p>Think about riding a bike with gears up a steep hill.</p>
<ol>
  <li>Do you pick an easy gear or a hard gear?</li>
  <li>In that gear, do your legs spin a lot or a little to travel the same distance?</li>
</ol>
<div class="callout think"><p>What do you give up to make the hill easier? Robots face the same trade-off.</p></div>`
      },
      {
        kind: "learn",
        title: "From Motor to Motion",
        minutes: 10,
        html: `<p>A motor makes spinning motion. A <strong>shaft</strong> carries that motion to whatever needs to turn. Shafts are square so they grip the square hole in a motor, wheel or gear.</p>
<p>Plastic beams have round holes, so a shaft can spin freely inside them. Support a shaft in <strong>two places</strong> so it doesn't wobble, and use <strong>collars</strong> to keep it from sliding out.</p>
<h3>Gears trade speed for torque</h3>
<p>When two gears mesh, the number of teeth decides what happens:</p>
<pre class="code">gear ratio = driven gear teeth ÷ driving gear teeth</pre>
<table class="tbl">
  <tr><th>Driving gear</th><th>Driven gear</th><th>Ratio</th><th>Result</th></tr>
  <tr><td>12 teeth</td><td>36 teeth</td><td>3:1</td><td>3 times the torque, 1/3 the speed</td></tr>
  <tr><td>36 teeth</td><td>12 teeth</td><td>1:3</td><td>3 times the speed, 1/3 the torque</td></tr>
  <tr><td>36 teeth</td><td>36 teeth</td><td>1:1</td><td>Same speed and torque, opposite direction</td></tr>
</table>
<div class="callout tip"><p><strong>Two meshed gears spin in opposite directions.</strong> Remember that when a wheel turns the wrong way.</p></div>
<div data-vex="smartmotor smartmotor1 shafts shaftlock"></div>`
      },
      {
        kind: "build",
        title: "Build a Gear Tester",
        minutes: 12,
        html: `<div class="callout tip"><p><strong>Model it in CAD Studio.</strong> Open <a class="btn sm" data-app="cad">CAD Studio ↗</a> <button class="btn sm" type="button" data-side="cad" title="Put CAD Studio and RoboCode side by side">⧉</button> and place the motor, shafts and the two gears so the teeth mesh. Check your spacing on screen, then build the tester.</p></div>
<div class="callout robot">
<ol class="steps">
  <li>Attach a Smart Motor to a beam or plate.</li>
  <li>Slide a shaft into the motor and put a 12-tooth gear on it. This is your <strong>driving gear</strong>.</li>
  <li>Put a second shaft through the frame a few holes away, supported in two places, with a 36-tooth gear on it. This is your <strong>driven gear</strong>.</li>
  <li>Move the second shaft until the teeth mesh. They should touch without being jammed together. If they grind or skip, try another hole.</li>
  <li>Add collars so neither shaft can slide out.</li>
  <li><strong>Spin test:</strong> turn the driven gear by hand with the motor unplugged. Is it smooth? If it's stiff, look for a shaft pressed against a beam or a collar squeezed too tight.</li>
</ol>
</div>
<div class="callout warn"><p>Keep fingers and hair away from gears whenever a motor is running.</p></div>`
      },
      {
        kind: "activity",
        title: "Count the Turns",
        minutes: 10,
        html: `<div class="callout robot">
<ol class="steps">
  <li>Mark one tooth on each gear with tape.</li>
  <li><strong>Predict:</strong> if the 12-tooth gear turns 6 times, how many times will the 36-tooth gear turn?</li>
  <li>Turn the 12-tooth gear by hand 6 times and count the turns of the 36-tooth gear. Were you right?</li>
  <li>Swap the gears so that the 36-tooth gear is driving. Predict, then test again.</li>
  <li>Plug the motor into the Brain and have your teacher show you how to run it. Which setup looks faster? Gently hold the output gear. Which setup is harder to stop?</li>
</ol>
</div>
<table class="tbl">
  <tr><th>Driving</th><th>Driven</th><th>Driving turns</th><th>Predicted driven turns</th><th>Actual driven turns</th></tr>
  <tr><td>12</td><td>36</td><td>6</td><td></td><td></td></tr>
  <tr><td>36</td><td>12</td><td>2</td><td></td><td></td></tr>
</table>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Next up, you'll combine pins, bracing, shafts and motors to build a real drivetrain. Take your tester apart and sort your parts. Put the battery on the charger.</p>
<div class="callout think"><p>Would a rescue robot that has to lift heavy objects want more speed or more torque in its arm?</p></div>`
      }
    ],
    reflection: "Describe a robot job that needs speed and one that needs torque. How would you set up the gears for each?",
    quiz: [
      {
        q: "A 12-tooth gear drives a 36-tooth gear. What is the result?",
        choices: ["More speed, less torque", "Nothing changes", "More torque, less speed", "The gears can't turn"],
        answer: 2,
        explain: "36 ÷ 12 gives a 3:1 ratio, so the output has 3 times the torque at 1/3 the speed."
      },
      {
        q: "Two meshed gears are turning. Which way do they spin?",
        choices: ["Opposite directions", "The same direction", "Whichever way the battery faces", "They take turns"],
        answer: 0,
        explain: "Meshed teeth push each other, so the second gear turns the opposite way."
      },
      {
        q: "A wheel feels stiff when you spin it by hand. What should you check?",
        choices: ["The Brain's screen brightness", "Whether the program has comments", "Whether the program is telling the wheel to spin at a speed that is too slow for the motor", "Whether a collar or shaft is rubbing or squeezed too tight"],
        answer: 3,
        explain: "Stiffness means friction, which often comes from parts pressed together too tightly."
      },
      {
        q: "Why should a shaft be supported in two places?",
        choices: ["It looks more balanced", "It keeps the shaft from wobbling and bending", "It makes the motor spin backward", "It is the only way to attach a gear"],
        answer: 1,
        explain: "Two supports keep the shaft straight, so gears stay meshed and wheels stay true."
      }
    ]
  },

  // ───────────────────────────────────────────── u1l2
  {
    id: "u1l2",
    unit: 1,
    order: 5,
    title: "Build the BaseBot",
    minutes: 40,
    tags: ["build", "code"],
    summary: "Work as a build team to assemble the VEX IQ BaseBot drivetrain, plug devices into Smart Ports, and drive it to a goal.",
    objectives: [
      "I can work in a team role (builder, parts manager, inspector) to build a drivetrain.",
      "I can explain what a Smart Port is and why port numbers matter.",
      "I can configure a Drivetrain, BrainInertial and sensors in my project.",
      "I can write a program that drives forward an exact distance."
    ],
    vocab: [
      { term: "Drivetrain", def: "The motors, wheels and gears that move the robot around." },
      { term: "Smart Port", def: "One of the 12 numbered sockets on the Brain where motors and sensors plug in." },
      { term: "Configuration", def: "Telling the program which device is plugged into which port, and what to call it." },
      { term: "Inertial sensor", def: "A sensor built into the 2nd gen Brain (BrainInertial) that measures turning and heading." },
      { term: "Chassis", def: "The frame of the robot that everything attaches to." }
    ],
    materials: [
      "VEX IQ (2nd gen) kits",
      "BaseBot build instructions (printed or in the VEX Builder app)",
      "Charged batteries",
      "VEX IQ field board",
      "Masking tape and a tape measure"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Spot the Mistake",
        minutes: 5,
        html: `<p>A team built a robot overnight and it just spins in circles when they tell it to drive forward. With a partner, list <strong>three things</strong> that could be wrong. (Think: motors, wheels, cables, ports, program...)</p>
<div class="callout think"><p>Share out. Keep your list! We will find out today which of these mistakes are the most common.</p></div>`
      },
      {
        kind: "learn",
        title: "Team Roles & Smart Ports",
        minutes: 5,
        html: `<p>Real engineering teams split up the work. Today every team of 3 has these jobs:</p>
<table class="tbl">
  <tr><th>Role</th><th>Job</th></tr>
  <tr><td><strong>Builder</strong></td><td>Puts the pieces together. The only one snapping parts in during your turn.</td></tr>
  <tr><td><strong>Parts Manager</strong></td><td>Reads the step, finds the exact parts and lays them out before the Builder needs them.</td></tr>
  <tr><td><strong>Inspector</strong></td><td>Compares the robot with the picture after <em>every</em> step. Checks pins are fully pushed in and parts face the right way.</td></tr>
</table>
<p><strong>Rotate roles</strong> every few steps so everyone builds.</p>
<p>The Brain has <strong>12 Smart Ports</strong>. Your program finds each device by its port number, so a cable in the wrong port means your code talks to nothing! Our class standard (check it against your build guide):</p>
<table class="tbl">
  <tr><th>Device</th><th>Port</th><th>Name in code</th></tr>
  <tr><td>Left drive motor</td><td>1</td><td rowspan="2"><code>Drivetrain</code></td></tr>
  <tr><td>Right drive motor</td><td>6</td></tr>
  <tr><td>Built-in Inertial</td><td>(inside Brain)</td><td><code>BrainInertial</code></td></tr>
  <tr><td>Distance Sensor</td><td>7</td><td><code>DistanceSensor</code></td></tr>
  <tr><td>Optical Sensor</td><td>8</td><td><code>Optical</code></td></tr>
  <tr><td>Bumper Switch</td><td>9</td><td><code>BumperA</code></td></tr>
</table>`
      },
      {
        kind: "build",
        title: "Build the BaseBot Drivetrain",
        minutes: 20,
        html: `<div data-vex="basebot basebotbuild"></div>
<div class="callout robot">
<p><strong>Build sprint:</strong> Follow the official VEX IQ BaseBot instructions. Use these checkpoints so your Inspector can sign off.</p>
<ol class="steps">
  <li><strong>Lay out the parts.</strong> Parts Manager sorts beams, pins, shafts and wheels into piles before step 1.</li>
  <li><strong>Build the left side.</strong> Attach a Smart Motor to the chassis beams. Inspector: is the motor's shaft hole lined up with the wheel position?</li>
  <li><strong>Build the right side</strong> as a <em>mirror image</em> of the left. Classic mistake: building two identical sides instead of mirrored ones.</li>
  <li><strong>Add shafts and wheels.</strong> Push shafts all the way through the motor. Spin each wheel by hand: it should turn smoothly and not wobble.</li>
  <li><strong>Mount the Brain</strong> on top, screen facing up and readable from the back.</li>
  <li><strong>Plug in cables:</strong> left motor to Port 1, right motor to Port 6. Click each cable in until it snaps. Tuck loose cable away from the wheels.</li>
  <li><strong>Add sensors</strong> (if time): Distance Sensor facing forward on the front, Optical Sensor pointing down at the floor, Bumper Switch on the very front.</li>
  <li><strong>Inspector final check:</strong> Battery in, Brain turns on, nothing rubs, nothing rattles when you gently shake the robot.</li>
</ol>
</div>
<div class="callout tip"><p><strong>Pin tip:</strong> If a pin won't go in, don't force it. The holes probably are not lined up. Wiggle the beam, then push.</p></div>`
      },
      {
        kind: "code",
        title: "Configure & Drive",
        minutes: 7,
        html: `<p>In VEXcode IQ, open <strong>Devices</strong> and add a <strong>Drivetrain 2-motor</strong> with left = Port 1, right = Port 6, and turn on the <strong>BrainInertial</strong> for turning. Add the sensors with the names in the table. Port numbers must match where your cables are really plugged in. Our simulator already has these devices set up with the same names.</p>
<p>Now the fun part:</p>
<pre class="code">Drivetrain.driveFor(forward, 24, inches);</pre>
<p>This tells the robot: drive <em>forward</em>, <em>24</em>, measured in <em>inches</em>, then stop.</p>
<div class="callout robot"><ol class="steps">
  <li>Put a strip of masking tape on the field board as the start line. Measure 24 in and put a second strip as the goal.</li>
  <li>Download and run the program on your robot. Does it stop on the goal line?</li>
  <li>If it drives backward or spins, check your Do Now list. Which mistake was it?</li>
</ol></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Inspector reports to the class: what was the trickiest build step for your team? Store robots on the shelf with the battery on the charger.</p>`
      }
    ],
    challenge: {
      title: "First Drive: 24 Inches",
      prompt: `<p>The robot is facing the green goal, which is exactly <strong>24 inches</strong> ahead. Write the line that drives the robot forward 24 inches so it stops inside the goal.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  Brain.Screen.print("Driving to the goal!");

  // TODO: drive forward 24 inches
  // Drivetrain.driveFor( ___ , ___ , inches);

}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  Brain.Screen.print("Driving to the goal!");
  Drivetrain.driveFor(forward, 24, inches);
}
`,
      hints: [
        "The command is Drivetrain.driveFor(direction, distance, units);",
        "Try Drivetrain.driveFor(forward, 24, inches);"
      ],
      field: {
        start: { x: 48, y: 60, heading: 0 },
        goal: { x: 48, y: 36, r: 6 }
      },
      checks: [
        { type: "goal", message: "Robot ends inside the green goal" },
        { type: "noCollision", message: "Robot never hits a wall" },
        { type: "code", pattern: "driveFor\\s*\\(", message: "Uses Drivetrain.driveFor" }
      ]
    },
    reflection: "Which team role did you like best today and why? What is one thing your team would do differently next build?",
    quiz: [
      {
        q: "What is a Smart Port?",
        choices: ["A USB charger", "One of the numbered sockets on the Brain for motors and sensors", "A special wheel mount on the chassis that lets the motors connect directly to the axles without any cables", "A port in Boston Harbor"],
        answer: 1,
        explain: "The Brain has 12 Smart Ports. Your configuration tells the program which device is in which port."
      },
      {
        q: "Your robot spins in a circle instead of driving straight. What is a likely cause?",
        choices: ["The battery is too new", "The two sides were built identical instead of mirrored, or a motor is in the wrong port", "The Brain's screen is turned off, so the robot cannot display which way it is supposed to be driving", "The program is too short"],
        answer: 1,
        explain: "If one motor is reversed or plugged into the wrong port, the wheels fight each other and the robot spins."
      },
      {
        q: "What does Drivetrain.driveFor(forward, 24, inches); do?",
        choices: ["Drives forward for 24 seconds", "Turns 24 degrees", "Drives forward 24 inches, then stops", "Drives forever"],
        answer: 2,
        explain: "driveFor drives a set distance in the units you choose, then stops."
      },
      {
        q: "What is the Inspector's job?",
        choices: ["Snap all the pieces together", "Check the robot against the instructions after every step", "Write all the code", "Collect the parts from the bin and lay them out in order before the builder needs each one"],
        answer: 1,
        explain: "The Inspector catches mistakes early by checking each step."
      }
    ]
  },

  // ───────────────────────────────────────────── u1l3
  {
    id: "u1l3",
    unit: 1,
    order: 6,
    title: "Hello, C++!",
    minutes: 35,
    tags: ["code"],
    summary: "Take apart a C++ program piece by piece, learn why order matters, and become an error detective.",
    objectives: [
      "I can name the parts of a C++ program: include, namespace, main, statements, comments.",
      "I can explain that a program runs one statement at a time, top to bottom (sequence).",
      "I can find and fix common errors like a missing semicolon or quote.",
      "I can print several lines on the Brain screen and then make the robot move."
    ],
    vocab: [
      { term: "Statement", def: "One complete instruction in a program. In C++ most statements end with a semicolon ;" },
      { term: "Sequence", def: "Statements run in order, one after another, top to bottom." },
      { term: "main()", def: "The function where every C++ program starts running." },
      { term: "Comment", def: "A note for humans that the computer ignores. Starts with // in C++." },
      { term: "Syntax error", def: "A mistake in the grammar of the code (like a missing ; or quote) that stops it from running." },
      { term: "Bug", def: "Any mistake that makes a program do something different than you wanted." }
    ],
    materials: [
      "Laptops/Chromebooks",
      "Printed 'mixed-up program' strips (one set per team)",
      "Built BaseBots and the field board"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Robot Sandwich",
        minutes: 5,
        html: `<p>Your teacher is a robot that follows instructions <strong>exactly</strong>. Write instructions to make a peanut butter sandwich (or pretend to). Your teacher will act them out word for word.</p>
<div class="callout think"><p>What went wrong? What does this tell you about how computers follow instructions?</p></div>`
      },
      {
        kind: "learn",
        title: "Anatomy of a Program",
        minutes: 10,
        html: `<pre class="code">#include "vex.h"          // 1. bring in the VEX toolbox
using namespace vex;      // 2. so we can write Brain instead of vex::Brain

// This is a comment. The robot ignores it.
int main() {              // 3. the program STARTS here
  Brain.Screen.print("Hi!");      // 4. a statement
  Brain.Screen.newLine();         //    another statement
  Brain.Screen.print("I am Bolt");
}                         // 5. the program ENDS here</pre>
<table class="tbl">
  <tr><th>Piece</th><th>What it does</th></tr>
  <tr><td><code>#include "vex.h"</code></td><td>Loads the VEX library so C++ knows about motors, the Brain, sensors.</td></tr>
  <tr><td><code>using namespace vex;</code></td><td>A shortcut so we don't type <code>vex::</code> everywhere.</td></tr>
  <tr><td><code>int main() { ... }</code></td><td>The starting point. Everything inside the curly braces runs.</td></tr>
  <tr><td><code>;</code></td><td>The "period" at the end of each statement.</td></tr>
  <tr><td><code>// ...</code></td><td>A comment: notes for you and your team.</td></tr>
</table>
<p><strong>Sequence:</strong> statements run top to bottom, one at a time. Swap two lines and the robot does things in a different order!</p>
<p><code>Brain.Screen.newLine();</code> moves the cursor down to the next line on the screen, like pressing Enter.</p>
<div class="callout warn"><p><strong>Top 4 beginner bugs</strong></p>
<ul>
  <li>Missing semicolon <code>;</code></li>
  <li>Missing closing quote: <code>print("Hi);</code></li>
  <li>Wrong capitals: <code>brain.screen.print</code> (C++ is case-sensitive!)</li>
  <li>Missing <code>}</code> at the end of main</li>
</ul></div>`
      },
      {
        kind: "unplugged",
        title: "Error Detective & Mixed-Up Program",
        minutes: 8,
        html: `<div class="callout robot">
<p><strong>Team race (teams of 3):</strong></p>
<ol class="steps">
  <li>Your team gets a set of paper strips. Each strip is one line of a program that prints a message and drives the robot to a goal.</li>
  <li>Put the strips in the right order. Where does <code>int main() {</code> go? Where does <code>}</code> go?</li>
  <li>Three strips have a bug hidden in them. Circle each bug and write the fix.</li>
  <li>When you think you're done, type the program in and run it on your robot on the field board. The robot is the judge!</li>
  <li>First team with a working robot explains one bug they found to the class.</li>
</ol>
</div>
<p>Try this one now. How many bugs can you find?</p>
<pre class="code">#include "vex.h"
using namespace vex;

int main() {
  Brain.Screen.print("Ready?)
  brain.Screen.newLine();
  Drivetrain.driveFor(forward, 12, inches)
</pre>
<p><em>(Answer: missing quote, missing semicolon, lowercase <code>brain</code>, another missing semicolon, and the missing <code>}</code>. Five!)</em></p>`
      },
      {
        kind: "code",
        title: "Code It: Introduce Your Robot",
        minutes: 9,
        html: `<p>Your robot is going to introduce itself, then roll to center stage. Use <code>Brain.Screen.print</code> and <code>Brain.Screen.newLine</code> to print <strong>4 lines</strong>, then drive.</p>
<pre class="code">Brain.Screen.print("My name is Bolt");
Brain.Screen.newLine();
Brain.Screen.print("I like long drives");
Brain.Screen.newLine();
...</pre>
<div class="callout tip"><p>Read your error messages! The editor tells you the line number where it got confused. The bug is usually on that line or the line just above.</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Thumbs up / sideways / down: How confident do you feel finding a missing semicolon? Share the funniest robot name in your class.</p>`
      }
    ],
    challenge: {
      title: "Robot Introduction",
      prompt: `<p>Print <strong>4 lines</strong> on the Brain screen:</p>
<ol>
  <li><code>My name is ...</code> (your robot's name)</li>
  <li>Three more lines of your own message (a joke, a fact about your team, a catchphrase...)</li>
</ol>
<p>Use <code>Brain.Screen.newLine();</code> between lines. Then drive forward <strong>36 inches</strong> to the green goal.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  // Line 1
  Brain.Screen.print("My name is ");
  Brain.Screen.newLine();

  // TODO: print 3 more lines of your message,
  // with a new line between each one

  // TODO: drive forward 36 inches to the goal

}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  Brain.Screen.print("My name is Bolt");
  Brain.Screen.newLine();
  Brain.Screen.print("I like long drives");
  Brain.Screen.newLine();
  Brain.Screen.print("My team is the best");
  Brain.Screen.newLine();
  Brain.Screen.print("Watch me roll!");
  Drivetrain.driveFor(forward, 36, inches);
}
`,
      hints: [
        "Put your robot's name inside the quotes on the first line: \"My name is Bolt\".",
        "Each new line of text needs Brain.Screen.newLine(); before it.",
        "Drive with Drivetrain.driveFor(forward, 36, inches);"
      ],
      field: {
        start: { x: 16, y: 36, heading: 90 },
        goal: { x: 52, y: 36, r: 6 }
      },
      checks: [
        { type: "output", pattern: "My name is \\S+", message: "Prints 'My name is' followed by a name" },
        { type: "code", pattern: "(newLine[\\s\\S]*){3}", message: "Uses newLine at least 3 times (4 lines)" },
        { type: "goal", message: "Robot ends inside the green goal" },
        { type: "noCollision", message: "Robot never hits a wall" }
      ]
    },
    reflection: "What bug did you (or your team) make today, and how did you find it? What will you check first next time your code doesn't run?",
    quiz: [
      {
        q: "Where does every C++ program start running?",
        choices: ["At #include", "At the first comment", "At int main()", "At the last line"],
        answer: 2,
        explain: "main() is the entry point. Everything inside its curly braces runs in order."
      },
      {
        q: "What is wrong with this line?  Brain.Screen.print(\"Hi\")",
        choices: ["Nothing", "Missing semicolon", "Hi should be lowercase", "Too many quotes"],
        answer: 1,
        explain: "Statements in C++ end with a semicolon."
      },
      {
        q: "What does the computer do with  // drive to the goal ?",
        choices: ["Drives to the goal", "Prints it on the screen", "Ignores it: it's a comment", "Gives an error"],
        answer: 2,
        explain: "Anything after // on a line is a comment for humans."
      },
      {
        q: "A program prints \"Ready\", then drives, then prints \"Done\". When does \"Done\" appear?",
        choices: ["Before the robot moves", "At the same time as Ready", "After the robot finishes driving", "Never"],
        answer: 2,
        explain: "Sequence: statements run one at a time, top to bottom, and driveFor finishes before the next line runs."
      },
      {
        q: "Why does  brain.Screen.print(\"Hi\");  cause an error?",
        choices: ["C++ is case-sensitive; it must be Brain", "Screen is spelled wrong", "print only works with numbers, so text has to be stored in a variable first", "It needs two semicolons"],
        answer: 0,
        explain: "Brain and brain are different names to C++. Capital letters matter."
      }
    ]
  },

  // ───────────────────────────────────────────── u1l4
  {
    id: "u1v1",
    unit: 1,
    order: 7,
    title: "From Simulator to Robot: VEXcode IQ",
    minutes: 40,
    tags: ["code", "build"],
    summary: "Move your code from RoboCode into VEXcode IQ, set up your robot's devices, download it to the Brain and see how the real robot compares with the simulator.",
    objectives: [
      "I can open VEXcode IQ next to RoboCode and move my code between them.",
      "I can set up my robot's devices in VEXcode IQ to match my Robot Setup.",
      "I can download a program to the Brain and run it.",
      "I can compare what the real robot did with what the simulator predicted, and explain the difference."
    ],
    vocab: [
      { term: "VEXcode IQ", def: "VEX's official app for writing robot code and downloading it to a real VEX IQ Brain." },
      { term: "Download", def: "Sending a finished program from the computer to the robot's Brain over a cable." },
      { term: "Slot", def: "One of the numbered places on the Brain where a downloaded program is stored." },
      { term: "Devices", def: "The VEXcode IQ window where you tell the program which motors and sensors are plugged into which ports." },
      { term: "Simulator", def: "A program that imitates the real robot on screen, so you can test ideas quickly." },
      { term: "Calibrate", def: "To adjust numbers so the real robot matches what you planned, for example how far it drives." }
    ],
    materials: [
      "Chromebooks or laptops with Google Chrome",
      "Built BaseBots with charged batteries",
      "One USB cable per team (the one that came with the Brain)",
      "Rulers or tape measures",
      "Masking tape to mark a start line on the field"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Will the Real Robot Match?",
        minutes: 5,
        html: `<p>So far your code has only run in the RoboCode simulator. Today it runs on your real robot.</p>
<p>With your team, write down <strong>two things</strong> that might make the real robot act differently from the simulator. Think about the floor, the battery, the wheels and the people around it.</p>
<div class="callout think"><p>The simulator says <code>driveFor(forward, 12, inches)</code> drives exactly 12 inches. Will your real robot? Make a prediction and keep it for later.</p></div>`
      },
      {
        kind: "learn",
        title: "Meet VEXcode IQ",
        minutes: 8,
        html: `<p><strong>RoboCode</strong> is where you learn, test in the simulator and turn in your work. <strong>VEXcode IQ</strong> is VEX's own app, and it is the only way to put a program on the real Brain. You will use them together, so open them <strong>side by side</strong>.</p>
<ol class="steps">
<li>Click <a class="btn sm" href="https://codeiq.vex.com/" target="vexcode" rel="noopener">VEXcode IQ ↗</a> at the top of RoboCode. It opens in its own tab, and the same tab is reused every time.</li>
<li>On a Chromebook, press <kbd>Alt</kbd> + <kbd>[</kbd> in VEXcode to snap it to the <strong>left</strong>. Come back to RoboCode and press <kbd>Alt</kbd> + <kbd>]</kbd> to snap it to the <strong>right</strong>.</li>
<li>Find these parts of VEXcode IQ: the <strong>File</strong> menu, the <strong>code area</strong>, the <strong>Devices</strong> button, the <strong>Brain</strong> connection icon, and the <strong>Download</strong> and <strong>Run</strong> buttons.</li>
</ol>
<figure class="shot" data-shot="vx-tour"><figcaption>The parts of VEXcode IQ you will use today</figcaption></figure>
<div class="callout tip"><p>VEXcode IQ works in Google Chrome on Chromebooks. If your school installed the VEXcode IQ app instead, open that. The steps are the same.</p></div>`
      },
      {
        kind: "code",
        title: "Code in RoboCode, Then Move It to VEXcode",
        minutes: 7,
        html: `<p>First finish the code challenge at the bottom of this page, and press <strong>Check &amp; Submit</strong>. Then follow these steps to move your code into VEXcode IQ.</p>
<ol class="steps">
<li><strong>Copy your code.</strong> In the RoboCode editor, press <strong>Copy for VEXcode</strong>, then <strong>Copy code</strong>.</li>
<li><strong>Start a C++ project.</strong> In VEXcode IQ, click <strong>File → New Text Project</strong>, then choose <strong>C++</strong>.
<figure class="shot" data-shot="vx-new-project"><figcaption>File → New Text Project</figcaption></figure></li>
<li><strong>Pick your Brain.</strong> Open <strong>Devices</strong>. At the top, next to <strong>IQ Robot Brain</strong>, click the generation that matches your kit (1st or 2nd). Your teacher can tell you which one your class uses.
<figure class="shot" data-shot="vx-brain"><figcaption>In Devices, choose your Brain's generation</figcaption></figure></li>
<li><strong>Add your devices.</strong> Still in <strong>Devices</strong>, click <strong>Add a device</strong> and add a <strong>Drivetrain</strong> on the same ports as your Robot Setup in RoboCode. Add any sensors the same way, using the <strong>same names</strong>. The <em>Devices to add in VEXcode</em> list in the Copy for VEXcode window shows you exactly what to add.
<figure class="shot" data-shot="vx-devices"><figcaption>Click Add a device for each motor and sensor</figcaption></figure></li>
<li><strong>Paste.</strong> At the top of <code>main.cpp</code> is a folded line, <code>#pragma region VEXcode Generated Robot Configuration</code>. That is the setup for your devices, so <strong>don't delete it</strong>. Select from <code>int main() {</code> down to the very bottom, then paste with <kbd>Ctrl</kbd> + <kbd>V</kbd>.
<figure class="shot" data-shot="vx-paste"><figcaption>Keep the folded device block. Paste over int main() and everything below it.</figcaption></figure></li>
<li><strong>Save.</strong> Click the project name at the top (it starts as <strong>VEXcode Project</strong>), type your team name and the lesson, like <code>TeamBolt-RobotCheck</code>, and click <strong>Save</strong>.
<figure class="shot" data-shot="vx-save"><figcaption>Name your project, then click Save</figcaption></figure></li>
</ol>
<div class="callout warn"><p>If you change your code in VEXcode, copy it back into RoboCode before you submit. Your teacher only sees the code in RoboCode.</p></div>`
      },
      {
        kind: "activity",
        title: "Download, Run and Measure",
        minutes: 15,
        html: `<div class="callout robot"><ol class="steps">
<li><strong>Connect.</strong> Turn on the Brain and plug the USB cable into the Brain and the Chromebook. Wait until the <strong>Brain</strong> icon in VEXcode shows it is connected. If Chrome asks to connect to a device, choose the VEX Brain.
<figure class="shot" data-shot="vx-connect"><figcaption>The Brain icon shows when your robot is connected</figcaption></figure></li>
<li><strong>Download.</strong> Press <strong>Download</strong>. Wait for it to finish. The program is now stored in a slot on the Brain.
<figure class="shot" data-shot="vx-download"><figcaption>The Download and Run buttons</figcaption></figure></li>
<li><strong>Get ready.</strong> Unplug the cable, set the robot on your tape start line and give it room. Everyone stands back.</li>
<li><strong>Run.</strong> Press <strong>Run</strong> in VEXcode, or choose your program on the Brain's screen and press the check button.</li>
<li><strong>Measure.</strong> Measure how far the robot really drove and how close to 90° it turned. Fill in the table below. Run it three times.</li>
</ol></div>
<table class="tbl"><tr><th>Run</th><th>Planned distance</th><th>Real distance</th><th>Planned turn</th><th>Real turn (about)</th></tr>
<tr><td>1</td><td>12 in</td><td></td><td>90°</td><td></td></tr><tr><td>2</td><td>12 in</td><td></td><td>90°</td><td></td></tr><tr><td>3</td><td>12 in</td><td></td><td>90°</td><td></td></tr></table>
<p><strong>Calibrate:</strong> if the robot is always short or long, change the number in your code a little, download again and test. Write down the number that works for <em>your</em> robot.</p>`
      },
      {
        kind: "wrapup",
        title: "Troubleshooting & Wrap-Up",
        minutes: 5,
        html: `<table class="tbl"><tr><th>Problem</th><th>Try this</th></tr>
<tr><td>VEXcode can't find the Brain</td><td>Turn the Brain on, try the other end of the cable, and use Google Chrome. Close other tabs that might be connected to it.</td></tr>
<tr><td>Lots of errors right after pasting</td><td>You probably pasted over the folded <code>#pragma region</code> device block. Press <kbd>Ctrl</kbd> + <kbd>Z</kbd> to undo, then paste again over <code>int main() {</code> and below only.</td></tr>
<tr><td>An error says a device name is not declared</td><td>The name in your code does not match the name in <strong>Devices</strong>. Make them exactly the same, including capital letters.</td></tr>
<tr><td>The robot drives backward or spins in place</td><td>A motor is on the wrong port or turns the wrong way. Check the ports in Devices, or swap the left and right ports.</td></tr>
<tr><td>Nothing happens when I press Run</td><td>Check that the download finished and the battery is charged.</td></tr></table>
<div class="callout think"><p>Was your prediction from the Do Now right? Why can't a simulator ever match a real robot perfectly?</p></div>`
      }
    ],
    challenge: {
      title: "Robot Check",
      prompt: `<p>Write a short program that proves your robot is ready. It will be the first program you download to the real Brain.</p>
<ol><li>Print <strong>Robot check</strong> on the Brain screen.</li><li>Drive forward 12 inches.</li><li>Turn right 90 degrees.</li><li>Drive forward 12 inches again.</li><li>Print <strong>Done</strong>.</li></ol>
<p>When it passes, press <strong>Copy for VEXcode</strong> and follow the steps above to run it on your real robot.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  // 1. Print Robot check on the Brain screen
  Brain.Screen.print("Robot check");
  Brain.Screen.newLine();

  // 2. TODO: drive forward 12 inches

  // 3. TODO: turn right 90 degrees

  // 4. TODO: drive forward 12 inches again

  // 5. TODO: print Done

  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  Brain.Screen.print("Robot check");
  Brain.Screen.newLine();
  Drivetrain.driveFor(forward, 12, inches);
  Drivetrain.turnFor(right, 90, degrees);
  Drivetrain.driveFor(forward, 12, inches);
  Brain.Screen.print("Done");
  return 0;
}
`,
      hints: [
        "Drive with Drivetrain.driveFor(forward, 12, inches); and turn with Drivetrain.turnFor(right, 90, degrees);",
        "Print Done the same way the starter prints Robot check.",
        "Each statement ends with a semicolon."
      ],
      field: { start: { x: 48, y: 50, heading: 0 }, goal: { x: 60, y: 38, r: 6 } },
      checks: [
        { type: "output", pattern: "Robot check", message: "Prints Robot check" },
        { type: "output", pattern: "Done", message: "Prints Done" },
        { type: "code", pattern: "turnFor\\s*\\(\\s*right", message: "Turns right with turnFor" },
        { type: "goal", message: "Robot ends inside the green goal" },
        { type: "noCollision", message: "Robot never hits a wall" }
      ]
    },
    reflection: "Describe one way your real robot acted differently from the simulator, and explain what you think caused it.",
    quiz: [
      { q: "Why do you need VEXcode IQ if you can already write code in RoboCode?", choices: ["VEXcode IQ is what downloads the program to the real Brain", "RoboCode can't run C++ at all", "VEXcode IQ grades your work", "The simulator only works inside VEXcode IQ"], answer: 0, explain: "RoboCode tests your code in a simulator. Only VEXcode IQ can put the program on the real Brain." },
      { q: "VEXcode says DistanceSensor was not declared, but it is plugged in. What is the most likely fix?", choices: ["Add it in Devices with the same name your code uses", "Charge the battery", "Press Run twice", "Delete #include \"vex.h\""], answer: 0, explain: "Every device in your code has to be set up in Devices with exactly the same name." },
      { q: "The simulator drove exactly 12 inches but the real robot drove 11. What should you do?", choices: ["Test, adjust the number a little, and test again", "Give up, because the robot is broken", "Change the code in the simulator only", "Turn the robot off and on until it drives 12"], answer: 0, explain: "Real robots need calibrating. Small changes and repeated tests are how engineers match the plan." },
      { q: "You fixed a bug in VEXcode IQ. What must you do before you submit in RoboCode?", choices: ["Copy the fixed code back into RoboCode", "Nothing, RoboCode updates by itself", "Download it again", "Email it to your teacher"], answer: 0, explain: "The two apps don't share code automatically. Your teacher only sees what is in RoboCode." }
    ]
  },
  {
    id: "u1l4",
    unit: 1,
    order: 8,
    title: "Drive & Turn",
    minutes: 40,
    tags: ["code", "algorithms"],
    summary: "Master driveFor and turnFor, measure the real field, choreograph a robot dance, and drive a perfect square.",
    objectives: [
      "I can use driveFor and turnFor with distances, angles, and units.",
      "I can change the robot's speed with setDriveVelocity and setTurnVelocity.",
      "I can measure real distances on the field board and predict where my robot will end up.",
      "I can plan a path as a sequence of drives and turns."
    ],
    vocab: [
      { term: "Velocity", def: "How fast the robot moves, set as a percent of top speed in VEX." },
      { term: "Degrees", def: "A unit for measuring turns. A full spin is 360 degrees; a quarter turn is 90." },
      { term: "Heading", def: "The direction the robot is facing: 0 = forward/north, 90 = right/east." },
      { term: "Units", def: "What a number measures, like inches, mm, degrees, or seconds." },
      { term: "Algorithm", def: "A step-by-step plan for solving a problem." }
    ],
    materials: [
      "Built BaseBots with charged batteries",
      "VEX IQ field board",
      "Tape measures and masking tape",
      "A speaker/phone for music (robot dance)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Human Robot",
        minutes: 5,
        html: `<p>Pairs: one person is the <strong>robot</strong>, one is the <strong>programmer</strong>. The programmer may only say <em>"forward N steps"</em>, <em>"turn left 90"</em>, or <em>"turn right 90"</em>. Guide your robot from your desk to the classroom door without touching anything.</p>
<div class="callout think"><p>How many commands did it take? Did anyone turn the wrong way? (Left and right are tricky when the robot faces you!)</p></div>`
      },
      {
        kind: "learn",
        title: "Driving and Turning Commands",
        minutes: 8,
        html: `<pre class="code">Drivetrain.driveFor(forward, 12, inches);   // drive 12 inches
Drivetrain.driveFor(reverse, 100, mm);      // back up 100 millimeters
Drivetrain.turnFor(right, 90, degrees);     // quarter turn clockwise
Drivetrain.turnFor(left, 180, degrees);     // about-face

Drivetrain.setDriveVelocity(80, percent);   // faster driving
Drivetrain.setTurnVelocity(30, percent);    // slower, more accurate turns</pre>
<table class="tbl">
  <tr><th>Turn</th><th>Degrees</th></tr>
  <tr><td>Quarter turn</td><td>90</td></tr>
  <tr><td>Half turn (about-face)</td><td>180</td></tr>
  <tr><td>Full spin</td><td>360</td></tr>
</table>
<p>The 2nd gen Brain has a built-in <strong>inertial sensor</strong>, so <code>turnFor</code> measures the actual turn, not just how far the wheels spun. That's why it's so accurate!</p>
<div class="callout tip"><p><strong>Speed vs. accuracy:</strong> Fast robots slide and overshoot. Competition teams often drive fast on long straightaways and slow down for turns.</p></div>`
      },
      {
        kind: "activity",
        title: "Measure the Field & Robot Dance",
        minutes: 15,
        html: `<div class="callout robot">
<p><strong>Part 1: Predict and measure (6 min)</strong></p>
<ol class="steps">
  <li>Put your robot on a tape start line on the field board.</li>
  <li>Each team member <strong>predicts</strong> where the robot will stop after <code>driveFor(forward, 18, inches)</code> and marks it with a small piece of tape.</li>
  <li>Run it. Measure the real distance with a tape measure. Whose prediction was closest?</li>
  <li>Try <code>setDriveVelocity(100, percent)</code> and run it again. Did it overshoot?</li>
</ol>
<p><strong>Part 2: Robot Dance-Off (9 min)</strong></p>
<ol class="steps">
  <li>As a team, choreograph a dance with at least <strong>6 moves</strong> using drives, turns, and <code>wait(0.5, seconds);</code> pauses.</li>
  <li>Include at least one spin (360 degrees) and one wiggle (small left/right turns).</li>
  <li>Print a dance name on the Brain screen at the start.</li>
  <li>Teams perform on the field board one at a time while the class plays music. The class votes for <em>Best Moves</em> and <em>Most Precise</em>.</li>
</ol>
</div>`
      },
      {
        kind: "code",
        title: "Plan a Square",
        minutes: 9,
        html: `<p>A square has 4 equal sides and 4 right-angle corners. To drive one, repeat <em>drive, turn</em> 4 times:</p>
<pre class="code">Drivetrain.driveFor(forward, 24, inches);
Drivetrain.turnFor(right, 90, degrees);
// ...three more times</pre>
<div class="callout think"><p><strong>Predict before you run:</strong> If the robot starts facing up and always turns <em>right</em>, which corner does it visit first? Sketch the path on paper.</p></div>
<p>In the challenge, blue tiles mark the corners of the square. Drive over every corner and end back at the start, without hitting the box in the middle!</p>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Exit discussion: Why did the real robot not end <em>exactly</em> where it started? Name two things that cause small errors in the real world (hint: wheels slipping, the field not being flat...).</p>`
      }
    ],
    challenge: {
      title: "Drive a Square",
      prompt: `<p>The robot starts in the bottom-left corner of a 24-inch square, facing up. Drive the whole square, turning <strong>right</strong> at each corner, so that the robot:</p>
<ul>
  <li>drives over all three <strong>blue corner tiles</strong>,</li>
  <li>does not hit the box in the middle,</li>
  <li>and ends back in the green goal where it started.</li>
</ul>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);

  // Side 1
  Drivetrain.driveFor(forward, 24, inches);
  Drivetrain.turnFor(right, 90, degrees);

  // TODO: Side 2

  // TODO: Side 3

  // TODO: Side 4

}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);

  Drivetrain.driveFor(forward, 24, inches);
  Drivetrain.turnFor(right, 90, degrees);
  Drivetrain.driveFor(forward, 24, inches);
  Drivetrain.turnFor(right, 90, degrees);
  Drivetrain.driveFor(forward, 24, inches);
  Drivetrain.turnFor(right, 90, degrees);
  Drivetrain.driveFor(forward, 24, inches);
  Drivetrain.turnFor(right, 90, degrees);
}
`,
      hints: [
        "Each side is the same two lines: driveFor 24 inches, then turnFor right 90 degrees.",
        "You need 4 drives in total. The last turn is optional, but it makes the robot face up again.",
        "If the robot hits the box, check that you are turning right, not left."
      ],
      field: {
        start: { x: 24, y: 54, heading: 0 },
        walls: [{ x: 32, y: 38, w: 8, h: 8 }],
        tiles: [
          { x: 20, y: 26, w: 8, h: 8, color: "blue" },
          { x: 44, y: 26, w: 8, h: 8, color: "blue" },
          { x: 44, y: 50, w: 8, h: 8, color: "blue" }
        ],
        goal: { x: 24, y: 54, r: 6 }
      },
      checks: [
        { type: "visitedTiles", message: "Robot drove over every corner tile" },
        { type: "goal", message: "Robot ends back in the green goal" },
        { type: "noCollision", message: "Robot never hits a wall or the box" },
        { type: "code", pattern: "(turnFor[\\s\\S]*){3}", message: "Uses turnFor at least 3 times" }
      ]
    },
    reflection: "Describe your team's robot dance in words, as a sequence of moves. Which move was hardest to get right, and how did you fix it?",
    quiz: [
      {
        q: "Which command turns the robot a quarter turn clockwise?",
        choices: ["Drivetrain.turnFor(left, 90, degrees);", "Drivetrain.turnFor(right, 90, degrees);", "Drivetrain.driveFor(right, 90, inches);", "Drivetrain.turnFor(right, 360, degrees);"],
        answer: 1,
        explain: "Right is clockwise, and a quarter of 360 is 90 degrees."
      },
      {
        q: "A robot faces north (heading 0) and turns right 90 degrees. Which way does it face?",
        choices: ["North", "South", "East", "West"],
        answer: 2,
        explain: "Turning right (clockwise) from north points east, heading 90."
      },
      {
        q: "Your robot keeps overshooting its stopping point. What is the best fix?",
        choices: ["Increase velocity to 100%", "Lower the drive velocity", "Add more comments", "Use mm instead of inches"],
        answer: 1,
        explain: "Slower robots slide less and stop more accurately."
      },
      {
        q: "How many right turns of 90 degrees bring the robot back to facing its starting direction?",
        choices: ["2", "3", "4", "6"],
        answer: 2,
        explain: "4 × 90 = 360 degrees, a full turn."
      }
    ]
  }
];
