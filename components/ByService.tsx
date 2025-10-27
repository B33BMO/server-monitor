// components/ByService.tsx
export default function ByService({
  data,
}: {
  data: { service: string; count: number }[];
}) {
  if (!data.length) {
    return (
      <div className="text-[0.75rem] font-mono text-zinc-600">
        <div className="flex justify-between">
          <span className="text-zinc-500">—</span>
          <span className="text-zinc-700">0</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 text-[0.75rem] font-mono leading-relaxed">
      {data
        .filter((d) => d.count > 0)
        .map((d, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-2 py-1"
          >
            <span className="text-white/90">{d.service}</span>
            <span className="text-red-400 font-semibold">{d.count}</span>
          </div>
        ))}
    </div>
  );
}
