// components/OverviewCards.tsx

import ByService from "./ByService";
import TopAffected from "./TopAffected";
import DownTable from "./DownTable";

const panelClasses = [
  "rounded-2xl border border-[var(--panel-border)]",
  "bg-[var(--panel-bg)] backdrop-blur-md",
  "shadow-[var(--panel-shadow-main),var(--panel-shadow-inner)]",
  "p-4 flex flex-col font-mono text-[0.75rem] leading-relaxed",
].join(" ");

type OverviewCardsProps = {
  summary: {
    upCount: number;
    downCount: number;
    trend: "up" | "down" | "flat";
  };
  downServices: { customer: string; service: string; downForSec: number }[];
  byService: { service: string; count: number }[];
  topAffected: { customer: string; affected: string[] }[];
};

export default function OverviewCards({
  summary,
  downServices,
  byService,
  topAffected,
}: OverviewCardsProps) {
  const trendArrow =
    summary.trend === "up" ? "↗" : summary.trend === "down" ? "↘" : "→";

  const statusTitle =
    summary.downCount === 0
      ? "ALL SERVICES ONLINE"
      : "ALERT: SERVICES DOWN";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
      {/* OVERVIEW */}
      <div className={panelClasses}>
        <h2 className="text-[0.7rem] font-semibold tracking-wide text-[var(--text-dim)] mb-2 cyber-header">
          OVERVIEW
        </h2>

        <div className="text-[0.8rem] leading-relaxed">
          <div className="text-[var(--text-main)] font-semibold text-[0.75rem]">
            {statusTitle}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.75rem]">
            <span className="text-cyan-300">
              UP: {summary.upCount}
            </span>
            <span className="text-red-400">
              DOWN: {summary.downCount}
            </span>
            <span className="text-[var(--text-dim)]">
              Trend:{" "}
              <span
                className={
                  summary.trend === "up"
                    ? "text-cyan-300"
                    : summary.trend === "down"
                    ? "text-red-400"
                    : "text-yellow-300"
                }
              >
                {trendArrow}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* BY SERVICE */}
      <ByService data={byService} />

      {/* TOP AFFECTED */}
      <TopAffected data={topAffected} />

      {/* DOWN EVENTS - full width on wrap */}
      <div className="2xl:col-span-3 lg:col-span-2 col-span-1">
        <DownTable rows={downServices} />
      </div>
    </div>
  );
}
