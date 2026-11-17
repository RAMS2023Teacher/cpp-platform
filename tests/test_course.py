"""The lessons in course/lessons/ and the rules in course/rules.py."""
from course import lessons as L
from course import rules


def test_every_lesson_is_valid():
    lessons = L.all_lessons()
    assert lessons
    for lesson in lessons:
        assert L.validate(lesson) == [], lesson["_file"]


def test_course_plan_is_consistent():
    ids = [c[0] for c in rules.COURSE]
    assert len(ids) == len(set(ids))
    assert [c[1] for c in rules.COURSE] == list(range(1, len(ids) + 1))
    for lid, reqs in rules.REQUIRES.items():
        assert lid in ids and all(r in ids for r in reqs), lid
    badge_ids = {b[0] for b in rules.BADGES}
    for b in rules.BADGES:
        if b[4][0] == "lesson":
            assert b[4][1] in ids, b[0]
    for opts in rules.AVATAR_OPTIONS.values():
        for _, _, unlock in opts:
            assert unlock is None or unlock[0] in ("level", "cost") or unlock[1] in badge_ids, unlock


def test_validator_catches_mistakes():
    good = L.get("hello-brain")
    step = next(s for s in good["build"] if s.get("code") and not s.get("sim"))  if any(s.get("code") and not s.get("sim") for s in good["build"]) else {**good["build"][3], "code": "int main() {\n}\n"}
    bad = {**good, "build": [{**step, "test": [], "new": "40-50"}] * 3, "quiz": good["quiz"][:2]}
    errs = " ".join(L.validate(bad))
    assert "Test it" in errs or "test" in errs
    assert "'new' must be line numbers" in errs
    assert "3-6 questions" in errs


def test_simulator_steps_are_checked():
    good = L.get("hello-brain")
    sim_step = next(s for s in good["build"] if s.get("sim"))
    bad = {**good, "build": [{**sim_step, "sim": {"starter": "int main() {}", "checks": [{"type": "nope"}]}}] * 3}
    errs = " ".join(L.validate(bad))
    assert "needs a 'solution'" in errs and "each check needs" in errs
    assert L.turn_in(good) == "code" and L.turn_in(L.get("light-it-up")) == "link" and L.turn_in(L.get("drive-base")) == "show"
