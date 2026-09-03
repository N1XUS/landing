// Builds the responsive AVIF/WebP variants in public/img from the source
// PNGs in media/ (untracked), plus the ink logo for the light theme.
// Run: `npm run images`.
//
// Naming: <name>-<width>.<ext>. Components reference these paths directly.
import { mkdir, readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "public", "img");

/** name -> { src, widths, ground? } */
const JOBS = {
  "hero-dark": {
    src: "media/renders/hero-dark.png",
    widths: [960, 1536],
    ground: "dark",
  },
  "hero-light": {
    src: "media/renders/hero-light.png",
    widths: [960, 1536],
    ground: "light",
  },
  "malva-dark": { src: "media/shots/malva-dark.png", widths: [720, 1440] },
  "malva-light": { src: "media/shots/malva-light.png", widths: [720, 1440] },
};
for (const motif of ["strata", "peaks", "grid", "net"]) {
  for (const theme of ["dark", "light"]) {
    JOBS[`cover-${motif}-${theme}`] = {
      src: `media/renders/cover-${motif}-${theme}.png`,
      widths: [1024],
      ground: theme,
    };
  }
}

const exists = (p) =>
  stat(p).then(
    () => true,
    () => false,
  );

/**
 * The renders sit on a studio ground that is nearly, but not exactly, black
 * (dark set) or white (light set), and it drifts a few levels across the
 * frame. The site blends them onto the page with `screen` / `multiply`,
 * where every level short of pure black / white shows up as a faint slab
 * with hard edges on a large display.
 *
 * Flat-field the ground away: estimate it as a smooth per-channel field
 * (block minima for dark renders, block maxima for light ones, filled in
 * across the subject from the surrounding ground and upsampled), then
 * stretch each pixel so the field maps to 0 / 255. Glass highlights and
 * shadows clip harmlessly; the subject itself is untouched.
 */
async function flattenGround(image, mode) {
  const { data, info } = await image
    .clone()
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const light = mode === "light";
  const bs = 32;
  const bw = Math.ceil(w / bs);
  const bh = Math.ceil(h / bs);
  const field = new Float32Array(bw * bh * c);
  const known = new Uint8Array(bw * bh);

  // Per-block ground level per channel: the mean of the pixels within a
  // few levels of the block's extreme, so sensor-style noise averages out
  // instead of the single noisiest pixel setting the level. A block counts
  // as ground only when that level is close enough to the target to be
  // ground rather than subject.
  const band = 10;
  for (let by = 0; by < bh; by++) {
    for (let bx = 0; bx < bw; bx++) {
      const ext = [light ? 0 : 255, light ? 0 : 255, light ? 0 : 255];
      const y1 = Math.min(h, (by + 1) * bs);
      const x1 = Math.min(w, (bx + 1) * bs);
      for (let y = by * bs; y < y1; y++) {
        for (let x = bx * bs; x < x1; x++) {
          const i = (y * w + x) * c;
          for (let ch = 0; ch < c; ch++) {
            const v = data[i + ch];
            if (light ? v > ext[ch] : v < ext[ch]) ext[ch] = v;
          }
        }
      }
      const sum = [0, 0, 0];
      const n = [0, 0, 0];
      for (let y = by * bs; y < y1; y++) {
        for (let x = bx * bs; x < x1; x++) {
          const i = (y * w + x) * c;
          for (let ch = 0; ch < c; ch++) {
            const v = data[i + ch];
            if (light ? v >= ext[ch] - band : v <= ext[ch] + band) {
              sum[ch] += v;
              n[ch]++;
            }
          }
        }
      }
      const b = by * bw + bx;
      const level = sum.map((s, ch) => s / n[ch]);
      const lum = (level[0] + level[1] + level[2]) / 3;
      known[b] = light ? lum >= 205 : lum <= 40;
      for (let ch = 0; ch < c; ch++) field[b * c + ch] = level[ch];
    }
  }

  // Grow the ground estimate across subject blocks from their neighbours.
  for (let pass = 0; pass < bw + bh; pass++) {
    const next = known.slice();
    let grew = false;
    for (let by = 0; by < bh; by++) {
      for (let bx = 0; bx < bw; bx++) {
        const b = by * bw + bx;
        if (known[b]) continue;
        const sum = [0, 0, 0];
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = by + dy;
            const nx = bx + dx;
            if (ny < 0 || nx < 0 || ny >= bh || nx >= bw) continue;
            const nb = ny * bw + nx;
            if (!known[nb]) continue;
            for (let ch = 0; ch < c; ch++) sum[ch] += field[nb * c + ch];
            n++;
          }
        }
        if (!n) continue;
        for (let ch = 0; ch < c; ch++) field[b * c + ch] = sum[ch] / n;
        next[b] = 1;
        grew = true;
      }
    }
    known.set(next);
    if (!grew) break;
  }

  const coarse = Buffer.alloc(bw * bh * c);
  for (let i = 0; i < coarse.length; i++) coarse[i] = Math.round(field[i]);
  const smooth = await sharp(coarse, {
    raw: { width: bw, height: bh, channels: c },
  })
    .blur(1.2)
    .resize(w, h, { fit: "fill", kernel: "lanczos3" })
    .raw()
    .toBuffer();

  // Overshoot the target by a couple of levels so the noise around the
  // ground level clips to it instead of straddling it (the lossy encoders
  // add a little more of their own).
  const over = 3;
  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i++) {
    const g = light ? smooth[i] - over : smooth[i] + over;
    const v = light
      ? (data[i] * 255) / Math.max(g, 1)
      : ((data[i] - g) * 255) / Math.max(255 - g, 1);
    out[i] = v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
  }
  return sharp(out, { raw: { width: w, height: h, channels: c } });
}

await mkdir(OUT, { recursive: true });
const produced = new Set();
let built = 0;
let skipped = 0;
for (const [name, job] of Object.entries(JOBS)) {
  const src = path.join(ROOT, job.src);
  if (!(await exists(src))) {
    console.warn(`skip ${name}: missing ${job.src}`);
    skipped++;
    continue;
  }
  let image = sharp(src);
  if (job.ground) image = await flattenGround(image, job.ground);
  for (const width of job.widths) {
    const base = `${name}-${width}`;
    const resized = image.clone().resize({ width, withoutEnlargement: true });
    await Promise.all([
      resized
        .clone()
        .avif({ quality: 58, effort: 6 })
        .toFile(path.join(OUT, `${base}.avif`)),
      resized
        .clone()
        .webp({ quality: 82 })
        .toFile(path.join(OUT, `${base}.webp`)),
    ]);
    produced.add(`${base}.avif`);
    produced.add(`${base}.webp`);
    built += 2;
  }
  console.log(`built ${name} @ ${job.widths.join("/")}`);
}

// Prune outputs no job produces any more, but only after a complete run:
// with sources missing (a fresh clone without media/) the old files are all
// the site has.
if (skipped === 0) {
  for (const file of await readdir(OUT)) {
    if (produced.has(file)) continue;
    await unlink(path.join(OUT, file));
    console.log(`pruned ${file}`);
  }
}

// public/logo.png is the light glyph (near-white strokes + blue accents)
// for the dark theme. Recolour the near-white pixels to ink for the light
// theme; the blue accents stay as they are.
{
  const src = path.join(ROOT, "public", "logo.png");
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    if (data[i] > 200 && data[i + 1] > 200 && data[i + 2] > 200) {
      data[i] = 0x17;
      data[i + 1] = 0x17;
      data[i + 2] = 0x17;
    }
  }
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(path.join(ROOT, "public", "logo-ink.png"));
  built++;
  console.log("built logo-ink.png");
}

const files = await readdir(OUT);
console.log(
  `${built} files written, ${skipped} jobs skipped, ${files.length} in public/img`,
);
