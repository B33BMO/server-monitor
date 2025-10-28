import { NextResponse } from "next/server";
import fs from "node:fs";

const STATUS_JSON_PATH = "/Users/brandonbischoff/server-monitor/server_status.json";

export async function GET() {
  try {
    const raw = fs.readFileSync(STATUS_JSON_PATH, "utf8");
    const parsed = JSON.parse(raw);

    // we assume monitor.py gave us valid structure
    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error("[/api/status] Failed to read status file:", err.message);
    return NextResponse.json(
      {
        meta: {
          lastChecked: "N/A",
          nextCheck: "N/A",
          uptimePct: 0,
          avgPingMs: 0,
          alertActive: false,
        },
        summary: {
          upCount: 0,
          downCount: 0,
          trend: "flat",
        },
        downServices: [],
        byService: [],
        topAffected: [],
        healthHistory: [],
      },
      { status: 200 }
    );
  }
}
