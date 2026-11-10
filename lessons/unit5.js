// Unit 5: Capstone
// The rescue field is shared by u5l1 and u5l2.
// Reference route (robot center): start (14,60) heading 0
//  fwd 22 -> (14,38), grab blue cube at (14,30); rev 22 -> (14,60); right 90; fwd 56 -> (70,60);
//  release (cube ~x78 in blue zone); rev 10 -> (60,60); left 90; fwd 34 -> (60,26), grab red cube at (60,18);
//  right 90 (cube swings to ~ (68,26)); fwd 10 -> (70,26); release (cube ~ (78,26) in red zone); rev 8.
const rescueField = {
  start: { x: 14, y: 60, heading: 0 },
  walls: [{ x: 40, y: 14, w: 6, h: 34 }],
  cubes: [
    { x: 14, y: 30, color: "blue" },
    { x: 60, y: 18, color: "red" }
  ],
  zones: [
    { x: 72, y: 50, w: 18, h: 18, color: "blue" },
    { x: 70, y: 8, w: 20, h: 24, color: "red" }
  ]
};

module.exports = [
  // ---------------------------------------------------------------- u5l1
  {
    id: "u5l1",
    unit: 5,
    order: 27,
    title: "Capstone: Design a Rescue Robot",
    minutes: 40,
    tags: ["build", "code", "algorithms", "ai"],
    summary: "Your team gets a mission: design an autonomous rescue robot that finds victims, carries them to safety and avoids hazards. Today you plan like real engineers.",
    objectives: [
      "I can use the engineering design process to plan a robot project.",
      "I can compare design ideas with a decision matrix.",
      "I can break a big mission into subgoals and write them as pseudocode and function stubs.",
      "I can program the first subgoal: drive to a cube and grab it."
    ],
    vocab: [
      { term: "Engineering design process", def: "A cycle engineers use: Ask, Imagine, Plan, Create, Test, Improve - and repeat." },
      { term: "Design brief", def: "A short description of the problem, the goal, and the rules (constraints) of a project." },
      { term: "Constraint", def: "A limit you must work within, like time, parts, field size or rules." },
      { term: "Decision matrix", def: "A table that scores several ideas on the same criteria so a team can pick the best one fairly." },
      { term: "Pseudocode", def: "A plan for a program written in plain language, step by step, before writing real code." },
      { term: "Function stub", def: "A function with a name and empty (or very simple) body, written first so the plan is clear and can be filled in later." }
    ],
    materials: [
      "VEX IQ kit per team (robot with claw, Distance Sensor, Optical sensor, bumper)",
      "VEX field board set up as the rescue scenario: 2-3 cubes (victims), colored tape safe zones, wall pieces as rubble",
      "Engineering notebooks or planning sheet",
      "Chart paper and markers",
      "Your team's Robot Code of Ethics (if you did the AI Ethics lesson)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Mission Briefing",
        minutes: 5,
        html: `<div class="callout robot">
<p><strong>INCOMING MESSAGE:</strong> An earthquake has hit VEX City. Buildings have collapsed and it is too dangerous for human rescuers to go in. Your team must build an <strong>autonomous rescue robot</strong> that:</p>
<ul>
<li>finds the "victims" (cubes),</li>
<li>carries each one to the safe zone of its color,</li>
<li>never crashes into the rubble (walls),</li>
<li>runs completely on its own - no controller!</li>
</ul>
</div>
<div class="callout think"><p>Quick write: What is the hardest part of this mission? What do you already know from Units 1-4 that will help?</p></div>`
      },
      {
        kind: "learn",
        title: "Think Like an Engineer",
        minutes: 8,
        html: `<p>Real engineers don't just start building. They follow the <strong>engineering design process</strong>:</p>
<ol>
<li><strong>Ask</strong> - What exactly is the problem? What are the rules?</li>
<li><strong>Imagine</strong> - Brainstorm many ideas. No idea is too silly yet.</li>
<li><strong>Plan</strong> - Pick the best idea, draw it, write pseudocode.</li>
<li><strong>Create</strong> - Build and code it.</li>
<li><strong>Test</strong> - Run it. Record what happens.</li>
<li><strong>Improve</strong> - Fix the biggest problem, then test again.</li>
</ol>
<h3>Design Brief</h3>
<table class="tbl">
<tr><th>Problem</th><td>Victims (cubes) are trapped in a disaster zone with rubble.</td></tr>
<tr><th>Goal</th><td>Move every cube into the zone of matching color, autonomously.</td></tr>
<tr><th>Constraints</th><td>VEX IQ kit parts only. 2 minutes per run. No touching the robot during the run. Robot must start in the start square.</td></tr>
<tr><th>Success</th><td>All cubes in zones, zero wall hits, code organized into functions.</td></tr>
</table>
<h3>Break it into subgoals</h3>
<p>A huge mission is scary. A list of small subgoals is not. Write the plan as <strong>pseudocode</strong> and <strong>function stubs</strong> first:</p>
<pre class="code">// MISSION PLAN
// 1. Drive to victim 1 and grab it
// 2. Back out and turn toward the blue safe zone
// 3. Drive into the zone and release
// 4. Go to victim 2 and grab it
// 5. Turn toward the red safe zone, drive, release

void grab() {
  // TODO: close claw
}
void goToVictim1() {
  // TODO: drive forward until the cube is in the claw
}</pre>`
      },
      {
        kind: "activity",
        title: "Team Planning Session",
        minutes: 15,
        html: `<div class="callout tip"><p><strong>🧊 Design your rescue robot in CAD Studio.</strong> The Lead Builder opens <a class="btn sm" data-app="cad">CAD Studio ↗</a> <button class="btn sm" type="button" data-side="cad" title="Put CAD Studio and RoboCode side by side">⧉</button> and models the team's chosen design: drivetrain, claw and where each sensor mounts. Show the design to your teacher before you start building.</p></div>
<div data-vex="plowbot basebot"></div>
<div class="callout robot">
<p><strong>Team activity (groups of 3-4):</strong></p>
<ol class="steps">
<li><strong>Assign roles</strong> (everyone still helps everywhere):
  <ul>
  <li><em>Lead Builder</em> - in charge of the robot hardware.</li>
  <li><em>Lead Programmer</em> - in charge of the code file.</li>
  <li><em>Test Engineer</em> - runs tests and keeps the testing log.</li>
  <li><em>Project Manager</em> - keeps time, keeps the notebook, prepares the showcase.</li>
  </ul></li>
<li><strong>Imagine:</strong> brainstorm at least 3 strategies. For example: (A) fixed driving distances, (B) use the Distance Sensor to find each cube, (C) follow a tape line to each victim.</li>
<li><strong>Decision matrix:</strong> score each strategy 1-5 on each criterion and add it up.</li>
<li><strong>Draw the field</strong> on paper. Mark the start, cubes, zones, rubble, and draw your robot's path with arrows. Measure the distances on the real VEX board.</li>
<li><strong>Write a flowchart or pseudocode</strong> for the whole mission. Circle subgoal 1.</li>
<li><strong>Build plan:</strong> list what your robot needs (claw, Distance Sensor on the front, Optical sensor under it). Is it safe? What could go wrong for people nearby?</li>
</ol>
</div>
<h3>Example decision matrix</h3>
<table class="tbl">
<tr><th>Strategy</th><th>Reliable (x2)</th><th>Easy to code</th><th>Works if cubes move</th><th>Total</th></tr>
<tr><td>A: Fixed distances</td><td>4 (x2 = 8)</td><td>5</td><td>1</td><td>14</td></tr>
<tr><td>B: Distance Sensor search</td><td>3 (x2 = 6)</td><td>2</td><td>5</td><td>13</td></tr>
<tr><td>C: Follow tape lines</td><td>4 (x2 = 8)</td><td>3</td><td>2</td><td>13</td></tr>
</table>
<p>A criterion can count double if it matters most. Close scores? Combine ideas: fixed distances first, sensors as an upgrade.</p>
<h3>Capstone rubric</h3>
<table class="tbl">
<tr><th>Category</th><th>4 - Expert</th><th>3 - Proficient</th><th>2 - Developing</th><th>1 - Beginning</th></tr>
<tr><td>Mission performance</td><td>All cubes in correct zones, no wall hits</td><td>Most cubes delivered, at most 1 hit</td><td>1 cube delivered</td><td>Robot moves but delivers none</td></tr>
<tr><td>Code quality</td><td>Clear functions, comments, uses sensors or loops</td><td>Functions and comments</td><td>Works but one long main()</td><td>Code does not run</td></tr>
<tr><td>Design process</td><td>Plan, decision matrix, testing log with 5+ tests and fixes</td><td>Plan and 3+ logged tests</td><td>Plan only</td><td>No documentation</td></tr>
<tr><td>Teamwork</td><td>Every member has a clear role and contributes</td><td>Most members contribute</td><td>One person does most work</td><td>Team did not cooperate</td></tr>
<tr><td>Showcase</td><td>Clear demo, explains AI/algorithm choices, reflects on growth</td><td>Clear demo and explanation</td><td>Demo only</td><td>Did not present</td></tr>
</table>`
      },
      {
        kind: "code",
        title: "Code: Subgoal 1 - Rescue the First Victim",
        minutes: 8,
        html: `<p>The Lead Programmer types the team's mission plan as comments and function stubs. Then the team codes subgoal 1 only: drive to the blue cube and grab it.</p>
<p>The claw can grab a cube that is just in front of the robot's front edge (within about 6 inches). The robot's center is about 5 inches behind its front.</p>
<div class="callout tip"><p><strong>Test small:</strong> don't write the whole mission today. A tested subgoal is worth more than a whole untested program.</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 4,
        html: `<p>Each Project Manager reports in one sentence: "Our strategy is ___ because ___. Our biggest risk is ___." The teacher collects the decision matrices.</p>`
      }
    ],
    challenge: {
      title: "Plan as Code + Rescue Victim 1",
      prompt: `<p>The blue victim cube is straight ahead of the robot, 30 inches from the robot's center. Rubble and safe zones are already on the field.</p>
<ol>
<li>Write your <strong>mission plan</strong> as comments at the top of <code>main()</code> (your teacher reviews the plan; the auto-checker ignores comments).</li>
<li>Fill in the function stubs <code>grab()</code> and <code>goToVictim1()</code>. Leave the later functions as stubs for next lesson.</li>
<li>Drive so the cube ends up just in front of the claw (the robot's center about 8 inches from the cube), grab it, and print <code>Victim 1 secured</code>.</li>
</ol>`,
      starterCode: `#include "vex.h"
using namespace vex;

// ---------- FUNCTION STUBS ----------
void grab() {
  // TODO: close the claw (ClawMotor forward 90 degrees)
}

void release() {
  // TODO (next lesson): open the claw
}

void goToVictim1() {
  // TODO: drive forward so the cube is right in front of the claw
  // Cube center is 30 in ahead of the robot's center.
  // The front of the robot is 5 in ahead of the center.
}

void deliverVictim1() {
  // TODO (next lesson)
}

int main() {
  // MISSION PLAN (pseudocode)
  // 1. TODO
  // 2. TODO
  // 3. TODO
  // 4. TODO

  Drivetrain.setDriveVelocity(50, percent);
  goToVictim1();
  grab();
  std::cout << "Victim 1 secured" << std::endl;
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

// ---------- FUNCTIONS ----------
void grab() {
  ClawMotor.spinFor(forward, 90, degrees);
}

void release() {
  // next lesson
}

void goToVictim1() {
  // cube is 30 in ahead, stop with the center about 8 in from it
  Drivetrain.driveFor(forward, 22, inches);
}

void deliverVictim1() {
  // next lesson
}

int main() {
  // MISSION PLAN (pseudocode)
  // 1. Drive to the blue cube and grab it
  // 2. Back up to the start and turn right
  // 3. Drive under the rubble into the blue zone and release
  // 4. Drive to the red cube, grab it, carry it to the red zone

  Drivetrain.setDriveVelocity(50, percent);
  goToVictim1();
  grab();
  std::cout << "Victim 1 secured" << std::endl;
  return 0;
}
`,
      hints: [
        "30 in to the cube minus about 8 in = drive forward about 22 inches.",
        "grab() needs just one line: ClawMotor.spinFor(forward, 90, degrees);",
        "Write at least 4 pseudocode steps: what happens after the grab?"
      ],
      field: rescueField,
      checks: [
        { type: "code", pattern: "void\\s+goToVictim1\\s*\\(\\s*\\)\\s*\\{[\\s\\S]*?driveFor", message: "goToVictim1() drives the robot" },
        { type: "code", pattern: "ClawMotor\\.spinFor\\s*\\(\\s*forward", message: "grab() closes the claw" },
        { type: "code", pattern: "void\\s+deliverVictim1\\s*\\(", message: "Keeps a function stub for the next subgoal" },
        { type: "output", pattern: "Victim 1 secured", message: "Prints Victim 1 secured" },
        { type: "noCollision", message: "Robot never hits a wall" }
      ]
    },
    reflection: "Which strategy did your team choose in the decision matrix, and why? What is one risk in your plan and how will you test for it?",
    quiz: [
      {
        q: "What is the correct order of the engineering design process?",
        choices: [
          "Create, Test, Ask, Plan",
          "Ask, Imagine, Plan, Create, Test, Improve",
          "Test, Improve, Ask, Create",
          "Plan, Create, Ask, Imagine"
        ],
        answer: 1,
        explain: "Understand the problem first, then imagine, plan, create, test and improve (and repeat)."
      },
      {
        q: "What is a decision matrix used for?",
        choices: [
          "Storing sensor values",
          "Scoring several ideas on the same criteria to choose fairly",
          "Drawing the robot",
          "Keeping a record of how long the robot takes to complete each part of the mission during every test"
        ],
        answer: 1,
        explain: "It compares ideas on the same criteria so the team chooses with reasons, not just opinions."
      },
      {
        q: "Why write function stubs before the real code?",
        choices: [
          "They let the robot skip the empty functions, which makes the final program run faster during the mission",
          "They make the plan visible in the code and let you build and test one piece at a time",
          "C++ requires empty functions",
          "So you never have to finish them"
        ],
        answer: 1,
        explain: "Stubs turn the plan into structure; you fill them in and test them one by one."
      },
      {
        q: "The cube is 30 in from the robot's center and the claw grabs best when the center is about 8 in from the cube. How far should the robot drive?",
        choices: ["8 in", "22 in", "30 in", "38 in"],
        answer: 1,
        explain: "30 - 8 = 22 inches."
      }
    ]
  },

  // ---------------------------------------------------------------- u5l2
  {
    id: "u5l2",
    unit: 5,
    order: 28,
    title: "Capstone: Build, Code, Test",
    minutes: 40,
    tags: ["build", "code", "algorithms"],
    summary: "Build, code and test your rescue robot. Keep a testing log, debug like a pro, and complete the full rescue mission.",
    objectives: [
      "I can build and improve my robot through repeated testing (iteration).",
      "I can keep a testing log that records what happened and what I changed.",
      "I can use debugging strategies to find and fix problems.",
      "I can complete a multi-step autonomous mission using functions."
    ],
    vocab: [
      { term: "Iteration", def: "One round of build-test-improve. Good projects go through many iterations." },
      { term: "Testing log", def: "A table that records each test: what you tried, what happened, and what you will change." },
      { term: "Debugging", def: "Finding and fixing the cause of a problem in code or hardware." },
      { term: "Print debugging", def: "Printing values (like sensor readings or the current step) so you can see what the program is really doing." },
      { term: "Rubber duck debugging", def: "Explaining your code line by line to someone (or a rubber duck). Saying it out loud often reveals the bug." },
      { term: "Edge case", def: "An unusual situation that can break your program, like a cube placed a little off its spot." }
    ],
    materials: [
      "VEX IQ kit per team",
      "VEX field board set up as the rescue scenario",
      "Testing log sheets (or the table below in notebooks)",
      "Tape measure",
      "A rubber duck or any small toy (optional, for debugging!)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Bug Hunt",
        minutes: 5,
        html: `<p>This robot should drive to the cube, grab it, and back up. Instead it backs up without the cube. Find the bug!</p>
<pre class="code">void grab() {
  ClawMotor.spinFor(reverse, 90, degrees);
}

int main() {
  Drivetrain.driveFor(forward, 22, inches);
  grab();
  Drivetrain.driveFor(reverse, 22, inches);
}</pre>
<p><em>Answer: <code>reverse</code> opens the claw. To grab, the claw must spin <code>forward</code>.</em></p>`
      },
      {
        kind: "learn",
        title: "Test, Log, Debug, Repeat",
        minutes: 6,
        html: `<p>Nobody's robot works the first time. Professional engineers expect failure and plan for it with <strong>iteration</strong>: change one thing, test, record, repeat.</p>
<h3>The testing log</h3>
<table class="tbl">
<tr><th>Test #</th><th>What we tried</th><th>What happened</th><th>Next change</th></tr>
<tr><td>1</td><td>Drive 22 in, grab</td><td>Claw closed 2 in short of the cube</td><td>Drive 24 in</td></tr>
<tr><td>2</td><td>Drive 24 in, grab</td><td>Got the cube!</td><td>Start on subgoal 2</td></tr>
<tr><td>3</td><td>Turn right 90, drive 56</td><td>Turned 80 degrees, rubbed the rubble</td><td>Lower turn velocity to 30%</td></tr>
</table>
<h3>Debugging strategies</h3>
<ul>
<li><strong>Print debugging:</strong> print the step number and sensor values: <code>std::cout &lt;&lt; "step 3, d = " &lt;&lt; d &lt;&lt; std::endl;</code></li>
<li><strong>Test one function at a time:</strong> comment out everything else in <code>main()</code>.</li>
<li><strong>Change ONE thing per test.</strong> Otherwise you won't know which change fixed it.</li>
<li><strong>Rubber duck:</strong> explain your code line by line to a teammate or a toy.</li>
<li><strong>Is it code or hardware?</strong> Run it in the simulator. Works there but not on the real board? Check loose wires, batteries, wheel friction.</li>
</ul>`
      },
      {
        kind: "build",
        title: "Build & Test Sprint",
        minutes: 18,
        html: `<div class="callout tip"><p><strong>🧊 Keep your CAD design up to date.</strong> When testing makes you change the robot, update it in <a class="btn sm" data-app="cad">CAD Studio ↗</a> too, so your design matches the real robot for the showcase.</p></div>
<div class="callout robot">
<p><strong>Team sprint on the VEX board:</strong></p>
<ol class="steps">
<li><strong>(Builder)</strong> Make sure the claw opens wide and grips a cube firmly. Mount the Distance Sensor on the front, low enough to see walls.</li>
<li><strong>(Programmer)</strong> Fill in one function at a time from your plan. Test it in the simulator first.</li>
<li><strong>(Test Engineer)</strong> Run it on the real board. Fill in one row of the testing log for EVERY run.</li>
<li><strong>(Project Manager)</strong> Every 6 minutes call "checkpoint!": the team says which subgoal is done and which is next.</li>
<li>When subgoal 1 works 3 times in a row, move to subgoal 2. Repeat.</li>
<li>Upgrade challenge: replace one fixed distance with a sensor (e.g. drive until <code>DistanceSensor.objectDistance(inches)</code> is less than a value). Is it more reliable when a cube is moved 2 inches?</li>
</ol>
</div>
<div class="callout think"><p><strong>Stuck for more than 5 minutes?</strong> Ask another team's Test Engineer to watch one run. Fresh eyes find bugs fast.</p></div>`
      },
      {
        kind: "code",
        title: "Code: The Full Mission (Simulator)",
        minutes: 8,
        html: `<p>Complete the full rescue mission in the simulator using the helper functions. Plan the route on paper first. All measurements are from the robot's center:</p>
<ul>
<li>Start: (14, 60), facing up.</li>
<li>Blue cube: 30 in straight ahead. Blue zone: lower right corner.</li>
<li>Red cube: at x = 60, near the top. Red zone: upper right corner.</li>
<li>Rubble wall: x 40-46, from y 14 to y 48. Go <em>under</em> it (at y = 60).</li>
</ul>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Each Test Engineer shares the most useful row from their testing log: "We changed ___ and it fixed ___." Clean up the field for the next class.</p>`
      }
    ],
    challenge: {
      title: "Full Rescue Mission",
      prompt: `<p>Rescue both victims! Put the <strong>blue cube in the blue zone</strong> and the <strong>red cube in the red zone</strong> without touching any wall.</p>
<p>Suggested route (robot center, use the helper functions):</p>
<ol>
<li>Forward 22, grab. Reverse 22 back to the start.</li>
<li>Turn right, forward 56 under the rubble, release. Reverse 10.</li>
<li>Turn left, forward 34 to the red cube, grab.</li>
<li>Turn right, forward 10, release. Reverse 8. Print <code>Mission complete</code>.</li>
</ol>`,
      starterCode: `#include "vex.h"
using namespace vex;

// ---------- HELPER FUNCTIONS ----------
void forwardIn(double d) {
  Drivetrain.driveFor(forward, d, inches);
}

void backIn(double d) {
  Drivetrain.driveFor(reverse, d, inches);
}

void turnRight() {
  Drivetrain.turnFor(right, 90, degrees);
}

void turnLeft() {
  Drivetrain.turnFor(left, 90, degrees);
}

void grab() {
  ClawMotor.spinFor(forward, 90, degrees);
}

void release() {
  ClawMotor.spinFor(reverse, 90, degrees);
}

// ---------- MISSION STEPS ----------
void rescueBlue() {
  forwardIn(22);
  grab();
  std::cout << "Victim 1 secured" << std::endl;
  // TODO: back out, turn toward the blue zone, drive under the rubble, release, back up
}

void rescueRed() {
  // TODO: turn toward the red cube, drive to it, grab
  // TODO: turn toward the red zone, drive in, release, back up
}

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(40, percent);
  rescueBlue();
  rescueRed();
  std::cout << "Mission complete" << std::endl;
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

void forwardIn(double d) {
  Drivetrain.driveFor(forward, d, inches);
}

void backIn(double d) {
  Drivetrain.driveFor(reverse, d, inches);
}

void turnRight() {
  Drivetrain.turnFor(right, 90, degrees);
}

void turnLeft() {
  Drivetrain.turnFor(left, 90, degrees);
}

void grab() {
  ClawMotor.spinFor(forward, 90, degrees);
}

void release() {
  ClawMotor.spinFor(reverse, 90, degrees);
}

void rescueBlue() {
  forwardIn(22);
  grab();
  std::cout << "Victim 1 secured" << std::endl;
  backIn(22);
  turnRight();
  forwardIn(56);
  release();
  backIn(10);
}

void rescueRed() {
  turnLeft();
  forwardIn(34);
  grab();
  std::cout << "Victim 2 secured" << std::endl;
  turnRight();
  forwardIn(10);
  release();
  backIn(8);
}

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(40, percent);
  rescueBlue();
  rescueRed();
  std::cout << "Mission complete" << std::endl;
  return 0;
}
`,
      hints: [
        "rescueBlue after the grab: backIn(22); turnRight(); forwardIn(56); release(); backIn(10);",
        "After rescueBlue the robot is at (60, 60) facing right. turnLeft() faces it up toward the red cube at y = 18.",
        "rescueRed: turnLeft(); forwardIn(34); grab(); turnRight(); forwardIn(10); release(); backIn(8);"
      ],
      field: rescueField,
      checks: [
        { type: "cubesInZones", message: "Every victim is in the safe zone matching its color" },
        { type: "noCollision", message: "Robot never hits the rubble or the walls" },
        { type: "code", pattern: "void\\s+rescueRed\\s*\\(\\s*\\)\\s*\\{[\\s\\S]*?grab\\s*\\(", message: "rescueRed() uses the helper functions" },
        { type: "output", pattern: "Mission complete", message: "Prints Mission complete" }
      ]
    },
    reflection: "Look at your testing log. What was the hardest bug your team found, how did you find it, and what did you change?",
    quiz: [
      {
        q: "Why should you change only ONE thing between tests?",
        choices: [
          "It is faster",
          "So you know which change caused the result",
          "The robot can only remember one change",
          "Because of the rubric"
        ],
        answer: 1,
        explain: "If you change three things and it works, you don't know which one fixed it."
      },
      {
        q: "What is print debugging?",
        choices: [
          "Printing the whole program on paper so that your team can cross out each line it thinks is not needed",
          "Printing values and step names so you can see what the program is really doing",
          "Deleting all print statements",
          "Using a 3D printer to fix the robot"
        ],
        answer: 1,
        explain: "Printing values shows the real state of the program at each step."
      },
      {
        q: "The code works perfectly in the simulator, but the real robot turns only 80 degrees. What is the most likely cause?",
        choices: [
          "The C++ syntax is wrong",
          "A real-world hardware issue like wheel slip, low battery or high turn speed",
          "The simulator and the real robot use different C++ rules, so the same program always has to be rewritten",
          "The cube is the wrong color"
        ],
        answer: 1,
        explain: "If the logic is right in the simulator, look at physical differences next."
      },
      {
        q: "What does a testing log row NOT need?",
        choices: ["What you tried", "What happened", "What you will change next", "Your favorite color"],
        answer: 3,
        explain: "A log records the test, the result and the next change."
      }
    ]
  },

  // ---------------------------------------------------------------- u5l3
  {
    id: "u5l3",
    unit: 5,
    order: 29,
    title: "Capstone Showcase",
    minutes: 40,
    tags: ["code", "build", "ai"],
    summary: "Show off your rescue robot! Live demos on the VEX board, peer feedback with Glow & Grow, reflection on how far you've come, and a robot victory dance.",
    objectives: [
      "I can present my team's robot, code and design process clearly.",
      "I can give kind, specific and helpful feedback to other teams.",
      "I can reflect on how my skills grew during the course.",
      "I can use functions and loops to create a robot celebration."
    ],
    vocab: [
      { term: "Showcase", def: "An event where teams present their finished work to an audience." },
      { term: "Glow", def: "Specific praise: something another team did really well." },
      { term: "Grow", def: "A kind, specific suggestion for how another team could improve." },
      { term: "Reflection", def: "Thinking back on what you did, what you learned and what you would do differently." },
      { term: "Demo", def: "A live demonstration of your robot doing its job." }
    ],
    materials: [
      "Finished team robots and code",
      "VEX field board set up as the rescue scenario",
      "Glow & Grow sticky notes (two colors)",
      "Projector for showing code (optional)",
      "Certificates or celebration snacks (optional)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Pre-Show Checklist",
        minutes: 5,
        html: `<p>Teams have 5 minutes to get ready:</p>
<ul>
<li>Batteries charged? Robot and controller paired? Program downloaded to the Brain?</li>
<li>Who says what? Every team member speaks at least once.</li>
<li>Pick the ONE thing you are proudest of to show first.</li>
</ul>`
      },
      {
        kind: "activity",
        title: "Live Demos",
        minutes: 18,
        html: `<p>Each team gets about 4 minutes:</p>
<table class="tbl">
<tr><th>Time</th><th>What to present</th></tr>
<tr><td>30 s</td><td><strong>The team:</strong> names and roles.</td></tr>
<tr><td>90 s</td><td><strong>Live demo:</strong> run the rescue mission on the VEX board. (If it fails: that's real engineering! Explain what you think went wrong.)</td></tr>
<tr><td>60 s</td><td><strong>How it works:</strong> show one function or algorithm you're proud of. Did you use sensors, a state machine, a decision tree?</td></tr>
<tr><td>30 s</td><td><strong>The journey:</strong> your best "we changed X and it fixed Y" moment from the testing log.</td></tr>
<tr><td>30 s</td><td><strong>Questions</strong> from the audience.</td></tr>
</table>
<div class="callout robot">
<p><strong>Audience job: Glow &amp; Grow</strong></p>
<ol class="steps">
<li>For every team, write one <strong>Glow</strong> (yellow note): "I liked how your robot ___."</li>
<li>Write one <strong>Grow</strong> (blue note): "Next time you could try ___."</li>
<li>Be specific and kind. "Cool robot" is not specific. "Your claw grabbed every cube on the first try" is!</li>
<li>Stick your notes on that team's poster after their demo.</li>
</ol>
</div>`
      },
      {
        kind: "unplugged",
        title: "Reflection: How Far You've Come",
        minutes: 7,
        html: `<p>Think back to Lesson 1, when the robot was a box of parts and C++ was a mystery. Answer on your own, then share one answer with your team:</p>
<ol>
<li>What can you do now that you couldn't do at the start? (Loops? Functions? Using the claw?)</li>
<li>What was the hardest moment in this course, and how did you get through it?</li>
<li>Read your Glow &amp; Grow notes. Which Grow will you work on next?</li>
<li>Where could you see yourself using robotics, coding or AI in the future?</li>
</ol>
<div class="callout think"><p><strong>Big picture:</strong> You started with a box of parts. Now you can plan, build, code and test a robot that completes a mission, which is what engineers do.</p></div>`
      },
      {
        kind: "code",
        title: "Code: The Victory Lap",
        minutes: 7,
        html: `<p>Every great mission ends with a celebration. Program a <strong>victory dance</strong> using functions and loops, then roll the credits!</p>
<pre class="code">void wiggle() {
  for (int i = 0; i &lt; 3; i++) {
    Drivetrain.turnFor(right, 30, degrees);
    Drivetrain.turnFor(left, 30, degrees);
  }
}</pre>
<div class="callout robot"><p>Run your dance on the real robot in the middle of the VEX board while the class counts down. Best dance moves get a round of applause!</p></div>`
      },
      {
        kind: "wrapup",
        title: "Celebration",
        minutes: 3,
        html: `<p>Congratulations, engineers! Take a team photo with your robot, and the certificate. Thank your teammates: tell each one person something they did that helped the team.</p>`
      }
    ],
    challenge: {
      title: "Victory Dance & Credits",
      prompt: `<p>Optional, but fun! Make the robot celebrate in the middle of the field:</p>
<ul>
<li>Write at least <strong>two dance functions</strong> (e.g. <code>wiggle()</code>, <code>spin()</code>, <code>shuffle()</code>) that use <code>for</code> loops.</li>
<li>Keep the robot near the center: drive no more than 12 inches in any direction.</li>
<li>Roll the credits: print <code>Team: </code> followed by your team name, every member's name, and finally <code>Thanks for watching!</code></li>
</ul>`,
      starterCode: `#include "vex.h"
using namespace vex;

void wiggle() {
  for (int i = 0; i < 3; i++) {
    Drivetrain.turnFor(right, 30, degrees);
    Drivetrain.turnFor(left, 30, degrees);
  }
}

void shuffle() {
  // TODO: use a for loop to drive forward 6 in and back 6 in, 3 times
}

void spin() {
  // TODO: spin all the way around, flash the TouchLED, wave the arm
}

void credits() {
  std::cout << "Team: " << "TODO team name" << std::endl;
  // TODO: print every member's name
  // TODO: print Thanks for watching!
}

int main() {
  Drivetrain.setDriveVelocity(60, percent);
  Drivetrain.setTurnVelocity(80, percent);
  wiggle();
  // TODO: call your other dance moves
  credits();
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

void wiggle() {
  for (int i = 0; i < 3; i++) {
    Drivetrain.turnFor(right, 30, degrees);
    Drivetrain.turnFor(left, 30, degrees);
  }
}

void shuffle() {
  for (int i = 0; i < 3; i++) {
    Drivetrain.driveFor(forward, 6, inches);
    Drivetrain.driveFor(reverse, 6, inches);
  }
}

void spin() {
  TouchLED.setColor(green);
  Drivetrain.turnFor(right, 360, degrees);
  TouchLED.setColor(blue);
  ArmMotor.spinFor(forward, 180, degrees);
  ArmMotor.spinFor(reverse, 180, degrees);
}

void credits() {
  std::cout << "Team: " << "The Rescue Rangers" << std::endl;
  std::cout << "Lead Builder: Maya" << std::endl;
  std::cout << "Lead Programmer: Leo" << std::endl;
  std::cout << "Test Engineer: Priya" << std::endl;
  std::cout << "Project Manager: Sam" << std::endl;
  std::cout << "Thanks for watching!" << std::endl;
}

int main() {
  Drivetrain.setDriveVelocity(60, percent);
  Drivetrain.setTurnVelocity(80, percent);
  wiggle();
  shuffle();
  spin();
  wiggle();
  credits();
  return 0;
}
`,
      hints: [
        "shuffle(): for (int i = 0; i < 3; i++) { Drivetrain.driveFor(forward, 6, inches); Drivetrain.driveFor(reverse, 6, inches); }",
        "spin(): TouchLED.setColor(green); Drivetrain.turnFor(right, 360, degrees); ArmMotor.spinFor(forward, 180, degrees);",
        "Every forward should have a matching reverse so the robot ends near where it started."
      ],
      field: {
        start: { x: 48, y: 36, heading: 0 },
        tiles: [
          { x: 30, y: 18, w: 8, h: 8, color: "red" },
          { x: 58, y: 18, w: 8, h: 8, color: "yellow" },
          { x: 30, y: 46, w: 8, h: 8, color: "blue" },
          { x: 58, y: 46, w: 8, h: 8, color: "green" }
        ]
      },
      checks: [
        { type: "code", pattern: "void\\s+\\w+\\s*\\(\\s*\\)[\\s\\S]*void\\s+\\w+\\s*\\(\\s*\\)", message: "Has at least two dance functions" },
        { type: "code", pattern: "for\\s*\\(", message: "Uses a for loop" },
        { type: "output", pattern: "Team:", message: "Prints the team credits" },
        { type: "output", pattern: "Thanks for watching", message: "Ends with Thanks for watching!" },
        { type: "noCollision", message: "Robot dances without hitting a wall" }
      ]
    },
    reflection: "What is the one skill from this course you are proudest of, and what would you like to build or code next?",
    quiz: [
      {
        q: "Which is the best example of a Glow?",
        choices: [
          "Cool robot",
          "Your claw grabbed every cube on the first try, and your code used clear function names",
          "Your robot was bad",
          "Your robot was really good and everybody liked it, so you probably do not need to change anything"
        ],
        answer: 1,
        explain: "Good feedback is specific and kind."
      },
      {
        q: "Your robot fails during the live demo. What is the best thing to do?",
        choices: [
          "Leave the stage",
          "Blame a teammate",
          "Explain what you think went wrong and how you would fix it",
          "Run the same program again right away without changing anything until it finally works on its own"
        ],
        answer: 2,
        explain: "Explaining failures shows real engineering thinking."
      },
      {
        q: "Why is a dance written as functions like wiggle() and spin() easier to change?",
        choices: [
          "Functions run faster",
          "Each move has a name and is in one place, so you can reorder or reuse it easily",
          "C++ requires functions for dancing",
          "Functions make each move run at the same speed, which the robot needs in order to keep the dance in time"
        ],
        answer: 1,
        explain: "Functions break a program into named, reusable pieces."
      }
    ]
  }
];
