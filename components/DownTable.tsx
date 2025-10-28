// components/DownTable.tsx

const panelClasses = [
  "rounded-2xl border border-[var(--panel-border)]",
  "bg-[var(--panel-bg)] backdrop-blur-md",
  "shadow-[var(--panel-shadow-main),var(--panel-shadow-inner)]",
  "p-4 flex flex-col font-mono text-[0.75rem] leading-relaxed",
].join(" ");

type Row = {
  customer: string;
  service: string;
  downForSec: number; // seconds
};

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function DownTable({ rows }: { rows: Row[] }) {
  return (
    <div className={panelClasses}>
      <h2 className="text-[0.7rem] font-semibold tracking-wide text-[var(--text-dim)] mb-2 cyber-header">
        DOWN EVENTS
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-separate border-spacing-y-1">
          <thead className="text-[0.7rem] text-[var(--text-main)]">
            <tr>
              <th className="px-2 py-1 font-semibold">Customer</th>
              <th className="px-2 py-1 font-semibold">Service</th>
              <th className="px-2 py-1 font-semibold text-right">
                Down Since (mm:ss)
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-2 py-2 text-cyan-300"
                  colSpan={3}
                >
                  None
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={i}
                  className={[
                    "bg-black/20 rounded-lg",
                    "border border-[var(--panel-border)]",
                    "text-[0.75rem]",
                  ].join(" ")}
                >
                  <td className="px-2 py-1 text-[var(--text-main)] align-top">
                    {row.customer}
                  </td>
                  <td className="px-2 py-1 text-red-400 align-top">
                    {row.service}
                  </td>
                  <td className="px-2 py-1 text-right text-[var(--text-dim)] tabular-nums align-top">
                    {formatDuration(row.downForSec)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
