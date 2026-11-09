# RoboCode Academy — C++, Algorithms & AI with VEX IQ

A course website for 8th graders that runs on **Google Apps Script**, so it needs no server and lives inside your school's Google Workspace. Students sign in with their school Google account and work through a **10-, 12- or 15-lesson term (30–40 min each)** drawn from 28 lessons, writing VEX IQ C++ in a built-in editor with a robot simulator. Teachers watch progress, read submitted code, and leave grades and feedback.

To put it online, follow **[docs/DEPLOY.md](docs/DEPLOY.md)**.

## Course map
| Unit | Lessons |
|---|---|
| 1 · Meet Your Robot | What Is a Robot? · Build Basics: Beams, Plates & Pins · Build Basics: Strong Structures · Build Basics: Motors, Shafts & Gears · Build the BaseBot · Hello, C++! · Drive & Turn |
| 2 · C++ Foundations | Variables & Math · Loops · Making Decisions · While Loops & Sensors · Functions |
| 3 · Algorithms | What Is an Algorithm? · Line Following · Searching · Sorting · Cube Sorting Robot · Pathfinding (BFS) · Proportional Control |
| 4 · Artificial Intelligence | What Is AI? · Decision Trees · State Machines · Machine Learning: Training Data · The Robot Learns (trial & error) · AI Ethics & Bias |
| 5 · Capstone | Design a Rescue Robot · Build, Code, Test · Showcase |

Each lesson has a warm-up, direct instruction, a hands-on activity, a simulator code challenge with auto-checks, and a graded exit ticket with a reflection. Lessons unlock in order. Some lessons are build-only and have no code challenge. The algorithm and AI lessons also have interactive widgets.

## Standards and student supports
Every lesson is mapped to the Massachusetts grades 6-8 DLCS standards. See **[docs/STANDARDS_MAP.md](docs/STANDARDS_MAP.md)** or the **Standards** page in the teacher view. The build stops if a lesson has no assessed standard or cites a code that isn't on the state list.

Each lesson has an Engineer's Brief written for grades 7-8, with a guiding question and a diagram with alt text. Lessons also have sentence starters for reflections, and code lessons have a worked example and a "Stuck?" routine. Students can have sections read aloud and change the text size, spacing and font with **Aa Reading**. To edit these supports, see [`lessons/supports.js`](lessons/supports.js).

## Teams, photos and class events
- **Teams:** 2 to 4 students join with a team code and share one robot's design, Robot Setup, photos and events. Exit tickets and code stay individual.
- **Build photos:** build lessons and class events need a team photo of the robot before they count as complete.
- **Class events:** Robot Sumo (bracket) and the Maze Race (timed leaderboard) use real robots. The main path pauses at each event until the teacher finishes it.
- **Google Classroom:** import a Classroom class so rostered students are enrolled automatically, post lessons as Classroom assignments that link straight to the lesson (now, scheduled or as drafts), and send grades back, then use Classroom's SIS export to reach PowerSchool. See [docs/DEPLOY.md](docs/DEPLOY.md).

## Term plans
Each class has a **term length** of 10, 12 or 15 lessons, or the full 28. Every plan includes an algorithms lesson and ends with the rescue capstone, the 12- and 15-lesson terms add AI, and each shorter plan is contained in the next, so you can change a class's plan without losing work. The lists are in [`lessons/plans.js`](lessons/plans.js).

Everything outside the term becomes **Go Further** lessons. Anyone can try them. Each one opens when the lesson it builds on is finished, so a fast student can go deeper mid-term. Classmates can't see how many a student has done, but you can.

## Robot Setup and VEX IQ kits
Each class is set to a **VEX IQ 1st gen or 2nd gen** kit. Before a program can run, students open **🔌 Robot Setup** in the editor and choose their devices, ports and names, as in the VEXcode Devices window. Code that uses a device the robot doesn't have stops with an error explaining what to add.

On 1st gen, lessons automatically show the Color Sensor (`colorname()`) and Gyro Sensor in place of the Optical Sensor and the built-in inertial sensor, and auto-checks accept whatever names a student chose.

## The Rescue Robot quest
- **My Robot:** each student starts with an empty outline. Each lesson before the capstone installs a part, and the robot visibly grows. Go Further lessons add upgrades. They can choose its colors and style.
- **Rescue Mission:** the three capstone lessons are the mission stages. Finishing them earns *Rescue Certified*.
- **Mission to the Moon map:** a flight from Earth to Moon Base through the course's units that shows each student's robot at the lesson they're on. Classmates appear as first name and last initial, with no grades or scores. Teachers see full names. A teacher can turn classmates off for a class in **Class settings**.

## Teacher workflow
1. **Classes → New class** gives you a 6-letter join code.
2. Students open the web app link and enter the code and their name, once.
3. Open a class to see the progress grid. Click any cell to see quiz answers, the reflection and recent code versions, then leave a grade and feedback.
4. **Class settings:** set the term length and robot kit, unlock lessons, close enrollment, regenerate the code, or hide classmates on the map.
5. **Export to Google Sheets** puts grades in a spreadsheet.
6. **Lessons** page: add a YouTube, Google Drive or Vimeo video to any lesson, and private teacher notes.

## Working on the code
You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
```

```bash
npm start
```

This runs the real Apps Script code on your computer with stand-ins for Google's services. Open http://localhost:3000 as the teacher, or http://localhost:3000/?as=maya@school.test as a student. Nothing touches Google, and test data goes in `data/preview-sheets.json`.

| Folder | What's in it |
|---|---|
| `gas/` | The Apps Script backend. |
| `public/` | The web page (`quest.js` holds the robot parts and map). |
| `lessons/` | Lesson content. The format is in [`docs/LESSON_FORMAT.md`](docs/LESSON_FORMAT.md). |
| `apps-script/` | **Generated** by `npm run build`. These are the files that go into Google. |

## About the simulator
The editor runs a classroom subset of VEX IQ C++ (1st and 2nd gen) in a top-down simulator. It translates C++ into JavaScript in the browser, so it is not a full compiler. Real robot code should still be downloaded to the robots with VEXcode IQ.
