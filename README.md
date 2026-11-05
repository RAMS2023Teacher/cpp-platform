# RoboCode Academy — C++, Algorithms & AI with VEX IQ

A course website for 8th graders. Students enroll in your class, work through **25 lessons (30–40 min each)**, write real VEX IQ C++ in a built-in editor with a robot simulator, and turn in code challenges and exit tickets. Teachers watch progress live, read submitted code, and leave grades and feedback.

## Course map
| Unit | Lessons |
|---|---|
| 1 · Meet Your Robot | What Is a Robot? · Build the BaseBot · Hello, C++! · Drive & Turn |
| 2 · C++ Foundations | Variables & Math · Loops · Making Decisions · While Loops & Sensors · Functions |
| 3 · Algorithms | What Is an Algorithm? · Line Following · Searching · Sorting · Cube Sorting Robot · Pathfinding (BFS) · Proportional Control |
| 4 · Artificial Intelligence | What Is AI? · Decision Trees · State Machines · Machine Learning: Training Data · The Robot Learns (trial & error) · AI Ethics & Bias |
| 5 · Capstone | Design a Rescue Robot · Build, Code, Test · Showcase |

Each lesson has a warm-up, direct instruction, a hands-on activity (many use the VEX IQ kits and field board), a simulator code challenge with auto-checks, and a graded exit ticket with a reflection question. Lessons unlock in order. The algorithm and AI lessons also have interactive widgets: a binary-search game, a bubble-sort visualizer, a BFS maze, a perceptron trainer, and a decision tree.

## Running it
You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm start
```

Then open http://localhost:3000. The console prints a **teacher sign-up code**. Use it once to create your teacher account. Set your own code with `TEACHER_CODE=MYCODE npm start`.

To let students reach it from their Chromebooks, run it on a computer on the school network (students go to `http://<that-computer's-IP>:3000`), or deploy it to any Node host (Render, Railway, a school server, etc.). On a cloud host, give it a **persistent disk** and point `DATA_DIR` at it. All accounts and student work live in `DATA_DIR/db.json` (default `./data`). Back up that folder.

## Teacher workflow
1. **Classes → New class** gives you a 6-letter join code.
2. Students choose **Join a class**, type the code, their name, a username and a password.
3. Open a class to see the progress grid. Click any cell to see quiz answers, the reflection, every version of the submitted code (and re-run it in the simulator), then leave a grade and feedback.
4. **Class settings:** unlock all lessons or specific ones, close enrollment, regenerate the code.
5. **Export CSV** downloads grades for your gradebook.
6. **Lessons** page: paste a YouTube, Google Drive or Vimeo link to embed a video in any lesson, and add private teacher notes. As a teacher you also see each challenge's reference solution.

You can reset a student's password, move a student to another class, or remove one with the ⋯ button next to their name.

## Editing lessons
Lessons are plain JavaScript files in `lessons/`. The format, the supported C++ subset, simulator fields and auto-checks are documented in [`docs/LESSON_FORMAT.md`](docs/LESSON_FORMAT.md). Restart the server after editing.

## About the simulator
The editor runs a classroom subset of VEX IQ (2nd gen) C++ in a top-down simulator, with Drivetrain, Distance, Optical, Bumper, Inertial, TouchLED, claw and arm. It translates C++ into JavaScript in the browser, so it is not a full compiler. It does mimic C++ habits that matter for beginners: required semicolons, integer division, undeclared-variable errors, and `int main()`. Real robot code should still be downloaded to the robots with VEXcode IQ.
