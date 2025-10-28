type HeaderStatsProps = {
  lastChecked: string;
  nextCheck: string;
  downCount: number;
  uptimePct: number;
  avgPingMs: number;
  alertActive: boolean;
};

export default function HeaderStats({
  lastChecked,
  nextCheck,
  downCount,
  uptimePct,
  avgPingMs,
  alertActive,
}: HeaderStatsProps) {
  const uptimeColor =
    uptimePct > 95
      ? "text-cyan-300"
      : uptimePct < 80
      ? "text-red-400"
      : "text-yellow-300";

  return (
    <div
      className={[
        "rounded-2xl border border-[var(--panel-border)]",
        "bg-[var(--panel-bg)] backdrop-blur-md",
        "shadow-[var(--panel-shadow-main),var(--panel-shadow-inner)]",
        "px-4 py-4 flex flex-col gap-2",
        "sm:flex-row sm:items-center sm:justify-between",
        "text-[0.75rem] leading-relaxed font-mono",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8rem]">
        <span className="cyber-header font-semibold">
          CYBURITY {alertActive ? "• ALERT •" : "— SERVER MONITOR"}
        </span>

        <span className="text-[var(--text-dim)]">
          Last {lastChecked}
        </span>
        <span className="text-[var(--text-dim)]">
          Next {nextCheck}
        </span>

        <span className="text-[var(--text-dim)]">
          Down{" "}
          <span
            className={
              downCount === 0
                ? "text-cyan-300"
                : "text-red-400 font-semibold"
            }
          >
            {downCount}
          </span>
        </span>

        <span className="text-[var(--text-dim)]">
          Uptime: <span className={uptimeColor}>{uptimePct.toFixed(1)}%</span>
        </span>

        <span className="text-[var(--text-dim)]">
          Avg Ping:{" "}
          <span className="text-cyan-300">
            {avgPingMs.toFixed(1)}ms
          </span>
        </span>
      </div>

      <div className="text-[0.7rem] text-[var(--text-dim)] sm:text-right">
        
      </div>
    </div>
  );
}
