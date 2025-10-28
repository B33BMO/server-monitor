"use client";

import { useEffect, useState } from "react";
import HeaderStats from "../components/HeaderStats";
import HealthAndOverviewPanel from "../components/HealthAndOverviewPanel";
import TopAffectedPanel from "../components/TopAffectedPanel";
import DownEventsPanel from "../components/DownEventsPanel";
import ByService from "../components/ByService";

type ApiData = {
  meta: {
    lastChecked: string;
    nextCheck: string;
    uptimePct: number;
    avgPingMs: number;
    alertActive: boolean;
  };
  summary: {
    upCount: number;
    downCount: number;
    trend: "up" | "down" | "flat";
  };
  downServices: { customer: string; service: string; downForSec: number }[];
  byService: { service: string; count: number }[];
  topAffected: { customer: string; affected: string[] }[];
  healthHistory: {
    ts: number;
    upCount: number;
    totalCount: number;
    avgPingMs: number;
  }[];
};

export default function Page() {
  const [data, setData] = useState<ApiData | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as ApiData;
        if (alive) setData(json);
      } catch (err) {
        console.error("status fetch failed:", err);
      }
    }

    load();
    const id = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!data) {
    return (
      <main className="h-[100dvh] w-[100dvw] flex items-center justify-center text-[0.75rem] font-mono text-[var(--text-dim)] bg-[radial-gradient(circle_at_20%_20%,rgba(0,200,255,0.08)_0%,rgba(0,0,0,0)_60%),linear-gradient(180deg,var(--bg-base-top)_0%,var(--bg-base-bottom)_100%)] relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-screen bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.03)_0px,rgba(0,0,0,0)_1px,rgba(0,0,0,0)_2px)]" />
        <div className="text-[var(--text-dim)] opacity-60 animate-pulse">
          loading status…
        </div>
      </main>
    );
  }

  const alertMode = data.summary.downCount > 0;

  return (
    <main
      className={[
        "h-[100dvh] w-[100dvw] overflow-hidden",
        "text-[0.75rem] leading-relaxed font-mono text-[var(--text-main)]",
        alertMode
          ? "bg-[radial-gradient(circle_at_20%_20%,rgba(255,50,50,0.15)_0%,rgba(0,0,0,0)_60%),linear-gradient(180deg,#1a0000_0%,#0a0000_100%)]"
          : "bg-[radial-gradient(circle_at_20%_20%,rgba(0,200,255,0.08)_0%,rgba(0,0,0,0)_60%),linear-gradient(180deg,#0b0e14_0%,#141821_100%)]",
        "relative transition-all duration-700",
      ].join(" ")}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-screen bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.03)_0px,rgba(0,0,0,0)_1px,rgba(0,0,0,0)_2px)]" />

      <div className="relative z-[1] flex flex-col gap-4 h-full px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 min-h-0">


        <div
          className={[
            "grid gap-4 flex-1 min-h-0",
            "xl:grid-cols-2 xl:grid-rows-2",
            "grid-cols-1 grid-rows-[auto_auto_auto_auto]",
          ].join(" ")}
        >
          <HealthAndOverviewPanel
            summary={data.summary}
            meta={{
              uptimePct: data.meta.uptimePct,
              avgPingMs: data.meta.avgPingMs,
            }}
            history={data.healthHistory}
            alertMode={alertMode}
          />
          <TopAffectedPanel data={data.topAffected} alertMode={alertMode} />
          <DownEventsPanel rows={data.downServices} alertMode={alertMode} />
          <ByService data={data.byService} alertMode={alertMode} />
        </div>
      </div>
    </main>
  );
}
