# RoboCode Academy in Google Apps Script

RoboCode Academy runs as a Google Apps Script web app in the teacher's school account: no hosting, no passwords, and student
work stays in the teacher's Google Drive. **To install or update it, follow
[dist/apps-script/INSTALL.md](../dist/apps-script/INSTALL.md).**

* **Sign-in:** everyone is identified by their school Google account. The script's owner is the teacher.
* **Coding:** students write C++ in the editor built into the lesson steps and test it in the robot simulator.
  To run it on the real Brain they copy it into VEXcode IQ (codeiq.vex.com) in a second tab, because the Apps Script
  frame can't use USB but VEXcode's own tab can.
* **Turning in:** at the end of each lesson students ship their program from the last simulator step, or tick that they showed the teacher the real robot (lessons with no code). It shows in the gradebook.
* **Grades:** each class is grade 7 or grade 8 (set when you create it, or on the class page). Students see that
  grade's lessons. A class imported from Google Classroom is grade 7 if its name has a 7 in it, else grade 8.
* **Help requests:** every lesson has "✋ I'm stuck: ask for help". The Class display rings, shows who is stuck and
  where, and you clear it with "✓ Helped".
* **Lesson feedback:** students can flag a step or quiz question as confusing and rate each lesson (+10 XP). The
  **Feedback** page shows it by lesson, with a report (no names) to copy and paste to Claude to improve the lessons.
* **Sounds and locked buttons:** a grey button still responds to a click and shows what is missing. The 🔊 button
  in the top bar turns sounds off on that device.
* **Student view:** on a class page, **👀 Student view** lets you use the site as a student in that class. Your
  practice work is saved but never shows in the gradebook, leaderboards, arena or reports; partners, teams and
  help requests are off. A gold strip at the top has **Exit student view**.
* **Your data and backups:** My classes → 🗄️ Your data shows the Drive folder in use, counts and daily backups.
  See [RELIABILITY.md](RELIABILITY.md).
* **Arena leaderboard (projector):** on a class page, **🏟️ Arena leaderboard** shows today's challenge and how it
  is scored, 1st to 5th place with team logos, The Pack, and a single-elimination bracket for up to 8 teams. Seed
  the bracket from the scores or by random draw, then click the winner of each match.
* **Teams:** on their Arena page students start a team (name, mascot, logo shape and color, motto) or join one.
  On the class page you set the team size (default 3), lock teams, move students, rename or delete a team.
* **Circuit City Arena:** on the class page, pick a challenge, type each team's points and save (a student with
  no team is scored alone). Standings show
  on the students' Arena page and the Class display.
* **Saving:** each student's work is one file in **My Drive → RoboCode Academy data → students**.
* **Gradebook and Class display:** catch up with new work within about a minute.

## How it's built

* `tools/build.py` checks `course/lessons/*.yaml`, runs every simulator step's solution through the real simulator
  (`tools/check_sims.js`), turns the Markdown into HTML, and writes `Data.gs`.
* The code editor (CodeMirror) and simulator are a second compressed bundle in `Assets.gs` that only lesson pages
  with a simulator step load.
* The CSS and browser code are gzip-compressed into `Assets.gs`, and every page has only two small scripts with no
  slashes, because Apps Script strips `//` and `/* */` from `<script>` and `<style>` blocks even inside strings.
* `tests/apps_script_app/` has fake Google services (they strip comments the same way), the app test, and a local
  server for clicking through in a browser.
