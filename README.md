# RoboCode Academy

A 12-project robotics course for 8th grade: **circuits, mechanics and C++ with VEX IQ (1st generation)**. It starts
with a single circuit on a micro:bit and ends with a robot that finishes a course with no driver. It looks and works
like the teacher's other courses (micro:bit Maker Lab, AppVenture, Scratch Quest) and is built on Maker Lab's engine.
It runs as a **Google Apps Script web app** in the teacher's school Google account, and student work stays in the
teacher's Drive.

**To install or update it, follow [dist/apps-script/INSTALL.md](dist/apps-script/INSTALL.md)** (paste 3 Script files
into a new Apps Script project).

## The course

| # | Project | Big idea | Hardware |
|---|---|---|---|
| 1 | Light It Up | Circuits: input → decide → output | micro:bit, LED, resistor, button |
| 2 | Motors and Gears | Gear ratios: speed or strength | Smart Motor, gears, shafts |
| 3 | Build the Drive Base | Structure, bracing and Smart Ports | VEX IQ kit, 2 motors, Brain |
| 4 | Hello, Brain | A C++ program runs in order | Drive base + USB cable |
| 5 | Take the Wheel | Loops · joystick numbers → motor speed | Controller |
| 6 | Battle Bot Design | if / else · buttons run a mechanism | Extra motor, beams for a wedge |
| 7 | **Battle Bot Challenge** | Test, improve, compete (driver-controlled sumo) | Your battle bot + the ring |
| 8 | Drive by Code | Sequences and for loops | Drive base + Gyro Sensor |
| 9 | Feel the Wall | if / else with a sensor | Bumper Switch + Touch LED |
| 10 | See It Coming | while loops with a sensor | Distance Sensor |
| 11 | Follow the Line | Functions and thresholds | Color Sensor |
| 12 | **Autonomy Challenge** | Sense → decide → act, all together | Your robot + the course |

Each lesson is about two class periods and is split into two Parts.

## How a lesson works

| Stage | What students do |
|---|---|
| 🎯 **Mission** | See what they'll build and what they need, and talk a question over with their partner |
| 🛠️ **Build** | One step per screen: what to do, code with the **new lines highlighted**, a green **Test it** box, and one question. **Got it! Next ▶** unlocks when the step is done |
| 🧠 **Quiz** | 4-5 questions as colored answer tiles, graded on the server (pass at 75%) |
| 🚀 **Ship it** | Pick at least one extension, answer the reflection questions, and turn in |

**The editor and simulator are inside the Build steps.** In a coding step students type C++ next to a simulated
VEX IQ robot. The step's 🤖 Test it boxes tick themselves when the program passes (the robot stops in the goal,
never hits a wall, prints the right thing, and so on). In driving lessons the keyboard is the controller. A
**Copy for VEXcode** button hands the program to **VEXcode IQ**, which opens in its own tab and puts it on the real Brain.

Turn-ins are the program from the last simulator step (coding lessons), a MakeCode share link (lesson 1), or
ticking "I showed my teacher my robot" (build lessons and the Battle Bot Challenge).

Around that: XP, levels, badges and a robot avatar; a skill tree; partners on one Chromebook (work saves to both);
a teacher gradebook with each student's stage, quiz score, answers and programs; a projector **Class display** with
a timer, the question of the day, the lesson's standards, a race track of where everyone is, and recent wins;
Google Classroom roster import and a grades package; and the Robot Rush arcade the teacher can open as a reward.

## CAD Studio

[`vex-cad-studio/`](vex-cad-studio/) is VEX IQ CAD Studio, a 3D building app with the real VEX IQ parts, for planning
builds in class or at home. It is its **own** Apps Script project. Lessons open it with the **Open CAD Studio**
button. Its address is `CAD_STUDIO_URL` in `course/rules.py`.

## Working on it

You need Python 3 (`pip install -r requirements.txt -r requirements-dev.txt`) and Node.js.

```bash
python tools/build.py
```

```bash
python -m pytest -q
```

```bash
node tests/apps_script_app/serve.js dist/apps-script 5055
```

The last one serves the app with pretend Google services at http://localhost:5055/exec (you are the teacher;
add `?as=sam@students.school.org` to be a student).

| Folder | What's in it |
|---|---|
| `course/lessons/` | The 12 lessons, one YAML file each. [docs/LESSONS.md](docs/LESSONS.md) explains the format, the robot's C++ commands and the simulator. |
| `course/rules.py` | The course plan, XP, levels, badges, avatar parts and the links to VEXcode IQ and CAD Studio. |
| `course/shots/`, `course/pictures.py` | VEXcode IQ screenshots, and the list of VEX part pictures (linked from VEX's website). |
| `apps_script/server/` | The Apps Script backend. |
| `apps_script/client/` | The pages. `lesson.js` is the lesson player, `lib/sim.js` the robot simulator, `lib/ide.js` the step editor. |
| `tools/` | `build.py` makes `dist/apps-script/`. `check_lesson.py FILE` checks one lesson. `check_sims.js` proves every simulator step can be passed. |
| `dist/apps-script/` | **Generated.** The files that go into Google. |
| `classroom-sender/` | The small separate script that sends grades to Google Classroom. See [docs/GOOGLE_CLASSROOM.md](docs/GOOGLE_CLASSROOM.md). |

## History

The earlier 29-lesson version of RoboCode Academy (a different design, with a spreadsheet backend) is kept on the
branch `backup/2026-11-17-robocode-before-restart`.
