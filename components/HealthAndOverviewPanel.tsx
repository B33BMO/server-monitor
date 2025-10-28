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
  const accentColor = alertMode ? "#ff3131" : "#00ffff";

  const latest = history.length
    ? history[history.length - 1]
    : { upCount: 0, totalCount: 0, avgPingMs: 0 };

  const servicesUp = `${latest.upCount}/${latest.totalCount}`;
  const uptimePct = meta.uptimePct?.toFixed(1) ?? "0.0";
  const avgPing = (latest.avgPingMs ?? meta.avgPingMs ?? 0).toFixed(1);

  return (
    <div className="flex flex-col min-h-0 overflow-hidden text-[0.75rem] leading-relaxed font-mono text-[var(--text-main)]">
      {/* Title */}
      <div className={`${accent} font-semibold tracking-wide text-[0.7rem] mb-3`}>
        SYSTEM HEALTH OVER TIME{" "}
        <span className="text-[var(--text-dim)]"></span>
      </div>

      {/* Status Summary */}
      <div className="space-y-1 mb-4">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="text-white">
            Services UP: <span className={`${accent} font-semibold`}>{servicesUp}</span>
          </span>
          <span className="text-[var(--text-dim)]">
            Uptime: <span className={`${accent} font-semibold`}>{uptimePct}%</span>
          </span>
          <span className="text-[var(--text-dim)]">
            Avg Ping: <span className={`${accent} font-semibold`}>{avgPing}ms</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[0.75rem]">
          <span className="text-white font-semibold">
            {summary.downCount === 0
              ? "ALL SERVICES ONLINE"
              : "ALERT: SERVICES DOWN"}
          </span>

          <span className={`${accent}`}>UP: {summary.upCount}</span>
          <span className="text-red-400">DOWN: {summary.downCount}</span>

          <span className="text-[var(--text-dim)]">
            Trend: <span className={accent}>{arrow}</span>
          </span>
        </div>
      </div>

      {/* Graph */}
      <div
        className={[
          "rounded-xl border",
          alertMode ? "border-red-500/40 bg-[rgba(30,0,0,0.4)]" : "border-cyan-400/20 bg-[rgba(0,20,30,0.4)]",
          "p-2 flex flex-col min-h-[150px] max-h-[220px] flex-1",
          "text-[0.7rem] overflow-hidden",
          "transition-all duration-500",
        ].join(" ")}
      >
       <div className="overflow-hidden rounded-xl border border-[var(--panel-border)] bg-[rgba(0,0,0,0.3)] shadow-inner">
  <HealthGraph
    history={history}
    alertMode={summary.downCount > 0}
  />
</div>

      </div>
    </div>
  );
}
