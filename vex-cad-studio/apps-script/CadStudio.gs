/**
 * VEX IQ CAD Studio — Google Apps Script server code.
 *
 * Works two ways:
 *  - Inside your RoboCode Academy project: RoboCode's doGet shows the studio for ?page=cad.
 *  - In a project of its own: add a Code.gs containing doGet() { return cadStudioPage_(); }.
 *
 * The editor runs in the student's browser. This file only serves the page and the
 * part shape files (CadParts01, CadParts02, ...). It stores nothing.
 */
function cadStudioPage_() {
  return HtmlService.createHtmlOutputFromFile('CadStudioPage')
    .setTitle('VEX IQ CAD Studio')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    // Lets the studio be shown inside another page in an <iframe>.
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Returns one part-shape file. Called by the page with google.script.run. */
function cadPartsChunk(name) {
  if (!/^CadParts\d{2}$/.test(String(name))) throw new Error('Unknown parts file: ' + name);
  return HtmlService.createTemplateFromFile(name).getRawContent();
}
