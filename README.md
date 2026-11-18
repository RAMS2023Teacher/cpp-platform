# RoboCode Academy

Robotics courses for grades 7 and 8: **mechanics and C++ with VEX IQ (1st generation)**, built around the
teacher's robot lab, **Circuit City Arena**. Students pick a ready-built chassis, modify it, learn one part of the
robot each week, and compete in scored arena challenges. It looks and works like the teacher's other courses
(micro:bit Maker Lab, AppVenture, Scratch Quest) and is built on Maker Lab's engine.
It runs as a **Google Apps Script web app** in the teacher's school Google account, and student work stays in the
teacher's Drive.

**To install or update it, follow [dist/apps-script/INSTALL.md](dist/apps-script/INSTALL.md)** (paste 3 Script files
into a new Apps Script project).

## The courses

Each class is set to grade 7 or grade 8, and its students see only that course.

### Grade 7 · Rookie Season

| # | Lesson | Big idea | Arena challenge |
|---|---|---|---|
| 1 | Welcome to Circuit City | Every robot design is a trade-off |  |
| 2 | Brain Song | A C++ program runs in order | **Brain Song** |
| 3 | Driver's Ed | Loops · joystick numbers → motor speed |  |
| 4 | Tune Your Bot | Traction, weight and balance |  |
| 5 | The Impossible Bridge | Test, change one thing, test again | **The Impossible Bridge** |
| 6 | Claws and Arms | if / else · buttons run a mechanism |  |
| 7 | Castle Crasher | Strategy: plan before you drive | **Castle Crasher** |
| 8 | Sumo Showdown | Pushing power: torque, grip, low weight | **Sumo Showdown** |
| 9 | Robot, Drive Yourself | Sequences: exact moves in order |  |
| 10 | Maze Runner | Plan, measure, code, debug | **Maze Runner** |

### Grade 8 · Pro Season

| # | Lesson | Big idea | Arena challenge |
|---|---|---|---|
| 1 | Motors and Gears | Gear ratios: speed or strength |  |
| 2 | Pick Your Chassis | Drive trains, structure and Smart Ports |  |
| 3 | Hello, Brain | A C++ program runs in order |  |
| 4 | Take the Wheel | Loops · joystick numbers → motor speed |  |
| 5 | Battle Bot Design | if / else · buttons run a mechanism |  |
| 6 | Battle Bot Challenge | Test, improve, compete | **Battle Bot Challenge** |
| 7 | Drive by Code | Sequences and for loops |  |
| 8 | Feel the Wall | if / else with a sensor | **Maze Runner Pro** |
| 9 | See It Coming | while loops with a sensor |  |
| 10 | Follow the Line | Functions and thresholds |  |
| 11 | Autonomy Challenge | Sense → decide → act, all together | **Collection Run** |

Each lesson is about two class periods and is split into two Parts.

**Circuit City Arena.** The chassis (2WD Standard, 2WD Lite, 3WD Side Crawler, 4WD), the arena challenges and their
scoring guides are in `course/rules.py`. Students form teams on their Arena page, each with a name, a mascot, a logo and a motto. On a class page the
teacher types each team's points for a challenge;
the site ranks them and keeps season standings, shown on the students' **Arena** page and the Class display.

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

Turn-ins are the program from the last simulator step (coding lessons), or ticking "I showed my teacher my
robot" (lessons with no code).

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
| `course/lessons/grade7/`, `grade8/` | The lessons, one YAML file each. [docs/LESSONS.md](docs/LESSONS.md) explains the format, the robot's C++ commands and the simulator. |
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
