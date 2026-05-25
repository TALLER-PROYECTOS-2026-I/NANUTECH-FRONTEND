#!/usr/bin/env python3
"""
parse_semgrep.py
Lee security-reports/sast/semgrep-results.json y genera resumen.
Usado por job1-sast.yml.
"""
import json, sys, os

INPUT  = "security-reports/sast/semgrep-results.json"
OUTPUT = "security-reports/sast/semgrep-summary.json"

SEVERITY_ORDER = {"ERROR": 0, "WARNING": 1, "INFO": 2}

def main():
    if not os.path.exists(INPUT):
        print("Semgrep: reporte no encontrado, saltando.")
        write_empty()
        return

    try:
        with open(INPUT) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Semgrep: JSON inválido — {e}")
        write_empty()
        return

    results = data.get("results", [])
    errors  = data.get("errors", [])

    findings = []
    by_severity = {}

    for r in results:
        path = r.get("path", "?").replace(os.getcwd() + "/", "")
        line = r.get("start", {}).get("line", 0)
        rule = r.get("check_id", "?").split(".")[-1]
        msg  = r.get("extra", {}).get("message", "")
        sev  = r.get("extra", {}).get("severity", "INFO").upper()

        by_severity[sev] = by_severity.get(sev, 0) + 1
        findings.append({
            "file":     path,
            "line":     line,
            "severity": sev,
            "rule":     rule,
            "message":  msg,
        })

    # Ordenar por severidad
    findings.sort(key=lambda x: SEVERITY_ORDER.get(x["severity"], 99))

    # Consola
    print(f"\n{'='*60}")
    print("Semgrep — Resumen")
    print(f"{'='*60}")
    print(f"  Total findings: {len(findings)}")
    for sev, count in sorted(by_severity.items(), key=lambda x: SEVERITY_ORDER.get(x[0], 99)):
        icon = "🔴" if sev == "ERROR" else "🟡" if sev == "WARNING" else "🔵"
        print(f"  {icon} {sev}: {count}")

    if errors:
        print(f"  ⚠️  Errores de scan: {len(errors)}")

    if findings:
        print("\nTop hallazgos:")
        for f in findings[:10]:
            icon = "🔴" if f["severity"] == "ERROR" else "🟡"
            print(f"  {icon} [{f['rule']}] {f['file']}:{f['line']}")
            print(f"       {f['message'][:90]}")

    summary = {
        "tool":        "semgrep",
        "total":       len(findings),
        "by_severity": by_severity,
        "scan_errors": len(errors),
        "findings":    findings,
    }

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n✅ Semgrep summary guardado en {OUTPUT}")
    sys.exit(0)

def write_empty():
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump({"tool": "semgrep", "total": 0, "by_severity": {}, "scan_errors": 0, "findings": []}, f)

if __name__ == "__main__":
    main()
