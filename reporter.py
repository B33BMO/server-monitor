#!/usr/bin/env python3
"""
Cyburity Server Monitor (Headless Service Exporter)
---------------------------------------------------

This script:
- Pings customer services (pm1, pm2, dc1, nas1, nas2, vpn, admin)
- Tracks up/down state with caching and backoff
- Maintains recent system health history
- Writes /tmp/server_status.json in the exact shape the Next.js dashboard expects

No TUI. This is the data producer for the dashboard.
"""

import os
import time
import json
import platform
import subprocess
import threading
from datetime import datetime
from collections import defaultdict, Counter, deque
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from threading import RLock
from json import JSONEncoder
# ===================== CONFIG ===================== #

CHECK_INTERVAL = int(os.getenv("SERVER_CHECK_INTERVAL", "100"))  # how often to do full checks (sec)
MAX_WORKERS = int(os.getenv("SERVER_MAX_WORKERS", "32"))          # max concurrent pings
CACHE_TIMEOUT = int(os.getenv("SERVER_CACHE_TTL", "300"))         # how long a known-good UP result is trusted
DOWN_BACKOFF_MAX = int(os.getenv("SERVER_BACKOFF_MAX", "300"))    # max backoff cap for dead hosts
STATUS_JSON_PATH = os.getenv("SERVER_STATUS_PATH", "/Users/brandonbischoff/server-monitor/server_status.json")

GRAPH_WIDTH = 60
HISTORY_SIZE = GRAPH_WIDTH  # we keep last N data points

CUSTOMERS = [
    "A3C","AMO","APX","CAP","CAH","CCI","CAS","COR","CFI","CYB",
    "ENV","GRT","JES","MDR","MSR","OUT","PRO","RIS","RES","TIB",
    "TPI","TMC","TMI","TSI","TUM","VET","WAP","WJL","MOO"
]

SERVICES = ["pm1", "pm2", "dc1", "nas1", "nas2", "vpn", "admin"]

REMOVED_SERVICES = {
    'A3C': {'pm2', 'nas1', 'nas2'},
    'AMO': {'pm2', 'pm1', 'nas1', 'nas2', 'vpn'},
    'APX': {'pm2', 'pm1', 'nas1', 'nas2'},
    'CAP': {'pm1', 'nas2'},
    'CAH': {'pm2', 'nas1', 'nas2'},
    'CCI': {'pm2', 'pm1', 'dc1', 'nas1', 'nas2', 'vpn', 'admin'},
    'CAS': {'pm2', 'nas1', 'nas2'},
    'COR': {'pm2', 'nas1', 'nas2'},
    'CFI': {'pm1', 'nas2'},
    'CYB': {'pm2', 'nas1', 'nas2'},
    'ENV': {'pm2', 'pm1', 'nas1', 'nas2'},
    'GRT': {'pm1','pm2', 'nas1', 'nas2'},
    'JES': {'pm2', 'nas2'},
    'MDR': {'pm2', 'nas1', 'nas2'},
    'MSR': {'pm2', 'nas1', 'nas2', 'admin'},
    'PRO': {'nas2'},
    'RIS': {'pm2', 'nas1', 'nas2'},
    'RES': {'pm2', 'nas2'},
    'TIB': {'pm2', 'nas2'},
    'TPI': {'pm2', 'pm1', 'dc1', 'nas1', 'nas2', 'vpn'},
    'TMC': {'pm2', 'nas2'},
    'TMI': {'nas2'},
    'TSI': {'pm1', 'nas2'},
    'TUM': {'pm2', 'nas1', 'nas2'},
    'VAL': {'pm2', 'pm1', 'nas1', 'nas2', 'vpn'},
    'VET': {'nas2'},
    'WAP': {'pm2', 'pm1', 'nas1', 'nas2'},
    'WIL': {'pm2', 'nas2'},
    'WJL': {'pm2', 'nas1', 'nas2'},
    'OUT': {'pm2', 'nas1'},
    'MOO': {'nas1', 'nas2', 'pm2'},
}

# ===================== GLOBAL STATE ===================== #

# SERVICE_CACHE[(customer, service)] = (status_bool, timestamp_last_check, ping_ms)
SERVICE_CACHE = {}

# DOWN_SINCE[(customer, service)] = first_time_we_saw_it_down (epoch seconds)
DOWN_SINCE = {}

# DOWN_BACKOFF[(customer, service)] = (next_allowed_time_to_probe, current_delay_sec)
DOWN_BACKOFF = {}

# SYSTEM_HISTORY: deque of tuples:
#   (timestamp, up_count, total_count, avg_ping_ms)
SYSTEM_HISTORY = deque(maxlen=HISTORY_SIZE)

# mutable runtime / status
_state_lock = RLock()
_last_checked = datetime.now()
_next_check_time = time.time()
_down_services_list = []
_prev_down_set = set()
ALERT_UNTIL = 0.0  # timestamp until which alert banner should blink


# ===================== UTILS ===================== #

def ping_with_time(host: str) -> tuple[bool, float]:
    """
    Returns (is_up, response_time_ms).
    If ping fails, is_up=False and ping ~999.9 ms.
    """
    try:
        start = time.time()
        system = platform.system().lower()
        if system == "windows":
            cmd = ["ping", "-n", "1", "-w", "1000", host]
        else:
            cmd = ["ping", "-c", "1", "-W", "1", host]
        result = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=3
        )
        response_time = (time.time() - start) * 1000.0
        return (result.returncode == 0, round(response_time, 1))
    except Exception:
        return (False, 999.9)


def get_all_targets():
    """
    Yield (customer, service, fqdn) for every service we actually monitor.
    Skips REMOVED_SERVICES[customer].
    """
    for customer in CUSTOMERS:
        skip = REMOVED_SERVICES.get(customer, set())
        for service in SERVICES:
            if service in skip:
                continue
            host = f"{service}.{customer}.customer"
            yield (customer, service, host)


def check_all_services():
    """
    Core check:
    - respects cache for UP hosts
    - respects backoff for DOWN hosts
    - pings only what needs pinging
    - updates DOWN_SINCE and DOWN_BACKOFF
    - records SYSTEM_HISTORY point
    Returns list of currently-down (customer, service).
    """
    now = time.time()
    total_services = 0
    successful_pings = 0
    total_ping_time = 0.0

    to_probe = []

    # Evaluate which to skip or reuse cache
    for (customer, service, host) in get_all_targets():
        total_services += 1
        key = (customer, service)

        cached = SERVICE_CACHE.get(key)
        if cached:
            cached_status, cached_ts, cached_ping = cached

            # If it was UP recently, trust it briefly (cache)
            if cached_status and (now - cached_ts) < CACHE_TIMEOUT:
                successful_pings += 1
                total_ping_time += cached_ping if cached_ping is not None else 50.0
                continue

            # If it was DOWN and we're still in backoff, don't spam ping
            if not cached_status:
                next_time, delay = DOWN_BACKOFF.get(key, (0, CHECK_INTERVAL))
                if now < next_time:
                    # still down (assume)
                    total_ping_time += cached_ping if cached_ping is not None else 999.9
                    continue

        # Needs a fresh ping
        to_probe.append((customer, service, host))

    # Actually probe in parallel
    down_list = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futs = {ex.submit(ping_with_time, host): (c, s) for (c, s, host) in to_probe}
        for fut in as_completed(futs):
            c, s = futs[fut]
            key = (c, s)
            try:
                status, ping_ms = fut.result()
            except Exception:
                status, ping_ms = False, 999.9

            SERVICE_CACHE[key] = (status, time.time(), ping_ms)

            if status:
                successful_pings += 1
                total_ping_time += ping_ms
                # if it's back up, clear backoff
                if key in DOWN_BACKOFF:
                    DOWN_BACKOFF.pop(key, None)
            else:
                down_list.append((c, s))
                total_ping_time += ping_ms

                # exponential-ish backoff for dead targets
                if key in DOWN_BACKOFF:
                    _, cur_delay = DOWN_BACKOFF[key]
                    new_delay = min(cur_delay * 2, DOWN_BACKOFF_MAX)
                else:
                    new_delay = CHECK_INTERVAL
                DOWN_BACKOFF[key] = (time.time() + new_delay, new_delay)

    # For hosts we didn't ping because of cache/backoff, we still need to count them as down if cached down.
    for (c, s), (cached_status, cached_ts, cached_ping) in SERVICE_CACHE.items():
        if not cached_status:
            if (c, s) not in down_list:
                # still down, wasn't re-probed
                down_list.append((c, s))
            total_ping_time += cached_ping if cached_ping is not None else 999.9

    # dedupe down_list
    down_list = sorted(set(down_list), key=lambda x: (x[0], x[1]))

    # track DOWN_SINCE
    now2 = time.time()
    down_set = set(down_list)
    for key in down_set:
        if key not in DOWN_SINCE:
            DOWN_SINCE[key] = now2
    # clean up ones that came back up
    for key in list(DOWN_SINCE.keys()):
        if key not in down_set:
            DOWN_SINCE.pop(key, None)

    # compute avg ping (include failures)
    avg_ping = (total_ping_time / total_services) if total_services > 0 else 0.0

    # push point into SYSTEM_HISTORY
    SYSTEM_HISTORY.append((
        time.time(),
        total_services - len(down_list),  # up_count
        total_services,
        avg_ping
    ))

    return down_list


def calc_trend():
    """
    Look at last 2 history points and decide "up" | "down" | "flat"
    based on upCount.
    """
    with _state_lock:
        if len(SYSTEM_HISTORY) < 2:
            return "flat"
        _, up_prev, _, _ = SYSTEM_HISTORY[-2]
        _, up_now, _, _ = SYSTEM_HISTORY[-1]
    if up_now > up_prev:
        return "up"
    if up_now < up_prev:
        return "down"
    return "flat"


def build_status_payload():
    """
    Build the JSON object that Next.js consumes.
    Shape must match what the dashboard expects.
    """
    with _state_lock:
        # pull last health snapshot
        if SYSTEM_HISTORY:
            last_ts, up_count, total_count, avg_ping = SYSTEM_HISTORY[-1]
        else:
            last_ts, up_count, total_count, avg_ping = (time.time(), 0, 0, 0.0)

        uptime_pct = (up_count / total_count * 100.0) if total_count > 0 else 0.0

        # build downServices (list of dicts)
        down_rows = []
        now_ts = time.time()
        for (cust, svc) in _down_services_list:
            since_ts = DOWN_SINCE.get((cust, svc), now_ts)
            down_for = int(now_ts - since_ts)
            down_rows.append({
                "customer": cust,
                "service": svc,
                "downForSec": down_for,
            })

        # byService
        svc_counter = Counter(s for (_, s) in _down_services_list)
        by_service = [
            {"service": svc, "count": svc_counter.get(svc, 0)}
            for svc in SERVICES
            if svc_counter.get(svc, 0) > 0
        ]

        # topAffected
        aff = defaultdict(list)
        for (cust, svc) in _down_services_list:
            aff[cust].append(svc)
        top_affected = [
            {"customer": cust, "affected": svcs}
            for cust, svcs in sorted(
                aff.items(),
                key=lambda kv: (-len(kv[1]), kv[0])
            )
        ][:10]

        # healthHistory (array of historical points)
        health_hist = [
            {
                "ts": ts,
                "upCount": up,
                "totalCount": total,
                "avgPingMs": ping,
            }
            for (ts, up, total, ping) in list(SYSTEM_HISTORY)
        ]

        payload = {
            "meta": {
                "lastChecked": _last_checked.strftime("%H:%M:%S"),
                "nextCheck": datetime.fromtimestamp(_next_check_time).strftime("%H:%M:%S"),
                "uptimePct": uptime_pct,
                "avgPingMs": avg_ping,
                "alertActive": (time.time() < ALERT_UNTIL),
            },
            "summary": {
                "upCount": up_count,
                "downCount": len(_down_services_list),
                "trend": calc_trend(),  # "up"|"down"|"flat"
            },
            "downServices": down_rows,
            "byService": by_service,
            "topAffected": top_affected,
            "healthHistory": health_hist,
        }

    return payload

class SafeJSONEncoder(JSONEncoder):
    def default(self, obj):
        try:
            return super().default(obj)
        except Exception:
            return str(obj)


def write_status_json(payload: dict):
    tmp_path = STATUS_JSON_PATH + ".tmp"
    try:
        print(f"[monitor] dumping JSON to {tmp_path} ...")
        with open(tmp_path, "w") as f:
            json.dump(payload, f, cls=SafeJSONEncoder, indent=2)
        print("[monitor] finished dumping json, replacing...")
        os.replace(tmp_path, STATUS_JSON_PATH)
        print(f"[monitor] wrote {STATUS_JSON_PATH} ({len(json.dumps(payload, cls=SafeJSONEncoder))} bytes)")
    except Exception as e:
        print(f"[monitor] ERROR writing JSON: {e}")


def monitor_loop():
    global _last_checked, _next_check_time, _down_services_list, _prev_down_set, ALERT_UNTIL

    with _state_lock:
        _next_check_time = 0  # force immediate first run

    last_export = 0.0
    print("[monitor] entering main loop")

    while True:
        now = time.time()
        do_check = False

        with _state_lock:
            if now >= _next_check_time:
                do_check = True

        if do_check:
            down_now = check_all_services()
            print(f"[monitor] checked {len(down_now)} down, exporting JSON...")

            with _state_lock:
                _down_services_list = down_now
                _last_checked = datetime.now()
                _next_check_time = now + CHECK_INTERVAL

                cur_set = set(down_now)
                if cur_set != _prev_down_set:
                    ALERT_UNTIL = time.time() + 2.5
                _prev_down_set = cur_set

            # ⬇ Immediately write JSON *after* every check
            print("[monitor] writing JSON file...")
            payload = build_status_payload()
            print("[monitor] payload built. keys:", list(payload.keys()))
            print("[monitor] length downServices:", len(payload["downServices"]))
            print("[monitor] length healthHistory:", len(payload["healthHistory"]))
            if payload["healthHistory"]:
                print("[monitor] last health point:", payload["healthHistory"][-1])
            write_status_json(payload)

            last_export = now

        # still write once per second even if no new data
        elif (now - last_export) >= 1.0:
            payload = build_status_payload()
            write_status_json(payload)
            last_export = now

        time.sleep(0.05)


def main():
    Path(os.path.dirname(STATUS_JSON_PATH) or "/tmp").mkdir(parents=True, exist_ok=True)
    print(f"[monitor] starting. writing status to {STATUS_JSON_PATH}")
    monitor_loop()


if __name__ == "__main__":
    main()

