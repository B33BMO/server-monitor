// components/TopAffected.tsx

const panelClasses = [
  "rounded-2xl border border-[var(--panel-border)]",
  "bg-[var(--panel-bg)] backdrop-blur-md",
  "shadow-[var(--panel-shadow-main),var(--panel-shadow-inner)]",
  "p-4 flex flex-col font-mono text-[0.75rem] leading-relaxed",
].join(" ");

export default function TopAffected({
  data,
}: {
  data: { customer: string; affected: string[] }[];
}) {
  return (
    <div className={panelClasses}>
      <h2 className="text-[0.7rem] font-semibold tracking-wide text-[var(--text-dim)] mb-2 cyber-header">
        TOP AFFECTED
      </h2>

      {data.length === 0 ? (
        <div className="text-[0.75rem] text-[var(--text-dim)]">
          No customers impacted
        </div>
      ) : (
        <div className="space-y-1">
          {data.map((row, i) => (
            <div
              key={i}
              className={[
                "flex items-start justify-between",
                "rounded-lg border border-[var(--panel-border)] bg-black/20",
                "px-2 py-1",
                "text-[0.75rem]",
              ].join(" ")}
            >
              <div className="text-[var(--text-main)]">{row.customer}</div>

              <div className="text-right leading-snug text-[0.7rem]">
                <div className="text-red-400 font-semibold tabular-nums">
                  {row.affected.length}
                </div>
                <div className="text-cyan-300/70">
                  {row.affected.map(() => "●").join(" ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
