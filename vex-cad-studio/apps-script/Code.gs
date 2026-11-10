/**
 * VEX IQ CAD Studio — Google Apps Script server.
 *
 * The editor runs entirely in the student's browser. This script only serves the page and
 * the part shape files (Parts01, Parts02, ...). It stores nothing and needs no permissions
 * beyond serving the web app: students save models as files on their own Chromebook.
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('VEX IQ CAD Studio')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    // Lets you show the studio inside another page (like your VEX IQ course site) in an <iframe>.
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Returns one part-shape file. Called by the page with google.script.run. */
function partsChunk(name) {
  if (!/^Parts\d{2}$/.test(String(name))) throw new Error('Unknown parts file: ' + name);
  return HtmlService.createTemplateFromFile(name).getRawContent();
}
