import React from "react";

export default function TopAffectedPanel({
  data,
  alertMode = false,
}: {
  data: { customer: string; affected: string[] }[];
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
        TOP AFFECTED CUSTOMERS
      </div>

      <div className="space-y-2 text-[0.75rem] text-[var(--text-main)]">
        {data.length === 0 && (
          <div className="text-[var(--text-dim)]">All systems stable.</div>
        )}

        {data.map((row, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="font-medium">{row.customer}</span>
            <span className={`${accent} font-semibold`}>
              {row.affected.join(", ")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
