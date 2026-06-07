#!/usr/bin/env python3
"""
parse_gitleaks.py
Lee security-reports/sast/gitleaks-report.json y genera resumen.
Usado por job1-sast.yml.
"""
import json, sys, os

INPUT  = "security-reports/sast/gitleaks-report.json"
OUTPUT = "security-reports/sast/gitleaks-summary.json"

def main():
    if not os.path.exists(INPUT):
        print("Gitleaks: reporte no encontrado.")
        write_empty()
        return

    try:
        with open(INPUT) as f:
            raw = f.read().strip()
        # Gitleaks puede devolver null o [] cuando no hay leaks
        if not raw or raw == "null":
            leaks = []
        else:
            leaks = json.loads(raw)
            if not isinstance(leaks, list):
                leaks = []
    except json.JSONDecodeError:
        print("Gitleaks: reporte vacío o sin fugas detectadas.")
        leaks = []

    print(f"\n{'='*60}")
    print("Gitleaks — Secretos detectados")
    print(f"{'='*60}")

    if not leaks:
        print("  ✅ Sin secretos encontrados en el historial de git")
    else:
        print(f"  🚨 {len(leaks)} secreto(s) encontrado(s) — ROTARLOS INMEDIATAMENTE")
        print()
        for leak in leaks[:10]:
            rule   = leak.get("RuleID", "?")
            file_  = leak.get("File", "?")
            line   = leak.get("StartLine", "?")
            commit = leak.get("Commit", "?")[:8]
            author = leak.get("Author", "?")
            print(f"  🔴 [{rule}] {file_}:{line}")
            print(f"       Commit: {commit} | Autor: {author}")

        if len(leaks) > 10:
            print(f"  ... y {len(leaks) - 10} más (ver gitleaks-report.json)")

    summary = {
        "tool":          "gitleaks",
        "leaks_found":   len(leaks),
        "leaks":         leaks[:20],  # Máximo 20 en el summary
    }

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n✅ Gitleaks summary guardado en {OUTPUT}")

    # Exit 1 si hay leaks para que el step lo marque como failure visible
    # (el job tiene continue-on-error: true así que no bloquea)
    sys.exit(1 if leaks else 0)

def write_empty():
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump({"tool": "gitleaks", "leaks_found": 0, "leaks": []}, f)

if __name__ == "__main__":
    main()
