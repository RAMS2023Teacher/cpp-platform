# Screenshots for "From Simulator to Robot: VEXcode IQ"

The lesson has eight "where to look" pictures of VEXcode IQ. `vx-new-project`, `vx-brain`, `vx-devices`, `vx-paste` and `vx-save` are done; `vx-tour`, `vx-connect` and `vx-download` are still needed. Until a picture exists, students see a "Picture coming soon" box in its place.

## Taking them
1. Open VEXcode IQ in Chrome (codeiq.vex.com) at a normal window size.
2. Set up the screen as described below, then press **Ctrl + Shift + Show windows** (the key with rectangles) on a Chromebook and drag over the VEXcode window.
3. Save each picture as a `.png` with the name in the table, and put it in the `shots/` folder. Or send them to whoever maintains the site to add.
4. Run `node tools/shrink-shots.js` to turn the PNGs into small WebP files, then `npm run build`.

| File name | What to show |
|---|---|
| `vx-tour` | VEXcode IQ with a C++ project open: File menu, code area, Devices button, Brain icon, Download and Run buttons all visible. |
| `vx-new-project` | The File menu open, pointing at New Text Project. |
| `vx-brain` | The IQ Robot Brain 1st gen / 2nd gen switch in Devices. |
| `vx-devices` | The Add a device button in Devices. |
| `vx-paste` | `main.cpp`, showing the folded device block to keep and `int main()` to paste over. |
| `vx-save` | The project name box and Save button. |
| `vx-connect` | The Brain icon showing a connected Brain. |
| `vx-download` | The Download and Run buttons. |

Circle or arrow the important button if you can, as the Scratch Quest pictures do. The pictures are embedded in `Lessons.gs`, and the build stops if they add up to more than 400 KB.
