#!/usr/bin/env python3
"""
parse_npm_audit.py
Lee todos los security-reports/deps/npm-audit-*.json (uno por workspace)
y genera un resumen consolidado.
Usado por job2-dependencies.yml.
"""
import json, sys, os, glob

OUTPUT = "security-reports/deps/npm-audit-summary.json"

# Workspaces del monorepo NANUTECH
WORKSPACES = [
    "root",
    "mfe-contratos",
    "mfe-dashboard",
    "mfe-flota",
    "shell-app",
    "api-client",
]

def parse_one(filepath):
    try:
        with open(filepath) as f:
            data = json.load(f)
    except Exception as e:
        return None, str(e)

    meta  = data.get("metadata", {})
    vulns = meta.get("vulnerabilities", {})

    advisories = []
    # npm v7+ format
    for name, info in data.get("vulnerabilities", {}).items():
        via = info.get("via", [])
        for v in via:
            if isinstance(v, dict):
                advisories.append({
                    "package":   name,
                    "severity":  info.get("severity", "?"),
                    "title":     v.get("title", "?"),
                    "url":       v.get("url", ""),
                    "range":     info.get("range", ""),
                    "fixAvailable": info.get("fixAvailable", False),
                })

    return {
        "critical": vulns.get("critical", 0),
        "high":     vulns.get("high", 0),
        "moderate": vulns.get("moderate", 0),
        "low":      vulns.get("low", 0),
        "total":    meta.get("totalDependencies", 0),
        "advisories": advisories[:20],
    }, None

def main():
    files = glob.glob("security-reports/deps/npm-audit-*.json")

    if not files:
        print("npm audit: no se encontraron reportes.")
        write_empty()
        return

    totals = {"critical": 0, "high": 0, "moderate": 0, "low": 0}
    by_workspace = {}
    all_advisories = []

    print(f"\n{'='*60}")
    print("npm audit — Resumen por workspace")
    print(f"{'='*60}")

    for filepath in sorted(files):
        ws_name = os.path.basename(filepath).replace("npm-audit-", "").replace(".json", "")
        result, err = parse_one(filepath)

        if err:
            print(f"  [{ws_name}] Error: {err}")
            continue

        by_workspace[ws_name] = result
        totals["critical"] += result["critical"]
        totals["high"]     += result["high"]
        totals["moderate"] += result["moderate"]
        totals["low"]      += result["low"]
        all_advisories.extend(result["advisories"])

        has_issues = sum(result[k] for k in ["critical","high","moderate","low"]) > 0
        icon = "🔴" if result["critical"] > 0 else "🟠" if result["high"] > 0 else "🟡" if result["moderate"] > 0 else "✅"
        print(f"\n  {icon} [{ws_name}]")
        print(f"     Critical: {result['critical']} | High: {result['high']} | Moderate: {result['moderate']} | Low: {result['low']}")
        print(f"     Total dependencias: {result['total']}")

    print(f"\n{'='*60}")
    print("TOTALES CONSOLIDADOS")
    print(f"{'='*60}")
    print(f"  🔴 Critical: {totals['critical']}")
    print(f"  🟠 High:     {totals['high']}")
    print(f"  🟡 Moderate: {totals['moderate']}")
    print(f"  🔵 Low:      {totals['low']}")

    # Advisories críticos/high
    critical_advisories = [a for a in all_advisories if a["severity"] in ("critical","high")]
    if critical_advisories:
        print(f"\n⚠️  Paquetes críticos/high que requieren acción:")
        for a in critical_advisories[:10]:
            fix = "✅ fix disponible" if a["fixAvailable"] else "⚠️  fix manual"
            print(f"  • {a['package']} [{a['severity'].upper()}] — {a['title']} ({fix})")
            if a["url"]:
                print(f"    {a['url']}")

    summary = {
        "tool":         "npm-audit",
        "totals":       totals,
        "by_workspace": by_workspace,
        "critical_advisories": critical_advisories[:20],
    }

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n✅ npm audit summary guardado en {OUTPUT}")
    sys.exit(0)

def write_empty():
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump({"tool": "npm-audit", "totals": {"critical":0,"high":0,"moderate":0,"low":0}, "by_workspace": {}}, f)

if __name__ == "__main__":
    main()
