import { colors } from '../../theme/tokens.js';

/** Simple SVG bar chart (no chart library). The last bar is highlighted in gold like the prototype. */
export function BarChart({ data, max, ticks, label = 'Bar chart' }) {
  const W = 520, H = 220, pl = 30, pb = 26, pt = 14;
  const top = max ?? (Math.ceil(Math.max(...data.map((d) => d.value)) / 10) * 10 || 10);
  const tickValues = ticks ?? [0, 0.5, 1].map((f) => Math.round(top * f));
  const bw = Math.min(40, (W - pl) / data.length - 14);
  const gap = (W - pl - data.length * bw) / data.length;
  const yFor = (v) => H - pb - (v / top) * (H - pb - pt);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={label}>
      {tickValues.map((v) => (
        <g key={v}>
          <line x1={pl} x2={W} y1={yFor(v)} y2={yFor(v)} stroke={colors.line} />
          <text x={pl - 8} y={yFor(v) + 4} textAnchor="end" fontSize="11" fill={colors['ink-3']}>{v}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const h = (d.value / top) * (H - pb - pt);
        const x = pl + gap / 2 + i * (bw + gap);
        const y = H - pb - h;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={bw} height={h} rx="6" fill={i === data.length - 1 ? colors.gold : colors.wine} />
            <text x={x + bw / 2} y={y - 6} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={colors.ink}>{d.value}</text>
            <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize="12" fill={colors['ink-2']}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Donut chart with a legend; segment values are percentages. */
export function DonutChart({ segments, centerValue, centerLabel, label = 'Donut chart' }) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={label}>
        {segments.map((s) => {
          const circle = (
            <circle
              key={s.label}
              cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="20"
              strokeDasharray={`${(circumference * s.value) / 100 - 2} ${circumference}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
            />
          );
          offset += (circumference * s.value) / 100;
          return circle;
        })}
        <text x="70" y="68" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="600" fontSize="26" fill={colors.ink}>{centerValue}</text>
        <text x="70" y="86" textAnchor="middle" fontSize="11" fill={colors['ink-3']}>{centerLabel}</text>
      </svg>
      <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[13px]">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
            {s.label} <b className="tabular-nums">{s.value}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Horizontal share bar used in the report breakdown. */
export function ProgressRow({ label, value, share }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span>{label}</span>
        <span className="flex-1" />
        <b className="tabular-nums">{value}</b>
      </div>
      <div className="mt-1.5 h-2 rounded-md bg-line" role="presentation">
        <i className="block h-full rounded-md bg-wine" style={{ width: `${share * 100}%` }} />
      </div>
    </div>
  );
}
