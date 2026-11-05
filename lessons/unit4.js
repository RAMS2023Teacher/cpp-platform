// Unit 4: Artificial Intelligence
module.exports = [
  // ---------------------------------------------------------------- u4l1
  {
    id: "u4l1",
    unit: 4,
    order: 17,
    title: "What Is AI?",
    minutes: 35,
    tags: ["ai", "code"],
    summary: "Tell AI apart from regular programs, sort everyday tech into AI or not, and make a robot that avoids walls on its own for 20 seconds.",
    objectives: [
      "I can explain the difference between a program that follows rules and a system that learns from data.",
      "I can give real examples of AI in daily life and explain why they count as AI.",
      "I can describe how a robot senses, thinks and acts.",
      "I can program a reactive robot that avoids walls without anyone driving it."
    ],
    vocab: [
      { term: "Artificial Intelligence (AI)", def: "Computer systems that do tasks we usually think need human thinking, like recognizing pictures, understanding speech or making decisions." },
      { term: "Rule-based program", def: "A program where a human wrote every rule (if this, then that). It does exactly what the rules say." },
      { term: "Machine learning", def: "A kind of AI where the computer finds its own patterns from lots of examples (data) instead of being given every rule." },
      { term: "Perception", def: "How a robot turns sensor readings (numbers) into information about the world, like 'a wall is 10 inches ahead'." },
      { term: "Autonomous", def: "Able to work on its own, without a human controlling it while it runs." },
      { term: "Reactive behavior", def: "A behavior where the robot responds right away to what its sensors detect, with no long-term plan." }
    ],
    materials: [
      "VEX IQ robot with Distance Sensor mounted on the front",
      "VEX field board with walls",
      "\"AI or Not AI?\" cards (printed list below, cut into cards, one set per team)",
      "Stopwatch or phone timer",
      "Whiteboard"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Is My Toaster Smart?",
        minutes: 5,
        html: `<p>Write down your answer in 1 minute, then share with a partner:</p>
<div class="callout think">
<p><strong>A toaster pops when the timer ends. A phone camera finds faces and draws boxes around them. Which one is "intelligent"? Why?</strong></p>
</div>
<p>Hook: You have already built a robot that follows a line and a robot that finds the shortest path through a maze. Was that robot <em>intelligent</em>? By the end of today you will be able to argue either side like a pro.</p>`
      },
      {
        kind: "learn",
        title: "Rules vs. Learning",
        minutes: 8,
        html: `<p><strong>Artificial Intelligence (AI)</strong> is a big umbrella word for computer systems that do things we normally think need human thinking: recognizing a face, understanding speech, choosing a good move in a game, steering a car.</p>
<p>There are two main ways to make a computer act "smart":</p>
<table class="tbl">
<tr><th></th><th>Rule-based (classic) program</th><th>Machine learning</th></tr>
<tr><td>Who makes the rules?</td><td>A human programmer writes every rule.</td><td>The computer finds patterns from many examples (data).</td></tr>
<tr><td>Example</td><td>"If distance is less than 15 inches, turn right."</td><td>Show it 10,000 cat photos and 10,000 dog photos; it learns what makes a cat look like a cat.</td></tr>
<tr><td>Good at</td><td>Clear, predictable tasks.</td><td>Messy tasks where rules are hard to write down (faces, voices, handwriting).</td></tr>
<tr><td>Weakness</td><td>Breaks when something happens that the programmer did not think of.</td><td>Only as good as its data. It can be confidently wrong.</td></tr>
</table>
<div class="callout tip"><p><strong>Truth check:</strong> AI is not magic and it is not alive. Today's AI does not "understand" the world the way you do. It is math that finds patterns. Very useful math, but still math.</p></div>
<h3>Sense - Think - Act (revisited)</h3>
<p>Every robot, smart or not, runs the same loop:</p>
<ol>
<li><strong>Sense</strong> - read sensors (distance, color, bumper, gyro).</li>
<li><strong>Think</strong> - decide what to do (an <code>if</code>, a decision tree, a learned model...).</li>
<li><strong>Act</strong> - move motors, light the TouchLED, print to the screen.</li>
</ol>
<p>AI mostly lives in the <strong>Think</strong> step, but it also helps with <strong>perception</strong>: turning raw numbers into meaning. Your Distance Sensor only gives a number like <code>11.8</code>. Your code is what decides that means "wall ahead, danger!"</p>
<pre class="code">// SENSE
double d = DistanceSensor.objectDistance(inches);
// THINK
if (d &lt; 15) {
  // ACT
  Drivetrain.turnFor(right, 90, degrees);
}</pre>`
      },
      {
        kind: "unplugged",
        title: "Card Sort: AI or Not AI?",
        minutes: 8,
        html: `<p>In teams of 3-4, sort each card into one of three piles: <strong>AI</strong>, <strong>Not AI</strong>, <strong>It depends</strong>. You must agree on a reason for each card.</p>
<table class="tbl">
<tr><th>#</th><th>Card</th></tr>
<tr><td>1</td><td>A video app recommending what to watch next</td></tr>
<tr><td>2</td><td>A microwave that beeps after 2 minutes</td></tr>
<tr><td>3</td><td>A phone unlocking when it recognizes your face</td></tr>
<tr><td>4</td><td>A calculator doing 348 x 27</td></tr>
<tr><td>5</td><td>A spam filter in your email</td></tr>
<tr><td>6</td><td>A traffic light on a fixed timer</td></tr>
<tr><td>7</td><td>A voice assistant answering "What's the weather?"</td></tr>
<tr><td>8</td><td>A robot vacuum that maps your room</td></tr>
<tr><td>9</td><td>Our line-following robot from Unit 3</td></tr>
<tr><td>10</td><td>A chatbot writing a poem</td></tr>
</table>
<div class="callout think"><p><strong>Discuss:</strong> Which cards caused the biggest argument on your team? Usually it is the robot vacuum and our own line follower. Our line follower uses rules a human wrote, so most experts call it a <em>rule-based</em> program, not machine learning. Some people still call clever rule-based systems "AI". That is why "It depends" is an OK answer if you can explain it.</p></div>
<p><em>Teacher key (one good answer):</em> AI: 1, 3, 5, 7, 10. Not AI: 2, 4, 6. It depends: 8 (simple vacuums just bump and turn; newer ones learn maps), 9 (rule-based, so "classic AI" at most).</p>`
      },
      {
        kind: "activity",
        title: "Real Robot: How Does Our Robot Perceive?",
        minutes: 6,
        html: `<div class="callout robot">
<p><strong>On the VEX board:</strong> Find out what your robot actually "sees".</p>
<ol class="steps">
<li>Download a tiny program that prints <code>DistanceSensor.objectDistance(inches)</code> on the Brain screen every 200 msec.</li>
<li>Hold the robot on the field and slowly move it toward a wall. Record the reading at 30, 20, 10 and 5 inches (use a ruler).</li>
<li>Point it at a classmate's backpack, a shiny surface and an open doorway. What happens to the reading?</li>
<li>Write one sentence: "Our robot perceives a wall when..."</li>
</ol>
</div>
<div class="callout warn"><p>Sensors are noisy and imperfect. A dark or angled surface can trick the sensor. Real self-driving cars use many sensors together for this reason.</p></div>`
      },
      {
        kind: "code",
        title: "Code: The Wall-Dodging Robot",
        minutes: 6,
        html: `<p>Time to make an <strong>autonomous, reactive</strong> robot. It must run for 20 seconds on its own and never hit a wall. Use <code>Brain.Timer</code> to know when 20 seconds have passed.</p>
<pre class="code">Brain.Timer.clear();                      // start the stopwatch at 0
while (Brain.Timer.time(seconds) &lt; 20) {  // run for 20 seconds
  // sense, think, act ...
  wait(20, msec);
}</pre>
<p>Run it on the simulator first, then on the real field. Does the real robot behave the same? Why or why not?</p>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 2,
        html: `<p>Thumbs up / sideways / down: "Is our wall-dodging robot intelligent?" Pick one person per team to defend their answer in 15 seconds using the words <em>rule-based</em> and <em>learning</em>.</p>`
      }
    ],
    challenge: {
      title: "Survive 20 Seconds",
      prompt: `<p>Your robot is in a room with a wall sticking out from the top. Write a program that drives around <strong>on its own for 20 seconds</strong> without ever touching a wall.</p>
<ul>
<li>Clear the timer with <code>Brain.Timer.clear()</code> and loop while <code>Brain.Timer.time(seconds) &lt; 20</code>.</li>
<li><strong>Sense:</strong> read <code>DistanceSensor.objectDistance(inches)</code>.</li>
<li><strong>Think + Act:</strong> if the wall is closer than 15 inches, stop and turn right 90 degrees. Otherwise drive forward.</li>
<li>When time is up, stop and print <code>Survived 20 s!</code></li>
</ul>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);
  Brain.Timer.clear();

  while (Brain.Timer.time(seconds) < 20) {
    // SENSE: read the distance sensor in inches
    double d = 100; // TODO: replace 100 with the real sensor reading

    // THINK + ACT
    // TODO: if d is less than 15 -> stop, then turn right 90 degrees
    // TODO: otherwise -> drive forward

    wait(20, msec);
  }

  Drivetrain.stop();
  Brain.Screen.print("Survived 20 s!");
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.setTurnVelocity(50, percent);
  Brain.Timer.clear();

  while (Brain.Timer.time(seconds) < 20) {
    double d = DistanceSensor.objectDistance(inches);
    if (d < 15) {
      Drivetrain.stop();
      Drivetrain.turnFor(right, 90, degrees);
    } else {
      Drivetrain.drive(forward);
    }
    wait(20, msec);
  }

  Drivetrain.stop();
  Brain.Screen.print("Survived 20 s!");
  return 0;
}
`,
      hints: [
        "Use Drivetrain.drive(forward) to keep rolling. It returns right away, so your loop keeps checking the sensor.",
        "Inside the if: Drivetrain.stop(); then Drivetrain.turnFor(right, 90, degrees);",
        "If the robot bumps a wall, make the 15 bigger. The robot needs room to turn."
      ],
      field: {
        start: { x: 24, y: 50, heading: 0 },
        walls: [{ x: 46, y: 0, w: 4, h: 24 }]
      },
      checks: [
        { type: "code", pattern: "Brain\\.Timer\\.time", message: "Uses Brain.Timer to run for 20 seconds" },
        { type: "code", pattern: "objectDistance", message: "Reads the Distance Sensor" },
        { type: "code", pattern: "turnFor\\s*\\(|\\.turn\\s*\\(", message: "Turns away from walls" },
        { type: "noCollision", message: "Robot never hits a wall" },
        { type: "output", pattern: "Survived", message: "Prints Survived when time is up" }
      ]
    },
    reflection: "Is your wall-dodging robot an example of AI? Use the words 'rule-based' and 'learning' in your answer, and name one situation where your rules would fail.",
    quiz: [
      {
        q: "What is the main difference between a rule-based program and machine learning?",
        choices: [
          "Rule-based programs are always faster",
          "In machine learning the computer finds patterns from examples instead of a human writing every rule",
          "Machine learning does not use any math",
          "Rule-based programs can only run on robots"
        ],
        answer: 1,
        explain: "A programmer writes every rule in a rule-based program. Machine learning learns patterns from data."
      },
      {
        q: "Which of these is the best example of AI?",
        choices: ["A microwave timer", "A calculator", "A phone recognizing your face", "A fixed-timer traffic light"],
        answer: 2,
        explain: "Face recognition learns what faces look like from lots of example images."
      },
      {
        q: "In Sense - Think - Act, reading DistanceSensor.objectDistance(inches) is which step?",
        choices: ["Sense", "Think", "Act", "None of them"],
        answer: 0,
        explain: "Reading a sensor is sensing. Deciding what the number means is thinking."
      },
      {
        q: "Why does the challenge loop use Brain.Timer.time(seconds) < 20?",
        choices: [
          "To make the robot drive faster",
          "So the robot keeps reacting until 20 seconds have passed",
          "To measure the distance to the wall",
          "Because wait() does not work"
        ],
        answer: 1,
        explain: "The timer counts up from when it was cleared. The loop keeps running until it reaches 20."
      }
    ]
  },

  // ---------------------------------------------------------------- u4l2
  {
    id: "u4l2",
    unit: 4,
    order: 18,
    title: "Decision Trees",
    minutes: 35,
    tags: ["ai", "code", "algorithms"],
    summary: "Build decision trees that classify things with yes/no questions, then program a rover that labels terrain tiles by color and brightness.",
    objectives: [
      "I can explain how a decision tree classifies something using a chain of yes/no questions.",
      "I can design a decision tree that sorts real objects.",
      "I can turn a decision tree into nested if / else if code.",
      "I can use the Optical sensor's color and brightness to classify tiles."
    ],
    vocab: [
      { term: "Decision tree", def: "A flowchart of yes/no questions. You start at the top (the root) and follow answers until you reach a final answer (a leaf)." },
      { term: "Root", def: "The first question at the top of a decision tree." },
      { term: "Leaf", def: "An end point of the tree that gives the final answer or label." },
      { term: "Classify", def: "To put something into a group (a class), like 'lava' or 'water'." },
      { term: "Feature", def: "A measurable property used to make a decision, like color, brightness or size." },
      { term: "Rule-based AI", def: "AI made of human-written rules, like a decision tree written by a programmer." }
    ],
    materials: [
      "VEX IQ robot with Optical sensor pointing down",
      "Colored tiles or paper squares (red, green, blue, black) taped in a row on the field",
      "Sticky notes and markers",
      "Whiteboard"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: 20 Questions, Robot Style",
        minutes: 5,
        html: `<p>The teacher thinks of an object in the classroom. You can only ask <strong>yes/no questions</strong>. Can the class guess it in 10 questions or fewer?</p>
<div class="callout think"><p>Which questions were the most useful? Why is "Is it bigger than a backpack?" a better first question than "Is it the stapler?"</p></div>
<p>Good questions split the possibilities into big groups. That is exactly how a <strong>decision tree</strong> works.</p>`
      },
      {
        kind: "learn",
        title: "How Decision Trees Think",
        minutes: 8,
        html: `<p>A <strong>decision tree</strong> is a chain of yes/no questions. Each question looks at one <strong>feature</strong> (a measurement). You follow the branches until you land on a <strong>leaf</strong>: the answer.</p>
<p>Imagine our robot is a Mars rover. Its Optical sensor looks at the ground. Click through the tree below to see how it labels the terrain:</p>
<div data-widget="decision-tree" data-tree='{"q":"Is the color red?","yes":"LAVA - turn back!","no":{"q":"Is the color green?","yes":"PLANT - take a photo!","no":{"q":"Is the color blue?","yes":"WATER - collect a sample","no":{"q":"Is brightness below 30?","yes":"CRATER - avoid it","no":"SAND - keep driving"}}}}'></div>
<p>In code, a decision tree is just <strong>nested if / else if</strong>:</p>
<pre class="code">if (Optical.color() == red) {
  Brain.Screen.print("LAVA");
} else if (Optical.color() == green) {
  Brain.Screen.print("PLANT");
} else if (Optical.color() == blue) {
  Brain.Screen.print("WATER");
} else {
  if (Optical.brightness() &lt; 30) {
    Brain.Screen.print("CRATER");
  } else {
    Brain.Screen.print("SAND");
  }
}</pre>
<div class="callout tip"><p><strong>Real AI connection:</strong> Doctors' tools, bank fraud checkers and video game enemies often use decision trees. In machine learning, a computer can even <em>build</em> a decision tree by itself from data, choosing the questions that split the examples best. Today we build ours by hand.</p></div>`
      },
      {
        kind: "unplugged",
        title: "Team Activity: The Shoe Classifier",
        minutes: 9,
        html: `<div class="callout robot">
<p><strong>Unplugged (no robot needed):</strong> Each team builds a decision tree that sorts the shoes of everyone on the team.</p>
<ol class="steps">
<li>Everyone puts one shoe (or draws it) in the middle of the table.</li>
<li>Pick 3-4 labels, for example: <em>running shoe, boot, sandal, skate shoe</em>.</li>
<li>Write yes/no questions on sticky notes: "Has laces?", "Covers the ankle?", "Has open toes?"</li>
<li>Arrange the sticky notes into a tree on the desk or whiteboard. Every shoe must end at exactly one leaf.</li>
<li>Swap trees with another team. Run their shoes through YOUR tree. Did every shoe get the right label?</li>
<li>Fix one question to make your tree better.</li>
</ol>
</div>
<div class="callout think"><p><strong>Discuss:</strong> Did a shoe ever "break" your tree, like a sandal with laces? What does that tell you about rule-based AI?</p></div>`
      },
      {
        kind: "code",
        title: "Code: Rover Terrain Scanner",
        minutes: 10,
        html: `<p>Your rover drives east across a row of 4 tiles, 18 inches apart. On each tile it stops and runs the decision tree, printing a label.</p>
<p>Put the tree in a function so you can reuse it on every tile:</p>
<pre class="code">void classify() {
  // decision tree goes here
}

int main() {
  for (int i = 0; i &lt; 4; i++) {
    Drivetrain.driveFor(forward, 18, inches);
    classify();
  }
}</pre>
<div class="callout robot"><p><strong>Real robot:</strong> Tape 4 colored squares on the field 18 inches apart and test your code. Print the brightness value too. Are the real readings what you expected?</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Exit discussion: Add one more tile color (yellow = "GOLD"). Where in the tree would the new question go? Does the order of the questions matter?</p>`
      }
    ],
    challenge: {
      title: "Mars Rover Terrain Labels",
      prompt: `<p>The rover starts facing east. Four tiles are 18, 36, 54 and 72 inches ahead. Drive onto each tile, then use a <strong>decision tree</strong> to print its label:</p>
<table class="tbl">
<tr><th>Color</th><th>Brightness</th><th>Print</th></tr>
<tr><td>red</td><td>any</td><td>LAVA</td></tr>
<tr><td>green</td><td>any</td><td>PLANT</td></tr>
<tr><td>blue</td><td>any</td><td>WATER</td></tr>
<tr><td>something else</td><td>below 30</td><td>CRATER</td></tr>
<tr><td>something else</td><td>30 or more</td><td>SAND</td></tr>
</table>
<p>Use <code>Optical.color()</code> and <code>Optical.brightness()</code>.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

// The decision tree: looks at the floor and prints a label
void classify() {
  if (Optical.color() == red) {
    std::cout << "LAVA" << std::endl;
  }
  // TODO: else if green -> PLANT
  // TODO: else if blue  -> WATER
  // TODO: else -> ask a second question about Optical.brightness():
  //       below 30 -> CRATER, otherwise -> SAND
}

int main() {
  Drivetrain.setDriveVelocity(50, percent);

  // TODO: repeat 4 times: drive forward 18 inches, then classify()
  Drivetrain.driveFor(forward, 18, inches);
  classify();

  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

void classify() {
  if (Optical.color() == red) {
    std::cout << "LAVA" << std::endl;
  } else if (Optical.color() == green) {
    std::cout << "PLANT" << std::endl;
  } else if (Optical.color() == blue) {
    std::cout << "WATER" << std::endl;
  } else {
    if (Optical.brightness() < 30) {
      std::cout << "CRATER" << std::endl;
    } else {
      std::cout << "SAND" << std::endl;
    }
  }
}

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  for (int i = 0; i < 4; i++) {
    Drivetrain.driveFor(forward, 18, inches);
    classify();
  }
  return 0;
}
`,
      hints: [
        "Chain your questions: if (...) { } else if (...) { } else { }.",
        "The CRATER/SAND question goes inside the final else: if (Optical.brightness() < 30) { ... } else { ... }",
        "A for loop that runs 4 times can do the driving and the classify() call."
      ],
      field: {
        start: { x: 12, y: 36, heading: 90 },
        tiles: [
          { x: 24, y: 30, w: 12, h: 12, color: "red" },
          { x: 42, y: 30, w: 12, h: 12, color: "green" },
          { x: 60, y: 30, w: 12, h: 12, color: "blue" },
          { x: 78, y: 30, w: 12, h: 12, color: "black" }
        ]
      },
      checks: [
        { type: "visitedTiles", message: "Rover drove over every tile" },
        { type: "output", pattern: "LAVA[\\s\\S]*PLANT[\\s\\S]*WATER[\\s\\S]*CRATER", message: "Prints LAVA, PLANT, WATER, CRATER in order" },
        { type: "code", pattern: "else\\s+if", message: "Uses else if (a decision tree)" },
        { type: "code", pattern: "Optical\\.brightness", message: "Uses brightness as a second feature" },
        { type: "noCollision", message: "Robot never hits a wall" }
      ]
    },
    reflection: "Your tree asks about color first and brightness second. Describe a tile that would get the WRONG label from your tree, and how you would change the tree to fix it.",
    quiz: [
      {
        q: "In a decision tree, what is a leaf?",
        choices: ["The first question", "A final answer or label", "A sensor", "A loop"],
        answer: 1,
        explain: "Leaves are the end points that give the final classification."
      },
      {
        q: "Which C++ structure is the most natural way to code a decision tree?",
        choices: ["A for loop", "Nested if / else if / else", "An array", "A wait() call"],
        answer: 1,
        explain: "Each question is an if, and each branch leads to more ifs or a final answer."
      },
      {
        q: "Why is 'Is it bigger than a backpack?' a better first question than 'Is it the stapler?' in 20 questions?",
        choices: [
          "It is shorter",
          "It splits the possibilities into two big groups",
          "It is always true",
          "Staplers are not allowed"
        ],
        answer: 1,
        explain: "Good questions cut the remaining options roughly in half, like binary search."
      },
      {
        q: "On the black tile, Optical.color() is not red, green or blue. Which feature decides the label?",
        choices: ["Distance", "Heading", "Brightness", "Timer"],
        answer: 2,
        explain: "The last question in the tree uses brightness: a dark floor is a CRATER."
      }
    ]
  },

  // ---------------------------------------------------------------- u4l3
  {
    id: "u4l3",
    unit: 4,
    order: 19,
    title: "State Machines",
    minutes: 35,
    tags: ["ai", "code", "algorithms"],
    summary: "Give your robot moods: model behaviors as states like SEARCH, APPROACH and DONE, draw a state diagram, and code it with a switch.",
    objectives: [
      "I can explain what a state and a transition are.",
      "I can draw a state diagram for a robot behavior.",
      "I can code a state machine with a state variable and a switch statement."
    ],
    vocab: [
      { term: "State", def: "What the robot is currently doing or 'in the mood for', like SEARCH or APPROACH. The robot is in exactly one state at a time." },
      { term: "Transition", def: "A change from one state to another, triggered by an event like 'wall seen'." },
      { term: "State diagram", def: "A drawing with circles (states) and arrows (transitions) labeled with what causes each change." },
      { term: "State variable", def: "A variable that stores which state the robot is in right now." },
      { term: "switch statement", def: "C++ code that runs a different block (case) depending on the value of a variable." },
      { term: "Finite state machine (FSM)", def: "A system with a fixed number of states and rules for moving between them. Used in games, robots and traffic lights." }
    ],
    materials: [
      "VEX IQ robot with Distance Sensor and TouchLED",
      "VEX field board with one obstacle/wall piece",
      "Paper and markers for state diagrams",
      "Whiteboard"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: The Moods of a Cat",
        minutes: 5,
        html: `<p>A pet cat can be <strong>SLEEPING</strong>, <strong>HUNTING</strong>, <strong>EATING</strong> or <strong>RUNNING AWAY</strong>.</p>
<div class="callout think"><p>What makes a cat switch from SLEEPING to HUNTING? From HUNTING to RUNNING AWAY? Write down two "if this happens, the cat switches to..." rules.</p></div>
<p>Video game enemies work the same way: PATROL, CHASE, ATTACK, FLEE. Today your robot gets moods too.</p>`
      },
      {
        kind: "learn",
        title: "States, Transitions and switch",
        minutes: 9,
        html: `<p>A <strong>state machine</strong> splits a behavior into <strong>states</strong>. The robot is in exactly one state at a time. <strong>Transitions</strong> move it to a new state when something happens.</p>
<p>A rescue robot that looks for a charging station might use:</p>
<table class="tbl">
<tr><th>State</th><th>What it does</th><th>Transition</th></tr>
<tr><td>SEARCH</td><td>Turn in small steps, scanning</td><td>Sees a wall closer than 28 in -> APPROACH</td></tr>
<tr><td>APPROACH</td><td>Drive forward slowly</td><td>Wall closer than 10 in -> DONE<br>(Bumper pressed -> AVOID)</td></tr>
<tr><td>AVOID</td><td>Back up, turn</td><td>Finished backing up -> SEARCH</td></tr>
<tr><td>DONE</td><td>Stop, light turns green</td><td>(none, the mission is over)</td></tr>
</table>
<p>C++ does not need anything fancy. Give each state a number with <code>const int</code>, keep the current one in a <strong>state variable</strong>, and use <code>switch</code>:</p>
<pre class="code">const int SEARCH = 0;
const int APPROACH = 1;
const int DONE = 2;
int state = SEARCH;

while (state != DONE) {
  switch (state) {
    case SEARCH:
      // do search things, maybe change state
      break;
    case APPROACH:
      // do approach things, maybe change state
      break;
  }
  wait(20, msec);
}</pre>
<div class="callout tip"><p>Why bother? Without states, big programs become a jungle of <code>if</code>s. With states, each piece of behavior is small and easy to test. Many robots, game characters and even vending machines are built this way.</p></div>`
      },
      {
        kind: "activity",
        title: "Robot Pet: Draw It, Then Act It Out",
        minutes: 9,
        html: `<div class="callout robot">
<p><strong>Team activity:</strong> Design a "robot pet" for the VEX IQ robot.</p>
<ol class="steps">
<li>Choose 3-4 states for your pet, for example SLEEP, CURIOUS, SCARED, HAPPY.</li>
<li>Draw a state diagram: a circle for each state, arrows for transitions. Label every arrow with a sensor event ("bumper pressed", "hand closer than 6 in", "10 seconds passed").</li>
<li>Decide what the robot does in each state (TouchLED color, drive, spin, arm wiggle).</li>
<li>Act it out: one teammate is the "robot", the others call out sensor events. The robot must only change state along an arrow!</li>
<li>Find one missing arrow (an event your pet does not know how to handle). Add it.</li>
</ol>
</div>
<div class="callout think"><p><strong>Discuss:</strong> Is a robot pet with states "intelligent"? It looks like it has feelings. Does it? (No: it is following arrows you drew. But that is also why people get attached to robot toys!)</p></div>`
      },
      {
        kind: "code",
        title: "Code: Find the Charging Station",
        minutes: 9,
        html: `<p>Your robot starts in the middle of the field. A small wall (the charging station) is somewhere to its right. Code a state machine:</p>
<ol>
<li><strong>SEARCH:</strong> if the Distance Sensor reads less than 28 inches, switch to APPROACH. Otherwise turn right 15 degrees.</li>
<li><strong>APPROACH:</strong> drive forward at 25% speed. When the reading is less than 10 inches, stop and switch to DONE.</li>
<li><strong>DONE:</strong> the loop ends. Set the TouchLED green and print <code>DONE</code>.</li>
</ol>
<div class="callout robot"><p><strong>Real robot:</strong> Place a wall piece about 24 inches to the robot's right. Does it find it? Move the wall and test again. Your code did not change, but the robot still found it. That is the power of sensing!</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Draw the state diagram for the code you just wrote (3 circles, 2 arrows). Then add an AVOID state: which arrow goes in, and which goes out?</p>`
      }
    ],
    challenge: {
      title: "Search, Approach, Done",
      prompt: `<p>Use a <strong>state machine</strong> to find the charging station and stop in front of it, inside the green goal.</p>
<ul>
<li>States: <code>SEARCH</code>, <code>APPROACH</code>, <code>DONE</code> stored in an <code>int state</code>.</li>
<li>SEARCH: distance less than 28 in -> APPROACH, otherwise <code>turnFor(right, 15, degrees)</code>.</li>
<li>APPROACH: drive forward at 25% until the distance is less than 10 in, then stop -> DONE.</li>
<li>After the loop: TouchLED green, print <code>DONE</code>.</li>
</ul>`,
      starterCode: `#include "vex.h"
using namespace vex;

const int SEARCH = 0;
const int APPROACH = 1;
const int DONE = 2;

int main() {
  int state = SEARCH;
  Drivetrain.setTurnVelocity(30, percent);

  while (state != DONE) {
    double d = DistanceSensor.objectDistance(inches);

    switch (state) {
      case SEARCH:
        // TODO: if d < 28 -> state = APPROACH
        // TODO: otherwise turn right 15 degrees
        break;

      case APPROACH:
        // TODO: drive forward at 25% velocity
        // TODO: if d < 10 -> stop the drivetrain and state = DONE
        break;
    }
    wait(20, msec);
  }

  // TODO: set the TouchLED green
  std::cout << "DONE" << std::endl;
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

const int SEARCH = 0;
const int APPROACH = 1;
const int DONE = 2;

int main() {
  int state = SEARCH;
  Drivetrain.setTurnVelocity(30, percent);

  while (state != DONE) {
    double d = DistanceSensor.objectDistance(inches);

    switch (state) {
      case SEARCH:
        if (d < 28) {
          state = APPROACH;
        } else {
          Drivetrain.turnFor(right, 15, degrees);
        }
        break;

      case APPROACH:
        Drivetrain.setDriveVelocity(25, percent);
        Drivetrain.drive(forward);
        if (d < 10) {
          Drivetrain.stop();
          state = DONE;
        }
        break;
    }
    wait(20, msec);
  }

  TouchLED.setColor(green);
  std::cout << "DONE" << std::endl;
  return 0;
}
`,
      hints: [
        "In SEARCH: if (d < 28) { state = APPROACH; } else { Drivetrain.turnFor(right, 15, degrees); }",
        "In APPROACH: Drivetrain.setDriveVelocity(25, percent); Drivetrain.drive(forward); then check d.",
        "Don't forget break; at the end of each case, or the code falls into the next case."
      ],
      field: {
        start: { x: 48, y: 36, heading: 0 },
        walls: [{ x: 72, y: 32, w: 4, h: 8 }],
        goal: { x: 60, y: 36, r: 7 }
      },
      checks: [
        { type: "code", pattern: "switch\\s*\\(\\s*state", message: "Uses switch on a state variable" },
        { type: "code", pattern: "APPROACH", message: "Has an APPROACH state" },
        { type: "goal", message: "Robot stops in the green goal" },
        { type: "noCollision", message: "Robot never hits the charging station" },
        { type: "output", pattern: "DONE", message: "Prints DONE" }
      ]
    },
    reflection: "Describe one robot or video game character you know and list its states. What event makes it change from one state to another?",
    quiz: [
      {
        q: "How many states is a state machine in at one time?",
        choices: ["Zero", "Exactly one", "All of them", "Two"],
        answer: 1,
        explain: "The state variable holds one value, so the robot is in exactly one state at a time."
      },
      {
        q: "In a state diagram, what does an arrow represent?",
        choices: ["A motor", "A transition caused by an event", "A loop counter", "A comment"],
        answer: 1,
        explain: "Arrows show how the robot moves from one state to another and what triggers it."
      },
      {
        q: "What happens if you forget break; at the end of a case?",
        choices: [
          "Nothing",
          "The program will not compile",
          "The code continues into the next case",
          "The robot stops"
        ],
        answer: 2,
        explain: "Without break, C++ 'falls through' and runs the next case too."
      },
      {
        q: "In our challenge, what causes the transition from SEARCH to APPROACH?",
        choices: [
          "20 seconds passing",
          "The Distance Sensor reading less than 28 inches",
          "The bumper being pressed",
          "The TouchLED turning green"
        ],
        answer: 1,
        explain: "Seeing something closer than 28 inches means the station was found."
      }
    ]
  },

  // ---------------------------------------------------------------- u4l4
  {
    id: "u4l4",
    unit: 4,
    order: 20,
    title: "Machine Learning: Training Data",
    minutes: 40,
    tags: ["ai", "code", "algorithms"],
    summary: "Discover how machines learn from examples: features, labels, training and testing. Then 'train' a color classifier from real sensor data.",
    objectives: [
      "I can explain features, labels, training data and test data.",
      "I can collect sensor data and organize it in a table.",
      "I can write code that learns a threshold from training data and measures its accuracy on test data."
    ],
    vocab: [
      { term: "Training data", def: "Examples with known answers that a machine learning system learns from." },
      { term: "Test data", def: "New examples, not used for training, that check how well the learned model works." },
      { term: "Label", def: "The correct answer for an example, like 'red block' or 'yellow block'." },
      { term: "Feature", def: "A measurement that describes an example, like brightness or hue." },
      { term: "Model", def: "What the computer learned. Ours is a single number: a threshold." },
      { term: "Accuracy", def: "How many test examples the model got right, out of all test examples." }
    ],
    materials: [
      "VEX IQ robot with Optical sensor",
      "Red and yellow VEX IQ blocks/cubes (and any other colors)",
      "Bag of mixed VEX parts (beams, pins, gears, standoffs)",
      "Data table worksheet (or a notebook)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Teach an Alien",
        minutes: 5,
        html: `<p>An alien has never seen a dog or a cat. You cannot explain in words. You can only show it pictures with labels.</p>
<div class="callout think"><p>How many pictures would you show? What kinds? What could go wrong if every cat picture you showed was orange?</p></div>
<p>That is machine learning in a nutshell: <strong>learn from labeled examples</strong>.</p>`
      },
      {
        kind: "learn",
        title: "Features, Labels, Training, Testing",
        minutes: 9,
        html: `<p>In Lesson 2 <em>you</em> wrote the decision rules. In <strong>machine learning</strong> the computer figures out the rules from data.</p>
<table class="tbl">
<tr><th>Word</th><th>Meaning</th><th>Example (sorting blocks)</th></tr>
<tr><td>Feature</td><td>A measurement</td><td>Brightness = 38</td></tr>
<tr><td>Label</td><td>The right answer</td><td>"red"</td></tr>
<tr><td>Training data</td><td>Examples to learn from</td><td>10 measured blocks with labels</td></tr>
<tr><td>Model</td><td>The learned rule</td><td>"brightness above 56.5 means yellow"</td></tr>
<tr><td>Test data</td><td>New examples to check the model</td><td>10 different blocks</td></tr>
</table>
<p><strong>Classification</strong> means sorting things into groups. Try it: click to place red and blue points, then train the <strong>perceptron</strong> (a tiny brain-cell-inspired learner). Watch the line move until it separates the colors.</p>
<div data-widget="perceptron"></div>
<div class="callout think"><p>What happens if you place a red point deep inside the blue group? Can a single straight line ever be perfect?</p></div>
<h3>Our simple learner: the midpoint threshold</h3>
<pre class="code">average red    = 35
average yellow = 78
threshold = (35 + 78) / 2 = 56.5
if (brightness > threshold) -> "yellow" else -> "red"</pre>
<p>The computer did not get the number 56.5 from you. It <em>calculated</em> it from the data. Give it different data and it learns a different threshold. That is learning!</p>
<div class="callout warn"><p><strong>Why test on new data?</strong> If you test on the same examples you trained on, it is like taking a test you already saw the answers to. You learn nothing about how it handles the real world.</p></div>`
      },
      {
        kind: "unplugged",
        title: "Unplugged: Classify VEX Parts by Features",
        minutes: 7,
        html: `<p>In teams, dump a bag of VEX parts on the table.</p>
<ol class="steps">
<li>Choose labels: <em>beam, pin, gear, standoff</em>.</li>
<li>List 3 features you can measure for every part: number of holes, length (in holes), has teeth? round?</li>
<li>Fill a table with 8 parts: features + label. This is your <strong>training data</strong>.</li>
<li>Hide 4 more parts in a bag. A teammate reads only the features out loud. Can the rest of the team guess the label? That is your <strong>test</strong>.</li>
</ol>
<div class="callout think"><p>Which feature was the most useful? Which one was useless? Choosing good features is one of the most important jobs in machine learning.</p></div>`
      },
      {
        kind: "activity",
        title: "Real Robot: Collect Training Data",
        minutes: 8,
        html: `<div class="callout robot">
<p><strong>On the VEX board:</strong> Your robot becomes a data scientist.</p>
<ol class="steps">
<li>Write a short program that prints <code>Optical.brightness()</code> and <code>Optical.hue()</code> on the Brain screen every 500 msec (if <code>hue()</code> is not available on your firmware, use brightness only).</li>
<li>Hold a red block 1 cm under (or in front of) the sensor. Record 5 readings in your table with the label "red".</li>
<li>Repeat with 5 yellow blocks (or the same block in 5 positions).</li>
<li>Record 5 more of each and mark them "TEST" - don't peek at them until later.</li>
<li>Compare with another team. Are your numbers the same? Why might they be different (lighting, distance, sensor angle)?</li>
</ol>
</div>
<table class="tbl">
<tr><th>#</th><th>Brightness</th><th>Hue</th><th>Label</th><th>Train/Test</th></tr>
<tr><td>1</td><td></td><td></td><td>red</td><td>Train</td></tr>
<tr><td>2</td><td></td><td></td><td>red</td><td>Train</td></tr>
<tr><td>...</td><td></td><td></td><td></td><td></td></tr>
</table>`
      },
      {
        kind: "code",
        title: "Code: Train and Test a Classifier",
        minutes: 8,
        html: `<p>Put the training data in arrays, compute the averages, find the threshold, then test the model on new data and count how many it got right.</p>
<pre class="code">double sum = 0;
for (int i = 0; i &lt; 5; i++) {
  sum += red[i];
}
double avgRed = sum / 5;</pre>
<p>Use the numbers from the challenge so the auto-checker can grade you. Then try your team's real numbers!</p>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Your model got 9 out of 10. The one it missed had a brightness of 60 but was red. Was that the model's fault, or could the data be weird? What would you do to improve it?</p>`
      }
    ],
    challenge: {
      title: "Train the Block Sorter",
      prompt: `<p>Training data (brightness readings):</p>
<table class="tbl">
<tr><th>Red blocks</th><td>32, 38, 35, 41, 29</td></tr>
<tr><th>Yellow blocks</th><td>72, 80, 77, 85, 76</td></tr>
</table>
<ol>
<li><strong>Train:</strong> compute the average of each class and <code>threshold = (avgRed + avgYellow) / 2</code>. Print <code>Threshold: </code> and the value.</li>
<li><strong>Test:</strong> for each test value, predict yellow (1) if it is greater than the threshold, otherwise red (0). Compare with the true label and count correct answers.</li>
<li>Print <code>Correct: X out of 10</code>.</li>
</ol>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  // ----- TRAINING DATA (brightness) -----
  int red[5]    = {32, 38, 35, 41, 29};
  int yellow[5] = {72, 80, 77, 85, 76};

  // ----- TEST DATA: value + true label (0 = red, 1 = yellow) -----
  int testValue[10] = {34, 81, 58, 45, 70, 60, 63, 52, 64, 40};
  int testLabel[10] = { 0,  1,  1,  0,  1,  0,  1,  0,  1,  0};

  // TRAIN
  double sumRed = 0;
  double sumYellow = 0;
  // TODO: loop over the 5 samples and add them to sumRed and sumYellow
  double avgRed = sumRed / 5;
  double avgYellow = sumYellow / 5;
  double threshold = 0; // TODO: midpoint of the two averages
  std::cout << "Threshold: " << threshold << std::endl;

  // TEST
  int correct = 0;
  for (int i = 0; i < 10; i++) {
    int prediction = 0;
    // TODO: if testValue[i] > threshold, prediction = 1
    // TODO: if prediction == testLabel[i], add 1 to correct
  }
  std::cout << "Correct: " << correct << " out of 10" << std::endl;
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  int red[5]    = {32, 38, 35, 41, 29};
  int yellow[5] = {72, 80, 77, 85, 76};
  int testValue[10] = {34, 81, 58, 45, 70, 60, 63, 52, 64, 40};
  int testLabel[10] = { 0,  1,  1,  0,  1,  0,  1,  0,  1,  0};

  double sumRed = 0;
  double sumYellow = 0;
  for (int i = 0; i < 5; i++) {
    sumRed += red[i];
    sumYellow += yellow[i];
  }
  double avgRed = sumRed / 5;
  double avgYellow = sumYellow / 5;
  double threshold = (avgRed + avgYellow) / 2;
  std::cout << "Threshold: " << threshold << std::endl;

  int correct = 0;
  for (int i = 0; i < 10; i++) {
    int prediction = 0;
    if (testValue[i] > threshold) {
      prediction = 1;
    }
    if (prediction == testLabel[i]) {
      correct++;
    }
  }
  std::cout << "Correct: " << correct << " out of 10" << std::endl;
  return 0;
}
`,
      hints: [
        "One for loop from 0 to 4 can add red[i] to sumRed and yellow[i] to sumYellow.",
        "threshold = (avgRed + avgYellow) / 2; should give 56.5.",
        "Inside the test loop: if (testValue[i] > threshold) { prediction = 1; } then if (prediction == testLabel[i]) { correct++; }"
      ],
      checks: [
        { type: "output", pattern: "Threshold:\\s*56\\.5", message: "Learns the threshold 56.5 from the training data" },
        { type: "output", pattern: "Correct:\\s*9 out of 10", message: "Gets 9 out of 10 test examples right" },
        { type: "code", pattern: "for\\s*\\(", message: "Uses loops to process the data" },
        { type: "code", pattern: "threshold\\s*=\\s*\\(", message: "Computes the threshold from the averages" }
      ]
    },
    reflection: "Why is it important to test a machine learning model on data it did NOT see during training? Give an example from school (hint: tests and homework).",
    quiz: [
      {
        q: "In our block sorter, what is the feature?",
        choices: ["The label 'red'", "The brightness value", "The threshold", "The accuracy"],
        answer: 1,
        explain: "Brightness is the measurement used to make the decision."
      },
      {
        q: "What is test data used for?",
        choices: [
          "To train the model",
          "To check how well the model works on examples it has not seen",
          "To make the robot drive",
          "To make the threshold bigger"
        ],
        answer: 1,
        explain: "Test data must be new to the model, or the accuracy is meaningless."
      },
      {
        q: "Red average = 30, yellow average = 70. What threshold does our midpoint learner choose?",
        choices: ["40", "50", "70", "100"],
        answer: 1,
        explain: "(30 + 70) / 2 = 50."
      },
      {
        q: "The model got 9 of 10 test examples right. What is its accuracy?",
        choices: ["9%", "10%", "90%", "100%"],
        answer: 2,
        explain: "9 / 10 = 0.9 = 90%."
      },
      {
        q: "What makes this program 'learning' instead of a normal rule?",
        choices: [
          "It uses a for loop",
          "The threshold is calculated from data, so different data gives a different rule",
          "It prints to the screen",
          "It uses arrays"
        ],
        answer: 1,
        explain: "The rule comes from the examples, not from the programmer typing 56.5."
      }
    ]
  },

  // ---------------------------------------------------------------- u4l5
  {
    id: "u4l5",
    unit: 4,
    order: 21,
    title: "The Robot Learns: Trial & Error",
    minutes: 35,
    tags: ["ai", "code", "algorithms"],
    summary: "Robots can learn by trying, measuring and keeping what works best. Program a robot that experiments to find the perfect drive distance.",
    objectives: [
      "I can explain how trial and error (reinforcement learning, hill climbing) helps a robot improve.",
      "I can measure error with a sensor and use it as a score.",
      "I can write a loop that tries several options and remembers the best one."
    ],
    vocab: [
      { term: "Trial and error", def: "Trying something, checking how well it worked, and trying again with a change." },
      { term: "Reinforcement learning", def: "A kind of machine learning where an agent learns by getting rewards (or penalties) for its actions." },
      { term: "Reward / score", def: "A number that tells how good an attempt was. Our score is the error: smaller is better." },
      { term: "Error", def: "How far the result is from the goal: |measured - target|." },
      { term: "Hill climbing", def: "Keep making small changes and keep the change only if it makes the score better." },
      { term: "Parameter", def: "A setting you can tune, like a drive distance, a speed or Kp." }
    ],
    materials: [
      "VEX IQ robot with Distance Sensor",
      "VEX field board with a wall",
      "Paper balls and a trash can (for the warm-up)",
      "Tape measure"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Paper Ball Toss",
        minutes: 5,
        html: `<p>Three volunteers try to toss a paper ball into a trash can 3 meters away. After each miss, the class shouts "too far!" or "too short!".</p>
<div class="callout think"><p>How did the tosser improve? They didn't read a rulebook. They <strong>tried</strong>, got <strong>feedback</strong>, and <strong>adjusted</strong>. Could a robot learn like this?</p></div>`
      },
      {
        kind: "learn",
        title: "Learning by Trying",
        minutes: 8,
        html: `<p>In <strong>reinforcement learning</strong>, an agent (a robot, a game player) learns by doing:</p>
<ol>
<li><strong>Try</strong> an action.</li>
<li><strong>Measure</strong> how well it went (the reward or score).</li>
<li><strong>Remember</strong> what worked best, and try something new.</li>
</ol>
<p>This is how AI systems learned to play chess, Go and video games better than humans: by playing millions of games against themselves. Robots in labs learn to walk the same way (usually in a simulator first, so they don't break!).</p>
<h3>Remember proportional control?</h3>
<p>In Unit 3 you picked <code>Kp</code> by hand. Too small = slow, too big = wobbly. A robot could <em>tune Kp itself</em>: try Kp = 0.5, 1, 2, 3, measure the error each time, keep the best. That is <strong>hill climbing</strong>.</p>
<pre class="code">int best = 0;
double bestError = 1000;   // start with a terrible score
for (int i = 0; i &lt; 4; i++) {
  // try option i, measure error
  if (error &lt; bestError) {
    bestError = error;     // new record!
    best = option[i];
  }
}</pre>
<div class="callout tip"><p><strong>Honest AI:</strong> Trial and error needs lots of tries. A real robot gets tired batteries and worn wheels, so engineers try ideas in simulation first. That's exactly why we have a simulator in this class!</p></div>`
      },
      {
        kind: "activity",
        title: "Real Robot: The Parking Experiment",
        minutes: 9,
        html: `<div class="callout robot">
<p><strong>On the VEX board:</strong> Goal: park the robot so its Distance Sensor reads exactly 12 inches from the wall.</p>
<ol class="steps">
<li>Place the robot 60 inches from a wall, facing it. Mark the start spot with tape.</li>
<li>Choose 4 candidate drive distances (for example 12, 24, 36, 48 inches).</li>
<li>For each candidate: drive it, read the Distance Sensor, write down the error = |reading - 12|, drive back to the tape.</li>
<li>Circle the candidate with the smallest error. That's what the robot "learned".</li>
<li>Bonus: try 44, 46, 50 around the best one. Did it get even better? That's hill climbing!</li>
</ol>
</div>
<div class="callout warn"><p>Never put a candidate bigger than the space in front of the robot. A learning robot still needs safety rules from humans.</p></div>`
      },
      {
        kind: "code",
        title: "Code: Let the Robot Experiment",
        minutes: 10,
        html: `<p>Now automate it. The robot tries each candidate, measures the error, reverses back to the start, and remembers the best one. Finally it does one real run with the winning distance and parks in the goal.</p>
<pre class="code">double reading = DistanceSensor.objectDistance(inches);
double error = fabs(reading - target);</pre>
<p><code>fabs</code> means "absolute value of a double", so being 3 too far and 3 too short both count as error 3.</p>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Think-pair-share: What else could a robot tune itself with trial and error? (Turn speed? Claw angle? Line-follow Kp?) What would its "score" be?</p>`
      }
    ],
    challenge: {
      title: "Find the Best Parking Distance",
      prompt: `<p>The robot faces a wall far ahead. The goal: stop where the Distance Sensor reads about <strong>12 inches</strong>.</p>
<ol>
<li>Loop over the candidates <code>{12, 24, 36, 48}</code>.</li>
<li>For each: drive forward that distance, read the sensor, compute <code>error = fabs(reading - 12)</code>, keep the candidate with the smallest error, then <strong>reverse the same distance</strong> back to the start.</li>
<li>Print <code>Best distance: </code> and the winner.</li>
<li>Do a final run with the best distance so the robot parks in the green goal.</li>
</ol>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(80, percent);
  int candidates[4] = {12, 24, 36, 48};
  double target = 12;

  int best = 0;
  double bestError = 1000;   // start with a terrible score

  for (int i = 0; i < 4; i++) {
    // TRY: drive forward candidates[i] inches
    // TODO

    // MEASURE: read the distance sensor and compute the error
    double reading = 0; // TODO: read DistanceSensor in inches
    double error = fabs(reading - target);
    std::cout << "Try " << candidates[i] << " -> error " << error << std::endl;

    // REMEMBER: is this the best so far?
    // TODO: if error < bestError, update bestError and best

    // RESET: reverse back to the start
    // TODO
  }

  std::cout << "Best distance: " << best << std::endl;

  // TODO: final run - drive forward the best distance
  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(80, percent);
  int candidates[4] = {12, 24, 36, 48};
  double target = 12;

  int best = 0;
  double bestError = 1000;

  for (int i = 0; i < 4; i++) {
    Drivetrain.driveFor(forward, candidates[i], inches);
    double reading = DistanceSensor.objectDistance(inches);
    double error = fabs(reading - target);
    std::cout << "Try " << candidates[i] << " -> error " << error << std::endl;
    if (error < bestError) {
      bestError = error;
      best = candidates[i];
    }
    Drivetrain.driveFor(reverse, candidates[i], inches);
  }

  std::cout << "Best distance: " << best << std::endl;
  Drivetrain.driveFor(forward, best, inches);
  return 0;
}
`,
      hints: [
        "Drivetrain.driveFor(forward, candidates[i], inches); and later Drivetrain.driveFor(reverse, candidates[i], inches);",
        "double reading = DistanceSensor.objectDistance(inches);",
        "if (error < bestError) { bestError = error; best = candidates[i]; }"
      ],
      field: {
        start: { x: 48, y: 60, heading: 0 },
        goal: { x: 48, y: 13, r: 7 }
      },
      checks: [
        { type: "output", pattern: "Best distance:\\s*48", message: "The robot learned that 48 inches is best" },
        { type: "code", pattern: "reverse", message: "Reverses back to the start between tries" },
        { type: "code", pattern: "objectDistance", message: "Measures the result with the Distance Sensor" },
        { type: "goal", message: "Final run parks in the green goal" },
        { type: "noCollision", message: "Robot never hits a wall" }
      ]
    },
    reflection: "Our robot tried only 4 candidates. How could it find an even better answer without trying every possible number? Describe your idea in steps.",
    quiz: [
      {
        q: "What are the three steps of learning by trial and error?",
        choices: ["Sense, wait, stop", "Try, measure, remember the best", "Build, paint, test", "Read, write, print"],
        answer: 1,
        explain: "The robot tries an action, scores it, and keeps what worked best."
      },
      {
        q: "Why do we start bestError at 1000?",
        choices: [
          "1000 is the target",
          "So the first real attempt is guaranteed to be better and gets saved",
          "The sensor only reads up to 1000",
          "It makes the robot faster"
        ],
        answer: 1,
        explain: "Starting with a terrible score means the first try always becomes the record."
      },
      {
        q: "The target is 12 in and the sensor reads 9 in. What is the error?",
        choices: ["-3", "3", "9", "21"],
        answer: 1,
        explain: "error = fabs(9 - 12) = 3. Absolute value makes it positive."
      },
      {
        q: "Why do engineers often let robots learn by trial and error in a simulator first?",
        choices: [
          "Simulators are more colorful",
          "Real robots can break, run out of battery, and each real try takes time",
          "Real robots cannot use sensors",
          "It is required by law"
        ],
        answer: 1,
        explain: "Simulation lets a robot try thousands of times safely and quickly."
      }
    ]
  },

  // ---------------------------------------------------------------- u4l6
  {
    id: "u4l6",
    unit: 4,
    order: 22,
    title: "AI Ethics & Bias",
    minutes: 40,
    tags: ["ai", "code"],
    summary: "When AI learns from unfair or lopsided data, it makes unfair decisions. Explore bias, self-driving dilemmas and responsibility, then write your team's robot code of ethics.",
    objectives: [
      "I can explain how biased training data leads to biased AI decisions.",
      "I can discuss who is responsible when an AI system makes a mistake.",
      "I can show with code how unbalanced training data lowers accuracy.",
      "I can write a code of ethics for robots and AI."
    ],
    vocab: [
      { term: "Bias", def: "When a system is unfairly tilted toward some results or some groups of people." },
      { term: "Unbalanced data", def: "Training data with many examples of some kinds and very few of others." },
      { term: "Representative data", def: "Data that includes all the kinds of situations and people the AI will really meet." },
      { term: "Accountability", def: "Being responsible for a system's decisions and fixing its mistakes." },
      { term: "Ethics", def: "Ideas about what is right and fair, and how we should act." },
      { term: "Transparency", def: "Being open about how a system works and what data it learned from." }
    ],
    materials: [
      "Four corner signs: Strongly Agree, Agree, Disagree, Strongly Disagree",
      "Chart paper and markers",
      "Computers for the coding challenge",
      "Your data table from Lesson 4 (optional)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: The Lamp Problem",
        minutes: 5,
        html: `<p>Remember our block sorter from Lesson 4? Imagine Team A trained it with 8 red blocks on a normal desk, but only <strong>2 yellow blocks, both under a super-bright desk lamp</strong>.</p>
<div class="callout think"><p>Predict: Will their robot sort yellow blocks correctly in normal classroom light? Why or why not? Write your prediction down, we will test it in code later.</p></div>`
      },
      {
        kind: "learn",
        title: "How Bias Sneaks Into AI",
        minutes: 8,
        html: `<p>An AI model only knows what its training data shows it. If the data is <strong>unbalanced</strong> or not <strong>representative</strong>, the model learns a lopsided view of the world. This is called <strong>bias</strong>.</p>
<table class="tbl">
<tr><th>Real-world example</th><th>What went wrong</th></tr>
<tr><td>Face recognition systems worked much worse on darker-skinned faces, especially women.</td><td>The training photos were mostly of lighter-skinned men.</td></tr>
<tr><td>A hiring tool learned to rank resumes from women lower.</td><td>It learned from years of past hiring decisions that already favored men.</td></tr>
<tr><td>Voice assistants struggle more with some accents.</td><td>Fewer recordings of those accents in the training data.</td></tr>
</table>
<div class="callout tip"><p><strong>Key idea:</strong> The computer is not "mean". It copies patterns from data. But the result can still be unfair to real people, so the humans who build it must check for bias.</p></div>
<h3>Who is responsible?</h3>
<p>When an AI makes a harmful mistake, who should fix it: the programmers, the company, the people who collected the data, the user? Most experts say: <em>humans are always accountable</em>. "The computer did it" is not an excuse.</p>`
      },
      {
        kind: "activity",
        title: "Four Corners Debate",
        minutes: 10,
        html: `<p>The teacher reads a statement. Walk to the corner that matches your opinion. Each corner gets 1 minute to explain their reason. You may switch corners if someone convinces you!</p>
<ol class="steps">
<li>"A self-driving car should always protect its passengers first, even if that means more danger to people outside the car."</li>
<li>"If a self-driving car crashes, the company that made it is responsible, not the person sitting in it."</li>
<li>"It's OK for a school to use AI to decide which students get into an advanced class."</li>
<li>"Robots should always tell people they are robots."</li>
<li>"If an AI is right 95% of the time, it is good enough to use."</li>
</ol>
<div class="callout think"><p><strong>About statement 5:</strong> 95% sounds great. But if the 5% mistakes all happen to the same group of people, is it fair? Accuracy alone doesn't tell the whole story.</p></div>
<div class="callout robot">
<p><strong>Team task: Our Robot Code of Ethics</strong></p>
<ol class="steps">
<li>In your build team, write 5 rules that every robot and AI your team builds must follow.</li>
<li>At least one rule must be about <strong>data</strong>, one about <strong>safety</strong>, one about <strong>who is responsible</strong>.</li>
<li>Write them on chart paper and sign it. Post it next to the VEX field. We will use it in the capstone!</li>
</ol>
</div>`
      },
      {
        kind: "code",
        title: "Code: Bias in Action",
        minutes: 12,
        html: `<p>Let's test the Do Now prediction. You will train the same classifier twice on the same test set:</p>
<ul>
<li><strong>Fair data:</strong> 5 red and 5 yellow blocks in normal light.</li>
<li><strong>Biased data:</strong> 8 red blocks in normal light, but only 2 yellow blocks under a bright lamp (95, 97).</li>
</ul>
<p>The bright-lamp yellow samples pull the yellow average way up, so the threshold moves too high. Medium-bright yellow blocks now get called "red".</p>
<div class="callout think"><p>How would you fix the biased dataset? (More yellow samples, in the same lighting the robot will really use.)</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 5,
        html: `<p>Gallery walk: read the other teams' codes of ethics. Put a star sticker on the one rule (from another team) that you think is the most important. The top 5 rules become our class code of ethics.</p>`
      }
    ],
    challenge: {
      title: "Fair vs. Biased Training",
      prompt: `<p>The function <code>countCorrect(threshold)</code> (from Lesson 4) tests a threshold on 10 test blocks and returns how many it got right. The fair model is already trained for you.</p>
<p><strong>Your job:</strong> train a second model on this <strong>biased</strong> data, then print both results:</p>
<table class="tbl">
<tr><th>Red (8 samples)</th><td>32, 38, 35, 41, 29, 36, 34, 39</td></tr>
<tr><th>Yellow (2 samples, bright lamp)</th><td>95, 97</td></tr>
</table>
<p>Print <code>Fair: X out of 10</code> and <code>Biased: Y out of 10</code>. Which model is better?</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

// Tests a threshold on 10 test blocks. Returns how many were right.
int countCorrect(double threshold) {
  int testValue[10] = {34, 81, 58, 45, 70, 60, 63, 52, 64, 40};
  int testLabel[10] = { 0,  1,  1,  0,  1,  0,  1,  0,  1,  0};
  int correct = 0;
  for (int i = 0; i < 10; i++) {
    int prediction = 0;
    if (testValue[i] > threshold) {
      prediction = 1;
    }
    if (prediction == testLabel[i]) {
      correct++;
    }
  }
  return correct;
}

int main() {
  // ----- FAIR MODEL (balanced data, normal light) -----
  int red[5]    = {32, 38, 35, 41, 29};
  int yellow[5] = {72, 80, 77, 85, 76};
  double sumR = 0;
  double sumY = 0;
  for (int i = 0; i < 5; i++) {
    sumR += red[i];
    sumY += yellow[i];
  }
  double fairThreshold = (sumR / 5 + sumY / 5) / 2;
  std::cout << "Fair threshold: " << fairThreshold << std::endl;
  std::cout << "Fair: " << countCorrect(fairThreshold) << " out of 10" << std::endl;

  // ----- BIASED MODEL (unbalanced data, yellow only under a lamp) -----
  // TODO: make an array biasRed[8] and an array biasYellow[2] with the values from the table
  // TODO: compute the average of each (careful: 8 and 2 samples, not 5!)
  double biasedThreshold = 0; // TODO: midpoint of the two averages
  std::cout << "Biased threshold: " << biasedThreshold << std::endl;
  // TODO: print "Biased: " << countCorrect(biasedThreshold) << " out of 10"

  return 0;
}
`,
      solution: `#include "vex.h"
using namespace vex;

int countCorrect(double threshold) {
  int testValue[10] = {34, 81, 58, 45, 70, 60, 63, 52, 64, 40};
  int testLabel[10] = { 0,  1,  1,  0,  1,  0,  1,  0,  1,  0};
  int correct = 0;
  for (int i = 0; i < 10; i++) {
    int prediction = 0;
    if (testValue[i] > threshold) {
      prediction = 1;
    }
    if (prediction == testLabel[i]) {
      correct++;
    }
  }
  return correct;
}

int main() {
  int red[5]    = {32, 38, 35, 41, 29};
  int yellow[5] = {72, 80, 77, 85, 76};
  double sumR = 0;
  double sumY = 0;
  for (int i = 0; i < 5; i++) {
    sumR += red[i];
    sumY += yellow[i];
  }
  double fairThreshold = (sumR / 5 + sumY / 5) / 2;
  std::cout << "Fair threshold: " << fairThreshold << std::endl;
  std::cout << "Fair: " << countCorrect(fairThreshold) << " out of 10" << std::endl;

  int biasRed[8] = {32, 38, 35, 41, 29, 36, 34, 39};
  int biasYellow[2] = {95, 97};
  double bR = 0;
  double bY = 0;
  for (int i = 0; i < 8; i++) {
    bR += biasRed[i];
  }
  for (int i = 0; i < 2; i++) {
    bY += biasYellow[i];
  }
  double biasedThreshold = (bR / 8 + bY / 2) / 2;
  std::cout << "Biased threshold: " << biasedThreshold << std::endl;
  std::cout << "Biased: " << countCorrect(biasedThreshold) << " out of 10" << std::endl;
  return 0;
}
`,
      hints: [
        "int biasRed[8] = {32, 38, 35, 41, 29, 36, 34, 39}; int biasYellow[2] = {95, 97};",
        "Use two loops: one from 0 to 7 for red, one from 0 to 1 for yellow. Divide by 8 and by 2.",
        "The biased threshold should be 65.75. Medium yellow blocks like 58, 63 and 64 now get called red."
      ],
      checks: [
        { type: "output", pattern: "Fair:\\s*9 out of 10", message: "Fair model: 9 out of 10" },
        { type: "output", pattern: "Biased threshold:\\s*65\\.75", message: "Biased threshold is 65.75" },
        { type: "output", pattern: "Biased:\\s*7 out of 10", message: "Biased model: 7 out of 10" },
        { type: "code", pattern: "biasRed\\s*\\[\\s*8\\s*\\]", message: "Stores the 8 biased red samples in an array" }
      ]
    },
    reflection: "Your biased model dropped from 9 to 7 correct. Describe a real AI system (not a robot) where biased data could hurt people, and one thing its builders should do about it.",
    quiz: [
      {
        q: "What is the most common cause of bias in a machine learning system?",
        choices: [
          "The computer is in a bad mood",
          "Training data that is unbalanced or not representative",
          "Using a for loop",
          "The screen is too small"
        ],
        answer: 1,
        explain: "Models copy the patterns in their data, including unfair or lopsided ones."
      },
      {
        q: "In our challenge, why did the biased threshold move up to 65.75?",
        choices: [
          "There were more red samples",
          "The only yellow samples were extra bright, so the yellow average was too high",
          "The test data changed",
          "The robot drove faster"
        ],
        answer: 1,
        explain: "The lamp made the yellow average 96 instead of about 78, pulling the midpoint up."
      },
      {
        q: "An AI is 95% accurate, but almost all of its mistakes happen to one group of people. What is the problem?",
        choices: [
          "There is no problem, 95% is great",
          "It may be unfair to that group, even though overall accuracy looks high",
          "It needs a bigger screen",
          "It should use a decision tree"
        ],
        answer: 1,
        explain: "Overall accuracy can hide unfairness. Check how it performs for each group."
      },
      {
        q: "Which is the best way to fix the biased block sorter?",
        choices: [
          "Delete the red samples",
          "Collect more yellow samples in the same lighting the robot will really use",
          "Make the threshold 100",
          "Turn off the Optical sensor"
        ],
        answer: 1,
        explain: "Representative, balanced data is the main cure for data bias."
      }
    ]
  }
];
