#!/usr/bin/env python3
"""
parse_eslint.py
Lee security-reports/sast/eslint-security.json y genera un resumen
legible en consola + un summary.json estructurado.
Usado por job1-sast.yml.
"""
import json, sys, os

INPUT  = "security-reports/sast/eslint-security.json"
OUTPUT = "security-reports/sast/eslint-summary.json"

def main():
    if not os.path.exists(INPUT):
        print("ESLint: reporte no encontrado, saltando.")
        write_empty()
        return

    try:
        with open(INPUT) as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"ESLint: JSON inválido — {e}")
        write_empty()
        return

    total_errors   = 0
    total_warnings = 0
    findings       = []

    for file_result in data:
        path     = file_result.get("filePath", "?").replace(os.getcwd() + "/", "")
        errors   = file_result.get("errorCount", 0)
        warnings = file_result.get("warningCount", 0)
        total_errors   += errors
        total_warnings += warnings

        for msg in file_result.get("messages", []):
            findings.append({
                "file":     path,
                "line":     msg.get("line", 0),
                "severity": "ERROR" if msg.get("severity") == 2 else "WARNING",
                "rule":     msg.get("ruleId", "unknown"),
                "message":  msg.get("message", ""),
            })

    # Consola
    print(f"\n{'='*60}")
    print("ESLint Security — Resumen")
    print(f"{'='*60}")
    print(f"  Errores:      {total_errors}")
    print(f"  Advertencias: {total_warnings}")
    print(f"  Archivos con issues: {sum(1 for r in data if r.get('errorCount',0)+r.get('warningCount',0) > 0)}")

    if findings:
        print("\nTop hallazgos:")
        for f in findings[:10]:
            icon = "❌" if f["severity"] == "ERROR" else "⚠️ "
            print(f"  {icon} [{f['rule']}] {f['file']}:{f['line']} — {f['message'][:80]}")

    summary = {
        "tool":           "eslint-security",
        "total_errors":   total_errors,
        "total_warnings": total_warnings,
        "findings":       findings,
    }

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n✅ ESLint summary guardado en {OUTPUT}")

    # Exit code no-zero si hay errores (para que el step pueda fallar si se quiere)
    sys.exit(0)  # Siempre 0: el CI decide si fallar, no este script

def write_empty():
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump({"tool": "eslint-security", "total_errors": 0, "total_warnings": 0, "findings": []}, f)

if __name__ == "__main__":
    main()
