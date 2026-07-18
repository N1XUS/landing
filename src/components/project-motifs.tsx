import { component$ } from '@builder.io/qwik';

const S = { stroke: '#526ed3', 'stroke-opacity': 0.35, fill: 'none', 'stroke-width': 1.5 };

/** Component-library grid — Fundamental-ngx */
export const MotifGrid = component$(() => (
  <svg viewBox="0 0 200 140" aria-hidden="true">
    {[0, 1, 2].map((r) =>
      [0, 1, 2, 3].map((c) => (
        <rect
          key={`${r}${c}`}
          x={8 + c * 48}
          y={8 + r * 44}
          width={40}
          height={36}
          rx={6}
          {...S}
          fill={r === 1 && c === 1 ? 'rgba(82,110,211,0.18)' : 'none'}
        />
      ))
    )}
  </svg>
));

/** Ascending peaks — PeakVentures */
export const MotifPeaks = component$(() => (
  <svg viewBox="0 0 200 140" aria-hidden="true">
    <polyline points="8,120 48,84 84,102 128,52 164,70 192,24" {...S} stroke-width={2} />
    {[
      [48, 84],
      [128, 52],
      [192, 24],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={4} fill="rgba(104,135,228,0.5)" stroke="none" />
    ))}
  </svg>
));

/** Package strata — Apptimized */
export const MotifStack = component$(() => (
  <svg viewBox="0 0 200 140" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={30 + i * 8} y={104 - i * 26} width={120} height={20} rx={4} {...S} />
    ))}
    <rect x={62} y={26} width={120} height={20} rx={4} {...S} fill="rgba(82,110,211,0.18)" />
  </svg>
));

/** Node network — Freelance */
export const MotifNet = component$(() => {
  const nodes: Array<[number, number]> = [
    [30, 110],
    [70, 40],
    [110, 90],
    [150, 30],
    [180, 100],
  ];
  const edges: Array<[number, number]> = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [2, 4],
    [0, 2],
  ];
  return (
    <svg viewBox="0 0 200 140" aria-hidden="true">
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          {...S}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill="rgba(104,135,228,0.5)" stroke="none" />
      ))}
    </svg>
  );
});
