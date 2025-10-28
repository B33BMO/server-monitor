const panelClasses = [
  "rounded-2xl border border-[var(--panel-border)]",
  "bg-[var(--panel-bg)] backdrop-blur-md",
  "shadow-[var(--panel-shadow-main),var(--panel-shadow-inner)]",
  "p-4 flex flex-col font-mono text-[0.75rem] leading-relaxed",
  "text-[var(--text-main)]",
].join(" ");

export default function OverviewPanel({
  upCount,
  downCount,
  trend,
}: {
  upCount: number;
  downCount: number;
  trend: "up" | "down" | "flat";
}) {
  const arrow = trend === "up" ? "↗" : trend === "down" ? "↘" : "→";
  const arrowColor =
    trend === "up"
      ? "text-cyan-300"
      : trend === "down"
      ? "text-red-400"
      : "text-yellow-300";

  return (
    <div className={panelClasses}>
      <h2 className="text-[0.7rem] font-semibold tracking-wide text-cyan-300 mb-3">
        OVERVIEW
      </h2>

      <div className="text-[0.75rem] leading-relaxed">
        <div className="text-white font-semibold text-[0.75rem]">
          {downCount === 0 ? "ALL SERVICES ONLINE" : "ALERT: SERVICES DOWN"}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.75rem]">
          <span className="text-cyan-300">
            UP: {upCount}
          </span>
          <span className="text-red-400">
            DOWN: {downCount}
          </span>
          <span className="text-[var(--text-dim)]">
            Trend:{" "}
            <span className={arrowColor}>
              {arrow}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
