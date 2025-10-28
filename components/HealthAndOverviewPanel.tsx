import React from "react";
import HealthGraph from "./HealthGraph";

export default function HealthAndOverviewPanel({
  summary,
  meta,
  history,
  alertMode = false,
}: {
  summary: {
    upCount: number;
    downCount: number;
    trend: "up" | "down" | "flat";
  };
  meta: {
    uptimePct: number;
    avgPingMs: number;
  };
  history: {
    ts: number;
    upCount: number;
    totalCount: number;
    avgPingMs: number;
  }[];
  alertMode?: boolean;
}) {
  const arrow =
    summary.trend === "up" ? "↗" : summary.trend === "down" ? "↘" : "→";

  const accent = alertMode ? "text-red-400" : "text-cyan-300";

  const latest = history.length
    ? history[history.length - 1]
    : { upCount: 0, totalCount: 0, avgPingMs: 0 };

  const servicesUp = `${latest.upCount}/${latest.totalCount}`;
  const uptimePct = meta.uptimePct?.toFixed(1) ?? "0.0";
  const avgPing = (latest.avgPingMs ?? meta.avgPingMs ?? 0).toFixed(1);

  return (
    <div
      className={[
        // make this panel itself a flex column that can stretch
        "flex flex-col h-full min-h-0 overflow-hidden",
        "text-[0.75rem] leading-relaxed font-mono text-[var(--text-main)]",
      ].join(" ")}
    >
      {/* Header / title row */}
      <div
        className={[
          "shrink-0 mb-3",
          `${accent} font-semibold tracking-wide text-[0.7rem]`,
        ].join(" ")}
      >
        SYSTEM HEALTH OVER TIME{" "}
        <span className="text-[var(--text-dim)]"></span>
      </div>

      {/* Status summary (also shrink, never grows) */}
      <div className="shrink-0 space-y-1 mb-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="text-white">
            Services UP:{" "}
            <span className={`${accent} font-semibold`}>{servicesUp}</span>
          </span>
          <span className="text-[var(--text-dim)]">
            Uptime:{" "}
            <span className={`${accent} font-semibold`}>{uptimePct}%</span>
          </span>
          <span className="text-[var(--text-dim)]">
            Avg Ping:{" "}
            <span className={`${accent} font-semibold`}>{avgPing}ms</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.75rem]">
          <span className="text-white font-semibold">
            {summary.downCount === 0
              ? "ALL SERVICES ONLINE"
              : "ALERT: SERVICES DOWN"}
          </span>

          <span className={accent}>UP: {summary.upCount}</span>
          <span className="text-red-400">DOWN: {summary.downCount}</span>

          <span className="text-[var(--text-dim)]">
            Trend: <span className={accent}>{arrow}</span>
          </span>
        </div>
      </div>

      {/* GRAPH AREA */}
      <div
        className={[
          // this block should now take the *rest* of the vertical space
          "flex-1 min-h-0",
          // visual frame around the graph
          "rounded-xl border p-2 flex flex-col overflow-hidden transition-all duration-500",
          alertMode
            ? "border-red-500/40 bg-[rgba(30,0,0,0.4)] shadow-[0_0_30px_rgba(255,0,0,0.15)]"
            : "border-cyan-400/20 bg-[rgba(0,20,30,0.4)] shadow-[0_0_30px_rgba(0,200,255,0.15)]",
        ].join(" ")}
      >
        {/* inner border/scanline box that will hold the SVG and stretch */}
        <div
          className={[
            "flex-1 min-h-0 w-full h-full",
            "rounded-xl border overflow-hidden",
            alertMode
              ? "border-red-500/40 bg-[rgba(0,0,0,0.3)]"
              : "border-[var(--panel-border)] bg-[rgba(0,0,0,0.3)]",
          ].join(" ")}
        >
          {/* HealthGraph itself now fills both width & height */}
          <HealthGraph
            history={history}
            alertMode={summary.downCount > 0}
          />
        </div>
      </div>
    </div>
  );
}
