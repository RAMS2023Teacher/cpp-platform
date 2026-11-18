# Installing RoboCode Academy in Google Apps Script

These files are **generated** by `python tools/build.py`. Don't edit them here: change the lessons
(`course/lessons/`) or the code in the repository and build again.

**Use a new Apps Script project.** Don't paste these into the old RoboCode Academy project (the one with a
`Lessons` file and an `Index` HTML file). This version keeps its data in a Drive folder instead of a spreadsheet,
so the two can't share a project. The old project and its spreadsheet can stay as they are.

## 1. Make the project (your teacher account)

1. Go to <https://script.google.com/home/projects/create> in Chrome, signed in to your school account.
2. Rename it **RoboCode Academy** (click "Untitled project").
3. Add one **Script** file for each row below. Click **+** next to "Files", choose **Script**, and type the name
   exactly (Apps Script adds `.gs`). Open the file from this folder, select all, copy, and paste it in.
   `Code.gs` already exists: replace what's in it.

| File | Add it as | Size |
|---|---|---|
| `Assets.gs` | Script (+ → Script), name it `Assets` | 225 KB |
| `Code.gs` | Script (+ → Script), name it `Code` | 103 KB |
| `Data.gs` | Script (+ → Script), name it `Data` | 682 KB |

4. Press **Ctrl+S**. There are no HTML files in this project.

## 2. Settings (one time)

1. Click the **gear (Project Settings)**, tick **Show "appsscript.json" manifest file in editor**, then
   open `appsscript.json` and replace it with:

```json
{
  "timeZone": "America/New_York",
  "runtimeVersion": "V8",
  "exceptionLogging": "STACKDRIVER",
  "webapp": { "executeAs": "USER_DEPLOYING", "access": "DOMAIN" },
  "dependencies": {
    "enabledAdvancedServices": [{ "userSymbol": "Classroom", "serviceId": "classroom", "version": "v1" }]
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.rosters.readonly",
    "https://www.googleapis.com/auth/classroom.profile.emails"
  ]
}
```

2. Open `Code.gs`, choose **setup** in the function menu at the top, and press **Run**. Allow access when Google
   asks ("Advanced → Go to RoboCode Academy" if it warns you). It makes the **RoboCode Academy data** folder in
   your Drive.

## 3. Deploy

1. **Deploy → New deployment**. Gear → **Web app**.
2. **Execute as: Me**. **Who has access: Anyone within** your school.
3. **Deploy**, then copy the **Web app URL** (it ends in `/exec`).

Open it yourself first: you're the teacher, so you'll see **My classes**. Make a class (or import from Google
Classroom), assign lessons, then share the address and the class's join code. Students write C++ in the editor
built into the lessons, test it in the simulator, and use **VEXcode IQ** in a second tab to put it on the real Brain.

## Updating later

Paste the new files over the old ones, save, then **Deploy → Manage deployments → ✏️ → Version: New version →
Deploy**. The web address stays the same and student work is kept (it lives in your Drive, not in the code).
If a file was cut short while pasting, the site says which one.

## CAD Studio

The **Open CAD Studio** button in each lesson opens VEX IQ CAD Studio, which is its own Apps Script project
(see `vex-cad-studio/README.md`). Its address is `CAD_STUDIO_URL` in `course/rules.py`; set it to `""` to hide
the button.

## Where the data lives

* **My Drive → RoboCode Academy data → students**: one small file per student (their work, code, XP, robot).
* **RoboCode Academy data → config.json**: your classes, assignments, videos, feedback and bonus XP.
* **RoboCode Academy data → summary.json**: the gradebook's quick copy, rebuilt as students work.
