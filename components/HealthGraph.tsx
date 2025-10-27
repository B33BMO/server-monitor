// components/HealthGraph.tsx
type Point = {
  ts: number;
  upCount: number;
  totalCount: number;
  avgPingMs: number;
};

function uptimePct(p: Point) {
  if (!p.totalCount) return 0;
  return (p.upCount / p.totalCount) * 100;
}

export default function HealthGraph({ history }: { history: Point[] }) {
  // Normalize heights 0-100 → 0-100%
  // We'll render each point as a vertical bar.
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-[0_20px_80px_-10px_rgba(0,255,174,0.18)] flex flex-col">
      <h2 className="text-xs font-semibold text-white/70 mb-3 tracking-wide">
        SYSTEM HEALTH OVER TIME (Combined View)
      </h2>

      {history.length === 0 ? (
        <div className="text-[0.8rem] font-mono text-zinc-600">
          No data yet...
        </div>
      ) : (
        <>
          {/* Stats row */}
          {(() => {
            const cur = history[history.length - 1];
            const curPct = uptimePct(cur);
            const histPctAvg =
              history.reduce((acc, p) => acc + uptimePct(p), 0) /
              history.length;
            const avgPingHist =
              history.reduce((acc, p) => acc + p.avgPingMs, 0) /
              history.length;

            return (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-[0.75rem] font-mono leading-relaxed">
                <div className="space-y-1">
                  <div className="text-white flex flex-wrap gap-x-2 gap-y-1">
                    <span className="text-emerald-400">
                      Services UP: {cur.upCount}/{cur.totalCount}
                    </span>
                    <span
                      className={
                        curPct >= 95
                          ? "text-emerald-400"
                          : curPct < 80
                          ? "text-red-400"
                          : "text-yellow-400"
                      }
                    >
                      Uptime: {curPct.toFixed(1)}%
                    </span>
                    <span className="text-cyan-400">
                      Avg Ping: {cur.avgPingMs.toFixed(1)}ms
                    </span>
                  </div>
                  <div className="text-zinc-500 flex flex-wrap gap-x-2 gap-y-1">
                    <span>
                      Historical Uptime: {histPctAvg.toFixed(1)}%
                    </span>
                    <span>
                      Avg Ping: {avgPingHist.toFixed(1)}ms
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Graph bars */}
          <div className="flex h-32 w-full items-end gap-[2px]">
            {history.map((p, idx) => {
              const pct = uptimePct(p); // 0-100
              const h = Math.max(2, Math.round((pct / 100) * 100)); // %
              const color =
                pct >= 95
                  ? "bg-emerald-400"
                  : pct < 80
                  ? "bg-red-500"
                  : "bg-yellow-400";

              return (
                <div
                  key={idx}
                  className={`flex-1 ${color} rounded-t-[2px]`}
                  style={{
                    height: `${h}%`,
                    minWidth: "2px",
                  }}
                  title={`Uptime ${pct.toFixed(
                    1
                  )}% | Avg ${p.avgPingMs.toFixed(1)}ms`}
                />
              );
            })}
          </div>

          {/* X-axis labels (Now / mins ago) */}
          <div className="mt-2 flex justify-between text-[0.6rem] font-mono text-zinc-600">
            <div>Past</div>
            <div>Now</div>
          </div>

          {/* Legend */}
          <div className="mt-4 text-[0.7rem] font-mono text-zinc-500 flex flex-wrap gap-4">
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-sm bg-emerald-400" />
              <span>&gt;95% Good</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-sm bg-yellow-400" />
              <span>80-95% Warning</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-sm bg-red-500" />
              <span>&lt;80% Critical</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
