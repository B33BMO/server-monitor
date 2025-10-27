// components/TopAffected.tsx
export default function TopAffected({
  data,
}: {
  data: { customer: string; affected: string[] }[];
}) {
  if (!data.length) {
    return (
      <div className="text-[0.75rem] font-mono text-zinc-600">—</div>
    );
  }

  return (
    <div className="space-y-1 text-[0.75rem] font-mono leading-relaxed">
      {data.map((row, i) => (
        <div
          key={i}
          className="rounded-lg border border-white/5 bg-white/5 px-2 py-1 flex items-start justify-between"
        >
          <div className="text-white/90">{row.customer}</div>
          <div className="text-emerald-400 text-right text-[0.7rem] leading-snug">
            <div className="font-semibold">{row.affected.length}</div>
            <div className="text-emerald-500/70">
              {row.affected.map(() => "●").join(" ")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
