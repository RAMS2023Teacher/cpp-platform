"""Check one lesson file while you write it: the format rules, then every simulator step's solution.

    python tools/check_lesson.py course/lessons/08-drive-by-code.yaml
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from course import lessons as L  # noqa: E402
from course import rules  # noqa: E402


def main(path: str) -> int:
    data = yaml.safe_load(Path(path).read_text(encoding="utf-8"))
    data["_file"] = Path(path).name
    plan = {c[0]: c for c in rules.COURSE}.get(data.get("id"))
    if plan:
        _, data["number"], data["title_plan"], data["icon"], data["color"], data["python"], data["hardware"], data["pos"], data["grade"] = plan
    errs = L.validate(data)
    for e in errs:
        print("  FORMAT:", e)
    steps = [{"where": f"step {i} ({s.get('title', '?')})", "starter": "" if s["sim"].get("carry") else s["sim"].get("starter") or "",
              "solution": s["sim"].get("solution") or "", "field": s["sim"].get("field") or {}, "checks": s["sim"].get("checks") or [],
              "drive": bool(s["sim"].get("drive")), "pilot": s["sim"].get("pilot")}
             for i, s in enumerate(data.get("build") or [], 1) if isinstance(s.get("sim"), dict)]
    bad = bool(errs)
    if steps and shutil.which("node"):
        r = subprocess.run(["node", str(ROOT / "tools" / "check_sims.js")], input=json.dumps(steps), capture_output=True, text=True, timeout=900)
        print("\n".join("  SIM: " + x if r.returncode else x for x in (r.stdout + r.stderr).strip().split("\n")))
        bad = bad or bool(r.returncode)
    minutes = data.get("minutes")
    print(f"{'PROBLEMS in' if bad else 'OK:'} {data['_file']}: {len(data.get('build') or [])} steps, {len(steps)} simulator step(s), {len(data.get('quiz') or [])} quiz questions, {minutes} min")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
