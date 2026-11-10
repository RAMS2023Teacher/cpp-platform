// Converts screenshots in shots/ (.png or .jpg) into small WebP files for the lessons, 1000 px wide at most.
// Needs Python 3 with Pillow (pip install pillow). Usage: node tools/shrink-shots.js
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'shots');
const py = `
import sys
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
if im.width > 1000: im = im.resize((1000, round(im.height * 1000 / im.width)), Image.LANCZOS)
im.save(dst, 'WEBP', quality=72, method=6)
`;
for (const f of fs.readdirSync(dir).filter(f => /\.(png|jpe?g)$/i.test(f))) {
  const src = path.join(dir, f), dst = path.join(dir, f.replace(/\.(png|jpe?g)$/i, '.webp'));
  execFileSync('python3', ['-I', '-c', py, src, dst]);
  fs.unlinkSync(src);
  console.log(`${f} -> ${path.basename(dst)} (${Math.round(fs.statSync(dst).size / 1024)} KB)`);
}
