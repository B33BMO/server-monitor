// app/api/status/route.ts
import { NextResponse } from "next/server";

// This matches what your Python is tracking.
export async function GET() {
  // EXAMPLE DATA.
  // Replace with real data pull.
  const data = {
    meta: {
      lastChecked: "11:24:05",
      nextCheck: "11:25:45",
      uptimePct: 97.4,
      avgPingMs: 42.7,
      alertActive: true,
    },
    summary: {
      upCount: 186,
      downCount: 3,
      trend: "down", // "up" | "down" | "flat"
    },
    downServices: [
      // sorted by (customer, service)
      { customer: "CAP", service: "dc1", downForSec: 125 },
      { customer: "TMC", service: "vpn", downForSec: 512 },
      { customer: "RES", service: "nas1", downForSec: 1900 },
    ],
    byService: [
      // service -> number down
      { service: "vpn", count: 1 },
      { service: "dc1", count: 1 },
      { service: "nas1", count: 1 },
    ],
    topAffected: [
      // customer -> list of services down
      { customer: "RES", affected: ["nas1"] },
      { customer: "TMC", affected: ["vpn"] },
      { customer: "CAP", affected: ["dc1"] },
    ],
    healthHistory: [
      // newest at END. we graph left->right.
      // each point: { ts, upCount, totalCount, avgPingMs }
      { ts: Date.now() - 60 * 1000 * 5, upCount: 180, totalCount: 189, avgPingMs: 55.2 },
      { ts: Date.now() - 60 * 1000 * 4, upCount: 183, totalCount: 189, avgPingMs: 50.1 },
      { ts: Date.now() - 60 * 1000 * 3, upCount: 186, totalCount: 189, avgPingMs: 44.3 },
      { ts: Date.now() - 60 * 1000 * 2, upCount: 186, totalCount: 189, avgPingMs: 42.7 },
      { ts: Date.now() - 60 * 1000 * 1, upCount: 186, totalCount: 189, avgPingMs: 42.7 },
    ],
  };

  return NextResponse.json(data);
}
