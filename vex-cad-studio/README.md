# VEX IQ CAD Studio

> **Status: shelved (November 10, 2026).** The teacher decided not to use CAD Studio and to keep everything in RoboCode Academy. This branch was never merged, and nothing outside `vex-cad-studio/` changes. It's kept so the work isn't lost: `parts/library.json` holds all 449 VEX IQ parts already converted from the STEP files, so the editor can be revived without redoing the conversion.

A 3D editor where students build VEX IQ models from the **real VEX IQ CAD parts**. It runs on **Google Apps Script**, like RoboCode Academy, so it lives in your school's Google Workspace and needs no other server.

- **449 official parts** (beams, plates, pins, connectors, standoffs, shafts, gears, wheels, panels and more), converted from VEX's STEP files, plus simple stand-in blocks for the Brain, Smart Motor, battery and sensors.
- **Colorful parts.** Each kind of part has its own color (beams blue, plates green, gears red and so on) in the library and when placed, so models are easy to read. Students can recolor anything.
- **Place parts by clicking.** Pick a part, then click on the grid or on another part. New parts sit flat on top of or beside the part under the mouse.
- **Holes line up.** With Snap on **1 pitch** (12.7 mm), parts snap so their holes line up, even when one part has an even number of holes and the other an odd number.
- **Move and rotate** with on-screen arrows, the arrow keys, 90° Turn/Tilt/Roll buttons, or by typing exact positions.
- **Edit like a CAD tool:** multi-select by Shift+click or by dragging a box, copy and paste, duplicate, colors, hide and show, undo and redo, and a parts list (bill of materials) that downloads as CSV.
- **Save to the Chromebook and open again.** Save downloads a `.vexiq.json` file, and Open… (or dragging the file onto the 3D view) loads it back. Work also autosaves in the browser.
- **Export** an STL for 3D printing, or a PNG picture of the model.
- **Example models:** a gear train, a criss-cross beam tower and a simple drive base.

The server stores nothing. Students keep their own model files, so there's no data spreadsheet and no extra permissions to approve.

## Put it on Google Apps Script

CAD Studio gets **its own Apps Script project**, separate from RoboCode Academy. RoboCode's menu bar already has a **CAD Studio ↗** button that opens CAD Studio's web app link in a new tab. The files are in [`apps-script/`](apps-script/), already built.

> **Don't put CAD Studio's files in the RoboCode project.** In particular, CAD Studio's `Code.gs` would replace RoboCode's and break it ("api is not a function").

1. Go to [script.google.com](https://script.google.com), click **New project** and name it `VEX IQ CAD Studio`. (If you already made one, open it and delete any old `Index` and `Parts01`–`Parts09` files.)
2. Replace everything in `Code.gs` with [`apps-script/separate-project/Code.gs`](apps-script/separate-project/Code.gs).
3. Click **+** next to Files → **Script**, name it `CadStudio`, and paste in [`apps-script/CadStudio.gs`](apps-script/CadStudio.gs).
4. Click **+** → **HTML**, name it `CadStudioPage`, and paste in [`apps-script/CadStudioPage.html`](apps-script/CadStudioPage.html).
5. Add the part shape files the same way: **+** → **HTML**, named exactly `CadParts01`, `CadParts02`, … `CadParts09`, each with the matching file. Apps Script adds `.html` for you.
6. Open **Project Settings** (gear icon), tick **Show "appsscript.json" manifest file in editor**, and replace its contents with [`apps-script/separate-project/appsscript.json`](apps-script/separate-project/appsscript.json).
7. Click **Deploy → New deployment**, then the gear icon → **Web app**. Set **Execute as** to **Me** and **Who has access** to **Anyone within [your school]**. Click **Deploy** and copy the **Web app URL**. If you already have a deployment, use **Manage deployments → pencil icon → New version** instead, so the URL stays the same.

RoboCode Academy links to that URL from the `APPS` list near the top of its `public/js/app.js`. If your CAD Studio URL changes, update it there. Apps Script pages run inside a frame, so any other link to CAD Studio should open in a new tab:

```html
<a href="YOUR_CAD_STUDIO_URL" target="_blank" rel="noopener">Open VEX IQ CAD Studio</a>
```

CAD Studio's files all start with `Cad`, and its server functions are `cadStudioPage_` and `cadPartsChunk`, so they could share a project with another app later. Only `separate-project/Code.gs` defines `doGet`.

The first visit takes a few seconds while the part shapes load. After that the browser keeps a copy, so it opens quickly.

### Updating later
Paste in the changed files, then **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**. The link stays the same.

## How students use it
| Do this | How |
|---|---|
| Add a part | Click it in the library (or drag it), then click in the 3D view. Shift+click places more copies. |
| Turn the new part before placing | <kbd>R</kbd> turn, <kbd>T</kbd> tilt. <kbd>Esc</kbd> stops placing. |
| Select | Click a part. Shift+click adds more. Double-click selects every part of that kind. Drag a box to select several: choose **⬚ Select** at the top right of the 3D view (or press <kbd>B</kbd>), or hold Shift and drag in any mode. |
| Move or rotate | Drag the arrows. <kbd>W</kbd> move arrows, <kbd>E</kbd> rotate rings. Arrow keys nudge 1 pitch, Shift+↑/↓ moves up and down, Ctrl+arrow nudges ½ pitch. |
| Quick 90° turns | Turn, Tilt and Roll buttons, or <kbd>R</kbd> <kbd>T</kbd> <kbd>Y</kbd>. |
| Camera | Left-drag orbits, right-drag pans, scroll or pinch zooms. On a touchpad, choose **✋ Pan** (<kbd>P</kbd>) to make left-drag pan instead, and **⟲ Orbit** (<kbd>O</kbd>) to switch back. 3D/Top/Front/Side buttons and <kbd>F</kbd> to fit. |
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
gas/            CadStudio.gs, plus Code.gs and appsscript.json for a stand-alone project
parts/          library.json, the converted part shapes (source for the build)
tools/          convert-parts.js (STEP → shapes), build-gas.js, preview.js, categories.js
apps-script/    built files to copy into Apps Script (generated); separate-project/ is only for a stand-alone project
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

The 3D view uses [three.js](https://threejs.org) r147 and [meshoptimizer](https://github.com/zeux/meshoptimizer), both MIT licensed and bundled into `CadStudioPage.html`. Part shapes come from VEX Robotics' public VEX IQ CAD files.
