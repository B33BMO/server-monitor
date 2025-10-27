// components/OverviewCards.tsx
import ByService from "./ByService";
import TopAffected from "./TopAffected";
import DownTable from "./DownTable";

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
    summary.downCount === 0 ? "ALL SERVICES ONLINE" : "ALERT: SERVICES DOWN";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
      {/* Overview card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-[0_20px_80px_-10px_rgba(0,255,174,0.18)] flex flex-col">
        <h2 className="text-xs font-semibold text-white/70 mb-2 tracking-wide">
          OVERVIEW
        </h2>
        <div className="text-[0.8rem] font-mono leading-relaxed">
          <div className="text-white font-semibold text-[0.75rem]">
            {statusTitle}
          </div>
          <div className="text-emerald-400 mt-2">
            UP: {summary.upCount}{" "}
            <span className="text-zinc-600 mx-1">|</span>
            <span className="text-red-400">
              DOWN: {summary.downCount}
            </span>{" "}
            <span className="text-zinc-600 mx-1">|</span>
            <span className="text-cyan-400">Trend: {trendArrow}</span>
          </div>
        </div>
      </div>

      {/* By Service card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-[0_20px_80px_-10px_rgba(0,255,174,0.18)] flex flex-col">
        <h2 className="text-xs font-semibold text-white/70 mb-2 tracking-wide">
          BY SERVICE
        </h2>
        <ByService data={byService} />
      </div>

      {/* Top Affected card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-[0_20px_80px_-10px_rgba(0,255,174,0.18)] flex flex-col">
        <h2 className="text-xs font-semibold text-white/70 mb-2 tracking-wide">
          TOP AFFECTED
        </h2>
        <TopAffected data={topAffected} />
      </div>

      {/* Down Events card (full width under on large screens) */}
      <div className="2xl:col-span-3 lg:col-span-2 col-span-1 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-[0_20px_80px_-10px_rgba(0,255,174,0.18)] flex flex-col">
        <h2 className="text-xs font-semibold text-white/70 mb-2 tracking-wide">
          DOWN EVENTS
        </h2>
        <DownTable rows={downServices} />
      </div>
    </div>
  );
}
