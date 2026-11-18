"""Load and check the lessons in course/lessons/*.yaml.

A lesson has four stages, like the App Inventor curriculum:
  mission  what you'll make, what you need, a partner question
  build    one step per screen, like the slideshows: say / do / code (new lines highlighted) / what it does /
           Test it checkboxes / one question
  quiz     3-6 multiple-choice questions (graded on the server)
  ship     extensions to pick from, reflection questions, and the turn-in (code, a link, or showing the teacher)

A build step can hold the code editor and robot simulator (`sim`). Its checks tick themselves when the
student's program passes, and tools/check_sims.js proves each one can be passed with the lesson's own solution.
"""
from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path

import yaml

from . import pictures, rules

HERE = Path(__file__).resolve().parent
LEVELS = ("Easier", "Medium", "Challenge")
STEP_KEYS = {"part", "title", "say", "do", "code", "new", "what", "tip", "stuck", "test", "ask", "fields", "picture", "wiring", "sim", "lang"}
SIM_KEYS = {"starter", "field", "checks", "solution", "drive", "pilot", "carry", "speed"}
CHECK_TYPES = {"goal", "reachGoal", "noCollision", "output", "code", "cubesInZones", "cubesOutOfRing", "stayInRing", "visitedTiles", "drove", "notes"}
FIELD_KEYS = {"start", "walls", "lines", "tiles", "goal", "cubes", "zones", "ring"}
TURN_INS = ("code", "link", "show")
LANGS = ("cpp", "python")


def words(text) -> int:
    return len(re.findall(r"[A-Za-z0-9][\w'’.-]*", re.sub(r"`[^`]*`", " x ", str(text or ""))))


def line_set(spec, n_lines: int) -> list[int] | None:
    """'3-9', '10' or '1-2, 5' -> 1-based line numbers. None if it doesn't parse or is out of range."""
    out = []
    for part in str(spec).split(","):
        m = re.fullmatch(r"\s*(\d+)\s*(?:-\s*(\d+))?\s*", part)
        if not m:
            return None
        a, b = int(m.group(1)), int(m.group(2) or m.group(1))
        if not 1 <= a <= b <= n_lines:
            return None
        out += range(a, b + 1)
    return sorted(set(out))


def standards_table() -> dict:
    data = yaml.safe_load((HERE / "standards.yaml").read_text(encoding="utf-8"))
    return {s["code"]: {**s, "topic": t["topic"], "strand": t["strand"]} for t in data["topics"] for s in t["standards"]}


def _check_code_block(item: dict, where: str) -> list[str]:
    errs = []
    if item.get("new") is not None:
        if not item.get("code"):
            errs.append(f"{where}: 'new' needs 'code'")
        elif line_set(item["new"], len(item["code"].rstrip("\n").split("\n"))) is None:
            errs.append(f"{where}: 'new' must be line numbers like \"3-9\" inside the code")
    return errs


def turn_in(lesson: dict) -> str:
    """How a lesson is turned in: 'code' (the program from its last simulator step), 'link' (a MakeCode share link)
    or 'show' (the student shows the teacher the real robot). Defaults to code when the lesson has a simulator step."""
    chosen = (lesson.get("ship") or {}).get("turn_in")
    return chosen or ("code" if any(s.get("sim") for s in lesson.get("build") or []) else "show")


def _check_picture(pic, where: str) -> list[str]:
    if not isinstance(pic, dict):
        return []
    if pic.get("type") == "shot" and not shot_file(pic.get("name")):
        return [f"{where}: no screenshot called {pic.get('name')!r} in course/shots/"]
    if pic.get("type") == "vex":
        return [f"{where}: no VEX picture called {n!r} in course/pictures.py" for n in pic.get("names") or ["?"] if n not in pictures.VEX]
    return []


def shot_file(name) -> Path | None:
    for ext in ("webp", "png", "jpg"):
        p = HERE / "shots" / f"{name}.{ext}"
        if name and p.exists():
            return p
    return None


def _check_sim(sim, where: str) -> list[str]:
    errs = []
    if not isinstance(sim, dict):
        return [f"{where}: 'sim' is a group of settings (starter, field, checks, solution)"]
    extra = set(sim) - SIM_KEYS
    if extra:
        errs.append(f"{where}: unknown sim keys {sorted(extra)}")
    if not str(sim.get("starter") or "").strip() and not sim.get("carry"):
        errs.append(f"{where}: sim needs 'starter' code (or carry: true to continue the last program)")
    if not str(sim.get("solution") or "").strip():
        errs.append(f"{where}: sim needs a 'solution' (teachers see it, and the build proves it passes)")
    checks = sim.get("checks") or []
    if not 1 <= len(checks) <= 4:
        errs.append(f"{where}: sim needs 1-4 'checks'")
    for c in checks:
        if not isinstance(c, dict) or c.get("type") not in CHECK_TYPES or not c.get("message"):
            errs.append(f"{where}: each check needs a 'type' ({', '.join(sorted(CHECK_TYPES))}) and a 'message'")
        elif c["type"] in ("output", "code") and not c.get("pattern"):
            errs.append(f"{where}: an {c['type']} check needs a 'pattern'")
    extra = set(sim.get("field") or {}) - FIELD_KEYS
    if extra:
        errs.append(f"{where}: unknown field keys {sorted(extra)}")
    if sim.get("drive") and not sim.get("pilot"):
        errs.append(f"{where}: a driving step needs a 'pilot' (joystick moves that prove it can be passed)")
    return errs


def validate(lesson: dict) -> list[str]:
    errs = []
    plan = {c[0]: c for c in rules.COURSE}
    if lesson.get("id") not in plan:
        return [f"id {lesson.get('id')!r} isn't in rules.COURSE"]
    m = lesson.get("mission") or {}
    for key in ("big_question", "goal", "you_need", "talk"):
        if not m.get(key):
            errs.append(f"mission: add '{key}'")
    if words(m.get("big_question")) > 15:
        errs.append("mission: keep the big_question (the class display's question of the day) to 15 words")
    if words(m.get("goal")) > 70:
        errs.append("mission: keep the goal under 70 words")
    steps = lesson.get("build") or []
    if not 3 <= len(steps) <= 16:
        errs.append("build: use 3-16 steps")
    for i, s in enumerate(steps, 1):
        where = f"build step {i} ({s.get('title', '?')})"
        extra = set(s) - STEP_KEYS
        if extra:
            errs.append(f"{where}: unknown keys {sorted(extra)}")
        if not s.get("title"):
            errs.append(f"{where}: add a 'title'")
        if not (s.get("do") or s.get("code") or s.get("say") or s.get("wiring") or s.get("sim")):
            errs.append(f"{where}: needs something to do (say, do, code, wiring or sim)")
        tests = s.get("test") or []
        if s.get("sim"):
            errs += _check_sim(s["sim"], where)
            if len(tests) > 3:
                errs.append(f"{where}: a simulator step can add up to 3 'test' checkboxes of its own")
        elif not 1 <= len(tests) <= 4:
            errs.append(f"{where}: give 1-4 'test' checkboxes, so students know it worked")
        if s.get("lang") and s["lang"] not in LANGS:
            errs.append(f"{where}: lang must be one of {LANGS}")
        errs += _check_picture(s.get("picture"), where)
        if words(s.get("say")) > 80:
            errs.append(f"{where}: 'say' is over 80 words; split the step")
        if s.get("ask") and words(s["ask"]) > 40:
            errs.append(f"{where}: 'ask' is over 40 words")
        if s.get("fields") and (not isinstance(s["fields"], list) or len(s["fields"]) > 4):
            errs.append(f"{where}: 'fields' is a list of up to 4 short labels")
        errs += _check_code_block(s, where)
    quiz = lesson.get("quiz") or []
    if not 3 <= len(quiz) <= 6:
        errs.append("quiz: use 3-6 questions")
    for i, q in enumerate(quiz, 1):
        ch = q.get("choices") or []
        if not q.get("question") or not 2 <= len(ch) <= 4:
            errs.append(f"quiz {i}: needs a question and 2-4 choices")
        if not isinstance(q.get("answer"), int) or isinstance(q.get("answer"), bool) or not 0 <= q["answer"] < len(ch):
            errs.append(f"quiz {i}: 'answer' must be a 0-based index into choices")
        if not q.get("why"):
            errs.append(f"quiz {i}: add 'why', shown after they answer")
    ship = lesson.get("ship") or {}
    for i, e in enumerate(ship.get("extensions") or [], 1):
        if not (e.get("title") and e.get("goal")):
            errs.append(f"extension {i}: needs a title and a goal")
        if e.get("level") not in LEVELS:
            errs.append(f"extension {i}: level must be one of {LEVELS}")
        errs += _check_code_block(e, f"extension {i}")
    if ship.get("turn_in") and ship["turn_in"] not in TURN_INS:
        errs.append(f"ship: turn_in must be one of {TURN_INS}")
    if turn_in(lesson) == "code" and not any(s.get("sim") for s in steps):
        errs.append("ship: turn_in 'code' needs a simulator step to take the code from")
    if lesson.get("lang") and lesson["lang"] not in LANGS:
        errs.append(f"lang must be one of {LANGS}")
    errs += _check_picture(m.get("picture"), "mission")
    if not 1 <= len(ship.get("reflect") or []) <= 3:
        errs.append("ship: add 1-3 'reflect' questions")
    table = standards_table()
    if not lesson.get("standards"):
        errs.append("add 'standards' (MA DLCS codes, each with a 'how')")
    for st in lesson.get("standards") or []:
        if st.get("code") not in table:
            errs.append(f"standards: unknown code {st.get('code')!r}")
        elif not st.get("how"):
            errs.append(f"standards: {st['code']} needs a 'how'")
    return errs


@lru_cache(maxsize=1)
def _load() -> tuple:
    plan = {c[0]: c for c in rules.COURSE}
    out = []
    for path in sorted((HERE / "lessons").rglob("*.yaml")):
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
        data["_file"] = str(path.relative_to(HERE / "lessons"))
        c = plan.get(data.get("id"))
        if c:
            _, data["number"], data["title_plan"], data["icon"], data["color"], data["python"], data["hardware"], data["pos"], data["grade"] = c
        out.append(data)
    out.sort(key=lambda l: (l.get("grade", 99), l.get("number", 99)))
    return tuple(out)


def all_lessons() -> list[dict]:
    return list(_load())


def get(lesson_id: str) -> dict | None:
    return next((l for l in _load() if l["id"] == lesson_id), None)


def wired(lesson: dict) -> bool:
    """True when a lesson has students build a circuit (any step with wiring)."""
    return any(s.get("wiring") for s in lesson.get("build") or [])
