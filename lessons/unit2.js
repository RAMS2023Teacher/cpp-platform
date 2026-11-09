// Unit 2: C++ Foundations
module.exports = [
  // ───────────────────────────────────────────── u2l1
  {
    id: "u2l1",
    unit: 2,
    order: 8,
    title: "Variables & Math",
    minutes: 35,
    tags: ["code"],
    summary: "Store numbers in variables, use wheel math to predict distances, and drive a rectangle you can resize by changing one line.",
    objectives: [
      "I can declare variables using int, double, bool and string.",
      "I can use math operators (+ - * /) with variables.",
      "I can calculate how far the robot travels from wheel rotations.",
      "I can use variables to control how far my robot drives."
    ],
    vocab: [
      { term: "Variable", def: "A named box in memory that stores a value your program can use and change." },
      { term: "Data type", def: "The kind of value a variable holds: int (whole number), double (decimal), bool (true/false), string (text)." },
      { term: "Declare", def: "To create a variable by giving it a type and a name, like  double length = 24;" },
      { term: "Circumference", def: "The distance around a circle. One wheel rotation moves the robot one circumference." },
      { term: "Perimeter", def: "The total distance around a shape." }
    ],
    materials: [
      "Built BaseBots",
      "VEX IQ field board",
      "Tape measures, masking tape",
      "Calculators (or phone calculators)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: The Changing Room",
        minutes: 5,
        html: `<p>Your coach says: "Drive a rectangle 36 in by 48 in." You write 8 lines of code. Then the coach says: "Actually, make it 30 by 40." Then: "Hmm, 20 by 50."</p>
<div class="callout think"><p>How many numbers do you have to change each time? Is there a smarter way? Discuss with your table.</p></div>`
      },
      {
        kind: "learn",
        title: "Variables Are Labeled Boxes",
        minutes: 9,
        html: `<p>A <strong>variable</strong> is a labeled box that holds a value. Change what's in the box once, and every line that uses it changes too.</p>
<pre class="code">int laps = 3;               // whole numbers
double sideLength = 24.5;   // decimals
bool isReady = true;        // true or false
string teamName = "Bolt";   // text

double perimeter = 4 * sideLength;   // math with variables!
laps = laps + 1;                     // now laps is 4
std::cout &lt;&lt; "Perimeter: " &lt;&lt; perimeter &lt;&lt; std::endl;</pre>
<table class="tbl">
  <tr><th>Operator</th><th>Meaning</th><th>Example</th><th>Result</th></tr>
  <tr><td><code>+</code></td><td>add</td><td><code>10 + 4</code></td><td>14</td></tr>
  <tr><td><code>-</code></td><td>subtract</td><td><code>10 - 4</code></td><td>6</td></tr>
  <tr><td><code>*</code></td><td>multiply</td><td><code>10 * 4</code></td><td>40</td></tr>
  <tr><td><code>/</code></td><td>divide</td><td><code>10 / 4</code></td><td>2 (int!) or 2.5 (double)</td></tr>
</table>
<div class="callout warn"><p><strong>Integer division trap:</strong> <code>10 / 4</code> with two ints gives <code>2</code>, not <code>2.5</code>. Use <code>10.0 / 4</code> or a <code>double</code> to keep the decimal.</p></div>
<h3>Wheel math</h3>
<p>The standard VEX IQ wheel travels about <strong>200 mm per revolution</strong> (about <strong>7.87 inches</strong>). So:</p>
<pre class="code">double travelPerRev = 7.87;          // inches per wheel turn
double revs = 3;
double distance = revs * travelPerRev;   // about 23.6 inches</pre>`
      },
      {
        kind: "activity",
        title: "Wheel Detective",
        minutes: 10,
        html: `<div class="callout robot">
<p><strong>Teams of 3: Prove the 200 mm rule on the real field.</strong></p>
<ol class="steps">
  <li>Put a small piece of tape on one wheel so you can see it spin. Mark the robot's starting spot on the field board.</li>
  <li><strong>Predict:</strong> If the wheel turns 5 times, how far will the robot go? Write the math: <code>5 * 7.87 = ?</code></li>
  <li>Push the robot slowly by hand while one teammate counts 5 wheel turns out loud. Measure with the tape measure.</li>
  <li>Compare with your prediction. How close were you? Why might it be off?</li>
  <li><strong>Reverse it:</strong> How many wheel turns to cross a 48-inch-wide field? Write <code>48 / 7.87</code> and test it.</li>
</ol>
</div>
<div class="callout think"><p><strong>Discuss:</strong> If we put on bigger wheels, would the robot go farther or less far per turn? Why?</p></div>`
      },
      {
        kind: "code",
        title: "Code It: A Resizable Rectangle",
        minutes: 8,
        html: `<p>Use variables so changing <strong>one line</strong> resizes the whole path:</p>
<pre class="code">double length = 36;
double width = 48;
Drivetrain.driveFor(forward, length, inches);
Drivetrain.turnFor(right, 90, degrees);
Drivetrain.driveFor(forward, width, inches);
...</pre>
<p>Also calculate the <strong>perimeter</strong> with math and print it, so you know the robot's total travel before it moves.</p>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Lightning round: your teacher calls out a value (3, 7.5, true, "Go Pats!") and the class shouts its data type.</p>`
      }
    ],
    challenge: {
      title: "Variable Rectangle",
      prompt: `<p>Drive a rectangle that is <strong>36 inches tall</strong> (length) and <strong>48 inches wide</strong> (width), turning <strong>right</strong> at each corner.</p>
<ul>
  <li>Use the variables <code>length</code> and <code>width</code> in your <code>driveFor</code> commands (no typing 36 or 48 in driveFor!).</li>
  <li>Calculate <code>perimeter = 2 * (length + width)</code> and print it.</li>
  <li>Drive over all three blue corner tiles and end back in the green goal.</li>
</ul>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  double length = 36;    // inches (up/down sides)
  double width = 0;      // TODO: set width to 48 inches
  double perimeter = 0;  // TODO: calculate 2 * (length + width)

  std::cout << "Perimeter: " << perimeter << std::endl;

  // Side 1 (going up)
  Drivetrain.driveFor(forward, length, inches);
  Drivetrain.turnFor(right, 90, degrees);

  // TODO: Side 2 uses width
  // TODO: Side 3 uses length
  // TODO: Side 4 uses width

}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  double length = 36;
  double width = 48;
  double perimeter = 2 * (length + width);

  std::cout << "Perimeter: " << perimeter << std::endl;

  Drivetrain.driveFor(forward, length, inches);
  Drivetrain.turnFor(right, 90, degrees);
  Drivetrain.driveFor(forward, width, inches);
  Drivetrain.turnFor(right, 90, degrees);
  Drivetrain.driveFor(forward, length, inches);
  Drivetrain.turnFor(right, 90, degrees);
  Drivetrain.driveFor(forward, width, inches);
  Drivetrain.turnFor(right, 90, degrees);
}
`,
      hints: [
        "Change the 0 on the width line to 48.",
        "perimeter = 2 * (length + width); should print 168.",
        "Sides 2 and 4 drive width inches; side 3 drives length inches. Turn right 90 after each side."
      ],
      field: {
        start: { x: 16, y: 56, heading: 0 },
        tiles: [
          { x: 12, y: 16, w: 8, h: 8, color: "blue" },
          { x: 60, y: 16, w: 8, h: 8, color: "blue" },
          { x: 60, y: 52, w: 8, h: 8, color: "blue" }
        ],
        goal: { x: 16, y: 56, r: 6 }
      },
      checks: [
        { type: "output", pattern: "168", message: "Prints the correct perimeter (168)" },
        { type: "code", pattern: "driveFor\\s*\\(\\s*forward\\s*,\\s*width", message: "Uses the width variable in driveFor" },
        { type: "visitedTiles", message: "Robot drove over every corner tile" },
        { type: "goal", message: "Robot ends back in the green goal" },
        { type: "noCollision", message: "Robot never hits a wall" }
      ]
    },
    reflection: "Explain to a 5th grader why using variables is better than typing the same number over and over. Use an example from today.",
    quiz: [
      {
        q: "Which data type is best for storing 24.5 inches?",
        choices: ["int", "double", "bool", "string"],
        answer: 1,
        explain: "double holds numbers with decimals. int would chop off the .5."
      },
      {
        q: "What is the value of  7 / 2  when both numbers are ints?",
        choices: ["3.5", "3", "4", "Error"],
        answer: 1,
        explain: "Integer division drops the decimal part, so 7 / 2 is 3."
      },
      {
        q: "A VEX IQ wheel travels about 7.87 inches per turn. About how far does the robot go in 4 turns?",
        choices: ["About 12 in", "About 24 in", "About 31.5 in", "About 48 in"],
        answer: 2,
        explain: "4 × 7.87 ≈ 31.5 inches."
      },
      {
        q: "After  int score = 5;  score = score + 3;  what is score?",
        choices: ["5", "3", "8", "53"],
        answer: 2,
        explain: "The right side is calculated first (5 + 3 = 8), then stored back in score."
      }
    ]
  },

  // ───────────────────────────────────────────── u2l2
  {
    id: "u2l2",
    unit: 2,
    order: 9,
    title: "Loops",
    minutes: 35,
    tags: ["code", "algorithms"],
    summary: "Stop copy-pasting! Use for loops to repeat code and discover the 360/n rule for driving any polygon.",
    objectives: [
      "I can explain why loops make code shorter and easier to change.",
      "I can write a for loop that repeats an exact number of times.",
      "I can use the rule turn = 360 / sides to drive any regular polygon.",
      "I can trace a loop and predict what the loop variable is each time."
    ],
    vocab: [
      { term: "Loop", def: "Code that repeats." },
      { term: "for loop", def: "A loop that repeats a set number of times using a counter: for (int i = 0; i < n; i++)" },
      { term: "Iteration", def: "One trip through the body of a loop." },
      { term: "Counter variable", def: "The variable (often i) that counts how many times the loop has run." },
      { term: "Exterior angle", def: "How much you turn at each corner of a polygon. For a regular polygon it is 360 / number of sides." }
    ],
    materials: [
      "Built BaseBots",
      "VEX IQ field board",
      "Masking tape, protractors",
      "Open floor space for the unplugged activity"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: The 100-Line Punishment",
        minutes: 5,
        html: `<p>Your square program has 8 lines. How many lines would a robot need to drive <strong>10 squares in a row</strong>? 100 squares?</p>
<div class="callout think"><p>Programmers are proudly lazy. If you had to write "I will not talk in class" 100 times on the board, what trick would you invent?</p></div>`
      },
      {
        kind: "learn",
        title: "The for Loop",
        minutes: 8,
        html: `<pre class="code">for (int i = 0; i &lt; 4; i++) {
  Drivetrain.driveFor(forward, 24, inches);
  Drivetrain.turnFor(right, 90, degrees);
}</pre>
<p>That's a whole square in 4 lines! Read it as: <em>"Start i at 0. While i is less than 4, run the body, then add 1 to i."</em></p>
<table class="tbl">
  <tr><th>Part</th><th>Meaning</th></tr>
  <tr><td><code>int i = 0</code></td><td>Start: make a counter</td></tr>
  <tr><td><code>i &lt; 4</code></td><td>Keep going while this is true</td></tr>
  <tr><td><code>i++</code></td><td>After each lap, add 1</td></tr>
  <tr><td><code>{ ... }</code></td><td>The body: what gets repeated</td></tr>
</table>
<p>Trace it: i = 0, 1, 2, 3 (4 laps). When i becomes 4, <code>4 &lt; 4</code> is false and the loop ends.</p>
<h3>The Polygon Rule</h3>
<p>To drive a regular polygon and end facing the way you started, the robot turns a total of 360 degrees. So each corner turn is:</p>
<pre class="code">turn angle = 360 / number of sides</pre>
<table class="tbl">
  <tr><th>Shape</th><th>Sides</th><th>Turn</th></tr>
  <tr><td>Triangle</td><td>3</td><td>120°</td></tr>
  <tr><td>Square</td><td>4</td><td>90°</td></tr>
  <tr><td>Pentagon</td><td>5</td><td>72°</td></tr>
  <tr><td>Hexagon</td><td>6</td><td>?</td></tr>
</table>`
      },
      {
        kind: "unplugged",
        title: "Human Polygons",
        minutes: 9,
        html: `<div class="callout robot">
<p><strong>Teams of 3-4, on the floor or the field board.</strong></p>
<ol class="steps">
  <li>One person is the <strong>robot</strong>, one is the <strong>loop counter</strong> (holds up fingers for i), one is the <strong>protractor checker</strong>.</li>
  <li>The robot walks a triangle: "repeat 3 times: walk 4 steps, turn right 120." The counter calls out i = 0, 1, 2 each lap.</li>
  <li>Did the robot end where it started, facing the same way? The checker uses a protractor on tape to check the turns.</li>
  <li>Now try a pentagon (5 sides, 72°). Then a 12-sided shape. What happens as the number of sides gets bigger?</li>
  <li>Bonus: run a square on your real VEX robot using a for loop. Put tape on the field board at each corner and see how close it gets.</li>
</ol>
</div>
<div class="callout think"><p>If a robot drove a 360-sided polygon with tiny sides, what shape would it look like?</p></div>`
      },
      {
        kind: "code",
        title: "Code It: Hexagon",
        minutes: 10,
        html: `<p>Use variables and a loop together:</p>
<pre class="code">int sides = 6;
double angle = 360.0 / sides;
for (int i = 0; i &lt; sides; i++) {
  // drive one side, then turn
}</pre>
<p>In the challenge there is a box in the middle of the hexagon. If you use the wrong angle, you'll crash into it!</p>
<div class="callout tip"><p>Print <code>i</code> inside the loop to watch the counter: <code>std::cout &lt;&lt; "Side " &lt;&lt; i &lt;&lt; std::endl;</code></p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Show of fingers: how many times does <code>for (int i = 0; i &lt; 5; i++)</code> repeat? How about <code>for (int i = 1; i &lt;= 5; i++)</code>? (Both 5!)</p>`
      }
    ],
    challenge: {
      title: "Hexagon Loop",
      prompt: `<p>Use a <strong>for loop</strong> to drive a regular <strong>hexagon</strong> with 20-inch sides, turning <strong>right</strong> at each corner.</p>
<ul>
  <li>Drive over all three blue tiles (they're on corners of the hexagon).</li>
  <li>Don't hit the box in the middle.</li>
  <li>End back in the green goal.</li>
</ul>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  int sides = 6;
  double sideLength = 20;   // inches
  double angle = 0;         // TODO: use the polygon rule (360 / sides)

  // TODO: make the loop repeat once for every side (not just 1 time)
  for (int i = 0; i < 1; i++) {
    std::cout << "Side " << i << std::endl;
    // TODO: drive forward sideLength inches

    // TODO: turn right by angle degrees

  }
}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  int sides = 6;
  double sideLength = 20;
  double angle = 360.0 / sides;

  for (int i = 0; i < sides; i++) {
    std::cout << "Side " << i << std::endl;
    Drivetrain.driveFor(forward, sideLength, inches);
    Drivetrain.turnFor(right, angle, degrees);
  }
}
`,
      hints: [
        "angle = 360.0 / sides; gives 60 degrees for a hexagon.",
        "Change i < 1 to i < sides so the loop runs 6 times.",
        "Inside the loop: Drivetrain.driveFor(forward, sideLength, inches); then Drivetrain.turnFor(right, angle, degrees);"
      ],
      field: {
        start: { x: 30, y: 46, heading: 0 },
        walls: [{ x: 43, y: 32, w: 8, h: 8 }],
        tiles: [
          { x: 43.3, y: 12, w: 8, h: 8, color: "blue" },
          { x: 60.6, y: 42, w: 8, h: 8, color: "blue" },
          { x: 43.3, y: 52, w: 8, h: 8, color: "blue" }
        ],
        goal: { x: 30, y: 46, r: 6 }
      },
      checks: [
        { type: "code", pattern: "for\\s*\\(", message: "Uses a for loop" },
        { type: "visitedTiles", message: "Robot drove over every blue corner tile" },
        { type: "goal", message: "Robot ends back in the green goal" },
        { type: "noCollision", message: "Robot never hits the box or a wall" }
      ]
    },
    reflection: "Your friend's octagon program has 16 lines of copy-pasted code. Explain how you would rewrite it with a loop, and what turn angle they need.",
    quiz: [
      {
        q: "How many times does  for (int i = 0; i < 6; i++)  repeat?",
        choices: ["5", "6", "7", "Forever"],
        answer: 1,
        explain: "i takes the values 0, 1, 2, 3, 4, 5: that's 6 times."
      },
      {
        q: "What angle should the robot turn at each corner of a regular pentagon (5 sides)?",
        choices: ["60°", "72°", "90°", "108°"],
        answer: 1,
        explain: "360 / 5 = 72 degrees."
      },
      {
        q: "What does  i++  do?",
        choices: ["Doubles i", "Adds 1 to i", "Sets i to 0", "Prints i"],
        answer: 1,
        explain: "++ increases a variable by 1."
      },
      {
        q: "Which part of a for loop decides when to STOP?",
        choices: ["int i = 0", "i < n", "i++", "The curly braces"],
        answer: 1,
        explain: "The loop keeps running while the condition (i < n) is true and stops when it becomes false."
      }
    ]
  },

  // ───────────────────────────────────────────── u2l3
  {
    id: "u2l3",
    unit: 2,
    order: 10,
    title: "Making Decisions",
    minutes: 40,
    tags: ["code", "algorithms"],
    summary: "Give your robot choices with if/else, compare values, read the Bumper and Optical sensors, and play bumper tag.",
    objectives: [
      "I can write if, else if and else statements.",
      "I can use comparison operators (== != < > <= >=) and logical operators (&& || !).",
      "I can read the Bumper Switch and Optical sensor in my code.",
      "I can make the robot choose a path based on what it senses."
    ],
    vocab: [
      { term: "Conditional", def: "Code that only runs if something is true (if / else)." },
      { term: "Boolean", def: "A value that is either true or false." },
      { term: "Comparison operator", def: "Compares two values: == equal, != not equal, < less, > greater, <=, >=." },
      { term: "Logical operator", def: "Combines true/false values: && (and), || (or), ! (not)." },
      { term: "Optical sensor", def: "A sensor that detects color and brightness of what is in front of it (on our robot, the floor)." },
      { term: "Bumper Switch", def: "A touch sensor that reports true when it is pressed." }
    ],
    materials: [
      "BaseBots with a Bumper Switch on the front and Optical sensor pointing down",
      "VEX IQ field board",
      "Red and green paper squares (or colored tape)",
      "Pool noodles or cardboard for bumper tag walls (optional)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: If This, Then That",
        minutes: 5,
        html: `<p>Finish these "robot rules" for your morning:</p>
<ul>
  <li><strong>If</strong> it is raining, <strong>then</strong> ____ <strong>else</strong> ____.</li>
  <li><strong>If</strong> the T is running late <strong>and</strong> I have a bike, <strong>then</strong> ____.</li>
  <li><strong>If</strong> the Celtics win <strong>or</strong> the Bruins win, <strong>then</strong> ____.</li>
</ul>
<div class="callout think"><p>What's the difference between "and" and "or" in your rules? When is each one true?</p></div>`
      },
      {
        kind: "learn",
        title: "if / else and Operators",
        minutes: 9,
        html: `<pre class="code">int distance = 10;

if (distance &lt; 6) {
  Brain.Screen.print("Too close!");
} else if (distance &lt; 12) {
  Brain.Screen.print("Getting close...");
} else {
  Brain.Screen.print("All clear");
}</pre>
<p>Only <strong>one</strong> branch runs: the first one whose condition is true.</p>
<table class="tbl">
  <tr><th>Operator</th><th>Meaning</th><th>Example (x = 5)</th></tr>
  <tr><td><code>==</code></td><td>equal to</td><td><code>x == 5</code> → true</td></tr>
  <tr><td><code>!=</code></td><td>not equal</td><td><code>x != 5</code> → false</td></tr>
  <tr><td><code>&lt;  &gt;</code></td><td>less / greater</td><td><code>x &gt; 3</code> → true</td></tr>
  <tr><td><code>&amp;&amp;</code></td><td>and (both true)</td><td><code>x &gt; 3 &amp;&amp; x &lt; 10</code> → true</td></tr>
  <tr><td><code>||</code></td><td>or (at least one)</td><td><code>x &lt; 0 || x == 5</code> → true</td></tr>
  <tr><td><code>!</code></td><td>not</td><td><code>!(x == 5)</code> → false</td></tr>
</table>
<div class="callout warn"><p><code>=</code> <strong>stores</strong> a value. <code>==</code> <strong>compares</strong>. Writing <code>if (x = 5)</code> is one of the most famous bugs in programming!</p></div>
<h3>Sensors give us conditions</h3>
<pre class="code">if (BumperA.pressing()) {          // true when the bumper is pushed
  Drivetrain.driveFor(reverse, 6, inches);
}

if (Optical.color() == red) {      // color of the floor under the robot
  TouchLED.setColor(red);
} else if (Optical.color() == green) {
  TouchLED.setColor(green);
}</pre>
<div data-widget="decision-tree" data-tree='{"q":"Is the floor red?","yes":"Turn left","no":{"q":"Is the floor green?","yes":"Turn right","no":"Keep driving"}}'></div>`
      },
      {
        kind: "activity",
        title: "Bumper Tag",
        minutes: 13,
        html: `<div class="callout robot">
<p><strong>Bumper tag on the field board (2 teams per field).</strong> Each robot drives forward and must react when its bumper is tagged.</p>
<ol class="steps">
  <li>Write a program: drive forward in short hops (<code>driveFor(forward, 4, inches)</code>) inside a <code>for</code> loop that repeats 20 times.</li>
  <li>After each hop, check <code>if (BumperA.pressing())</code>. If it's pressed: set the Touch LED red, back up 6 inches, and turn 90 degrees.</li>
  <li><code>else</code>: set the Touch LED green.</li>
  <li>Place both robots on the field. One student is the <strong>tagger</strong> who gently taps the bumper with a pool noodle or hand.</li>
  <li>Score: +1 every time a robot correctly backs away after a tag. -1 if it hits a wall without reacting.</li>
  <li><strong>Upgrade:</strong> Put red and green paper squares on the field. Add an <code>if</code> that makes the robot spin a victory 360 when it drives over green.</li>
</ol>
</div>
<div class="callout think"><p>Why does the robot sometimes miss a quick tap? (Hint: when does your code actually check the bumper?) We'll fix this with while loops next lesson!</p></div>`
      },
      {
        kind: "code",
        title: "Code It: Color Crossroads",
        minutes: 10,
        html: `<p>Your robot drives to a crossroads and reads the colored tile under it. The color tells it which way to go:</p>
<ul>
  <li><strong>Red</strong> → turn left</li>
  <li><strong>Green</strong> → turn right</li>
</ul>
<p>Then it drives 30 inches to the goal. Pick the wrong way and you'll smash into the wall!</p>
<div class="callout tip"><p>Real robot test: tape a red or green paper square on the field board and swap it between runs. Your <em>same</em> code should take a different path each time. That's the power of decisions.</p></div>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Stand up if the statement is <strong>true</strong> when x = 8: <code>x &gt; 5</code> ... <code>x == 7</code> ... <code>x &gt; 5 &amp;&amp; x &lt; 10</code> ... <code>x &lt; 2 || x != 3</code> ... <code>!(x &gt; 5)</code>.</p>`
      }
    ],
    challenge: {
      title: "Color Crossroads",
      prompt: `<p>The robot drives forward 18 inches onto a colored tile, then reads the floor with <code>Optical.color()</code>.</p>
<ul>
  <li>If the color is <strong>red</strong>: turn <strong>left</strong> 90 degrees.</li>
  <li>Else if the color is <strong>green</strong>: turn <strong>right</strong> 90 degrees.</li>
  <li>Then drive forward 30 inches and stop in the green goal without hitting the wall.</li>
</ul>
<p>Your code must use <code>if</code> and <code>Optical.color()</code>, so it would work no matter which tile is there.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  // Drive onto the crossroads tile
  Drivetrain.driveFor(forward, 18, inches);
  wait(0.5, seconds);

  if (Optical.color() == red) {
    Brain.Screen.print("RED: going left");
    // TODO: turn left 90 degrees

  }
  // TODO: add an else if for green that turns right 90 degrees

  // TODO: drive forward 30 inches to the goal

}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.driveFor(forward, 18, inches);
  wait(0.5, seconds);

  if (Optical.color() == red) {
    Brain.Screen.print("RED: going left");
    Drivetrain.turnFor(left, 90, degrees);
  } else if (Optical.color() == green) {
    Brain.Screen.print("GREEN: going right");
    Drivetrain.turnFor(right, 90, degrees);
  }

  Drivetrain.driveFor(forward, 30, inches);
}
`,
      hints: [
        "Inside the red branch: Drivetrain.turnFor(left, 90, degrees);",
        "else if (Optical.color() == green) { ... turnFor(right, 90, degrees); }",
        "The final driveFor goes AFTER the whole if / else if, so it runs either way."
      ],
      field: {
        start: { x: 48, y: 60, heading: 0 },
        tiles: [{ x: 42, y: 36, w: 12, h: 12, color: "red" }],
        walls: [{ x: 70, y: 28, w: 4, h: 28 }],
        goal: { x: 18, y: 42, r: 7 }
      },
      checks: [
        { type: "code", pattern: "if\\s*\\(", message: "Uses an if statement" },
        { type: "code", pattern: "Optical\\.color\\s*\\(\\s*\\)", message: "Reads Optical.color()" },
        { type: "code", pattern: "green", message: "Handles the green case too" },
        { type: "goal", message: "Robot ends inside the green goal" },
        { type: "noCollision", message: "Robot never hits a wall" }
      ]
    },
    reflection: "Describe a robot in real life (a self-driving car, an automatic door, a Roomba) that makes a decision. Write its decision as an if / else in plain English.",
    quiz: [
      {
        q: "x is 4. Which branch runs?  if (x > 5) {A} else if (x > 2) {B} else {C}",
        choices: ["A", "B", "C", "B and C"],
        answer: 1,
        explain: "x > 5 is false, x > 2 is true, so B runs. Only one branch ever runs."
      },
      {
        q: "Which checks if the color is red?",
        choices: ["Optical.color() = red", "Optical.color() == red", "Optical.color(red)", "if red"],
        answer: 1,
        explain: "== compares. A single = would try to store a value."
      },
      {
        q: "When is  (a && b)  true?",
        choices: ["When a is true", "When b is true", "Only when both a and b are true", "When either is true"],
        answer: 2,
        explain: "&& means AND: both sides must be true."
      },
      {
        q: "BumperA.pressing() returns...",
        choices: ["A number of inches", "A color", "true or false", "A string"],
        answer: 2,
        explain: "It returns a boolean: true when pressed, false when not."
      },
      {
        q: "What does  !(x == 3)  mean?",
        choices: ["x is 3", "x is not 3", "x is greater than 3", "Error"],
        answer: 1,
        explain: "! flips true to false. It's the same as x != 3."
      }
    ]
  },

  // ───────────────────────────────────────────── u2l4
  {
    id: "u2l4",
    unit: 2,
    order: 11,
    title: "While Loops & Sensors",
    minutes: 40,
    tags: ["code", "algorithms"],
    summary: "Loop until something happens: use while loops and the Distance Sensor to park the robot right before a wall.",
    objectives: [
      "I can write a while loop that repeats until a condition becomes false.",
      "I can explain the difference between a for loop and a while loop.",
      "I can use Drivetrain.drive and Drivetrain.stop with a sensor to stop at the right time.",
      "I can explain why we poll a sensor with a short wait."
    ],
    vocab: [
      { term: "while loop", def: "A loop that keeps repeating as long as its condition is true." },
      { term: "Condition", def: "A true/false question the loop checks before every iteration." },
      { term: "Polling", def: "Checking a sensor over and over in a loop to see if something changed." },
      { term: "Infinite loop", def: "A loop whose condition never becomes false, so it never ends." },
      { term: "Distance Sensor", def: "Measures how far away an object is in front of it, in inches or mm." }
    ],
    materials: [
      "BaseBots with a forward-facing Distance Sensor",
      "VEX IQ field board and its walls (or a box as a wall)",
      "Ruler/tape measure",
      "Blindfold (for the warmup, optional)"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: How Many Steps?",
        minutes: 5,
        html: `<p>Volunteer: walk toward the wall with your eyes closed. A partner says "keep going" until you're one hand away, then "STOP!"</p>
<div class="callout think"><p>Could you have used a for loop ("take exactly 12 steps")? What if you started from a different spot? What does the partner do that a for loop can't?</p></div>`
      },
      {
        kind: "learn",
        title: "Loop Until...",
        minutes: 9,
        html: `<p>A <code>for</code> loop repeats a <strong>known number</strong> of times. A <code>while</code> loop repeats <strong>until something changes</strong>.</p>
<pre class="code">Drivetrain.drive(forward);                          // start the motors, don't wait

while (DistanceSensor.objectDistance(inches) &gt; 6) { // still far away?
  wait(20, msec);                                   // check again in 20 ms
}

Drivetrain.stop();                                  // close enough: stop!</pre>
<ol>
  <li><code>Drivetrain.drive(forward)</code> starts driving and moves right on to the next line (it doesn't stop by itself).</li>
  <li>The while loop <strong>polls</strong> the sensor: "Am I still more than 6 inches away?" Yes → wait 20 ms, check again.</li>
  <li>As soon as the answer is no, the loop ends and <code>Drivetrain.stop()</code> runs.</li>
</ol>
<div class="callout tip"><p><strong>Why wait(20, msec)?</strong> Checking 50 times a second is plenty fast (the robot moves less than 0.2 in between checks), and it gives the Brain time to do other work. Without it, the loop spins as fast as possible for no benefit.</p></div>
<div class="callout warn"><p><strong>Infinite loop alert:</strong> <code>while (true) { }</code> never ends. And if your robot has no Distance Sensor plugged in, the condition might never change. Always know how your loop will end! (Press X on the Brain to escape.)</p></div>
<table class="tbl">
  <tr><th></th><th>for loop</th><th>while loop</th></tr>
  <tr><td>Use when</td><td>You know how many times</td><td>You repeat until something happens</td></tr>
  <tr><td>Example</td><td>Drive 6 sides of a hexagon</td><td>Drive until the wall is close</td></tr>
</table>`
      },
      {
        kind: "activity",
        title: "Wall Parking Contest",
        minutes: 13,
        html: `<div class="callout robot">
<p><strong>Teams of 3: Who can park closest to the wall without touching it?</strong></p>
<ol class="steps">
  <li>Place a box or the field wall at one end of the field board. Mark three start lines with tape: 24 in, 36 in, and 48 in from the wall.</li>
  <li>Program the while-loop parking code from above. Run it from <strong>all three</strong> start lines. Does the robot stop at the same spot every time? (A for loop or driveFor couldn't do that!)</li>
  <li>Measure the gap between the robot and the wall. Record it in a table.</li>
  <li>Experiment: try <code>setDriveVelocity(100, percent)</code>. Does it overshoot? Try a 2-inch stopping distance. Try removing the <code>wait</code>.</li>
  <li><strong>Contest:</strong> each team gets 2 official runs at the speed of their choice. Closest gap without touching wins. Touching = disqualified run!</li>
  <li>Bonus: print the distance on the Brain screen inside the loop so you can watch it count down.</li>
</ol>
</div>
<div class="callout think"><p>Faster robots reach the wall sooner but coast farther after stop(). How would a real self-driving car use this idea? (Hint: stopping distance in the rain on Route 128.)</p></div>`
      },
      {
        kind: "code",
        title: "Code It: Park Before the Wall",
        minutes: 10,
        html: `<p>In the simulator, there's a wall ahead but you don't know exactly how far. Don't measure. Let the sensor decide!</p>
<pre class="code">while (DistanceSensor.objectDistance(inches) &gt; ___) {
  wait(20, msec);
}</pre>
<p>Bonus: make the robot slow down when it gets close using an <code>if</code> inside the loop and <code>setDriveVelocity</code>.</p>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Quick vote: for loop or while loop? (1) Spin 3 times. (2) Drive until the bumper is pressed. (3) Blink the LED 10 times. (4) Wait until the Touch LED is pressed.</p>`
      }
    ],
    challenge: {
      title: "Park Before the Wall",
      prompt: `<p>There's a wall straight ahead. Drive toward it and <strong>stop less than 6 inches away</strong> without touching it.</p>
<ul>
  <li>Use <code>Drivetrain.drive(forward)</code>, a <code>while</code> loop that polls <code>DistanceSensor.objectDistance(inches)</code>, and <code>Drivetrain.stop()</code>.</li>
  <li>Don't use driveFor with a measured distance: the sensor must decide when to stop!</li>
</ul>`,
      starterCode: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.drive(forward);

  // TODO: change 100 so the loop keeps going while
  // the wall is MORE than 6 inches away
  while (DistanceSensor.objectDistance(inches) > 100) {
    wait(20, msec);
  }

  // TODO: stop the robot here

  Brain.Screen.print("Parked!");
}
`,
      solution: `#include "vex.h"
using namespace vex;

int main() {
  Drivetrain.setDriveVelocity(50, percent);
  Drivetrain.drive(forward);

  while (DistanceSensor.objectDistance(inches) > 6) {
    wait(20, msec);
  }

  Drivetrain.stop();
  Brain.Screen.print("Parked!");
}
`,
      hints: [
        "Change 100 to 6 so the loop runs while the wall is more than 6 inches away.",
        "After the loop, add Drivetrain.stop(); otherwise the robot keeps driving into the wall!",
        "If you print inside the loop, keep the wait(20, msec) so it doesn't print thousands of lines."
      ],
      field: {
        start: { x: 48, y: 60, heading: 0 },
        walls: [{ x: 30, y: 10, w: 36, h: 4 }],
        goal: { x: 48, y: 26, r: 6 }
      },
      checks: [
        { type: "code", pattern: "while\\s*\\(", message: "Uses a while loop" },
        { type: "code", pattern: "objectDistance", message: "Reads the Distance Sensor" },
        { type: "code", pattern: "Drivetrain\\.stop\\s*\\(", message: "Stops the drivetrain" },
        { type: "goal", message: "Robot parks in the green zone near the wall" },
        { type: "noCollision", message: "Robot never touches the wall" }
      ]
    },
    reflection: "Explain the difference between a for loop and a while loop using your own example (not a robot one). When would you use each?",
    quiz: [
      {
        q: "When does  while (DistanceSensor.objectDistance(inches) > 6)  stop looping?",
        choices: ["After 6 loops", "When the distance is 6 inches or less", "When the distance is more than 6", "Never"],
        answer: 1,
        explain: "It loops while the distance is greater than 6. Once it's 6 or less, the condition is false and the loop ends."
      },
      {
        q: "What does Drivetrain.drive(forward); do?",
        choices: ["Drives 1 inch", "Starts driving and keeps going until told to stop", "Drives forward for 1 second", "Nothing until wait is called"],
        answer: 1,
        explain: "drive() starts the motors and moves on immediately. You must call stop() later."
      },
      {
        q: "Which job is best for a while loop?",
        choices: ["Drive a square", "Blink 5 times", "Drive until the bumper is pressed", "Print the numbers 1 to 10"],
        answer: 2,
        explain: "You don't know ahead of time how long it will take until the bumper is pressed."
      },
      {
        q: "Why do we put wait(20, msec); inside the polling loop?",
        choices: ["To make the robot faster", "To check the sensor at a steady, reasonable rate", "Because C++ requires it", "To turn the robot"],
        answer: 1,
        explain: "50 checks per second is plenty, and it keeps the loop from wasting the Brain's time."
      }
    ]
  },

  // ───────────────────────────────────────────── u2l5
  {
    id: "u2l5",
    unit: 2,
    order: 12,
    title: "Functions",
    minutes: 40,
    tags: ["code", "algorithms"],
    summary: "Package code into reusable functions with parameters and return values, build a dance-move library, and write drivePolygon.",
    objectives: [
      "I can define and call a function.",
      "I can use parameters to make a function work for different values.",
      "I can write a function that returns a value.",
      "I can break a big robot task into smaller functions."
    ],
    vocab: [
      { term: "Function", def: "A named block of code you can run (call) whenever you need it." },
      { term: "Parameter", def: "A variable in a function's definition that receives a value when the function is called." },
      { term: "Argument", def: "The actual value you pass to a function when you call it, like the 6 in drivePolygon(6, 12)." },
      { term: "Return value", def: "The answer a function sends back to the code that called it." },
      { term: "void", def: "A return type meaning the function does something but doesn't send a value back." }
    ],
    materials: [
      "Built BaseBots",
      "VEX IQ field board",
      "Index cards (one per dance move)",
      "Speaker for music"
    ],
    video: "",
    sections: [
      {
        kind: "warmup",
        title: "Do Now: Name That Move",
        minutes: 5,
        html: `<p>Dance teachers don't say "step left, step right, clap, spin" every time. They say <em>"do the grapevine."</em> Coaches say "run a slant route."</p>
<div class="callout think"><p>List 3 things in your life that have a short name for a long list of steps (a recipe, a play in a sport, a dance). Why are short names useful?</p></div>`
      },
      {
        kind: "learn",
        title: "Writing Functions",
        minutes: 10,
        html: `<p>A <strong>function</strong> gives a name to a group of statements. Define it once <strong>above</strong> <code>main</code>, then call it as often as you like.</p>
<pre class="code">void wiggle() {                         // definition
  Drivetrain.turnFor(left, 30, degrees);
  Drivetrain.turnFor(right, 60, degrees);
  Drivetrain.turnFor(left, 30, degrees);
}

int main() {
  wiggle();                             // call it
  Drivetrain.driveFor(forward, 6, inches);
  wiggle();                             // call it again!
}</pre>
<h3>Parameters: functions with settings</h3>
<pre class="code">void spin(int times) {
  for (int i = 0; i &lt; times; i++) {
    Drivetrain.turnFor(right, 360, degrees);
  }
}

spin(2);   // times = 2
spin(5);   // times = 5</pre>
<h3>Return values: functions that answer</h3>
<pre class="code">double revsFor(double inches) {
  return inches / 7.87;      // VEX IQ wheel: about 7.87 in per turn
}

double r = revsFor(24);      // r is about 3.05</pre>
<table class="tbl">
  <tr><th>Part</th><th>In <code>double revsFor(double inches)</code></th></tr>
  <tr><td>Return type</td><td><code>double</code> (use <code>void</code> if nothing comes back)</td></tr>
  <tr><td>Name</td><td><code>revsFor</code></td></tr>
  <tr><td>Parameter</td><td><code>double inches</code></td></tr>
</table>`
      },
      {
        kind: "activity",
        title: "Dance Move Library",
        minutes: 13,
        html: `<div class="callout robot">
<p><strong>Build a class "library" of robot dance moves.</strong></p>
<ol class="steps">
  <li>Each team invents <strong>2 dance moves</strong> and writes each as a function with at least one parameter, e.g. <code>void shimmy(int reps)</code> or <code>void slide(double inches)</code>.</li>
  <li>Write each function on an index card: the name, the parameters, and what it does. Post the cards on the board. This is the class library!</li>
  <li>Test your moves on the real robot on the field board. Do they work with different arguments?</li>
  <li>Borrow at least <strong>2 moves from other teams' cards</strong> and type them into your program.</li>
  <li>Write a <code>main</code> that is a full routine using 4+ function calls. Your <code>main</code> should read like a dance chart!</li>
  <li>Dance-off: each team performs to music. The class guesses the function names from the moves.</li>
</ol>
</div>
<div class="callout think"><p>Real programmers share libraries of functions too (VEX's own <code>driveFor</code> is a function someone else wrote!). What makes a function easy for <em>someone else</em> to use?</p></div>`
      },
      {
        kind: "code",
        title: "Code It: drivePolygon",
        minutes: 9,
        html: `<p>Combine everything from this unit: variables, math, loops, and functions. One function, any shape:</p>
<pre class="code">void drivePolygon(int sides, double length) {
  double angle = 360.0 / sides;
  // loop over the sides...
}

int main() {
  drivePolygon(4, 20);   // square
  drivePolygon(3, 36);   // triangle
}</pre>
<p>Why <code>360.0</code> and not <code>360</code>? Try <code>drivePolygon(7, 10)</code> with each and see!</p>`
      },
      {
        kind: "wrapup",
        title: "Wrap-Up",
        minutes: 3,
        html: `<p>Look back at Unit 2: variables, loops, decisions, while loops, functions. With your team, name the one you'd want most if you were programming a Mars rover, and why.</p>`
      }
    ],
    challenge: {
      title: "drivePolygon",
      prompt: `<p>Finish the function <code>void drivePolygon(int sides, double length)</code> so that it drives a regular polygon with any number of sides, turning <strong>right</strong> at each corner.</p>
<p>Then call it twice from <code>main</code>:</p>
<ol>
  <li><code>drivePolygon(4, 20);</code> a 20-inch square</li>
  <li><code>drivePolygon(3, 36);</code> a 36-inch triangle</li>
</ol>
<p>Drive over both blue tiles (one on the square, one on the tip of the triangle) and end back in the green goal.</p>`,
      starterCode: `#include "vex.h"
using namespace vex;

// Drives a regular polygon, turning right at every corner.
void drivePolygon(int sides, double length) {
  double angle = 0;   // TODO: use the polygon rule with 360.0

  // TODO: write a for loop that repeats once per side:
  //   drive forward length inches
  //   turn right angle degrees

}

int main() {
  drivePolygon(4, 20);   // square

  // TODO: call drivePolygon to drive a triangle with 36-inch sides

  Brain.Screen.print("Shapes done!");
}
`,
      solution: `#include "vex.h"
using namespace vex;

// Drives a regular polygon, turning right at every corner.
void drivePolygon(int sides, double length) {
  double angle = 360.0 / sides;
  for (int i = 0; i < sides; i++) {
    Drivetrain.driveFor(forward, length, inches);
    Drivetrain.turnFor(right, angle, degrees);
  }
}

int main() {
  drivePolygon(4, 20);
  drivePolygon(3, 36);
  Brain.Screen.print("Shapes done!");
}
`,
      hints: [
        "angle = 360.0 / sides;",
        "for (int i = 0; i < sides; i++) { Drivetrain.driveFor(forward, length, inches); Drivetrain.turnFor(right, angle, degrees); }",
        "The triangle call is drivePolygon(3, 36);"
      ],
      field: {
        start: { x: 30, y: 50, heading: 0 },
        tiles: [
          { x: 47, y: 27, w: 6, h: 6, color: "blue" },
          { x: 58.2, y: 29, w: 6, h: 6, color: "blue" }
        ],
        goal: { x: 30, y: 50, r: 6 }
      },
      checks: [
        { type: "code", pattern: "void\\s+drivePolygon\\s*\\(\\s*int\\s+\\w+\\s*,\\s*double\\s+\\w+\\s*\\)", message: "Defines void drivePolygon(int sides, double length)" },
        { type: "code", pattern: "for\\s*\\(", message: "Uses a loop inside the function" },
        { type: "code", pattern: "drivePolygon\\s*\\(\\s*3\\s*,\\s*36", message: "Calls drivePolygon(3, 36)" },
        { type: "visitedTiles", message: "Robot drove over both blue tiles" },
        { type: "goal", message: "Robot ends back in the green goal" },
        { type: "noCollision", message: "Robot never hits a wall" }
      ]
    },
    reflection: "Pick one of the dance-move functions from the class library. Describe what its parameters control and how you could change it to do something new.",
    quiz: [
      {
        q: "In  drivePolygon(6, 12);  what is 6?",
        choices: ["The return value", "An argument passed to the sides parameter", "The function's name", "The number of inches"],
        answer: 1,
        explain: "6 is the argument that fills the first parameter, sides."
      },
      {
        q: "What does  void  mean in  void wiggle()?",
        choices: ["The function is empty", "The function returns no value", "The function can't be called", "The function runs forever"],
        answer: 1,
        explain: "void means the function does something but doesn't send a value back."
      },
      {
        q: "double half(double x) { return x / 2; }  What is  half(10)?",
        choices: ["2", "5", "10", "20"],
        answer: 1,
        explain: "The function returns 10 / 2 = 5."
      },
      {
        q: "What's the biggest benefit of functions?",
        choices: ["They make the robot faster", "You write code once and reuse it with different values", "They remove the need for main", "They replace variables"],
        answer: 1,
        explain: "Functions let you reuse and organize code, so programs are shorter and easier to fix."
      }
    ]
  }
];
