// Generates the scroll film's shared geometry: src/morph.css and public/threads.svg.
// A dust cloud drifts down the page along one line that never stops or turns sharply, so an even scroll gives even motion.
// Threads run that whole line, from the opening sweep to the foot of the page. PAGE must match the scene heights in
// src/styles.css. The dust itself is drawn in src/mist.ts, which reads this film's position and pose.
// Run: npm run morph
import { writeFileSync } from "node:fs";

const PAGE = 1590; // page height in svh
const SCROLL = PAGE - 100; // scrollable distance in svh
const REST = { x: 74, y: 30 }; // where the dot lands after the opening, in vw and svh on screen

// Seeded so a rebuild gives the same film. Change SEED to shuffle where the cloud goes.
const SEED = 20261103;
let state = SEED;
const random = () => {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const between = (min, max) => min + (max - min) * random();

// Screen areas the cloud may pass through, in vw and svh. Skill text sits low on screen, so these keep to the top half.
const ZONES = [
  { x: [68, 84], y: [26, 32] },
  { x: [46, 62], y: [24, 30] },
  { x: [24, 40], y: [24, 30] },
];

/** A spot in a zone other than the last one used. */
let lastZone = -1;
const land = () => {
  let zone;
  do zone = Math.floor(random() * ZONES.length);
  while (zone === lastZone);
  lastZone = zone;
  return { x: between(...ZONES[zone].x), y: between(...ZONES[zone].y) };
};

// Points the line passes through, not places it stops. at: scroll progress in percent, s: size, r: turn in degrees.
const MARKS = [
  { at: 0, ...REST, r: 0, s: 0.05 },
  { at: 13, x: 72, y: REST.y, r: 0, s: 1 },
  ...[26, 40.5, 53, 65, 78, 91].map((at) => ({ at, ...land(), r: between(-30, 30), s: between(0.55, 0.85) })),
  { at: 100, x: 70, y: 32, r: 0, s: 0.95 },
];

/** A curve through the marks whose speed changes gradually: slopes match where segments meet and are flat at both ends. */
const through = (key) => (p) => {
  const i = Math.max(0, MARKS.findLastIndex((mark) => mark.at <= p));
  const a = MARKS[i];
  const b = MARKS[i + 1];
  if (!b) return a[key];
  const slope = (n) => {
    const [before, after] = [MARKS[n - 1], MARKS[n + 1]];
    return before && after ? (after[key] - before[key]) / (after.at - before.at) : 0;
  };
  const span = b.at - a.at;
  const t = (p - a.at) / span;
  return (
    (2 * t ** 3 - 3 * t ** 2 + 1) * a[key] +
    (t ** 3 - 2 * t ** 2 + t) * span * slope(i) +
    (-2 * t ** 3 + 3 * t ** 2) * b[key] +
    (t ** 3 - t ** 2) * span * slope(i + 1)
  );
};
const [markX, screenY, turn, size] = ["x", "y", "r", "s"].map(through);

const BUNDLE = 0.3; // how much of its spread a thread keeps as the line passes a mark

/** Where a thread sits at a scroll progress. `spread` is that thread's distance from the main line. */
const lineX = (p, spread = 0) => {
  const i = Math.max(0, MARKS.findLastIndex((mark) => mark.at <= p));
  const [a, b] = [MARKS[i], MARKS[i + 1]];
  const open = b ? Math.sin((Math.PI * (p - a.at)) / (b.at - a.at)) ** 2 : 0;
  return markX(p) + spread * (BUNDLE + (1 - BUNDLE) * open);
};

/** The line's height on the page: the scroll travelled plus where the cloud sits on screen. */
const pageY = (p) => (p / 100) * SCROLL + screenY(p);

const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const percents = Array.from({ length: 101 }, (_, p) => p);

// The opening: the dot sweeps in from above the top left and turns down into the line it will follow. All the control
// points after the first sit on the line's own vertical, so the curve straightens out as it joins and leaves no corner.
// Threads further right start higher, on the outside of the turn, so they never cross.
const bezier = ([p0, p1, p2, p3], t) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
};
const sweep = (spread = 0) => {
  const x = REST.x + spread * BUNDLE;
  return [[-6, -4 - spread * 1.4], [x, -spread * 0.5], [x, 10], [x, REST.y]];
};
const easeOut = (t) => 1 - (1 - t) ** 3.2;
const FLY_DURATION = 2200; // ms. Must match fly-in in src/styles.css
const UNSPOOL_DURATION = 3000; // ms. Must match unspool in src/styles.css
const TAIL_FROM = 0.3; // the share of the reveal after which the line runs on below the dot, while the dot is still settling
const LOWEST = REST.y + 3; // how far down the threads show before that, in svh
const flyFrames = [];
for (let percent = 0; percent <= 100; percent += 4) {
  const [x, y] = bezier(sweep(), easeOut(percent / 100));
  flyFrames.push(`  ${percent}% { translate: ${(x - REST.x).toFixed(2)}vw ${(y - REST.y).toFixed(2)}svh; }`);
}
// A clip, not dashes: dash lengths break under the threads' non-scaling stroke.
const unspoolFrames = [];
for (let percent = 0; percent <= 100; percent += 2) {
  const flight = Math.min(1, ((percent / 100) * UNSPOOL_DURATION) / FLY_DURATION);
  const [x] = bezier(sweep(), easeOut(flight));
  const left = 1 - smooth(Math.max(0, (percent / 100 - TAIL_FROM) / (1 - TAIL_FROM)));
  unspoolFrames.push(`  ${percent}% { clip-path: inset(-1px ${((100 - x) * left).toFixed(2)}vw ${((100 - LOWEST) * left).toFixed(2)}svh 0); }`);
}

const rideFrames = percents.map((p) => `  ${p}% { transform: translate(${lineX(p).toFixed(2)}vw, ${screenY(p).toFixed(2)}svh); }`);
const poseFrames = percents.map((p) => {
  const shown = smooth(Math.min(1, Math.max(0, (p - 1) / 8)));
  return `  ${p}% { transform: rotate(${turn(p).toFixed(2)}deg) scale(${Math.max(0.05, size(p)).toFixed(3)}); opacity: ${shown.toFixed(3)}; }`;
});

writeFileSync(
  new URL("../src/morph.css", import.meta.url),
  `/* Generated by scripts/morph.mjs. Do not edit by hand. */
@keyframes pose {
${poseFrames.join("\n")}
}
@keyframes ride {
${rideFrames.join("\n")}
}
@keyframes fly-in {
${flyFrames.join("\n")}
}
@keyframes unspool {
${unspoolFrames.join("\n")}
}
@keyframes pan {
  to { transform: translateY(-${SCROLL}svh); }
}
`,
);

// The opening as its exact bezier, then Catmull-Rom through the samples, written as cubic beziers.
const toPath = ([start, c1, c2], points) => {
  const pair = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(1)}`;
  let d = `M${pair(start)}C${pair(c1)} ${pair(c2)} ${pair(points[0])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [points[i - 1] ?? points[i], points[i], points[i + 1], points[i + 2] ?? points[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(2)} ${c1[1].toFixed(1)} ${c2[0].toFixed(2)} ${c2[1].toFixed(1)} ${p2[0].toFixed(2)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

const threads = [
  { spread: 0, opacity: 1, width: 1.5 },
  { spread: 7, opacity: 0.5, width: 1 },
  { spread: -7, opacity: 0.5, width: 1 },
  { spread: 15, opacity: 0.28, width: 1 },
  { spread: -15, opacity: 0.28, width: 1 },
];

const paths = threads.map(({ spread, opacity, width }) => {
  const line = Array.from({ length: 151 }, (_, i) => {
    const p = i / 1.5;
    return [lineX(p, spread), pageY(p)];
  });
  // Runs on past the last mark to the foot of the page, so the line never ends in view. Spaced like the line itself:
  // one long step here would throw the curve into a loop where it joins.
  const tail = Array.from({ length: 6 }, (_, i) => [lineX(100, spread), pageY(100) + ((PAGE - pageY(100)) * (i + 1)) / 6]);
  const points = [...line, ...tail];
  return `<path d="${toPath(sweep(spread), points)}" stroke="#f2f2f2" stroke-opacity="${opacity}" stroke-width="${width}" vector-effect="non-scaling-stroke"/>`;
});

writeFileSync(
  new URL("../public/threads.svg", import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${PAGE}" preserveAspectRatio="none" fill="none">${paths.join("")}</svg>\n`,
);
