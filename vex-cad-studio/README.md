# VEX IQ CAD Studio

A 3D editor where students build VEX IQ models from the **real VEX IQ CAD parts**. It runs on **Google Apps Script**, like RoboCode Academy, so it lives in your school's Google Workspace and needs no other server.

- **449 official parts** (beams, plates, pins, connectors, standoffs, shafts, gears, wheels, panels and more), converted from VEX's STEP files, plus simple stand-in blocks for the Brain, Smart Motor, battery and sensors.
- **Place parts by clicking.** Pick a part, then click on the grid or on another part. New parts sit flat on top of or beside the part under the mouse.
- **Holes line up.** With Snap on **1 pitch** (12.7 mm), parts snap so their holes line up, even when one part has an even number of holes and the other an odd number.
- **Move and rotate** with on-screen arrows, the arrow keys, 90° Turn/Tilt/Roll buttons, or by typing exact positions.
- **Edit like a CAD tool:** multi-select, copy and paste, duplicate, colors, hide and show, undo and redo, and a parts list (bill of materials) that downloads as CSV.
- **Save to the Chromebook and open again.** Save downloads a `.vexiq.json` file, and Open… (or dragging the file onto the 3D view) loads it back. Work also autosaves in the browser.
- **Export** an STL for 3D printing, or a PNG picture of the model.
- **Example models:** a gear train, a criss-cross beam tower and a simple drive base.

The server stores nothing. Students keep their own model files, so there's no data spreadsheet and no extra permissions to approve.

## Put it on Google Apps Script

Do this signed in to your school Google account. You'll copy the files in [`apps-script/`](apps-script/). They're already built, so you don't need Node unless you change something.

1. Go to [script.google.com](https://script.google.com), click **New project** and name it `VEX IQ CAD Studio`.
2. Replace everything in `Code.gs` with [`apps-script/Code.gs`](apps-script/Code.gs).
3. Click **+** next to Files → **HTML**, name it `Index`, and paste in [`apps-script/Index.html`](apps-script/Index.html).
4. Add the part shape files the same way: **+** → **HTML**, named exactly `Parts01`, `Parts02`, … `Parts09`, each with the matching file from `apps-script/`. Apps Script adds `.html` for you.
5. Open **Project Settings** (gear icon), tick **Show "appsscript.json" manifest file in editor**, and replace its contents with [`apps-script/appsscript.json`](apps-script/appsscript.json).
6. Click **Save**.
7. Click **Deploy → New deployment**, then the gear icon → **Web app**. Set **Execute as** to **Me** and **Who has access** to **Anyone within [your school]**. Click **Deploy** and copy the **Web app URL**.

Open the link to try it. The first visit takes a few seconds while the part shapes load. After that the browser keeps a copy, so it opens quickly.

**Shortcut with clasp:** if you use [clasp](https://github.com/google/clasp), run `clasp create --type webapp --rootDir apps-script` in this folder, then `clasp push`, and deploy as in step 7.

### Link it from RoboCode Academy
Add a link or button to the Web app URL in your course site. Apps Script pages run inside a frame, so open the link in a new tab:

```html
<a href="YOUR_CAD_STUDIO_URL" target="_blank" rel="noopener">Open VEX IQ CAD Studio</a>
```

The studio also allows being shown inside an `<iframe>` if you'd rather embed it on a page.

### Updating later
Paste in the changed files, then **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**. The link stays the same.

## How students use it
| Do this | How |
|---|---|
| Add a part | Click it in the library (or drag it), then click in the 3D view. Shift+click places more copies. |
| Turn the new part before placing | <kbd>R</kbd> turn, <kbd>T</kbd> tilt. <kbd>Esc</kbd> stops placing. |
| Select | Click a part. Shift+click adds more. Double-click selects every part of that kind. |
| Move or rotate | Drag the arrows. <kbd>W</kbd> move arrows, <kbd>E</kbd> rotate rings. Arrow keys nudge 1 pitch, Shift+↑/↓ moves up and down, Ctrl+arrow nudges ½ pitch. |
| Quick 90° turns | Turn, Tilt and Roll buttons, or <kbd>R</kbd> <kbd>T</kbd> <kbd>Y</kbd>. |
| Camera | Left-drag to orbit, right-drag to pan, scroll or pinch to zoom. 3D/Top/Front/Side buttons and <kbd>F</kbd> to fit. |
| Copy, paste, duplicate, delete | Ctrl+C, Ctrl+V, Ctrl+D, Delete. Ctrl+Z / Ctrl+Y undo and redo. |
| Save and open | **Save** (Ctrl+S) downloads a `.vexiq.json` file to Downloads. **Open…** (Ctrl+O) loads one back. |

The full list is under **More → Help & shortcuts** in the app.

## Good to know
- **Electronics are stand-ins.** The CAD folder doesn't include the Brain, motors or sensors, so those are simple blocks with roughly the right footprint, labeled "stand-in". Use them for planning, not exact fit.
- **Parts don't snap together by pins.** Students line parts up with the hole grid. They can pass through each other, so check the model from a few angles.
- **Shapes are simplified a little** (within about 0.1 mm) so 450 parts load quickly on Chromebooks.
- **Autosave** keeps the last model in the browser on that Chromebook. It isn't a backup, so students should use Save.
- If your school blocks downloads from Apps Script pages, Save and the exports won't work; ask IT to allow downloads from `script.google.com`.

## For developers
```
src/            the editor: index.html, style.css, app.js, electronics.js, examples.js
gas/            Code.gs and appsscript.json
parts/          library.json, the converted part shapes (source for the build)
tools/          convert-parts.js (STEP → shapes), build-gas.js, preview.js, categories.js
apps-script/    built files to copy into Apps Script (generated)
```

```bash
npm install
```

```bash
npm start
```

`npm start` builds `apps-script/` and serves it at http://localhost:8090. `npm run build` only builds.

To add or update parts, put every `.step` file in one folder and run:

```bash
npm run parts -- /path/to/step-folder
```

It tessellates each STEP file with OpenCascade, simplifies and compresses it, and writes `parts/library.json`. Parts it has already converted are skipped. Then run `npm run build`. Category rules are in [`tools/categories.js`](tools/categories.js).

Saved files are JSON: `{ "format": "vex-iq-cad", "version": 1, "name", "parts": [{ "p": part id, "t": [x, y, z] mm, "q": quaternion, "c": color }] }`. Y is up and part ids are the last digits of the VEX part number (`228-2500-005` → `"005"`).

The 3D view uses [three.js](https://threejs.org) r147 and [meshoptimizer](https://github.com/zeux/meshoptimizer), both MIT licensed and bundled into `Index.html`. Part shapes come from VEX Robotics' public VEX IQ CAD files.
