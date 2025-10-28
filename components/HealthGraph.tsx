import React from "react";

export type Point = {
  ts: number;
  upCount: number;
  totalCount: number;
  avgPingMs: number;
};

function toPct(p: Point) {
  return p.totalCount ? (p.upCount / p.totalCount) * 100 : 0;
}

// smooth-ish line builder
function buildSmoothPath(coords: [number, number][]) {
  if (coords.length === 0) return "";
  if (coords.length === 1) {
    const [x, y] = coords[0];
    return `M ${x},${y}`;
  }
  if (coords.length === 2) {
    const [x1, y1] = coords[0];
    const [x2, y2] = coords[1];
    return `M ${x1},${y1} L ${x2},${y2}`;
  }

  let d = `M ${coords[0][0]},${coords[0][1]}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    const midX = (x1 + x2) / 2;
    d += ` Q ${midX},${y1} ${x2},${y2}`;
  }
  return d;
}

// fill path only if >=3 pts
function buildFillPath(
  coords: [number, number][],
  width: number,
  height: number
) {
  if (coords.length < 3) return "";
  const first = coords[0];
  const last = coords[coords.length - 1];
  let d = buildSmoothPath(coords);
  d += ` L ${last[0]} ${height}`;
  d += ` L ${first[0]} ${height} Z`;
  return d;
}

export default function HealthGraph({
  history,
  alertMode = false,
}: {
  history: Point[];
  alertMode?: boolean;
}) {
  // logical canvas size for math
  const viewW = 900;
  const viewH = 260;

  if (!history || history.length === 0) {
    return (
      <div className="text-[0.7rem] text-[var(--text-dim)] font-mono">
        No data yet…
      </div>
    );
  }

  // sort chronologically so left→right is time
  const sorted = [...history].sort((a, b) => a.ts - b.ts);
  const pcts = sorted.map(toPct);

  // x spacing in the logical viewbox
  const stepX =
    pcts.length > 1 ? viewW / (pcts.length - 1) : viewW / 2;

  const coords: [number, number][] = pcts.map((pct, i) => {
    const x = i * stepX;
    // flip Y so 100% uptime is at the top
    const y = viewH - (pct / 100) * viewH;
    return [x, y];
  });

  const lineD = buildSmoothPath(coords);
  const fillD = buildFillPath(coords, viewW, viewH);

  // theming
  const glowRGB = alertMode ? "255,50,50" : "0,200,255";
  const borderColor = alertMode
    ? "rgba(255,0,0,0.4)"
    : "rgba(0,200,255,0.3)";
  const bgColor = alertMode
    ? "rgba(30,0,0,0.45)"
    : "rgba(0,20,30,0.45)";
  const panelShadow = alertMode
    ? "0 0 40px rgba(255,0,0,0.2) inset, 0 0 80px rgba(255,0,0,0.05)"
    : "0 0 40px rgba(0,200,255,0.2) inset, 0 0 80px rgba(0,200,255,0.05)";

  return (
    // outer frame inherits parent sizing, doesn't force a fixed height
    <div
      className={[
        "w-full h-full flex flex-col",
        "rounded-xl border overflow-hidden",
        alertMode
          ? "border-red-500/40 shadow-[0_0_30px_rgba(255,0,0,0.15)]"
          : "border-cyan-500/30 shadow-[0_0_30px_rgba(0,200,255,0.15)]",
      ].join(" ")}
    >
      {/* inner container flex-grow so svg can stretch */}
      <div
        className={[
          "flex-1 w-full h-full",
          "rounded-lg border overflow-hidden",
        ].join(" ")}
        style={{
          borderColor,
          background: bgColor,
          boxShadow: panelShadow,
        }}
      >
        <svg
          className="w-full h-full block"
          viewBox={`0 0 ${viewW} ${viewH}`}
          preserveAspectRatio="none"
        >
          {/* dotted grid */}
          <g stroke="rgba(255,255,255,0.07)" strokeWidth={1}>
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
              const y = t * viewH;
              return (
                <line
                  key={i}
                  x1={0}
                  x2={viewW}
                  y1={y}
                  y2={y}
                  strokeDasharray="2 4"
                />
              );
            })}
          </g>

          {/* fill area under line (if we have enough pts) */}
          {fillD && (
            <path
              d={fillD}
              fill={`rgba(${glowRGB},0.08)`}
            />
          )}

          {/* uptime line */}
          <path
            d={lineD}
            fill="none"
            stroke={`rgba(${glowRGB},0.9)`}
            strokeWidth={2}
            style={{
              filter: `drop-shadow(0 0 6px rgba(${glowRGB},0.8))
                       drop-shadow(0 0 18px rgba(${glowRGB},0.4))`,
            }}
          />

          {/* dots */}
          {coords.map(([x, y], idx) => (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r={4}
              fill={`rgba(${glowRGB},1)`}
              style={{
                filter: `drop-shadow(0 0 6px rgba(${glowRGB},0.9))
                         drop-shadow(0 0 14px rgba(${glowRGB},0.5))`,
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
