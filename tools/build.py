"""Build the Google Apps Script files the teacher pastes: dist/apps-script/{Code,Assets,Data}.gs + INSTALL.md.

    python tools/build.py

Code.gs    apps_script/server/*.js, joined
Data.gs    the course: course/lessons/*.yaml (checked, simulator steps proven, Markdown turned into HTML),
           course/rules.py, and the screenshots in course/shots/
Assets.gs  the CSS and browser JavaScript, gzip-compressed (Apps Script would strip // and /* */ out of
           <script> and <style> blocks even inside strings, so they travel as data, not as HTML files)
"""
from __future__ import annotations

import base64
import gzip
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import markdown as md_lib

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from course import lessons as L  # noqa: E402
from course import pictures, rules  # noqa: E402

OUT = Path(os.environ.get("ROBOCODE_APPS_SCRIPT_OUT") or os.environ.get("MAKERLAB_APPS_SCRIPT_OUT") or ROOT / "dist" / "apps-script")
CLIENT = ROOT / "apps_script" / "client"


# ---------------------------------------------------------------- Markdown -> HTML (lesson text is written by the teacher)
def md(text) -> str:
    return md_lib.markdown(str(text or "").strip(), extensions=["sane_lists", "tables"])


def md_inline(text) -> str:
    html = md(text)
    return re.sub(r"^<p>(.*)</p>$", r"\1", html, flags=re.S)


def plain(text) -> str:
    return re.sub(r"[*`_]", "", str(text or "")).strip()


def picture(pic):
    """A step's picture as the page needs it. Screenshots are embedded; VEX pictures stay on VEX's servers."""
    if not isinstance(pic, dict):
        return pic
    if pic.get("type") == "shot":
        f = L.shot_file(pic["name"])
        kind = {"webp": "image/webp", "png": "image/png", "jpg": "image/jpeg"}[f.suffix[1:]]
        return {"type": "img", "caption": pic.get("caption", ""), "alt": pic.get("alt") or pic.get("caption", ""),
                "src": f"data:{kind};base64," + base64.b64encode(f.read_bytes()).decode("ascii")}
    if pic.get("type") == "vex":
        return {"type": "vex", "caption": pic.get("caption", ""),
                "items": [{"src": pictures.VEX[n][0], "alt": pictures.VEX[n][1], "label": pictures.VEX[n][2]} for n in pic["names"]]}
    return pic


def sim_data(sim, tests):
    """A simulator step: the editor's starter code, the field, and checks that tick the first Test it boxes."""
    if not sim:
        return None
    return {"starter": (sim.get("starter") or "").rstrip("\n") + "\n", "field": sim.get("field") or {},
            "checks": [{k: c[k] for k in c if k != "message"} for c in sim["checks"]],
            "drive": bool(sim.get("drive")), "carry": bool(sim.get("carry")), "speed": sim.get("speed") or 1,
            "solution": (sim.get("solution") or "").rstrip("\n") + "\n"}


def lesson_data(lesson: dict) -> dict:
    """The lesson as Data.gs holds it: text as HTML, plus what the server and pages need."""
    std = L.standards_table()
    m = lesson["mission"]
    out = {
        "id": lesson["id"], "file": "course/lessons/" + lesson["_file"], "number": lesson["number"], "title": lesson["title"], "tagline": lesson.get("tagline", ""),
        "icon": lesson["icon"], "color": lesson["color"], "python": lesson["python"], "hardware": lesson["hardware"], "grade": lesson["grade"],
        "minutes": lesson.get("minutes", 45), "wired": L.wired(lesson), "lang": lesson.get("lang", "cpp"), "turn_in": L.turn_in(lesson),
        "mission": {"goal": md(m["goal"]), "picture": picture(m.get("picture")), "you_need": [md_inline(x) for x in m["you_need"]],
                    "learn": [md_inline(x) for x in m.get("learn") or []], "talk": md_inline(m["talk"]), "talk_text": plain(m["talk"]), "big_question": plain(m["big_question"])},
        "build": [],
        "quiz": [{"question": md_inline(q["question"]), "choices": [md_inline(c) for c in q["choices"]],
                  "answer": q["answer"], "why": md_inline(q["why"])} for q in lesson["quiz"]],
        "ship": {"extensions": [], "reflect": [plain(r) for r in (lesson.get("ship") or {}).get("reflect") or []],
                 "note": md_inline((lesson.get("ship") or {}).get("note"))},
        "teacher_notes": md(lesson.get("teacher_notes", "")),
        "standards_full": [{"code": s["code"], "text": std[s["code"]]["text"], "how": s["how"]} for s in lesson.get("standards") or []],
    }
    for s in lesson["build"]:
        code = (s.get("code") or "").rstrip("\n")
        out["build"].append({
            "part": s.get("part", ""), "title": plain(s["title"]), "say": md(s.get("say")), "do": [md_inline(x) for x in s.get("do") or []],
            "code": code, "new": L.line_set(s["new"], len(code.split("\n"))) if s.get("new") else [],
            "what": md(s.get("what")), "tip": md(s.get("tip")), "stuck": [md_inline(x) for x in s.get("stuck") or []],
            # a simulator step's checks come first in its Test it list, and tick themselves
            "test": [md_inline(c["message"]) for c in (s.get("sim") or {}).get("checks") or []] + [md_inline(x) for x in s.get("test") or []],
            "ask": plain(s.get("ask")), "fields": s.get("fields") or [], "lang": s.get("lang") or lesson.get("lang", "cpp"),
            "sim": sim_data(s.get("sim"), s.get("test")),
            "picture": picture(s.get("picture")), "wiring": [md_inline(w.get("text", "") if isinstance(w, dict) else w) for w in s.get("wiring") or []],
        })
    for e in (lesson.get("ship") or {}).get("extensions") or []:
        code = (e.get("code") or "").rstrip("\n")
        out["ship"]["extensions"].append({
            "title": plain(e["title"]), "level": e["level"], "goal": md_inline(e["goal"]), "where": md_inline(e.get("where")),
            "code": code, "new": L.line_set(e["new"], len(code.split("\n"))) if e.get("new") else [],
            "hints": [md_inline(h) for h in e.get("hints") or []]})
    return out


def check_sims():
    """Run every simulator step's solution through the real simulator (needs Node.js)."""
    steps = [{"where": f"{l['_file']} step {i} ({s.get('title', '?')})", "starter": "" if s["sim"].get("carry") else s["sim"].get("starter") or "",
              "solution": s["sim"]["solution"], "field": s["sim"].get("field") or {}, "checks": s["sim"]["checks"],
              "drive": bool(s["sim"].get("drive")), "pilot": s["sim"].get("pilot")}
             for l in L.all_lessons() for i, s in enumerate(l["build"], 1) if s.get("sim")]
    if not steps:
        return
    if not shutil.which("node"):
        print("  (Node.js not found: simulator steps were not checked)")
        return
    r = subprocess.run(["node", str(ROOT / "tools" / "check_sims.js")], input=json.dumps(steps), capture_output=True, text=True, timeout=900)
    if r.returncode:
        raise SystemExit("Simulator steps that can't be passed:\n" + "\n".join("  " + x for x in (r.stdout + r.stderr).strip().split("\n")))
    print(r.stdout.rstrip())


def build_data() -> dict:
    problems = [(l["_file"], e) for l in L.all_lessons() for e in L.validate(l)]
    if problems:
        raise SystemExit("Lesson problems:\n" + "\n".join(f"  {f}: {e}" for f, e in problems))
    check_sims()
    lessons = {l["id"]: lesson_data(l) for l in L.all_lessons()}
    course = [{"id": c[0], "number": c[1], "title": c[2], "icon": c[3], "color": c[4], "python": c[5], "hardware": c[6],
               "pos": list(c[7]), "grade": c[8]} for c in rules.COURSE]
    for c in course:                     # a written lesson's own title wins over the plan's
        if c["id"] in lessons:
            c["title"] = lessons[c["id"]]["title"]
    return {
        "lessons": lessons, "order": [c["id"] for c in course if c["id"] in lessons],
        "course": course, "course_by_id": {c["id"]: c for c in course}, "requires": rules.REQUIRES,
        "xp": rules.XP, "labels": rules.LABELS, "quiz_pass": rules.QUIZ_PASS,
        "levels": [list(x) for x in rules.LEVELS], "badges": [list(b) for b in rules.BADGES],
        "avatar_options": {part: [[o[0], o[1], list(o[2]) if o[2] else None] for o in opts]
                           for part, opts in rules.AVATAR_OPTIONS.items()},
        "avatar_parts": rules.AVATAR_PARTS, "arcade": rules.ARCADE,
        "powerups": [{"id": u[0], "icon": u[1], "name": u[2], "desc": u[3], "costs": u[4]} for u in rules.POWERUPS], "default_avatar": rules.DEFAULT_AVATAR, "makecode_url": rules.MAKECODE_URL,
        "vexcode_url": rules.VEXCODE_URL, "cad_url": rules.CAD_STUDIO_URL,
        "grades": {str(g): name for g, name in rules.GRADES.items()}, "default_grade": rules.DEFAULT_GRADE,
        "chassis": [{"id": c[0], "name": c[1], "blurb": c[2]} for c in rules.CHASSIS],
        "teams": {"max": rules.TEAM_MAX, "mascots": [list(m) for m in rules.TEAM_MASCOTS], "shapes": [list(x) for x in rules.TEAM_SHAPES],
                  "colors": [list(x) for x in rules.TEAM_COLORS]},
        "arena": {"place_points": rules.ARENA_PLACE_POINTS,
                  "events": [{"id": e[0], "grade": e[1], "lesson_id": e[2], "icon": e[3], "name": e[4], "kind": e[5], "blurb": e[6],
                              "guide": [list(g) for g in e[7]]} for e in rules.ARENA_EVENTS]},
    }


# ---------------------------------------------------------------- CSS and JavaScript
def read(path) -> str:
    return (CLIENT / path).read_text(encoding="utf-8")


def build_assets() -> dict:
    # CodeMirror's stylesheet goes first so the theme can restyle the editor. Its comments are dropped:
    # Apps Script strips comment marks out of <style> blocks anyway.
    styles = re.sub(r"/\*.*?\*/", "", read("vendor/codemirror.css"), flags=re.S) + "\n" + read("css/base.css") + "\n" + read("css/theme.css") + "\n" + read("css/robocode.css") + "\n" + read("css/arena.css")
    app = "\n".join([
        read("lib/sfx.js"), read("shim.js"), read("lib/avatar.js"), read("lib/crest.js"), read("lib/rewards.js"), read("lib/visuals.js"), read("lib/screen.js"), read("lib/game.js"),
        "window.__runMap = function () {\n" + read("lib/map.js") + "\n};",
        "window.__runProfile = function () {\n" + read("lib/profile.js") + "\n};",
        read("pages.js"), read("lesson.js"),
    ])
    # The code editor (CodeMirror), the simulator and the step editor: only lesson pages with a simulator step load these.
    editor = "\n".join([read("vendor/codemirror.min.js"), read("lib/sim.js"), read("lib/ide.js")])
    packed = {k: pack(v) for k, v in {"styles": styles, "app": app, "editor": editor}.items()}
    return {"Assets.gs": "// GENERATED by tools/build.py: the site's CSS and JavaScript, gzip-compressed. Don't edit.\n"
                         "var ASSETS_GZ = " + json.dumps(packed) + ";\n"}


def pack(value) -> str:
    raw = json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    return base64.b64encode(gzip.compress(raw, 9, mtime=0)).decode("ascii")


def stamp(files):
    """Every .gs file gets a fingerprint of its own content, and Code.gs knows what each should be.
    The app can then say which file is missing, cut short while pasting, or out of date."""
    expect = {}
    for name in sorted(files):
        if name == "Code.gs":
            continue
        key = name[:-3]
        h = hashlib.sha1(files[name].encode("utf-8")).hexdigest()[:10]
        expect[key] = h
        files[name] += f"\nvar BUILD_STAMPS = BUILD_STAMPS || {{}};\nBUILD_STAMPS[{json.dumps(key)}] = {json.dumps(h)};\n"
    code_hash = hashlib.sha1(files["Code.gs"].encode("utf-8")).hexdigest()[:10]
    files["Code.gs"] += (f"var BUILD_ID = {json.dumps(code_hash)};\nvar BUILD_EXPECT = {json.dumps(expect)};\n"
                         f"var BUILD_FILES = {json.dumps(sorted(files))};\n")


def main():
    code = "\n".join(p.read_text(encoding="utf-8") for p in sorted((ROOT / "apps_script" / "server").glob("*.js")))
    data = build_data()
    files = {"Code.gs": code,
             # The course is gzip-compressed like the page code, so the file stays quick to paste. It is unpacked
             # once each time the script runs.
             "Data.gs": "// GENERATED by tools/build.py from course/. Don't edit.\nvar DATA_GZ = " + json.dumps(pack(data)) + ";\n"
                        "var DATA = JSON.parse(Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(DATA_GZ), "
                        "'application/x-gzip')).getDataAsString('UTF-8'));\n"}
    files.update(build_assets())
    stamp(files)
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    for name, text in files.items():
        (OUT / name).write_text(text, encoding="utf-8")
    (OUT / "INSTALL.md").write_text(install_md(files), encoding="utf-8")
    for name in sorted(files):
        print(f"  {name:10} {len(files[name]) / 1000:6.0f} KB")
    print(f"Built {len(data['lessons'])} lesson(s) into {OUT}")


OAUTH_SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.rosters.readonly",
    "https://www.googleapis.com/auth/classroom.profile.emails",
]


def install_md(files):
    scopes = ",\n".join(f'    "{x}"' for x in OAUTH_SCOPES)
    gs = sorted(n for n in files if n.endswith(".gs"))
    rows = "\n".join(f"| `{n}` | Script (+ → Script), name it `{n[:-3]}` | {len(files[n]) // 1000} KB |" for n in gs)
    return f"""# Installing RoboCode Academy in Google Apps Script

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
{rows}

4. Press **Ctrl+S**. There are no HTML files in this project.

## 2. Settings (one time)

1. Click the **gear (Project Settings)**, tick **Show "appsscript.json" manifest file in editor**, then
   open `appsscript.json` and replace it with:

```json
{{
  "timeZone": "America/New_York",
  "runtimeVersion": "V8",
  "exceptionLogging": "STACKDRIVER",
  "webapp": {{ "executeAs": "USER_DEPLOYING", "access": "DOMAIN" }},
  "dependencies": {{
    "enabledAdvancedServices": [{{ "userSymbol": "Classroom", "serviceId": "classroom", "version": "v1" }}]
  }},
  "oauthScopes": [
{scopes}
  ]
}}
```

2. Open `Code.gs`, choose **setup** in the function menu at the top, and press **Run**. Allow access when Google
   asks ("Advanced → Go to RoboCode Academy" if it warns you). It makes the **RoboCode Academy data** folder in
   your Drive.

   **Tick "Select all"** on Google's permission screen. Google lets you allow only some permissions, and the site
   needs all of them. If something later says "You do not have permission to call..." (for example Google
   Classroom), run **resetPermissions**, then run **checkInstall** and tick "Select all" this time.

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
"""


if __name__ == "__main__":
    main()
