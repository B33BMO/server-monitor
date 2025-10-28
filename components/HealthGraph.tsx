import React from "react";

type Point = {
  ts: number;
  upCount: number;
  totalCount: number;
  avgPingMs: number;
};

function pctFromPoint(p: Point) {
  return p.totalCount ? (p.upCount / p.totalCount) * 100 : 0;
}

// map uptime % -> Y coord but keep some breathing room
function pctToY(
  pct: number,
  height: number,
  topPad = 20, // space at the top so 100% isn't glued to the border
  bottomPad = 12 // space at the bottom so lowest point isn't smashed
) {
  const usable = height - topPad - bottomPad;
  // clamp pct just in case we get garbage >100 or <0
  const clamped = Math.max(0, Math.min(100, pct));
  const y = height - bottomPad - (clamped / 100) * usable;
  return y;
}

// build a smooth-ish curve using quadratic segments
function buildSmoothPath(
  pcts: number[],
  width: number,
  height: number,
  topPad = 20,
  bottomPad = 12
) {
  if (pcts.length === 0) {
    return { lineD: "", fillD: "" };
  }

  const stepX =
    pcts.length > 1 ? width / (pcts.length - 1) : width / 2; // fallback: center single point

  const coords: [number, number][] = pcts.map((pct, i) => {
    const x = pcts.length > 1 ? i * stepX : width / 2;
    const y = pctToY(pct, height, topPad, bottomPad);
    return [x, y];
  });

  // if we somehow ended up with nothing, bail
  if (!coords.length) {
    return { lineD: "", fillD: "" };
  }

  // Move to first point
  let d = `M ${coords[0][0]},${coords[0][1]}`;

  // Quadratic curve between each pair of points
  for (let i = 0; i < coords.length - 1; i++) {
    const [x1, y1] = coords[i];
    const [x2, y2] = coords[i + 1];
    // control point halfway in X, keeps it smooth
    const ctrlX = (x1 + x2) / 2;
    d += ` Q ${ctrlX},${y1} ${x2},${y2}`;
  }

  // close fill down to bottom of chart
  const lastX = coords[coords.length - 1][0];
  const fillD = `${d} L ${lastX},${height} L 0,${height} Z`;

  return { lineD: d, fillD };
}

export default function HealthGraph({
  history,
  alertMode = false,
}: {
  history: Point[];
  alertMode?: boolean;
}) {
  // logical chart size in SVG units
  const viewW = 600;
  const viewH = 160;

  if (!history || history.length === 0) {
    return (
      <div className="text-[0.7rem] text-[var(--text-dim)] font-mono">
        No data yet...
      </div>
    );
  }

  // convert full history to uptime%
  const pcts = history.map(pctFromPoint);

  // build curved line + area
  const { lineD, fillD } = buildSmoothPath(pcts, viewW, viewH, 20, 12);

  // glow color flips to red if we're in alert mode
  const glowRGB = alertMode ? "255,50,50" : "0,200,255";

  return (
    <svg
      className="block w-full h-full"
      // responsive scaling using viewBox
      viewBox={`0 0 ${viewW} ${viewH}`}
      preserveAspectRatio="none"
    >
      {/* horizontal grid lines */}
      <g stroke="rgba(255,255,255,0.07)" strokeWidth="1">
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

      {/* area under curve */}
      {fillD && (
        <path
          d={fillD}
          fill={`rgba(${glowRGB},0.08)`} // lighter so it doesn't blast the panel
        />
      )}

      {/* main line */}
      {lineD && (
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
      )}

      {/* plotted dots */}
      {history.map((pt, i) => {
        const pct = pctFromPoint(pt);

        // x position
        const x =
          history.length > 1
            ? (i / (history.length - 1)) * viewW
            : viewW / 2;

        // y using padded scale
        const y = pctToY(pct, viewH, 20, 12);

        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill={`rgba(${glowRGB},1)`}
            style={{
              filter: `drop-shadow(0 0 6px rgba(${glowRGB},0.9))
                       drop-shadow(0 0 14px rgba(${glowRGB},0.5))`,
            }}
          />
        );
      })}
    </svg>
  );
}
