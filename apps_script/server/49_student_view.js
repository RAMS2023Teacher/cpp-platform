// ---------------------------------------------------------------- student view (teacher only)
// The teacher can use the site exactly as a student in one class would: the student pages, that grade's lessons,
// XP, the quiz, the editor. Their practice work is saved in a student record of their own, which never shows in
// the gradebook, leaderboards, arena or reports. Things that would reach real students are off: partners, teams
// and help requests.

function owner_() {
  var me = whoIs_();
  if (!me.owner) { var e = new Error('Only the teacher can do that.'); e.status = 403; throw e; }
  return me;
}

/** Start student view for a class. */
function studentView(cid) {
  var me = owner_(), cfg = config_();
  if (!cfg.classes[cid]) throw new Error('No such class.');
  var rec = loadStudent_(me.email) || newStudent_(me.email);
  rec.name = 'Student view';
  rec.classes = [String(cid)];
  saveStudent_(rec);
  PropertiesService.getScriptProperties().setProperty('preview', String(cid));
  return { ok: true };
}

/** Leave student view. reset: also clear the practice work, so the next visit starts fresh. */
function studentViewExit(reset) {
  var me = owner_(), props = PropertiesService.getScriptProperties(), cid = props.getProperty('preview') || '';
  if (reset) {
    var old = loadStudent_(me.email);
    if (old) { var fresh = newStudent_(me.email); fresh.name = 'Student view'; fresh.classes = old.classes || []; fresh.created_at = old.created_at; saveStudent_(fresh); }
  }
  props.deleteProperty('preview');
  return { ok: true, class_id: cid };
}

/** What the banner at the top of every page needs, or null. */
function previewInfo_(me) {
  if (!me.preview) return null;
  var c = config_().classes[me.preview];
  return { class_id: me.preview, class_name: c ? c.name : 'a class', grade_name: c ? DATA.grades[String(gradeOfClass_(c))] : '' };
}

function noPreview_(me, what) {
  if (me && me.preview) { var e = new Error(what + ' off in student view, so nothing reaches your real students.'); e.status = 400; throw e; }
}
