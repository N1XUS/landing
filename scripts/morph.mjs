// Generates the scroll film's shared geometry: src/morph.css, src/intro-threads.ts and public/threads.svg.
// One living shape rides a line down the page, melting into a new form at each stop. Threads gather at every stop and
// part in smooth curves between them. PAGE and the stops must match the scene heights in src/styles.css.
// Run: npm run morph
import { writeFileSync } from "node:fs";

const PAGE = 1590; // page height in svh
const SCROLL = PAGE - 100; // scrollable distance in svh
const HEAD = 30; // where the shape starts on screen, in svh

// Every shape is the same list of contours, each with a fixed point count, so any two can morph. Contours a
// shape does not use collapse to a point. Clockwise fills and counter-clockwise cuts, under the nonzero rule.
const SLOTS = [110, 50, 36, 36, 36, 24, 24];

const area = (points) =>
  points.reduce((sum, [x, y], i) => {
    const [nx, ny] = points[(i + 1) % points.length];
    return sum + x * ny - nx * y;
  }, 0) / 2;

const soft = (a, b, c) => (t) => 0.8 + 0.12 * Math.sin(2 * t + a) + 0.08 * Math.sin(3 * t + b) + 0.04 * Math.sin(5 * t + c);

/** A soft closed body, optionally stretched and turned. */
const wisp = (x, y, size, [a, b, c], { stretch = 1, turn = 0, cut = false } = {}) => ({
  cut,
  points: Array.from({ length: 120 }, (_, i) => {
    const t = (i / 120) * 2 * Math.PI;
    const r = size * soft(a, b, c)(t);
    const [dx, dy] = [r * Math.cos(t) * stretch, r * Math.sin(t)];
    return [x + dx * Math.cos(turn) - dy * Math.sin(turn), y + dx * Math.sin(turn) + dy * Math.cos(turn)];
  }),
});

/** A sickle that tapers to nothing at both tips. */
const crescent = (x, y, radius, thickness, from, to) => {
  const along = (u, r) => {
    const t = from + (to - from) * u;
    return [x + r * Math.cos(t), y + r * Math.sin(t)];
  };
  const steps = Array.from({ length: 80 }, (_, i) => i / 79);
  return {
    points: [
      ...steps.map((u) => along(u, radius * (1 + 0.05 * Math.sin(5 * u)))),
      ...steps.reverse().map((u) => along(u, radius - thickness * Math.sin(Math.PI * u))),
    ],
  };
};

const petal = (angle, seed) =>
  wisp(50 + 24 * Math.cos(angle), 50 + 24 * Math.sin(angle), 30, seed, { stretch: 1.3, turn: angle });

// Nothing here is meant to be recognised, only caught mid-change: a body that opens, sheds, divides and closes again.
const SHAPES = {
  circle: [{ points: Array.from({ length: 180 }, (_, i) => {
    const t = (i / 180) * 2 * Math.PI;
    return [50 + 50 * Math.cos(t), 50 + 50 * Math.sin(t)];
  }) }],
  blob: [wisp(50, 50, 50, [0.6, 2.1, 1])],
  membrane: [wisp(50, 50, 50, [0.6, 2.1, 1]), wisp(53, 46, 33, [2.4, 0.7, 4], { cut: true }), wisp(45, 56, 12, [1, 3, 5])],
  spores: [
    wisp(42, 52, 32, [3, 1, 2]),
    wisp(84, 26, 10, [1, 4, 0.5]),
    wisp(88, 66, 13, [5, 2, 3]),
    wisp(62, 92, 7, [2, 5, 1]),
    wisp(14, 14, 7, [4, 0.3, 2]),
    wisp(66, 10, 5, [0.2, 3, 4]),
    wisp(8, 84, 5, [3, 3, 1]),
  ],
  tide: [crescent(50, 50, 50, 36, -2.5, 1.7), wisp(62, 44, 8, [1, 2, 3]), wisp(46, 62, 5, [4, 1, 0.5])],
  dividing: [
    wisp(30, 52, 31, [0.8, 2.6, 4]),
    wisp(72, 46, 29, [3.4, 1.2, 0.4]),
    wisp(28, 54, 9, [2, 4, 1], { cut: true }),
    wisp(74, 44, 8, [5, 1, 3], { cut: true }),
  ],
  bloom: [
    petal(-Math.PI / 2, [0.5, 2, 3]),
    petal(Math.PI / 6, [3.1, 0.4, 1.5]),
    petal((5 * Math.PI) / 6, [1.8, 4.2, 5]),
    wisp(92, 12, 5, [2, 1, 4]),
    wisp(8, 92, 4, [0.6, 3, 2]),
  ],
};

const resample = (points, count) => {
  const closed = [...points, points[0]];
  const lengths = [0];
  for (let i = 1; i < closed.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(closed[i][0] - closed[i - 1][0], closed[i][1] - closed[i - 1][1]));
  }
  const total = lengths.at(-1);
  let segment = 1;
  return Array.from({ length: count }, (_, i) => {
    const target = (i / count) * total;
    while (lengths[segment] < target) segment++;
    const t = (target - lengths[segment - 1]) / (lengths[segment] - lengths[segment - 1] || 1);
    return [0, 1].map((k) => closed[segment - 1][k] + (closed[segment][k] - closed[segment - 1][k]) * t);
  });
};

const polygon = (contours) => {
  const all = contours.flatMap((contour) => contour.points);
  const [minX, maxX] = [Math.min(...all.map((p) => p[0])), Math.max(...all.map((p) => p[0]))];
  const [minY, maxY] = [Math.min(...all.map((p) => p[1])), Math.max(...all.map((p) => p[1]))];
  const fit = 100 / Math.max(maxX - minX, maxY - minY);
  const place = ([x, y]) => [50 + (x - (minX + maxX) / 2) * fit, 50 + (y - (minY + maxY) / 2) * fit];
  const ordered = [...contours].sort((a, b) => Math.abs(area(b.points)) - Math.abs(area(a.points)));

  // Every contour starts and ends on one anchor, so the jumps between contours retrace themselves and enclose nothing.
  let anchor = [50, 50];
  const points = SLOTS.flatMap((count, slot) => {
    if (!ordered[slot]) return Array.from({ length: count + 2 }, () => anchor);
    const { points: raw, cut } = ordered[slot];
    const wound = area(raw) > 0 === !cut ? raw : [...raw].reverse();
    const even = resample(wound, count).map(place);
    // Start each contour at its top, so morphing does not twist it.
    const top = even.reduce((best, p, i) => (p[1] < even[best][1] ? i : best), 0);
    const turned = [...even.slice(top), ...even.slice(0, top)];
    if (slot === 0) anchor = turned[0];
    return [...turned, turned[0], anchor];
  });
  return `polygon(${points.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(",")})`;
};

// Seeded so a rebuild gives the same film. Change SEED to shuffle where the shape lands.
const SEED = 20261103;
let state = SEED;
const random = () => {
  state = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(state ^ (state >>> 15), 1 | state);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const between = (min, max) => min + (max - min) * random();

// Screen areas the shape may land in, in vw and svh. Skill text sits low on screen, so these keep to the top half.
const ZONES = [
  { x: [68, 84], y: [26, 32] },
  { x: [46, 62], y: [24, 30] },
  { x: [24, 40], y: [24, 30] },
];

/** A landing spot in a zone other than the last one used. */
let lastZone = -1;
const land = () => {
  let zone;
  do zone = Math.floor(random() * ZONES.length);
  while (zone === lastZone);
  lastZone = zone;
  return { x: between(...ZONES[zone].x), y: between(...ZONES[zone].y) };
};

// from/to: scroll progress in percent while the shape holds. x in vw, y in svh on screen.
const STOPS = [
  { from: 0, to: 2, shape: "circle", x: 74, y: HEAD, r: 0, s: 0.05 },
  { from: 9, to: 14, shape: "circle", x: 74, y: HEAD, r: 0, s: 1 },
  ...[
    { from: 22, to: 30, shape: "blob", s: 0.72 },
    { from: 37, to: 44, shape: "membrane", s: 0.52 },
    { from: 50, to: 56, shape: "spores", s: 0.56 },
    { from: 62, to: 68, shape: "tide", s: 0.5 },
    { from: 75, to: 81, shape: "dividing", s: 0.56 },
    { from: 88, to: 94, shape: "bloom", s: 0.52 },
  ].map((stop) => ({ ...land(), r: Math.round(between(-40, 60)), ...stop, s: stop.s * between(0.85, 1.2) })),
  { from: 100, to: 100, shape: "circle", x: 88, y: 34, r: 45, s: 0.05 },
];

// How far the line bows on the way to each stop: towards whichever side has more room.
for (let i = 2; i < STOPS.length; i++) {
  const middle = (STOPS[i - 1].x + STOPS[i].x) / 2;
  STOPS[i].swing = (middle > 50 ? -1 : 1) * between(18, 42);
}

const smooth = (t) => t * t * t * (t * (t * 6 - 15) + 10);

/** The stretch of the film a scroll progress falls in: t is 0 while holding, rising during a transit. */
const locate = (p) => {
  for (let i = 1; i < STOPS.length; i++) {
    const a = STOPS[i - 1];
    const b = STOPS[i];
    if (p <= a.to) return { a, b: a, t: 0 };
    if (p < b.from) return { a, b, t: (p - a.to) / (b.from - a.to) };
  }
  return { a: STOPS.at(-1), b: STOPS.at(-1), t: 0 };
};

/** Where a thread sits at a scroll progress. `spread` is that thread's distance from the main line. */
const lineX = (p, spread = 0) => {
  const { a, b, t } = locate(p);
  const bow = Math.sin(Math.PI * t);
  return a.x + (b.x - a.x) * smooth(t) + (b.swing ?? 0) * bow * bow + spread * bow;
};

/** The shape's height on screen at a scroll progress. */
const screenY = (p) => {
  const { a, b, t } = locate(p);
  return a.y + (b.y - a.y) * smooth(t);
};

/** The line's height on the page: the scroll travelled plus where the shape sits on screen. */
const pageY = (p) => (p / 100) * SCROLL + screenY(p);

// Between stops the shape melts into a soft mass, its cuts closing, then gathers into the next form and overshoots.
const melts = [[0.4, 3.3, 5], [2.2, 0.9, 1.7], [4.1, 5.2, 0.3], [1.3, 2.7, 4.4], [5.5, 1.1, 2.6], [3, 4.6, 5.9], [0.9, 0.2, 3.8]];
const body = [];
const pose = [];
STOPS.forEach(({ from, to, shape, r, s }, i) => {
  const next = STOPS[i + 1];
  const at = from === to ? `${from}%` : `${from}%, ${to}%`;
  body.push(`  ${at} { clip-path: ${polygon(SHAPES[shape])}; }`);
  pose.push(`  ${from}% { transform: rotate(${r}deg) scale(${s}); }`);
  if (to !== from) pose.push(`  ${to}% { transform: rotate(${r + 8}deg) scale(${(s * 1.05).toFixed(3)}); }`);
  if (!next || i === 0) return;
  const middle = (to + next.from) / 2;
  const settle = next.from - 1.2;
  body.push(`  ${middle}% { clip-path: ${polygon([wisp(50, 50, 50, melts[i % melts.length])])}; }`);
  pose.push(`  ${middle}% { transform: rotate(${Math.round((r + next.r) / 2 + 24)}deg) scale(${(((s + next.s) / 2) * 0.86).toFixed(3)}); }`);
  pose.push(`  ${settle}% { transform: rotate(${next.r - 3}deg) scale(${(next.s * 1.07).toFixed(3)}); }`);
});

const percents = Array.from({ length: 101 }, (_, p) => p);
const rideFrames = percents
  .map((p) => `  ${p}% { transform: translate(${lineX(p).toFixed(2)}vw, ${screenY(p).toFixed(2)}svh); }`)
  .join("\n");
const drawFrames = percents
  .map((p) => `  ${p}% { clip-path: inset(0 0 calc(100% - ${pageY(p).toFixed(1)}svh) 0); }`)
  .join("\n");

// The opening: the dot flies in along a curve to its first stop, drawing threads that gather on it.
const REST = { x: STOPS[0].x, y: STOPS[0].y };
const easeOut = (t) => 1 - (1 - t) ** 3.2;
const bezier = ([p0, p1, p2, p3], t) => {
  const u = 1 - t;
  return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
};
const INTRO_CURVE = [[-4, 96], [18, 88], [34, 12], [REST.x, REST.y]];
const flyFrames = [];
const unspoolFrames = [];
for (let percent = 0; percent <= 100; percent += 4) {
  const eased = easeOut(percent / 100);
  const [x, y] = bezier(INTRO_CURVE, eased);
  flyFrames.push(`  ${percent}% { translate: ${(x - REST.x).toFixed(2)}vw ${(y - REST.y).toFixed(2)}svh; }`);
  // A clip, not dashes: dash lengths break under the threads' non-scaling stroke.
  unspoolFrames.push(`  ${percent}% { clip-path: inset(-1px calc(100% - ${x.toFixed(2)}vw) -1px 0); }`);
}

const introThreads = [
  { start: 0, bend: 0, opacity: 1, width: 1.5 },
  { start: 9, bend: 8, opacity: 0.5, width: 1 },
  { start: -9, bend: -8, opacity: 0.5, width: 1 },
  { start: 20, bend: 18, opacity: 0.28, width: 1 },
  { start: -20, bend: -18, opacity: 0.28, width: 1 },
].map(({ start, bend, opacity, width }) => {
  const [p0, p1, p2, p3] = INTRO_CURVE;
  const d = `M${p0[0]} ${p0[1] + start}C${p1[0]} ${p1[1] + bend} ${p2[0]} ${p2[1] + bend} ${p3[0]} ${p3[1]}`;
  return `<path d="${d}" stroke="#f2f2f2" stroke-opacity="${opacity}" stroke-width="${width}" vector-effect="non-scaling-stroke"/>`;
});

writeFileSync(
  new URL("../src/intro-threads.ts", import.meta.url),
  `// Generated by scripts/morph.mjs. Do not edit by hand.\nexport const introThreads = ${JSON.stringify(
    `<svg class="intro-threads" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">${introThreads.join("")}</svg>`,
  )};\n`,
);

writeFileSync(
  new URL("../src/morph.css", import.meta.url),
  `/* Generated by scripts/morph.mjs. Do not edit by hand. */
@keyframes morph {
${body.join("\n")}
}
@keyframes pose {
${pose.join("\n")}
}
@keyframes ride {
${rideFrames}
}
@keyframes fly-in {
${flyFrames.join("\n")}
}
@keyframes unspool {
${unspoolFrames.join("\n")}
}
@keyframes draw-line {
${drawFrames}
}
`,
);

// Catmull-Rom through the samples, written as cubic beziers.
const toPath = (points) => {
  let d = `M${points[0][0].toFixed(2)} ${points[0][1].toFixed(1)}`;
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
  const points = Array.from({ length: 151 }, (_, i) => {
    const p = i / 1.5;
    return [lineX(p, spread), pageY(p)];
  });
  return `<path d="${toPath(points)}" stroke="#f2f2f2" stroke-opacity="${opacity}" stroke-width="${width}" vector-effect="non-scaling-stroke"/>`;
});

writeFileSync(
  new URL("../public/threads.svg", import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 ${PAGE}" preserveAspectRatio="none" fill="none">${paths.join("")}</svg>\n`,
);
