import React from "react";

export default function DownEventsPanel({
  rows,
  alertMode = false,
}: {
  rows: { customer: string; service: string; downForSec: number }[];
  alertMode?: boolean;
}) {
  const accent = alertMode ? "text-red-400" : "text-cyan-300";

  return (
    <div
      className={[
        "rounded-2xl border backdrop-blur-md transition-all duration-500",
        alertMode
          ? "border-red-500/40 bg-[rgba(30,0,0,0.4)]"
          : "border-white/10 bg-[rgba(0,20,30,0.3)]",
        "p-4 flex flex-col min-h-0 overflow-auto",
      ].join(" ")}
    >
      <div className={`${accent} font-semibold tracking-wide text-[0.7rem] mb-3`}>
        DOWN EVENTS
      </div>

      {rows.length === 0 && (
        <div className="text-[var(--text-dim)] text-[0.75rem]">
          No active incidents.
        </div>
      )}

      <div className="flex flex-col gap-1 text-[0.75rem] text-[var(--text-main)]">
        {rows.map((r, i) => (
          <div
            key={i}
            className={`flex justify-between items-center border-b border-white/5 py-1 ${
              alertMode ? "text-red-300" : ""
            }`}
          >
            <span className="font-medium">{r.customer}</span>
            <span className="text-[var(--text-dim)]">{r.service}</span>
            <span className="font-semibold">
              {(r.downForSec / 60).toFixed(1)} min
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
