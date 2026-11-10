# Lesson file format

Lessons live in `lessons/unitN.js`. Each file exports an array of lesson objects:

```js
module.exports = [
  {
    id: "u1l1",                 // unique, short, stable (used in the database!)
    unit: 1,
    order: 1,                   // global order across all units (1..N) – defines the progression
    title: "What Is a Robot?",
    minutes: 35,                // 30-40
    tags: ["build", "code", "algorithms", "ai"],   // any subset
    summary: "One sentence shown on the lesson card.",
    objectives: ["I can ...", "I can ..."],
    vocab: [{ term: "Sensor", def: "..." }],
    materials: ["VEX IQ kit", "Whiteboard"],       // classroom stuff the teacher needs
    video: "",                  // leave empty – teacher adds a YouTube/Drive URL from the dashboard
    sections: [
      // kind: "warmup" | "learn" | "build" | "activity" | "unplugged" | "code" | "wrapup"
      { kind: "warmup", title: "Do Now", minutes: 5, html: `<p>...</p>` },
      ...
    ],
    challenge: {                // the coding challenge students solve in the built-in editor (optional)
      title: "Drive a Square",
      prompt: `<p>HTML instructions</p>`,
      starterCode: `...C++...`,
      hints: ["...", "..."],
      field: { ... },           // optional simulator field, see below
      checks: [ ... ]           // auto-checks, see below
    },
    reflection: "A short-answer exit question students type an answer to.",
    quiz: [                     // 3-5 multiple choice exit-ticket questions
      { q: "Question?", choices: ["A", "B", "C", "D"], answer: 1, explain: "Why B is right." }
    ]
  }
];
```

## Term plans
`lessons/plans.js` lists which lessons form each term (the plan keys 10, 12 and 15 now hold 11, 13 and 16 lessons), and what each Go Further lesson needs first. A new lesson also needs a part in `public/js/quest.js`.

Write lessons with the standard device names (`DistanceSensor`, `Optical`, `BumperA`, `TouchLED`, `ClawMotor`, `ArmMotor`, `BrainInertial`). Students see them adapted to their kit and their Robot Setup names, and auto-checks run against the standard names.

## HTML inside sections
- Companion apps: `<a class="btn sm" data-app="cad">CAD Studio ↗</a>` (or `data-app="vexcode"`) opens that app in its own tab, and `<button class="btn sm" type="button" data-side="cad">⧉</button>` shows the side-by-side help.
- VEX part pictures: `<div data-vex="brain2 smartmotor"></div>` shows pictures listed in `lessons/vex-images.js`. They load from VEX's own website with an "Image: VEX Robotics" credit, and pictures marked for one kit generation are hidden for the other.
- Screenshots: `<figure class="shot" data-shot="NAME"><figcaption>Caption</figcaption></figure>` shows `shots/NAME.webp` (see docs/SCREENSHOTS.md).
Plain HTML. Useful classes:
- `<div class="callout tip">`, `<div class="callout warn">`, `<div class="callout robot">` (VEX board / hardware activity), `<div class="callout think">` (discussion)
- `<pre class="code">` for C++ snippets (escape `<` as `&lt;` !)
- `<ol class="steps">` for numbered build/activity steps
- `<table class="tbl">`
- Interactive widgets (rendered by the site): `<div data-widget="NAME"></div>` where NAME is one of
  - `binary-search` – guess-the-number game that counts guesses
  - `bubble-sort` – step-through bubble sort visualizer
  - `maze-bfs` – grid maze where students place walls and watch BFS find the shortest path
  - `perceptron` – click to place red/blue points, train a perceptron, watch the line move
  - `decision-tree` – a "robot decision" tree students click through (uses `data-tree` JSON: `{"q":"Wall ahead?","yes":{...},"no":"Drive forward"}`)

## Simulator (the built-in editor)
Students write real VEX IQ (2nd gen) C++. The site runs it in a top-down 2D simulator.
Supported subset:

```cpp
#include "vex.h"            // ignored
using namespace vex;        // ignored
int main() { ... }          // required entry point

// Types: int double float bool char string auto long, const; arrays  int a[5] = {1,2,3,4,5};
// std::vector<int> v = {..}; v.push_back(x); v.size(); v[i]
// if / else if / else, while, do-while, for, switch, break, continue, return, functions with params
// && || ! == != < > <= >= + - * / % ++ -- += -= ; ternary ?:
// Math: abs fabs sqrt pow min max round floor ceil, rand(), srand(), to_string()
// Output: std::cout << "x = " << x << std::endl;   printf("%d\n", x);

Drivetrain.driveFor(forward, 12, inches);   // also reverse; units: inches, mm
Drivetrain.turnFor(right, 90, degrees);     // also left
Drivetrain.drive(forward);  Drivetrain.turn(right);  Drivetrain.stop();
Drivetrain.setDriveVelocity(50, percent);   Drivetrain.setTurnVelocity(50, percent);
Drivetrain.turnToHeading(90, degrees);      Drivetrain.heading(degrees);
wait(1, seconds);  wait(200, msec);

Brain.Screen.print("Hello %d", x);  Brain.Screen.newLine();  Brain.Screen.clearScreen();  Brain.Screen.setCursor(1,1);
Brain.Timer.time(seconds);  Brain.Timer.clear();
BrainInertial.heading(degrees);  BrainInertial.rotation(degrees);

DistanceSensor.objectDistance(inches);      // distance to wall in front (mm also ok)
DistanceSensor.isObjectDetected();
BumperA.pressing();                         // true when robot's front touches a wall
Optical.color();                            // returns red, green, blue, yellow, black, white … of the floor under robot
Optical.brightness();                       // 0-100 (black line ≈ 5, white floor ≈ 90)
TouchLED.setColor(green);
ClawMotor.spinFor(forward, 90, degrees);    // forward = close claw (grabs a cube right in front), reverse = open (drops it)
ArmMotor.spinFor(forward, 180, degrees);    // lifts arm (visual only)
```
Not supported: classes/structs, pointers, references, templates other than vector, multithreading/events.

### Field (units are inches; field is 96 wide × 72 tall; origin top-left; y grows DOWN)
Heading 0 = facing up (north), 90 = right (east), clockwise like VEX.
```js
field: {
  start: { x: 12, y: 60, heading: 0 },
  walls: [{ x: 40, y: 0, w: 4, h: 48 }],               // rectangles (the outer border is automatic)
  lines: [{ points: [[12,60],[12,12],[84,12]], width: 1 }], // black tape lines (for line following)
  tiles: [{ x: 70, y: 50, w: 12, h: 12, color: "red" }],    // colored floor squares (Optical sensor)
  goal:  { x: 84, y: 12, r: 6 },                         // green target circle
  cubes: [{ x: 30, y: 40, color: "blue" }],              // cubes the claw can pick up
  zones: [{ x: 80, y: 50, w: 14, h: 14, color: "blue" }] // drop zones (outlined)
}
```
The robot is about 9 in × 10 in. Default speed at 50%: ~8 in/s driving, ~90°/s turning.

### Checks (auto-graded when student clicks “Check & Submit”)
```js
checks: [
  { type: "goal", message: "Robot ends inside the green goal" },
  { type: "noCollision", message: "Robot never hits a wall" },
  { type: "output", pattern: "Hello", message: "Prints Hello on the Brain screen" },  // regex on Brain/console output
  { type: "code", pattern: "for\\s*\\(", message: "Uses a for loop" },                   // regex on source code
  { type: "cubesInZones", message: "Every cube is in the zone matching its color" },
  { type: "visitedTiles", message: "Robot drove over every colored tile" }
]
```
