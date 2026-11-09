// Unit 3: Algorithms
// Field geometry notes (inches, y grows down, heading 0 = up):
//  u3l1 maze: up 48, right 90, fwd 36, right 90, fwd 48, left 90, fwd 36 -> (84,60)
//  u3l2 line: left-edge follower (dark -> turn left 5, light -> turn right 5, drive 1) until wall < 10 in
//  u3l3 tiles: centers x = 24, 38, 52, 66, 80 on y = 36; black tile is index 3
//  u3l5 cubes: drive 11 -> red pad, deliver left 27; drive 14 -> blue pad, deliver right 27
//  u3l6 grid: 24-in cells, path R U U R D R U from (12,60) to (84,12)
//  u3l7 P-control toward the top border, goal covers 5..17 in from the wall

module.exports = [
  // ---------------------------------------------------------------- u3l1
  {
    id: "u3l1",
    unit: 3,
    order: 13,
    title: "What Is an Algorithm?",
    minutes: 40,
    tags: ["algorithms", "code"],
    summary: "Program your teacher to make a sandwich, then turn precise step-by-step thinking into a robot maze run.",
    objectives: [
      "I can explain what an algorithm is and why every step must be precise.",
      "I can describe an algorithm with pseudocode and a flowchart.",
      "I can compare two algorithms that solve the same problem and say which is more efficient.",
      "I can program a robot to navigate a maze using driveFor and turnFor."
    ],
    vocab: [
      { term: "Algorithm", def: "A finite list of precise, step-by-step instructions that solves a problem." },
      { term: "Pseudocode", def: "A plain-English sketch of a program that is written like code but not in any real language." },
      { term: "Flowchart", def: "A diagram of an algorithm: ovals for start/end, rectangles for actions, diamonds for yes/no decisions." },
      { term: "Efficiency", def: "How few steps, how little time, or how little energy an algorithm needs to do its job." },
      { term: "Wall follower", def: "A maze algorithm: keep one hand (for example, your right hand) on the wall and keep walking until you reach the exit." },
      { term: "Ambiguous", def: "Having more than one possible meaning. Computers cannot handle ambiguous instructions." }
    ],
    materials: [
      "Bread, peanut butter (or sunflower butter, check for allergies!), jelly, a plastic knife, paper plates",
      "Whiteboard or chart paper for flowcharts",
      "VEX IQ BaseBots (one per team)",
      "VEX IQ field board with field perimeter walls or cardboard/books for maze walls",
      "Painter's tape to mark start and goal"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Brush Your Teeth in 6 Steps",
        minutes: 5,
        html: `<p>On a sticky note, write the steps to <strong>brush your teeth</strong>, in exactly 6 steps.</p>
<p>Swap with a partner. Read their steps and act them out <em>exactly</em> as written, like a robot who has never seen a toothbrush. Did they forget to take the cap off the toothpaste? Did they say how long to brush?</p>
<div class="callout think"><p><strong>Discuss:</strong> What went wrong when you followed someone else's steps literally? What would a robot do with "brush for a while"?</p></div>`
      },
      {
        kind: "unplugged",
        title: "Program Your Teacher: The Sandwich Algorithm",
        minutes: 10,
        html: `<p>Your teacher is now a <strong>robot</strong>. It only does <em>exactly</em> what you say. Teams will write the algorithm to make a peanut-butter-and-jelly sandwich.</p>
<div class="callout unplugged">
<ol class="steps">
  <li>In teams of 3-4, write sandwich instructions on paper. You have 3 minutes.</li>
  <li>One team reads its steps aloud, one at a time. The teacher-robot follows each step <em>literally</em>. ("Put the peanut butter on the bread" might mean placing the whole jar on top of the loaf!)</li>
  <li>When the robot gets stuck, the team gets 1 minute to <strong>debug</strong>: rewrite the broken step.</li>
  <li>Next team goes, starting from the fixed version. Keep going until there is a sandwich.</li>
  <li>Count the final number of steps on the board.</li>
</ol>
</div>
<div class="callout think"><p><strong>Discuss:</strong> Which words were <em>ambiguous</em>? Which steps could be combined or repeated with a loop ("spread back and forth 5 times")? Which steps needed a decision ("if the jar is closed, twist the lid")?</p></div>
<div class="callout tip"><p>That is exactly what programming is: precise steps (<strong>sequence</strong>), repeating (<strong>loops</strong>), and choosing (<strong>if/else</strong>). Put those together and you have an <strong>algorithm</strong>.</p></div>`
      },
      {
        kind: "learn",
        title: "Pseudocode, Flowcharts, and Efficiency",
        minutes: 8,
        html: `<p>Before writing C++, programmers often sketch the plan in <strong>pseudocode</strong> or a <strong>flowchart</strong>.</p>
<p><strong>Pseudocode for the right-hand wall follower</strong> (a famous maze algorithm):</p>
<pre class="code">REPEAT until at the goal:
    IF there is no wall on my right:
        turn right, step forward
    ELSE IF there is no wall in front:
        step forward
    ELSE:
        turn left</pre>
<p><strong>Flowchart shapes</strong>:</p>
<table class="tbl">
<tr><th>Shape</th><th>Meaning</th><th>Example</th></tr>
<tr><td>Oval</td><td>Start / End</td><td>"Start", "At goal - stop"</td></tr>
<tr><td>Rectangle</td><td>Action</td><td>"Drive forward 12 in"</td></tr>
<tr><td>Diamond</td><td>Decision (yes/no)</td><td>"Wall on right?"</td></tr>
<tr><td>Arrow</td><td>What happens next</td><td>Arrows loop back to repeat</td></tr>
</table>
<p>Try the robot's decision at one spot in the maze:</p>
<div data-widget="decision-tree" data-tree='{"q":"Wall on my right?","yes":{"q":"Wall in front?","yes":"Turn left","no":"Drive forward one step"},"no":"Turn right, then drive forward one step"}'></div>
<p><strong>Efficiency:</strong> Two algorithms can both work but one can be much faster. The wall follower always escapes a simple maze, but it might wander down every dead end. If you <em>know</em> the maze, a planned route with fewer moves is more efficient. Later in this unit you'll learn an algorithm (BFS) that finds the <em>shortest</em> route automatically.</p>`
      },
      {
        kind: "activity",
        title: "Robot Activity: Board Maze",
        minutes: 12,
        html: `<div class="callout robot">
<p>Build a simple maze on the VEX field board using perimeter pieces, books or cardboard. Leave corridors at least 18 in wide so the BaseBot can turn.</p>
<ol class="steps">
  <li><strong>Plan (2 min):</strong> Each team draws the maze from above and writes pseudocode for the route: "forward 48, turn right 90, ..." Measure each straight with a ruler.</li>
  <li><strong>Human test (2 min):</strong> One teammate is the robot and walks the route with eyes closed while another reads the steps. Fix mistakes now - it's cheaper than fixing them in code!</li>
  <li><strong>Code (4 min):</strong> Write it in the editor below (the simulator has the same maze) and test it.</li>
  <li><strong>Real run (3 min):</strong> Download to the robot and run it on the board. Does the real robot match the simulator? Measure how far off it ends.</li>
  <li><strong>Improve (1 min):</strong> Can you make the code shorter with a function like <code>leg(distance, turnRight)</code>?</li>
</ol>
</div>
<div class="callout think"><p><strong>Discuss:</strong> The real robot probably did not stop in exactly the same spot as the simulator. Why? (Wheel slip, battery level, the floor, turning overshoot.) What sensor could help fix that?</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up: Algorithm Gallery",
        minutes: 5,
        html: `<p>Each team shares the number of lines in their maze program. The team with the <strong>shortest working</strong> program explains its trick.</p>
<div class="callout think"><p>Is shorter code always more <em>efficient</em>? What's the difference between "fewest lines of code" and "fewest robot moves"?</p></div>
<p>Finish the exit ticket and reflection.</p>`
      }
    ],
    challenge: {
      title: "Escape the Maze",
      prompt: `<p>The robot starts in the bottom-left corner facing <strong>up</strong>. Two walls block the direct route. Drive through the maze to the green goal in the bottom-right corner <strong>without touching any wall</strong>.</p>
<p>Route plan (pseudocode):</p>
<pre class="code">forward 48 in
turn right 90
forward 36 in
turn right 90
forward 48 in
turn left 90
forward 36 in</pre>
<p><strong>Then improve it:</strong> write a function <code>leg(double inches, bool turnRightAfter)</code> or use variables so the program is shorter and easier to change.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);

  // Leg 1: drive up the left side of the maze
  Drivetrain.driveFor(forward, 48, inches);
  Drivetrain.turnFor(right, 90, degrees);

  // TODO Leg 2: drive across the top (how far?)

  // TODO Leg 3: turn and drive down between the two walls

  // TODO Leg 4: turn and drive into the goal

  Brain.Screen.print("Maze done!");
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

void leg(double inches) {
  Drivetrain.driveFor(forward, inches, inches);
}

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);

  leg(48);
  Drivetrain.turnFor(right, 90, degrees);
  leg(36);
  Drivetrain.turnFor(right, 90, degrees);
  leg(48);
  Drivetrain.turnFor(left, 90, degrees);
  leg(36);

  Brain.Screen.print("Maze done!");
  return 0;
}
`,
      hints: [
        "After the first leg the robot is at the top-left. The gap between the two walls is at x = 48, which is 36 inches to the right of the start.",
        "Going down between the walls you need to turn RIGHT again (now facing down), then at the bottom turn LEFT to face the goal.",
        "To improve: put driveFor + turnFor into a function and call it once per leg."
      ],
      field: {
        start: { x: 12, y: 60, heading: 0 },
        walls: [
          { x: 32, y: 24, w: 4, h: 48 },
          { x: 60, y: 0, w: 4, h: 48 }
        ],
        goal: { x: 84, y: 60, r: 7 }
      },
      checks: [
        { type: "goal", message: "Robot ends inside the green goal" },
        { type: "noCollision", message: "Robot never hits a wall" },
        { type: "code", pattern: "turnFor", message: "Uses turnFor to turn" }
      ]
    },
    reflection: "Describe one instruction from the sandwich activity that was ambiguous. How did your team rewrite it so a robot could follow it exactly?",
    quiz: [
      {
        q: "Which is the best definition of an algorithm?",
        choices: ["Any computer program", "A precise, step-by-step set of instructions that solves a problem", "A type of robot sensor", "A math formula with letters"],
        answer: 1,
        explain: "An algorithm is a precise list of steps. It can be written in English, pseudocode, a flowchart or code."
      },
      {
        q: "In a flowchart, which shape shows a yes/no decision?",
        choices: ["Oval", "Rectangle", "Diamond", "Arrow"],
        answer: 2,
        explain: "Diamonds are decisions. They have two arrows coming out: yes and no."
      },
      {
        q: "Why did 'put the peanut butter on the bread' fail with the teacher-robot?",
        choices: ["Robots don't like peanut butter", "It was ambiguous: it didn't say to open the jar or use the knife", "It had too many steps", "It used a loop"],
        answer: 1,
        explain: "Computers take instructions literally. Every hidden step (open the jar, pick up the knife) must be written down."
      },
      {
        q: "Two maze programs both reach the goal. Program A uses 8 moves; program B uses 20 moves. Which is more efficient?",
        choices: ["A", "B", "They are equally efficient", "You can't tell"],
        answer: 0,
        explain: "Both are correct, but A reaches the goal with fewer moves, so it uses less time and battery."
      }
    ]
  },

  // ---------------------------------------------------------------- u3l2
  {
    id: "u3l2",
    unit: 3,
    order: 14,
    title: "Line Following",
    minutes: 40,
    tags: ["algorithms", "code"],
    summary: "Use the Optical sensor and a simple two-state (bang-bang) algorithm to make the robot follow black tape.",
    objectives: [
      "I can measure brightness values and calculate a threshold.",
      "I can explain how a bang-bang (two-state) controller works.",
      "I can program a robot to follow the edge of a black line."
    ],
    vocab: [
      { term: "Threshold", def: "The cut-off value that splits sensor readings into two groups, like 'dark' and 'light'." },
      { term: "Calibration", def: "Measuring real sensor values on the real surface so your program uses the right numbers." },
      { term: "Bang-bang control", def: "A controller with only two choices (like left or right) that switches whenever the reading crosses a threshold." },
      { term: "Edge following", def: "Following the boundary between the black line and the white floor instead of the middle of the line." },
      { term: "Brightness", def: "How much light the Optical sensor sees reflected from the floor, from 0 (dark) to 100 (bright)." }
    ],
    materials: [
      "VEX IQ BaseBots with the Optical sensor mounted facing down, about 1 cm above the floor",
      "Black electrical tape (3/4 in wide)",
      "VEX field board or a large sheet of white paper/poster board",
      "Calibration worksheet (or notebook)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Walk the Line Blindfolded",
        minutes: 5,
        html: `<p>Imagine you're walking along the edge of a sidewalk with your eyes closed, and you can only feel <em>one thing</em> with your right foot: "grass" or "concrete".</p>
<p>Write a rule (an if/else!) that keeps you walking along the edge.</p>
<div class="callout think"><p><strong>Discuss:</strong> If you only know "grass" or "concrete", can you ever walk perfectly straight? What would your path look like from above?</p></div>`
      },
      {
        kind: "learn",
        title: "Thresholds and Bang-Bang Control",
        minutes: 8,
        html: `<p>The Optical sensor gives a <strong>brightness</strong> number. On the black tape it's low; on the white floor it's high.</p>
<table class="tbl">
<tr><th>Surface</th><th>Typical brightness (simulator)</th></tr>
<tr><td>Black tape</td><td>about 5</td></tr>
<tr><td>White floor</td><td>about 90</td></tr>
</table>
<p>The <strong>threshold</strong> is halfway between them: <code>(5 + 90) / 2 = 47.5</code>, so we use about 50. Below the threshold means "I'm on the line".</p>
<p><strong>Edge following:</strong> Instead of trying to stay in the middle of the line, follow its <em>left edge</em>:</p>
<ul>
<li>On black? I drifted right, onto the line &rarr; turn a little <strong>left</strong>.</li>
<li>On white? I drifted left, off the line &rarr; turn a little <strong>right</strong>.</li>
<li>Either way, take a small step forward. Repeat.</li>
</ul>
<pre class="code">while (DistanceSensor.objectDistance(inches) > 10) {
  if (Optical.brightness() &lt; 50) {
    Drivetrain.turnFor(left, 5, degrees);   // on the line
  } else {
    Drivetrain.turnFor(right, 5, degrees);  // on the floor
  }
  Drivetrain.driveFor(forward, 1, inches);
}</pre>
<p>This is called <strong>bang-bang control</strong> because it only has two states and bangs back and forth between them. The robot wiggles along the edge like a snake, but it gets there!</p>
<div class="callout tip"><p>Smaller turns = smoother but slower to react at corners. Bigger turns = reacts fast but wiggles wildly. Engineers always balance this trade-off.</p></div>`
      },
      {
        kind: "activity",
        title: "Robot Activity: Calibrate on the Real Field",
        minutes: 10,
        html: `<div class="callout robot">
<p>Real sensors never read exactly 5 and 90. Your team must <strong>calibrate</strong>.</p>
<ol class="steps">
  <li>Teacher (or one team) lays a black electrical tape line on the field: a long straight piece, a wide gentle bend, and another straight piece. Avoid sharp corners for now.</li>
  <li>Write a tiny program that prints <code>Optical.brightness()</code> on the Brain screen in a loop (with <code>wait(200, msec)</code> and <code>Brain.Screen.clearScreen()</code>).</li>
  <li>Hold the robot over the white floor: record 3 readings. Over the black tape: record 3 readings. Exactly half on the edge: record 3 readings.</li>
  <li>Calculate: <code>threshold = (average black + average white) / 2</code>. Compare with the "edge" readings - they should be close!</li>
  <li>Put your threshold in the line follower and run it on the real tape. Try turn steps of 3, 5 and 10 degrees. Which works best?</li>
</ol>
</div>
<table class="tbl">
<tr><th>Turn step</th><th>Made it to the end?</th><th>Time (s)</th><th>Wiggle (1-5)</th></tr>
<tr><td>3&deg;</td><td></td><td></td><td></td></tr>
<tr><td>5&deg;</td><td></td><td></td><td></td></tr>
<tr><td>10&deg;</td><td></td><td></td><td></td></tr>
</table>
<div class="callout warn"><p>Classroom lights, sunlight from windows and the height of the sensor all change the readings. If your robot suddenly stops working, recalibrate!</p></div>`
      },
      {
        kind: "code",
        title: "Code: Follow the Line in the Simulator",
        minutes: 12,
        html: `<p>Now solve the challenge below. The simulator field has a black line that goes up, bends gently to the right, and runs to the goal near the right wall.</p>
<ol class="steps">
  <li>Fill in the threshold.</li>
  <li>Write the if/else inside the loop.</li>
  <li>Run it. If the robot loses the line, try a smaller turn angle.</li>
  <li><strong>Extra:</strong> Print how many loop steps it took. Can you make it faster by changing the step size?</li>
</ol>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up: Where Are Line Followers Used?",
        minutes: 5,
        html: `<p>Warehouse robots, hospital delivery carts and factory vehicles often follow lines or magnetic tape on the floor.</p>
<div class="callout think"><p><strong>Discuss:</strong> What would happen to our follower at a very sharp 90&deg; corner? What would happen if the line had a gap? How could you make the robot slow down on curves?</p></div>`
      }
    ],
    challenge: {
      title: "Follow the Black Line",
      prompt: `<p>The robot starts on the black line facing <strong>up</strong>. Follow the line's left edge around the bend to the green goal. Stop when the Distance sensor sees the right wall closer than 10 inches.</p>
<p>Use the two-state rule: <strong>dark &rarr; turn left a little</strong>, <strong>light &rarr; turn right a little</strong>, then drive forward 1 inch.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);

  // black is about 5, white is about 90
  int threshold = 0;  // TODO: pick a threshold halfway between black and white

  // keep following until the wall at the end of the line is close
  while (DistanceSensor.objectDistance(inches) > 10) {
    // TODO: if the brightness is below the threshold (on the line),
    //       turn left 5 degrees, otherwise turn right 5 degrees

    Drivetrain.driveFor(forward, 1, inches);
  }

  Drivetrain.stop();
  Brain.Screen.print("End of the line!");
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);

  int threshold = 50;

  while (DistanceSensor.objectDistance(inches) > 10) {
    if (Optical.brightness() < threshold) {
      Drivetrain.turnFor(left, 5, degrees);
    } else {
      Drivetrain.turnFor(right, 5, degrees);
    }
    Drivetrain.driveFor(forward, 1, inches);
  }

  Drivetrain.stop();
  Brain.Screen.print("End of the line!");
  return 0;
}
`,
      hints: [
        "A good threshold is (5 + 90) / 2, about 50.",
        "Use if (Optical.brightness() < threshold) { ... } else { ... } inside the while loop.",
        "If the robot spins in circles, use a smaller turn (try 4 or 5 degrees) and check that dark turns LEFT and light turns RIGHT."
      ],
      field: {
        start: { x: 18, y: 62, heading: 0 },
        lines: [{ points: [[18, 62], [18, 34], [24, 22], [36, 16], [82, 16]], width: 2 }],
        goal: { x: 83, y: 16, r: 7 }
      },
      checks: [
        { type: "goal", message: "Robot ends inside the green goal" },
        { type: "noCollision", message: "Robot never hits a wall" },
        { type: "code", pattern: "Optical\\.brightness\\s*\\(", message: "Reads Optical.brightness()" },
        { type: "code", pattern: "if\\s*\\(", message: "Uses an if/else decision" }
      ]
    },
    reflection: "Explain in your own words why the robot wiggles instead of driving smoothly along the line. What is one way to make it smoother?",
    quiz: [
      {
        q: "Black reads 8 and white reads 72 on your field. What is a good threshold?",
        choices: ["8", "40", "72", "80"],
        answer: 1,
        explain: "(8 + 72) / 2 = 40, halfway between black and white."
      },
      {
        q: "Why is it called 'bang-bang' control?",
        choices: ["It's loud", "It only has two states and switches hard between them", "It uses a bumper sensor", "It crashes into walls"],
        answer: 1,
        explain: "The controller has only two outputs (turn left / turn right) and slams between them."
      },
      {
        q: "Your robot follows the LEFT edge of the line. It reads dark. What should it do?",
        choices: ["Turn left", "Turn right", "Stop", "Reverse"],
        answer: 0,
        explain: "Dark means it drifted right onto the line, so it turns left back toward the edge."
      },
      {
        q: "Your line follower works in the morning but fails in the afternoon when sun shines through the window. What's the best fix?",
        choices: ["Paint the robot", "Recalibrate the threshold", "Make the robot faster", "Remove the Optical sensor"],
        answer: 1,
        explain: "Lighting changes the brightness readings, so you need to measure again and update the threshold."
      }
    ]
  },

  // ---------------------------------------------------------------- u3l3
  {
    id: "u3l3",
    unit: 3,
    order: 15,
    title: "Searching",
    minutes: 40,
    tags: ["algorithms", "code"],
    summary: "Compare linear search and binary search, then have the robot scan colored tiles into an array and search it.",
    objectives: [
      "I can store sensor readings in an array and loop over it.",
      "I can write a linear search to find a value or the smallest/largest value.",
      "I can explain why binary search is much faster on sorted data."
    ],
    vocab: [
      { term: "Array", def: "A numbered list of values of the same type, like double readings[5]. The first item is index 0." },
      { term: "Index", def: "The position number of an item in an array, starting at 0." },
      { term: "Linear search", def: "Check every item one by one from the start until you find what you want." },
      { term: "Binary search", def: "On SORTED data, check the middle, throw away the half that can't contain the answer, repeat." },
      { term: "Big-O", def: "A way to describe how the number of steps grows as the data gets bigger, e.g. O(n) or O(log n)." }
    ],
    materials: [
      "A deck of numbered index cards (1-100), face down",
      "VEX IQ BaseBots with Optical sensor",
      "5 squares of colored paper or VEX colored tiles/plates, one black",
      "VEX field board"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: I'm Thinking of a Number",
        minutes: 5,
        html: `<p>Your teacher is thinking of a number from 1 to 100. You may only ask "Is it N?" and the teacher says "higher", "lower" or "yes".</p>
<p>Round 1: guess in order 1, 2, 3, ... Round 2: use any strategy you want. Count the guesses for each round.</p>
<div class="callout think"><p><strong>Discuss:</strong> What was the smartest first guess? Why?</p></div>`
      },
      {
        kind: "learn",
        title: "Linear Search vs Binary Search",
        minutes: 10,
        html: `<p><strong>Linear search</strong> checks items one at a time. It works on <em>any</em> list, sorted or not.</p>
<pre class="code">int target = 42;
int found = -1;
for (int i = 0; i &lt; 10; i++) {
  if (a[i] == target) {
    found = i;
    break;
  }
}</pre>
<p><strong>Binary search</strong> only works on <em>sorted</em> lists, but it is amazingly fast: each guess cuts the remaining choices in half.</p>
<p>Play the game - try to win in as few guesses as possible:</p>
<div data-widget="binary-search"></div>
<table class="tbl">
<tr><th>Items in the list</th><th>Linear search (worst case)</th><th>Binary search (worst case)</th></tr>
<tr><td>100</td><td>100</td><td>7</td></tr>
<tr><td>1,000</td><td>1,000</td><td>10</td></tr>
<tr><td>1,000,000</td><td>1,000,000</td><td>20</td></tr>
<tr><td>1,000,000,000</td><td>1,000,000,000</td><td>30</td></tr>
</table>
<p>Computer scientists write this as <strong>O(n)</strong> for linear search ("steps grow with the size") and <strong>O(log n)</strong> for binary search ("steps grow with how many times you can halve it").</p>
<div class="callout think"><p><strong>Challenge question:</strong> How many guesses would binary search need for every person on Earth (about 8 billion)? (Hint: 2<sup>33</sup> is about 8.6 billion.)</p></div>`
      },
      {
        kind: "unplugged",
        title: "Unplugged: Card Search Race",
        minutes: 7,
        html: `<div class="callout unplugged">
<ol class="steps">
  <li>Pairs get 16 face-down numbered cards. Round A: cards are shuffled. Round B: cards are laid out in sorted order (still face down).</li>
  <li>Partner 1 names a target number. Partner 2 flips cards to find it, counting flips.</li>
  <li>In Round A you must use linear search. In Round B, use binary search: flip the middle card first.</li>
  <li>Record flips for 3 targets each round. Which round was faster on average?</li>
</ol>
</div>
<div class="callout think"><p>Why can't you use binary search on the shuffled cards?</p></div>`
      },
      {
        kind: "activity",
        title: "Robot Activity: Scan the Tiles",
        minutes: 13,
        html: `<div class="callout robot">
<ol class="steps">
  <li>Tape 5 colored squares in a row on the field, 14 in apart (center to center), one of them black. Put the robot 12 in before the first square.</li>
  <li>The robot drives to each tile, stops, reads <code>Optical.brightness()</code> and stores it in <code>readings[i]</code>.</li>
  <li>After the scan, a linear search finds the index of the <strong>darkest</strong> tile and prints it.</li>
  <li>Rearrange the tiles (move the black one) and run again. The program should find the new spot without changing any code!</li>
</ol>
</div>
<p>Code pattern for "find the smallest":</p>
<pre class="code">int best = 0;                    // assume tile 0 is darkest
for (int i = 1; i &lt; 5; i++) {
  if (readings[i] &lt; readings[best]) {
    best = i;                    // found a darker one
  }
}</pre>
<div class="callout tip"><p>Finding the smallest or largest value is a linear search too: you must look at every item because the answer could be anywhere.</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 5,
        html: `<div class="callout think"><p><strong>Discuss:</strong> Could the robot use binary search to find the black tile? Why or why not? (Think: are the tiles sorted?)</p></div>
<p>Search engines, phone contact lists and video games all depend on fast searching. Sorting data first is what makes binary search possible - that's next lesson!</p>`
      }
    ],
    challenge: {
      title: "Find the Darkest Tile",
      prompt: `<p>Five colored tiles are in a row in front of the robot (tile centers 14 inches apart; the first tile's center is 12 inches ahead). Drive over every tile, store each <code>Optical.brightness()</code> reading in an array, then use a <strong>linear search</strong> to find the darkest tile.</p>
<p>Print it like: <code>Darkest tile index: 3</code></p>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  double readings[5] = {0, 0, 0, 0, 0};

  // drive to the center of the first tile
  Drivetrain.driveFor(forward, 12, inches);

  for (int i = 0; i < 5; i++) {
    // TODO: store the brightness in readings[i]

    std::cout << "Tile " << i << ": " << readings[i] << std::endl;

    // TODO: drive 14 inches to the next tile (but not after the last one!)
  }

  // TODO: linear search for the index of the smallest reading
  int best = 0;

  std::cout << "Darkest tile index: " << best << std::endl;
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  double readings[5] = {0, 0, 0, 0, 0};

  Drivetrain.driveFor(forward, 12, inches);

  for (int i = 0; i < 5; i++) {
    readings[i] = Optical.brightness();
    std::cout << "Tile " << i << ": " << readings[i] << std::endl;
    if (i < 4) {
      Drivetrain.driveFor(forward, 14, inches);
    }
  }

  int best = 0;
  for (int i = 1; i < 5; i++) {
    if (readings[i] < readings[best]) {
      best = i;
    }
  }

  std::cout << "Darkest tile index: " << best << std::endl;
  return 0;
}
`,
      hints: [
        "readings[i] = Optical.brightness(); stores the reading at position i.",
        "Use if (i < 4) { Drivetrain.driveFor(forward, 14, inches); } so the robot doesn't hit the wall after the last tile.",
        "For the search: start with best = 0, loop i from 1 to 4, and if readings[i] < readings[best] then best = i."
      ],
      field: {
        start: { x: 12, y: 36, heading: 90 },
        tiles: [
          { x: 18, y: 30, w: 12, h: 12, color: "green" },
          { x: 32, y: 30, w: 12, h: 12, color: "yellow" },
          { x: 46, y: 30, w: 12, h: 12, color: "red" },
          { x: 60, y: 30, w: 12, h: 12, color: "black" },
          { x: 74, y: 30, w: 12, h: 12, color: "yellow" }
        ]
      },
      checks: [
        { type: "visitedTiles", message: "Robot drove over every colored tile" },
        { type: "noCollision", message: "Robot never hits a wall" },
        { type: "code", pattern: "readings\\s*\\[\\s*i\\s*\\]\\s*=", message: "Stores readings in an array" },
        { type: "code", pattern: "for\\s*\\(", message: "Uses a for loop" },
        { type: "output", pattern: "Darkest tile index:\\s*3", message: "Finds the darkest tile (index 3)" }
      ]
    },
    reflection: "Your friend says 'binary search is always better than linear search.' Is that true? Explain when you would have to use linear search.",
    quiz: [
      {
        q: "In int a[5] = {4, 8, 15, 16, 23}; what is a[2]?",
        choices: ["8", "15", "16", "2"],
        answer: 1,
        explain: "Indexes start at 0: a[0]=4, a[1]=8, a[2]=15."
      },
      {
        q: "About how many guesses does binary search need for 1,000,000 sorted items?",
        choices: ["20", "1,000", "500,000", "1,000,000"],
        answer: 0,
        explain: "2^20 is about 1,000,000, so 20 halvings are enough."
      },
      {
        q: "Binary search only works if the list is...",
        choices: ["Short", "Sorted", "Made of even numbers", "Stored on a robot"],
        answer: 1,
        explain: "Binary search throws away half the list based on 'higher/lower', which only makes sense if the list is in order."
      },
      {
        q: "Linear search on 1,000 items takes at most 1,000 checks. How many for 2,000 items?",
        choices: ["1,001", "1,100", "2,000", "1,000,000"],
        answer: 2,
        explain: "Linear search is O(n): double the items, double the work."
      }
    ]
  },

  // ---------------------------------------------------------------- u3l4
  {
    id: "u3l4",
    unit: 3,
    order: 16,
    title: "Sorting",
    minutes: 40,
    tags: ["algorithms", "code"],
    summary: "Become a human sorting network, step through bubble sort, and sort robot sensor readings in C++.",
    objectives: [
      "I can explain how bubble sort compares and swaps neighbors.",
      "I can swap two array values using a temporary variable.",
      "I can write nested loops that sort an array."
    ],
    vocab: [
      { term: "Sorting", def: "Putting items in order, such as smallest to largest." },
      { term: "Bubble sort", def: "A sorting algorithm that repeatedly compares neighbors and swaps them if they're out of order; big values 'bubble' to the end." },
      { term: "Swap", def: "Exchanging two values. Needs a temporary variable: temp = a; a = b; b = temp;" },
      { term: "Pass", def: "One trip through the whole array comparing each pair of neighbors." },
      { term: "Nested loop", def: "A loop inside another loop." },
      { term: "Sorting network", def: "A fixed pattern of compare-and-swap steps that sorts any input, and can do several comparisons at the same time." }
    ],
    materials: [
      "Painter's tape to draw a sorting network on the floor (or chalk outside)",
      "Index cards with random numbers 1-99 (one per student)",
      "VEX IQ BaseBots (for the bonus)",
      "Red and blue VEX cubes (bonus)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Line Up!",
        minutes: 5,
        html: `<p>Without talking, the whole class must line up in order of birthday (January 1 at the front). You may only use hand signals!</p>
<div class="callout think"><p><strong>Discuss:</strong> What strategy did people use? Did anyone compare themselves only with their neighbor? How long did it take?</p></div>`
      },
      {
        kind: "unplugged",
        title: "Unplugged: Human Sorting Network",
        minutes: 10,
        html: `<div class="callout unplugged">
<p>Tape a sorting network on the floor for 6 people: 6 parallel lanes with "comparison boxes" that connect two lanes.</p>
<ol class="steps">
  <li>Six students each get a number card and stand at the start of a lane.</li>
  <li>Walk forward. When two people reach a comparison box together, compare cards: the <strong>smaller</strong> goes to the left lane, the <strong>larger</strong> goes to the right lane.</li>
  <li>Keep walking until the end. Flip the cards - are they in order?</li>
  <li>Repeat with new cards. Time each run. Try it with the whole class watching and checking.</li>
</ol>
</div>
<div class="callout think"><p>Several pairs compared <em>at the same time</em>. Why does that make a sorting network faster than one person sorting alone? (This is how graphics cards sort huge lists quickly!)</p></div>`
      },
      {
        kind: "learn",
        title: "Bubble Sort Step by Step",
        minutes: 10,
        html: `<p><strong>Bubble sort</strong> walks through the array comparing each pair of neighbors. If they are in the wrong order, it swaps them. After the first pass, the biggest value has "bubbled" to the end. Repeat until no more swaps are needed.</p>
<div data-widget="bubble-sort"></div>
<p><strong>Swapping</strong> needs a temporary variable - like swapping the drinks in two cups, you need a third cup!</p>
<pre class="code">int temp = a[j];
a[j] = a[j + 1];
a[j + 1] = temp;</pre>
<p><strong>The full algorithm</strong> (for an array of size n):</p>
<pre class="code">for (int pass = 0; pass &lt; n - 1; pass++) {
  for (int j = 0; j &lt; n - 1 - pass; j++) {
    if (a[j] > a[j + 1]) {
      // swap a[j] and a[j + 1]
    }
  }
}</pre>
<div class="callout tip"><p>Bubble sort on n items does about n &times; n / 2 comparisons. 10 items: ~45. 1,000 items: ~500,000! Faster algorithms like merge sort exist, and you'll meet them in high school.</p></div>`
      },
      {
        kind: "code",
        title: "Code: Sort the Sensor Readings",
        minutes: 10,
        html: `<p>A robot took 6 Distance sensor readings (in inches) while scanning a room. Sort them smallest to largest so we know the closest obstacles first.</p>
<ol class="steps">
  <li>Pair-program: one person types, one person checks every line. Switch after the swap is written.</li>
  <li>Before running, trace the first pass on paper. What does the array look like after pass 1?</li>
  <li>Run the code and check the output.</li>
</ol>
<div class="callout robot"><p><strong>Bonus (real robot):</strong> Line up 3 red and 3 blue cubes in a mixed order. Can your team program the BaseBot (with claw) to swap two neighboring cubes? That's one bubble sort swap done by a robot! Hint: you need a free "temp" spot on the floor, just like the temp variable.</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 5,
        html: `<div class="callout think"><p><strong>Discuss:</strong> If the array is already sorted, how could bubble sort notice and stop early? (Hint: a <code>bool swapped</code> variable.)</p></div>
<p>Exit ticket and reflection below.</p>`
      }
    ],
    challenge: {
      title: "Bubble Sort the Readings",
      prompt: `<p>Sort the array <code>{42, 7, 88, 15, 63, 29}</code> from smallest to largest using <strong>bubble sort</strong>, then print it on one line with spaces:</p>
<pre class="code">7 15 29 42 63 88</pre>
<p>Use nested <code>for</code> loops and a <code>temp</code> variable to swap.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  int readings[6] = {42, 7, 88, 15, 63, 29};
  int n = 6;

  for (int pass = 0; pass < n - 1; pass++) {
    for (int j = 0; j < n - 1 - pass; j++) {
      // TODO: if this reading is bigger than the next one, swap them
      //       (you will need a third variable to hold one value)

    }
  }

  // print the sorted array
  for (int i = 0; i < n; i++) {
    std::cout << readings[i] << " ";
  }
  std::cout << std::endl;
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  int readings[6] = {42, 7, 88, 15, 63, 29};
  int n = 6;

  for (int pass = 0; pass < n - 1; pass++) {
    for (int j = 0; j < n - 1 - pass; j++) {
      if (readings[j] > readings[j + 1]) {
        int temp = readings[j];
        readings[j] = readings[j + 1];
        readings[j + 1] = temp;
      }
    }
  }

  for (int i = 0; i < n; i++) {
    std::cout << readings[i] << " ";
  }
  std::cout << std::endl;
  return 0;
}
`,
      hints: [
        "Compare with: if (readings[j] > readings[j + 1]) { ... }",
        "Swap with three lines: int temp = readings[j]; readings[j] = readings[j + 1]; readings[j + 1] = temp;",
        "If your output is only partly sorted, check the loop limits: the inner loop goes to n - 1 - pass."
      ],
      checks: [
        { type: "output", pattern: "7 15 29 42 63 88", message: "Prints the readings in sorted order" },
        { type: "code", pattern: "temp", message: "Uses a temp variable to swap" },
        { type: "code", pattern: "readings\\s*\\[\\s*j\\s*\\+\\s*1\\s*\\]", message: "Compares neighbors readings[j] and readings[j + 1]" }
      ]
    },
    reflection: "Explain why you need a temp variable to swap two values. What goes wrong if you just write a[j] = a[j+1]; a[j+1] = a[j]; ?",
    quiz: [
      {
        q: "After the FIRST pass of bubble sort on {5, 1, 4, 2}, which value is guaranteed to be at the end?",
        choices: ["1", "2", "4", "5"],
        answer: 3,
        explain: "The largest value bubbles all the way to the end during the first pass."
      },
      {
        q: "What does this code do? temp = a; a = b; b = temp;",
        choices: ["Copies a into b only", "Swaps a and b", "Sets both to temp", "Sorts the array"],
        answer: 1,
        explain: "temp holds a's old value so it isn't lost when a gets b's value."
      },
      {
        q: "Bubble sort compares which items?",
        choices: ["The first and last", "Random pairs", "Neighbors (side-by-side items)", "Only the middle item"],
        answer: 2,
        explain: "Bubble sort always compares a[j] with a[j+1]."
      },
      {
        q: "Why can a sorting network be faster than bubble sort done by one person?",
        choices: ["It skips comparisons", "Many comparisons happen at the same time (in parallel)", "It uses smaller numbers", "It doesn't need to compare"],
        answer: 1,
        explain: "In a sorting network, pairs on different lanes compare simultaneously."
      }
    ]
  },

  // ---------------------------------------------------------------- u3l5
  {
    id: "u3l5",
    unit: 3,
    order: 17,
    title: "Cube Sorting Robot",
    minutes: 40,
    tags: ["algorithms", "code", "build"],
    summary: "Combine driving, the claw, the Optical sensor and decisions to build a robot that sorts cubes by color.",
    objectives: [
      "I can break a big task into helper functions.",
      "I can use a sensor reading to decide where the robot goes.",
      "I can grab and release cubes with the claw."
    ],
    vocab: [
      { term: "Decomposition", def: "Breaking a big problem into smaller pieces that are easier to solve (often one function per piece)." },
      { term: "Helper function", def: "A small function that does one job, like grab() or drop(), so main() reads like a plan." },
      { term: "Parameter", def: "A value you pass into a function to change what it does, like deliver(true)." },
      { term: "Claw", def: "The motor-driven gripper. On our robot, ClawMotor forward closes it, reverse opens it." },
      { term: "Sorting zone", def: "A marked area on the field where cubes of one color belong." }
    ],
    materials: [
      "VEX IQ BaseBots with Claw attachment (Clawbot build) and Optical sensor",
      "Red and blue VEX cubes",
      "Red and blue paper squares (color pads) and painter's tape for zones",
      "VEX field board"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Sorting Robots in the Real World",
        minutes: 5,
        html: `<p>Recycling plants use robots to sort plastic, paper and metal; post offices sort packages; farms sort apples by color and size.</p>
<p>Write down: what <strong>sensor</strong> would each robot need, and what is its <strong>decision</strong> (if/else)?</p>
<div class="callout think"><p>Share one example. What happens if the sensor makes a mistake?</p></div>`
      },
      {
        kind: "learn",
        title: "Decompose the Problem",
        minutes: 8,
        html: `<p>"Sort the cubes" is too big to code in one go. Break it into small helper functions:</p>
<table class="tbl">
<tr><th>Helper</th><th>What it does</th></tr>
<tr><td><code>grab()</code></td><td>Close the claw: <code>ClawMotor.spinFor(forward, 90, degrees);</code></td></tr>
<tr><td><code>drop()</code></td><td>Open the claw: <code>ClawMotor.spinFor(reverse, 90, degrees);</code></td></tr>
<tr><td><code>deliver(bool goLeft)</code></td><td>Turn toward a zone, drive there, drop, drive back, turn back.</td></tr>
</table>
<p>Then <code>main()</code> reads like the plan:</p>
<pre class="code">drive to cube 1
grab
IF the color pad is red: deliver to the LEFT zone
ELSE: deliver to the RIGHT zone
drive to cube 2
grab
same decision again</pre>
<p>On our field, each cube sits at the end of a colored <strong>pad</strong> that matches the cube's color. When the robot stops with the cube in its claw, the Optical sensor (pointing down) is over the pad, so <code>Optical.color()</code> tells us the cube's color.</p>
<div data-widget="decision-tree" data-tree='{"q":"Optical sees red?","yes":"Turn left, deliver to the RED zone","no":{"q":"Optical sees blue?","yes":"Turn right, deliver to the BLUE zone","no":"Unknown color: leave the cube and beep"}}'></div>`
      },
      {
        kind: "activity",
        title: "Robot Activity: Build the Sorting Station",
        minutes: 15,
        html: `<div class="callout robot">
<ol class="steps">
  <li><strong>Set up (3 min):</strong> On the field board, tape a red zone on the left and a blue zone on the right. In the middle lane, place a red pad + red cube, and further ahead a blue pad + blue cube (match the simulator layout below).</li>
  <li><strong>Test helpers (3 min):</strong> Run only <code>grab()</code> and <code>drop()</code>. Does the claw close firmly on the cube? Adjust the degrees if needed.</li>
  <li><strong>Test one delivery (4 min):</strong> Drive to cube 1, grab it, and call <code>deliver(true)</code>. Measure where the cube lands and adjust the distance.</li>
  <li><strong>Add the decision (3 min):</strong> Use <code>Optical.color() == red</code> to choose the direction.</li>
  <li><strong>Swap test (2 min):</strong> Swap the cubes AND their pads. Does your robot still sort correctly without changing the code? That proves the sensor decision works!</li>
</ol>
</div>
<p><strong>Team roles:</strong> Driver/Coder, Field Manager (resets cubes), Measurer (checks distances with a ruler), Recorder (writes down what changed each run).</p>`
      },
      {
        kind: "code",
        title: "Code: Sort in the Simulator",
        minutes: 7,
        html: `<p>The challenge below matches the board layout. Robot starts at the bottom middle, facing up.</p>
<ul>
<li>Cube 1 (on the red pad) is reached by driving <strong>11 in</strong>.</li>
<li>Cube 2 (on the blue pad) is another <strong>14 in</strong> after that.</li>
<li>Both zones are <strong>27 in</strong> to the left or right of the middle lane.</li>
</ul>
<div class="callout tip"><p>Notice how the same <code>deliver()</code> function works for both cubes - only the decision changes. That's the power of functions with parameters!</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up: Scaling Up",
        minutes: 5,
        html: `<div class="callout think"><p><strong>Discuss:</strong> How would you change the program for 10 cubes? (Loop!) For 3 colors? (else if!) What if the cubes were in random spots? (Search!)</p></div>`
      }
    ],
    challenge: {
      title: "Sort Two Cubes",
      prompt: `<p>Two cubes sit in the middle lane on colored pads. Pick each one up, check the pad color with <code>Optical.color()</code>, and drop the cube in the matching zone: <strong>red zone on the LEFT</strong>, <strong>blue zone on the RIGHT</strong>.</p>
<p>The helper functions are already written. Your job: write <code>main()</code> - the driving distances and the decision.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

void grab() {
  ClawMotor.spinFor(forward, 90, degrees);
}

void drop() {
  ClawMotor.spinFor(reverse, 90, degrees);
}

// turn toward a zone, drop the cube there, and come back
void deliver(bool goLeft) {
  if (goLeft) {
    Drivetrain.turnFor(left, 90, degrees);
  } else {
    Drivetrain.turnFor(right, 90, degrees);
  }
  Drivetrain.driveFor(forward, 27, inches);
  drop();
  Drivetrain.driveFor(reverse, 27, inches);
  if (goLeft) {
    Drivetrain.turnFor(right, 90, degrees);
  } else {
    Drivetrain.turnFor(left, 90, degrees);
  }
}

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);

  // Cube 1
  Drivetrain.driveFor(forward, 11, inches);
  grab();
  // TODO: if the Optical sensor sees red, deliver to the left, otherwise to the right

  // Cube 2
  // TODO: drive 14 inches to the next cube, grab it, and make the same decision

  Brain.Screen.print("Sorted!");
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

void grab() {
  ClawMotor.spinFor(forward, 90, degrees);
}

void drop() {
  ClawMotor.spinFor(reverse, 90, degrees);
}

void deliver(bool goLeft) {
  if (goLeft) {
    Drivetrain.turnFor(left, 90, degrees);
  } else {
    Drivetrain.turnFor(right, 90, degrees);
  }
  Drivetrain.driveFor(forward, 27, inches);
  drop();
  Drivetrain.driveFor(reverse, 27, inches);
  if (goLeft) {
    Drivetrain.turnFor(right, 90, degrees);
  } else {
    Drivetrain.turnFor(left, 90, degrees);
  }
}

void sortCube() {
  grab();
  if (Optical.color() == red) {
    deliver(true);
  } else {
    deliver(false);
  }
}

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);

  Drivetrain.driveFor(forward, 11, inches);
  sortCube();

  Drivetrain.driveFor(forward, 14, inches);
  sortCube();

  Brain.Screen.print("Sorted!");
  return 0;
}
`,
      hints: [
        "if (Optical.color() == red) { deliver(true); } else { deliver(false); }",
        "deliver() brings the robot back to the middle lane facing up, so for cube 2 just drive forward 14 inches and grab again.",
        "Make the decision into its own function sortCube() and call it twice!"
      ],
      field: {
        start: { x: 48, y: 62, heading: 0 },
        tiles: [
          { x: 42, y: 44, w: 12, h: 13, color: "red" },
          { x: 42, y: 30, w: 12, h: 13, color: "blue" }
        ],
        cubes: [
          { x: 48, y: 44, color: "red" },
          { x: 48, y: 30, color: "blue" }
        ],
        zones: [
          { x: 7, y: 30, w: 14, h: 28, color: "red" },
          { x: 75, y: 30, w: 14, h: 28, color: "blue" }
        ]
      },
      checks: [
        { type: "cubesInZones", message: "Every cube is in the zone matching its color" },
        { type: "noCollision", message: "Robot never hits a wall" },
        { type: "code", pattern: "Optical\\.color\\s*\\(", message: "Uses the Optical sensor to decide" },
        { type: "code", pattern: "if\\s*\\(", message: "Uses an if/else decision" }
      ]
    },
    reflection: "How did splitting the program into grab(), drop() and deliver() make it easier to write and fix? Give one specific example from today.",
    quiz: [
      {
        q: "What does decomposition mean in programming?",
        choices: ["Deleting old code", "Breaking a big problem into smaller pieces", "Making the robot go faster", "Sorting numbers"],
        answer: 1,
        explain: "Decomposing a problem into helper functions makes each piece small and testable."
      },
      {
        q: "In deliver(bool goLeft), what is goLeft?",
        choices: ["A loop", "A parameter", "A sensor", "A motor"],
        answer: 1,
        explain: "goLeft is a parameter - a value passed in that changes what the function does."
      },
      {
        q: "On our robot, what does ClawMotor.spinFor(forward, 90, degrees) do?",
        choices: ["Opens the claw", "Closes the claw to grab", "Lifts the arm", "Drives forward"],
        answer: 1,
        explain: "Forward closes the claw; reverse opens it."
      },
      {
        q: "You add a third color, green, with its own zone. What C++ feature is the best fit?",
        choices: ["else if", "A second main()", "Deleting the Optical sensor", "A while(true) loop with no condition"],
        answer: 0,
        explain: "if / else if / else lets the robot choose among three or more options."
      }
    ]
  },

  // ---------------------------------------------------------------- u3l6
  {
    id: "u3l6",
    unit: 3,
    order: 18,
    title: "Pathfinding",
    minutes: 40,
    tags: ["algorithms", "code"],
    summary: "Turn a maze into a grid, find the shortest path with Breadth-First Search, and have the robot drive it from an array of moves.",
    objectives: [
      "I can represent a maze as a grid of cells.",
      "I can explain how Breadth-First Search (BFS) finds the shortest path.",
      "I can store a path as an array of moves and execute it with a function."
    ],
    vocab: [
      { term: "Grid", def: "A map split into equal squares (cells), each named by its column and row." },
      { term: "Neighbor", def: "A cell directly up, down, left or right of another cell." },
      { term: "Breadth-First Search (BFS)", def: "A search that explores all cells 1 step away, then all cells 2 steps away, and so on, so the first time it reaches the goal is by the shortest path." },
      { term: "Queue", def: "A waiting line: first in, first out. BFS keeps cells to explore in a queue." },
      { term: "Path", def: "The list of moves from the start to the goal." }
    ],
    materials: [
      "Masking tape to make a 4 x 3 grid on the floor (or the VEX field board tiles)",
      "Sticky notes with numbers 0-9",
      "Books or boxes for maze walls",
      "VEX IQ BaseBots"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: How Does GPS Know?",
        minutes: 5,
        html: `<p>When you ask a maps app for directions, it checks millions of possible routes in under a second.</p>
<p>Draw a 4 x 3 grid in your notebook. Shade 3 squares as walls. Find the shortest route from the bottom-left to the top-right. How do you <em>know</em> it's the shortest?</p>
<div class="callout think"><p>Compare with a partner. Did you find the same length? Can you prove there's nothing shorter?</p></div>`
      },
      {
        kind: "learn",
        title: "Breadth-First Search: Ripples in a Pond",
        minutes: 10,
        html: `<p>Imagine dropping a stone in a pond at the start cell. The ripple spreads out one ring at a time. BFS works the same way:</p>
<ol>
<li>Label the start cell <strong>0</strong>.</li>
<li>Label every open neighbor of a 0-cell with <strong>1</strong>.</li>
<li>Label every unlabeled open neighbor of a 1-cell with <strong>2</strong>, and so on.</li>
<li>When the goal gets a label, that number is the shortest distance!</li>
<li>To get the path, walk <em>backwards</em> from the goal, always stepping to a neighbor with a number one smaller.</li>
</ol>
<p>Place walls and watch BFS spread:</p>
<div data-widget="maze-bfs"></div>
<div class="callout tip"><p>BFS uses a <strong>queue</strong>: cells wait in line to be explored, first in, first out. That's what keeps the rings in order.</p></div>
<p><strong>Storing a path in code:</strong> use numbers for directions, like a compass: <code>0 = up, 1 = right, 2 = down, 3 = left</code>. Then <code>heading = dir * 90</code>!</p>
<pre class="code">void moveCell(int dir) {
  Drivetrain.turnToHeading(dir * 90, degrees);
  Drivetrain.driveFor(forward, 24, inches);   // one cell
}

int path[3] = {0, 1, 1};   // up, right, right
for (int i = 0; i &lt; 3; i++) {
  moveCell(path[i]);
}</pre>`
      },
      {
        kind: "unplugged",
        title: "Unplugged: Human BFS",
        minutes: 10,
        html: `<div class="callout unplugged">
<ol class="steps">
  <li>Tape a 4-column x 3-row grid on the floor (or use the field board). Put books on some lines as walls, matching the challenge maze.</li>
  <li>One student stands on the start cell holding a "0" sticky note.</li>
  <li>Teacher calls "Ripple!" Every student holding a number points to open neighbors; a new student steps into each one and gets the next number. No cell gets two students!</li>
  <li>Keep rippling until someone reaches the goal. Read the goal's number out loud - that's the shortest path length.</li>
  <li>Trace back: the goal student points to a neighbor with one smaller number, and so on to 0. Write down the moves (up, right, ...) on the board.</li>
</ol>
</div>
<div class="callout think"><p><strong>Discuss:</strong> Why does BFS never get fooled by a dead end? What's the downside of exploring every direction at once?</p></div>`
      },
      {
        kind: "code",
        title: "Code: Drive the Shortest Path",
        minutes: 10,
        html: `<p>The challenge maze is a 4 x 3 grid of 24-inch cells. Columns are 0-3 (left to right), rows are 0-2 (top to bottom). The robot starts in column 0, row 2 (bottom-left) and the goal is in column 3, row 0 (top-right).</p>
<ol class="steps">
  <li>Copy the maze onto grid paper and run BFS by hand (write the ripple numbers).</li>
  <li>Trace the shortest path back and write it as numbers 0-3.</li>
  <li>Put the moves in the array and run.</li>
  <li><strong>Extra:</strong> Use a <code>std::vector&lt;int&gt;</code> and <code>push_back()</code> to build the path one move at a time.</li>
</ol>
<div class="callout robot"><p>If you have time, build the same maze on the field board with books and run your code on the real robot. Real robots drift a little each move. After 7 moves, how far off is it?</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 5,
        html: `<div class="callout think"><p><strong>Discuss:</strong> Our robot drove a path we found by hand. How could the robot find the path by itself? (It would need a map of the walls stored in a 2D grid, then run BFS in code!) Video game characters do exactly this.</p></div>`
      }
    ],
    challenge: {
      title: "Shortest Path Through the Grid",
      prompt: `<p>The field is a 4 x 3 grid of 24-inch cells with walls between some cells. Use BFS (by hand or with the widget) to find the shortest path from the bottom-left cell to the goal in the top-right cell.</p>
<p>Store the path in an array as directions (<code>0 = up, 1 = right, 2 = down, 3 = left</code>) and drive it with <code>moveCell(dir)</code>. Don't touch any walls!</p>
<table class="tbl">
<tr><th>Wall</th><th>Where</th></tr>
<tr><td>A</td><td>Between column 0 and column 1, rows 0-1</td></tr>
<tr><td>B</td><td>Between column 1 and column 2, rows 1-2</td></tr>
<tr><td>C</td><td>Between column 2 and column 3, row 0</td></tr>
</table>`,
      starterCode: `#include "vex.h"
using namespace vex;

// 0 = up, 1 = right, 2 = down, 3 = left
void moveCell(int dir) {
  Drivetrain.turnToHeading(dir * 90, degrees);
  Drivetrain.driveFor(forward, 24, inches);
}

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);

  // TODO: find the shortest path with BFS and fill in the moves.
  // The first move is done for you (right).
  int path[7] = {1, 0, 0, 0, 0, 0, 0};
  int steps = 7;

  for (int i = 0; i < steps; i++) {
    // TODO: call moveCell with path[i]
  }

  Brain.Screen.print("Goal reached!");
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

// 0 = up, 1 = right, 2 = down, 3 = left
void moveCell(int dir) {
  Drivetrain.turnToHeading(dir * 90, degrees);
  Drivetrain.driveFor(forward, 24, inches);
}

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);

  int path[7] = {1, 0, 0, 1, 2, 1, 0};
  int steps = 7;

  for (int i = 0; i < steps; i++) {
    moveCell(path[i]);
  }

  Brain.Screen.print("Goal reached!");
  return 0;
}
`,
      hints: [
        "From the start you can't go right in row 0 or row 1 because of wall A, so first move right along the bottom row, then go up column 1.",
        "At the top of column 1, go right into column 2. Wall C blocks going right again, so go down one cell, then right, then up.",
        "The shortest path has 7 moves: right, up, up, right, down, right, up."
      ],
      field: {
        start: { x: 12, y: 60, heading: 0 },
        walls: [
          { x: 23, y: 0, w: 2, h: 48 },
          { x: 47, y: 24, w: 2, h: 48 },
          { x: 71, y: 0, w: 2, h: 24 }
        ],
        goal: { x: 84, y: 12, r: 8 }
      },
      checks: [
        { type: "goal", message: "Robot ends inside the green goal" },
        { type: "noCollision", message: "Robot never hits a wall" },
        { type: "code", pattern: "moveCell\\s*\\(\\s*\\w+\\s*\\[", message: "Executes moves stored in an array or vector" },
        { type: "code", pattern: "for\\s*\\(", message: "Uses a loop to drive the path" }
      ]
    },
    reflection: "Explain to a 5th grader how BFS finds the shortest path. Use the 'ripples in a pond' idea or your own analogy.",
    quiz: [
      {
        q: "In BFS, a cell labeled 4 means...",
        choices: ["It has 4 walls", "It's 4 steps from the start by the shortest route", "It was the 4th cell drawn", "The robot must turn 4 times"],
        answer: 1,
        explain: "BFS labels cells in rings, so the label is the shortest distance from the start."
      },
      {
        q: "With 0 = up, 1 = right, 2 = down, 3 = left, what heading does moveCell(3) turn to?",
        choices: ["3 degrees", "90 degrees", "180 degrees", "270 degrees"],
        answer: 3,
        explain: "dir * 90 = 3 * 90 = 270 degrees, which is facing left."
      },
      {
        q: "Which data structure does BFS use to decide which cell to explore next?",
        choices: ["A queue (first in, first out)", "A random number", "A sorted array only", "A single variable"],
        answer: 0,
        explain: "A queue keeps cells in the order they were found, so closer cells are explored first."
      },
      {
        q: "Why is BFS better than the wall follower for finding the SHORTEST path?",
        choices: ["It's always fewer lines of code", "It checks every route in order of length, so it can't miss a shorter one", "It doesn't need a map", "It drives faster"],
        answer: 1,
        explain: "The wall follower escapes, but it may take a long route. BFS explores in rings, guaranteeing the shortest path."
      }
    ]
  },

  // ---------------------------------------------------------------- u3l7
  {
    id: "u3l7",
    unit: 3,
    order: 19,
    title: "Smooth Moves: Proportional Control",
    minutes: 40,
    tags: ["algorithms", "code"],
    summary: "Replace jerky bang-bang stops with a proportional controller that slows down smoothly as the robot approaches a wall.",
    objectives: [
      "I can calculate error as the difference between the target and the sensor reading.",
      "I can program a P-controller: speed = Kp * error.",
      "I can tune Kp by experiment and describe what happens when it is too small or too big."
    ],
    vocab: [
      { term: "Target (setpoint)", def: "The value you want, like 'stop 8 inches from the wall'." },
      { term: "Error", def: "How far you are from the target: error = reading - target." },
      { term: "Proportional control", def: "Making the output (speed) proportional to the error: far away = fast, close = slow." },
      { term: "Kp (gain)", def: "The number that multiplies the error. It sets how aggressively the robot reacts." },
      { term: "Tuning", def: "Trying different values of Kp and measuring the result to find the best one." },
      { term: "Feedback loop", def: "A loop that measures, decides and acts over and over, using the latest sensor reading each time." }
    ],
    materials: [
      "VEX IQ BaseBots with Distance sensor facing forward",
      "A wall (field perimeter or a sturdy box)",
      "Rulers or tape measures",
      "Tuning table worksheet"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Park the Car",
        minutes: 5,
        html: `<p>Think about how a good driver pulls up to a stop sign. Do they drive full speed and then slam the brakes? Or slow down gradually?</p>
<p>Sketch a graph: <strong>distance to the stop sign</strong> (x-axis) vs <strong>speed</strong> (y-axis) for a smooth driver.</p>
<div class="callout think"><p>What shape did you draw? What would the graph look like for a robot using <code>if (distance &gt; 8) drive; else stop;</code>?</p></div>`
      },
      {
        kind: "learn",
        title: "Error and Proportional Control",
        minutes: 10,
        html: `<p>Our old approach was bang-bang: full speed until the wall, then STOP. The robot jerks, and at high speed it overshoots and can bump the wall.</p>
<p><strong>Proportional control</strong> makes speed depend on how far we still have to go:</p>
<pre class="code">error = distance - target      // inches still to go
speed = Kp * error             // far = fast, close = slow</pre>
<table class="tbl">
<tr><th>Distance</th><th>Error (target 8)</th><th>Speed with Kp = 3</th></tr>
<tr><td>48 in</td><td>40</td><td>120 &rarr; capped at 100%</td></tr>
<tr><td>28 in</td><td>20</td><td>60%</td></tr>
<tr><td>12 in</td><td>4</td><td>12%</td></tr>
<tr><td>8.5 in</td><td>0.5</td><td>1.5% (almost stopped)</td></tr>
</table>
<p>In VEX C++ we change speed while driving:</p>
<pre class="code">Drivetrain.drive(forward);
while (error > 0.5) {
  error = DistanceSensor.objectDistance(inches) - target;
  speed = Kp * error;
  if (speed > 100) speed = 100;
  Drivetrain.setDriveVelocity(speed, percent);
  wait(20, msec);
}
Drivetrain.stop();</pre>
<div class="callout tip"><p>This is a <strong>feedback loop</strong>: measure &rarr; calculate &rarr; act, 50 times per second. Self-driving cars, drones, thermostats and even your body's balance use the same idea.</p></div>`
      },
      {
        kind: "activity",
        title: "Robot Activity: Tune Kp",
        minutes: 13,
        html: `<div class="callout robot">
<ol class="steps">
  <li>Place the robot 48 in from the wall, facing it. Mark the start with tape.</li>
  <li>Run the P-controller with each Kp in the table. The Measurer uses a ruler to record the final distance from the robot's front to the wall. The Timer times the run.</li>
  <li>Watch carefully: does the robot creep at the end? Does it stop short? Does it bump the wall?</li>
  <li>Graph Kp vs time. Pick the "best" Kp and defend your choice to another team.</li>
</ol>
</div>
<table class="tbl">
<tr><th>Kp</th><th>Final distance (in)</th><th>Time (s)</th><th>Notes (smooth? jerky? too slow?)</th></tr>
<tr><td>0.5</td><td></td><td></td><td></td></tr>
<tr><td>1</td><td></td><td></td><td></td></tr>
<tr><td>3</td><td></td><td></td><td></td></tr>
<tr><td>8</td><td></td><td></td><td></td></tr>
<tr><td>20</td><td></td><td></td><td></td></tr>
</table>
<div class="callout warn"><p>Real motors don't move at very low speeds (they need a minimum push to beat friction). If your robot stalls before the target with a small Kp, add a minimum speed: <code>if (speed &lt; 5) speed = 5;</code></p></div>
<div class="callout think"><p><strong>Discuss:</strong> With a big Kp the robot is just like bang-bang. Why? With a tiny Kp, what goes wrong?</p></div>`
      },
      {
        kind: "code",
        title: "Code: P-Control in the Simulator",
        minutes: 7,
        html: `<p>Complete the challenge: the robot starts near the bottom of the field facing the top wall. Use proportional control to stop smoothly about 8 inches from the wall, inside the green goal.</p>
<p>Print the error every loop and watch it shrink. How does it shrink - by the same amount each time, or by a smaller amount each time?</p>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up: Unit 3 Reflection",
        minutes: 5,
        html: `<p>This unit you learned algorithms for <strong>planning</strong> (mazes, BFS), <strong>searching</strong>, <strong>sorting</strong>, and <strong>control</strong> (bang-bang, proportional).</p>
<div class="callout think"><p><strong>Discuss:</strong> Our line follower used bang-bang. How could you use proportional control to make it smoother? (Hint: error = brightness - threshold, turn amount = Kp * error.)</p></div>`
      }
    ],
    challenge: {
      title: "Smooth Stop at the Wall",
      prompt: `<p>The robot starts near the bottom of the field facing the top wall. Use a <strong>P-controller</strong> to drive toward the wall and slow down smoothly, stopping when it's about <strong>8 inches</strong> from the wall (inside the green goal).</p>
<pre class="code">error = DistanceSensor.objectDistance(inches) - target
speed = Kp * error   (cap it at 100)</pre>
<p>Don't touch the wall! Try different Kp values and see how the stop changes.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  double target = 8;    // inches from the wall
  double Kp = 0;        // TODO: try a value like 3
  double error = DistanceSensor.objectDistance(inches) - target;

  Drivetrain.setDriveVelocity(0, percent);
  Drivetrain.drive(forward);

  while (error > 0.5) {
    // TODO 1: update error using the Distance sensor

    // TODO 2: speed is the gain times the error, capped at 100
    double speed = 0;

    Drivetrain.setDriveVelocity(speed, percent);
    std::cout << "error: " << error << std::endl;
    wait(20, msec);
  }

  Drivetrain.stop();
  Brain.Screen.print("Parked!");
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  double target = 8;
  double Kp = 3;
  double error = DistanceSensor.objectDistance(inches) - target;

  Drivetrain.setDriveVelocity(0, percent);
  Drivetrain.drive(forward);

  while (error > 0.5) {
    error = DistanceSensor.objectDistance(inches) - target;
    double speed = Kp * error;
    if (speed > 100) {
      speed = 100;
    }
    Drivetrain.setDriveVelocity(speed, percent);
    std::cout << "error: " << error << std::endl;
    wait(20, msec);
  }

  Drivetrain.stop();
  Brain.Screen.print("Parked!");
  return 0;
}
`,
      hints: [
        "error = DistanceSensor.objectDistance(inches) - target; goes at the top of the loop.",
        "double speed = Kp * error; then if (speed > 100) { speed = 100; }",
        "If the robot never moves, check that Kp isn't 0!"
      ],
      field: {
        start: { x: 48, y: 60, heading: 0 },
        goal: { x: 48, y: 11, r: 6 }
      },
      checks: [
        { type: "goal", message: "Robot stops inside the green goal near the wall" },
        { type: "noCollision", message: "Robot never hits the wall" },
        { type: "code", pattern: "Kp\\s*\\*", message: "Calculates speed = Kp * error" },
        { type: "code", pattern: "setDriveVelocity\\s*\\(\\s*speed", message: "Sets the drive speed from the controller" }
      ]
    },
    reflection: "Describe what happened when Kp was too small and when it was too big. Which Kp did your team choose, and why?",
    quiz: [
      {
        q: "Target is 8 in. The sensor reads 20 in. What is the error?",
        choices: ["8", "12", "20", "28"],
        answer: 1,
        explain: "error = reading - target = 20 - 8 = 12."
      },
      {
        q: "With Kp = 4 and error = 10, what speed does the P-controller ask for?",
        choices: ["4%", "14%", "40%", "100%"],
        answer: 2,
        explain: "speed = Kp * error = 4 * 10 = 40%."
      },
      {
        q: "As the robot gets closer to the target, a P-controller makes it...",
        choices: ["Speed up", "Slow down", "Turn around", "Keep the same speed"],
        answer: 1,
        explain: "Smaller error means smaller speed, so the robot slows smoothly."
      },
      {
        q: "A very large Kp makes the P-controller behave most like...",
        choices: ["Bang-bang control", "Binary search", "Bubble sort", "A turned-off robot"],
        answer: 0,
        explain: "With a huge Kp the speed is 100% almost all the way, then drops suddenly, just like bang-bang."
      },
      {
        q: "Why do we put wait(20, msec) inside the control loop?",
        choices: ["To make the robot sleep", "To give the robot time to move before measuring again", "Because C++ requires it", "To turn the sensor off"],
        answer: 1,
        explain: "The loop runs about 50 times per second, giving the robot time to move between readings."
      }
    ]
  }
];
