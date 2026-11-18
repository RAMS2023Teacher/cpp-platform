# Writing a lesson

One YAML file per lesson in `course/lessons/grade7/` or `course/lessons/grade8/`, named like `03-hello-brain.yaml`. The lesson's number, icon, color,
big idea and hardware come from its row in `course/rules.py` (`COURSE`). `python tools/build.py` checks every lesson,
runs every simulator step's solution through the real simulator, and refuses to build if something is wrong.
`course/lessons/grade8/03-hello-brain.yaml` is the model to copy.

Text fields are Markdown: `**bold**`, `` `code` ``, lists. Keep sentences short and plain (7th and 8th graders, some
reading below grade level). The validator enforces the word limits below.

```yaml
id: hello-brain                 # must match a row in rules.COURSE
title: Hello, Brain
tagline: Write your first C++ program and run it on a real robot
minutes: 80                     # about two class periods; use `part:` to split the days

mission:
  big_question: How does a robot know what to do first?    # ≤ 15 words: the class display's question of the day
  goal: What they'll build, in 2-3 sentences (≤ 70 words)
  picture: {type: flow, steps: [...]}        # optional: any visual (see Pictures)
  you_need: [A partner, Your drive base]
  learn: ["**sequence**: code runs top to bottom"]
  talk: A question to talk over with their partner (they write what they decided)

build:                          # 3-16 steps, one per screen
  - part: "Part 1: In the simulator"   # optional group label (shown above the title, a divider in the step dots)
    title: Say hello
    say: The one idea for this step (≤ 80 words)
    wiring: ["Plug the left motor into **Port 1**"]   # optional: wiring / plugging-in steps
    do: [Type the new line., Press Run.]
    code: |                     # optional: code to read or type (C++ unless the lesson or step says lang: python)
      int main() {
        Brain.Screen.print("Hello");
      }
    new: "2"                    # optional: lines of `code` to highlight as new
    what: What the code does
    tip: A "watch out" note
    stuck: [Things to check when it doesn't work]
    picture: {type: shot, name: vx-paste, caption: "..."}
    sim:                        # optional: the code editor + robot simulator, right in the step
      starter: |                # what's in the editor at first (not the answer: leave TODO comments)
        int main() {
          // TODO: print Hello on the Brain screen
        }
      field: {start: {x: 48, y: 60, heading: 0}, goal: {x: 48, y: 36, r: 6}}
      checks:                   # 1-4. Each is a Test it box that ticks itself when the program passes
        - {type: output, pattern: "Hello", message: "The Brain screen says Hello"}
      solution: |               # teachers see it; the build proves it passes every check
        int main() {
          Brain.Screen.print("Hello");
        }
      # carry: true             # start from the student's program in the last simulator step, not `starter`
      # drive: true             # a driving step (keyboard joysticks). Needs `pilot`.
      # pilot: [[0, {A: 100, D: 100}], [2.5, {}]]   # [seconds, joystick values]: proves the solution can pass
    test: [It printed on the real Brain too]      # 1-4 checkboxes they tick themselves (0-3 extra on a sim step)
    fields: [Real distance (in)]                  # optional small blanks to fill in (up to 4)
    ask: One question (≤ 40 words); they must answer it to go on

quiz:                           # 3-6 questions; pass at 75%
  - question: What does every C++ statement end with?
    choices: ["A period", "A semicolon", "A colon", "Nothing"]
    answer: 1                   # 0-based
    why: Shown after they answer

ship:
  turn_in: code                 # code (default with a sim step): their program from the last sim step
                                # link: a share link · show: they show the teacher the real robot
  note: Optional sentence shown above the turn-in box
  extensions:                   # they must add at least one
    - title: Count down first
      level: Easier             # Easier, Medium or Challenge
      goal: ...
      where: Where the code goes
      code: |
        ...
      new: "1-3"
      hints: [...]
  reflect: [1-3 questions they answer before shipping]

teacher_notes: |
  Shown only to the teacher, with the quiz answers and simulator solutions.
standards:
  - code: 6-8.CT.d.5            # MA DLCS codes from course/standards.yaml
    how: What in the lesson meets it
```

## The lab: Circuit City Arena

Both grades work in the same robot lab, which about 30 sections share. Write every lesson for this room:

- **Parts live in labeled bins.** Students fetch what they need and put it back. No lesson has students build a
  whole robot from loose parts, and no robot belongs to one team for the term unless the teacher says so.
- **Students pick a ready-built chassis and modify it.** The four chassis (also in `rules.CHASSIS`):
  **2WD Standard** (two drive wheels and a caster: quick turns, all-rounder), **2WD Lite** (smaller and lighter:
  fast, nimble, easy to push), **3WD Side Crawler** (three wheels: climbs well, turns differently) and **4WD**
  (four driven wheels: most grip and pushing power, slower to turn).
- **Modifications** are what students build: swap the wheels, move the Brain (weight and balance), and bolt on
  add-ons such as sensors, a claw, an arm, a wedge or a pusher. Building steps are about choosing, changing one
  thing and testing, not following a long assembly guide.
- **Each week teaches one part of the robot** (the Brain, the controller, wheels and weight, manipulators, a
  sensor), then students use it in a **Circuit City Arena challenge**: scored, team against team, with prizes.
  The events and their scoring guides are in `rules.ARENA_EVENTS`; the teacher types scores on the class page and
  the class display shows the standings. A challenge lesson should state the rules and the scoring exactly as
  they are in `rules.ARENA_EVENTS`, tell teams to write down their score, and say that the teacher enters it.
- The arena challenges: **Brain Song** (program a tune), **The Impossible Bridge** (a steep bridge with only two
  beams to drive on: needs careful driving, the right wheels and the weight in the right place), **Castle
  Crasher** (knock down block towers, bring home blocks of your color), **Sumo** (push the other bot out of the
  ring or knock down its pillar), **Maze Runner** (coded, no driver: an easy course and a hard course) and, in
  grade 8, the **Collection Run** (the robot drives itself, collects a block and parks).
- Grade 7 is the "Rookie Season" (10 lessons). Grade 8 is the "Pro Season" (11 lessons); most 8th graders did the
  7th grade course the year before, so grade 8 can say "you may remember" but must not depend on it.

## The robot (VEX IQ 1st generation)

Every lesson uses the same robot and the same device names. Students give their devices these names in
VEXcode IQ's **Devices** window, so code moves between the simulator and the real robot unchanged.

```cpp
// Driving by code (lessons 4, 8-12). Needs the Drivetrain device (motors on ports 1 and 6, with the Gyro).
Drivetrain.driveFor(forward, 12, inches);      // or reverse; units inches or mm
Drivetrain.turnFor(right, 90, degrees);        // or left
Drivetrain.drive(forward);  Drivetrain.turn(right);  Drivetrain.stop();
Drivetrain.setDriveVelocity(50, percent);  Drivetrain.setTurnVelocity(50, percent);

// Driver control (lessons 5-7). Two separate motors and the Controller.
LeftMotor.setVelocity(50, percent);  LeftMotor.spin(forward);  LeftMotor.stop();   // RightMotor is the same
LeftMotor.spinFor(forward, 360, degrees);
Controller.AxisA.position()     // left stick up/down, -100 to 100     (AxisB: left stick left/right)
Controller.AxisD.position()     // right stick up/down                 (AxisC: right stick left/right)
Controller.ButtonLUp.pressing() // also ButtonLDown, ButtonRUp, ButtonRDown, ButtonEUp, ButtonEDown, ButtonFUp, ButtonFDown
ArmMotor.spinFor(forward, 180, degrees);  ArmMotor.spin(forward);  ArmMotor.stop();
ClawMotor.spinFor(forward, 90, degrees);    // forward closes the claw on a cube in front; reverse opens it

// Sensors (lessons 9-12)
Bumper.pressing()               // true while the front bumper is pushed in
Distance.distance(inches)       // how far the nearest thing in front is (or mm);  Distance.foundObject()
Color.brightness()              // 0-100: black tape is about 5, the white floor about 90
Color.colorname3() == colorType::red   // red, green or blue (none if it's something else);  Color.hue()
TouchLED.setColor(green);       // red, green, blue, yellow, orange, purple, white
Gyro.heading()                  // 0-360 degrees;  Gyro.rotation()

// Brain and timing
Brain.playNote(1, 0, 500);      // octave 1-3, note 0-6 (C D E F G A B), milliseconds. The simulator beeps.
Brain.playSound(soundType::tada);   // siren, wrongWay, fillup, alarm, tada, doorClose, ratchet, wrench, powerDown...
Brain.Screen.print("Score: %d", score);  Brain.Screen.newLine();  Brain.Screen.clearScreen();  Brain.Screen.setCursor(1, 1);
Brain.Timer.time(seconds);  Brain.Timer.clear();
wait(1, seconds);  wait(200, msec);
```

C++ the simulator understands: `int double float bool`, arrays, `if / else if / else`, `while`, `for`, functions with
parameters and return values, `&& || !`, comparison and math operators, `abs min max`. A program is just
`int main() { ... }` plus any functions above it. Not supported: classes, pointers, events/callbacks.
The simulator insists on semicolons, units on `driveFor`/`turnFor`/`spinFor`, and `==` in conditions.

In the simulator the keyboard is the controller: **W/S** = left stick up/down (AxisA), **A/D** = left stick
left/right (AxisB), **↑/↓** = right stick up/down (AxisD), **←/→** = right stick left/right (AxisC),
**Q/Z** = L Up/L Down, **E/C** = R Up/R Down, **1/2** = E Up/E Down, **9/0** = F Up/F Down.

## The simulator field

Units are inches. The field is 96 wide and 72 tall, origin top-left, **y grows down**. Heading 0 faces up the
screen, 90 faces right (clockwise). The robot is about 9 × 10 in (collision radius 5.2 in). At 50% velocity it
drives about 8 in/s and turns about 90°/s. The Distance sensor measures from the robot's front (5.5 in ahead of
its center); the Color sensor reads the floor 3.5 in ahead of center.

```yaml
field:
  start: {x: 12, y: 60, heading: 0}
  walls: [{x: 40, y: 0, w: 4, h: 48}]                 # rectangles (the outer border is automatic)
  lines: [{points: [[12, 60], [12, 12], [84, 12]], width: 2}]   # black tape
  tiles: [{x: 70, y: 50, w: 12, h: 12, color: red}]  # colored floor squares
  goal: {x: 84, y: 12, r: 6}                          # green target circle
  cubes: [{x: 30, y: 40, color: blue}]                # the robot pushes cubes it drives into; the claw can carry one
  zones: [{x: 80, y: 50, w: 14, h: 14, color: blue}]  # drop zones
  ring: {x: 48, y: 36, r: 20}                         # a sumo ring
```

Checks (`type`):

| type | passes when |
|---|---|
| `goal` | the robot is inside the goal when the program ends |
| `reachGoal` | the robot was inside the goal at any time (use this for driving steps) |
| `noCollision` | the robot never hit a wall |
| `output` + `pattern` | the Brain screen text matches the regular expression |
| `code` + `pattern` | the program's code (comments removed) matches the regular expression |
| `cubesInZones` | every cube is in a zone of its own color |
| `cubesOutOfRing` | every cube is outside the ring |
| `stayInRing` | the robot's center never left the ring |
| `visitedTiles` | the Color sensor passed over every tile |
| `drove` + `inches` | the robot traveled at least that far |
| `notes` + `count`, `different` | the Brain played at least `count` notes, with at least `different` different pitches |

## Pictures

`picture:` on the mission or a step is one of:

* a drawn visual: `{type: flow, steps: [{icon, label, color}], loop: true}`, `{type: compare, items: [{icon, title, text}]}`,
  `{type: graph, ...}`, `{type: dial, ...}`, `{type: part, part: led|resistor|button|dcmotor|battery, color}`
* a screenshot from `course/shots/`: `{type: shot, name: vx-paste, caption: "..."}`
  (`vx-new-project`, `vx-brain`, `vx-devices`, `vx-paste`, `vx-save`)
* VEX part pictures, linked from VEX's website: `{type: vex, names: [beams, pins], caption: "..."}`.
  Names are in `course/pictures.py`: `smartmotor omniwheel bumper touchled gyro beams beamlengths pins connectors
  shafts shaftlock basebot basebotbuild plowbot claw clawarm armbuild clawbuild`.

Each picture takes an optional `caption`.
