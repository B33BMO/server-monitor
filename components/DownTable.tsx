// components/DownTable.tsx
type Row = {
  customer: string;
  service: string;
  downForSec: number; // seconds
};

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function DownTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto text-[0.75rem] font-mono leading-relaxed">
      <table className="min-w-full text-left border-separate border-spacing-y-1">
        <thead className="text-white/80 text-[0.7rem]">
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
                className="px-2 py-2 text-emerald-400"
                colSpan={3}
              >
                None
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={i}
                className="bg-white/5 rounded-lg border border-white/5 text-[0.75rem]"
              >
                <td className="px-2 py-1 text-white/90">{row.customer}</td>
                <td className="px-2 py-1 text-red-400">{row.service}</td>
                <td className="px-2 py-1 text-right text-zinc-500">
                  {formatDuration(row.downForSec)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
