import React from "react";

export default function ByService({
  data,
  alertMode = false,
}: {
  data: { service: string; count: number }[];
  alertMode?: boolean;
}) {
  const accentColor = alertMode ? "#f87171" /* red-400 */ : "#67e8f9" /* cyan-300 */;

  const panelClasses = [
    "rounded-2xl border backdrop-blur-md transition-all duration-500",
    alertMode
      ? "border-red-500/40 bg-[rgba(30,0,0,0.4)]"
      : "border-[var(--panel-border)] bg-[var(--panel-bg)] shadow-[var(--panel-shadow-main),var(--panel-shadow-inner)]",
    "p-4 flex flex-col font-mono text-[0.75rem] leading-relaxed min-h-0 overflow-auto",
  ].join(" ");

  if (!data.length) {
    return (
      <div className={panelClasses}>
        <h2
          className={[
            "text-[0.7rem] font-semibold tracking-wide mb-2",
            "cyber-header",
          ].join(" ")}
          style={{ color: accentColor }}
        >
          BY SERVICE
        </h2>
        <div className="text-[0.75rem] text-[var(--text-dim)]">No outages</div>
      </div>
    );
  }

  return (
    <div className={panelClasses}>
      <h2
        className={[
          "text-[0.7rem] font-semibold tracking-wide mb-2",
          "cyber-header",
        ].join(" ")}
        style={{ color: accentColor }}
      >
        BY SERVICE
      </h2>

      <div className="space-y-1">
        {data
          .filter((d) => d.count > 0)
          .map((d, i) => (
            <div
              key={i}
              className={[
                "flex items-center justify-between",
                "rounded-lg border bg-black/20 px-2 py-1 text-[0.75rem]",
                alertMode
                  ? "border-red-500/30"
                  : "border-[var(--panel-border)]",
              ].join(" ")}
            >
              <span className="text-[var(--text-main)]">{d.service}</span>
              <span className="text-red-400 font-semibold tabular-nums">
                {d.count}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
