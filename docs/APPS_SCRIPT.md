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
* **Circuit City Arena:** on the class page, pick a challenge, type each student's points and save. Standings show
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
