"use client";

import { useEffect, useState } from "react";
import HeaderStats from "../components/HeaderStats";
import OverviewCards from "../components/OverviewCards";
import HealthGraph from "../components/HealthGraph";

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

  // polling fetch
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

    const id = setInterval(load, 5000); // 5s refresh
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // Skeleton while loading
  if (!data) {
    return (
      <main className="animate-pulse text-sm text-zinc-600 font-mono">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-md mb-4 h-20" />
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 h-32" />
          <div className="rounded-2xl border border-white/10 bg-white/5 h-32" />
          <div className="rounded-2xl border border-white/10 bg-white/5 h-32" />
          <div className="2xl:col-span-3 lg:col-span-2 col-span-1 rounded-2xl border border-white/10 bg-white/5 h-48" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 h-64 mt-4" />
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <HeaderStats
        lastChecked={data.meta.lastChecked}
        nextCheck={data.meta.nextCheck}
        downCount={data.summary.downCount}
        uptimePct={data.meta.uptimePct}
        avgPingMs={data.meta.avgPingMs}
        alertActive={data.meta.alertActive}
      />

      <OverviewCards
        summary={data.summary}
        downServices={data.downServices}
        byService={data.byService}
        topAffected={data.topAffected}
      />

      <HealthGraph history={data.healthHistory} />
    </main>
  );
}
