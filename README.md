# RoboCode Academy — C++, Algorithms & AI with VEX IQ

A course website for 8th graders that runs on **Google Apps Script**, so it needs no server and lives inside your school's Google Workspace. Students sign in with their school Google account and work through **25 lessons (30–40 min each)**, writing VEX IQ C++ in a built-in editor with a robot simulator. Teachers watch progress, read submitted code, and leave grades and feedback.

To put it online, follow **[docs/DEPLOY.md](docs/DEPLOY.md)**.

## Course map
| Unit | Lessons |
|---|---|
| 1 · Meet Your Robot | What Is a Robot? · Build the BaseBot · Hello, C++! · Drive & Turn |
| 2 · C++ Foundations | Variables & Math · Loops · Making Decisions · While Loops & Sensors · Functions |
| 3 · Algorithms | What Is an Algorithm? · Line Following · Searching · Sorting · Cube Sorting Robot · Pathfinding (BFS) · Proportional Control |
| 4 · Artificial Intelligence | What Is AI? · Decision Trees · State Machines · Machine Learning: Training Data · The Robot Learns (trial & error) · AI Ethics & Bias |
| 5 · Capstone | Design a Rescue Robot · Build, Code, Test · Showcase |

Each lesson has a warm-up, direct instruction, a hands-on activity, a simulator code challenge with auto-checks, and a graded exit ticket with a reflection. Lessons unlock in order. The algorithm and AI lessons also have interactive widgets.

## The Rescue Robot quest
- **My Robot:** each student starts with an empty outline. Finishing each of the first 22 lessons installs a part, and the robot visibly grows. They can choose its colors and style.
- **Rescue Mission:** the three capstone lessons are the mission stages. Finishing them earns *Rescue Certified*.
- **Learning Map:** a road through the five units that shows each student's robot at the lesson they're on. Classmates appear as first name and last initial, with no grades or scores. Teachers see full names. A teacher can turn classmates off for a class in **Class settings**.

## Teacher workflow
1. **Classes → New class** gives you a 6-letter join code.
2. Students open the web app link and enter the code and their name, once.
3. Open a class to see the progress grid. Click any cell to see quiz answers, the reflection and recent code versions, then leave a grade and feedback.
4. **Class settings:** unlock lessons, close enrollment, regenerate the code, or hide classmates on the map.
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
The editor runs a classroom subset of VEX IQ (2nd gen) C++ in a top-down simulator. It translates C++ into JavaScript in the browser, so it is not a full compiler. Real robot code should still be downloaded to the robots with VEXcode IQ.
