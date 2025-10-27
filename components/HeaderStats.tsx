// components/HeaderStats.tsx
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
    uptimePct > 95 ? "text-emerald-400" : uptimePct < 80 ? "text-red-400" : "text-yellow-400";

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 shadow-[0_30px_120px_-10px_rgba(0,255,174,0.2),0_0_80px_rgba(0,255,174,0.08)_inset] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center flex-wrap gap-x-3 text-sm font-medium text-white">
        <span className="text-emerald-400 font-semibold">
          CYBURITY {alertActive ? "• ALERT •" : "— SERVER MONITOR"}
        </span>

        <span className="text-zinc-500">Last {lastChecked}</span>
        <span className="text-zinc-500">Next {nextCheck}</span>

        <span className="text-zinc-400">
          Down{" "}
          <span className={downCount === 0 ? "text-emerald-400" : "text-red-400 font-semibold"}>
            {downCount}
          </span>
        </span>

        <span className="text-zinc-400">
          Uptime:{" "}
          <span className={uptimeColor}>
            {uptimePct.toFixed(1)}%
          </span>
        </span>

        <span className="text-zinc-400">
          Avg Ping:{" "}
          <span className="text-cyan-400">{avgPingMs.toFixed(1)}ms</span>
        </span>
      </div>

      <div className="text-xs text-zinc-600 sm:text-right">
        q = quit (lol not on web) • Combined view shows overall system health
      </div>
    </div>
  );
}
