#!/usr/bin/env python3
"""
check_headers.py
Recibe la URL como argumento, hace curl contra ella y analiza
todos los security headers relevantes.
Usado por job5-headers.yml.

Uso: python3 .github/scripts/check_headers.py <URL>
"""
import subprocess, json, sys, os
from datetime import datetime, timezone

OUTPUT = "security-reports/headers/headers-analysis.json"

# Definición completa de checks con severidad y recomendación
SECURITY_CHECKS = [
    {
        "name":           "Content-Security-Policy",
        "header":         "content-security-policy",
        "severity":       "HIGH",
        "description":    "Previene XSS e inyección de contenido no autorizado.",
        "recommendation": (
            "Content-Security-Policy: default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "connect-src 'self' https://wbda73ufn9.execute-api.us-east-2.amazonaws.com; "
            "img-src 'self' data: blob:; frame-ancestors 'none';"
        ),
    },
    {
        "name":           "Strict-Transport-Security",
        "header":         "strict-transport-security",
        "severity":       "HIGH",
        "description":    "Fuerza HTTPS y previene ataques de downgrade.",
        "recommendation": "Strict-Transport-Security: max-age=31536000; includeSubDomains",
    },
    {
        "name":           "X-Frame-Options",
        "header":         "x-frame-options",
        "severity":       "MEDIUM",
        "description":    "Previene Clickjacking al prohibir iframes.",
        "recommendation": "X-Frame-Options: DENY",
    },
    {
        "name":           "X-Content-Type-Options",
        "header":         "x-content-type-options",
        "severity":       "MEDIUM",
        "description":    "Previene MIME type sniffing por el navegador.",
        "recommendation": "X-Content-Type-Options: nosniff",
    },
    {
        "name":           "Referrer-Policy",
        "header":         "referrer-policy",
        "severity":       "LOW",
        "description":    "Controla qué información envía el header Referer.",
        "recommendation": "Referrer-Policy: strict-origin-when-cross-origin",
    },
    {
        "name":           "Permissions-Policy",
        "header":         "permissions-policy",
        "severity":       "LOW",
        "description":    "Restringe acceso a APIs del navegador (cámara, micrófono, etc.).",
        "recommendation": "Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()",
    },
    {
        "name":           "Cross-Origin-Opener-Policy",
        "header":         "cross-origin-opener-policy",
        "severity":       "LOW",
        "description":    "Aísla el contexto de navegación contra ataques de timing.",
        "recommendation": "Cross-Origin-Opener-Policy: same-origin",
    },
]

INFO_CHECKS = [
    {"header": "server",         "label": "Server",         "risk": "information disclosure"},
    {"header": "x-powered-by",  "label": "X-Powered-By",   "risk": "technology disclosure"},
    {"header": "x-aspnet-version", "label": "X-AspNet-Version", "risk": "technology disclosure"},
]

def fetch_headers(url):
    result = subprocess.run(
        ["curl", "-s", "-I", "-L",
         "--max-time", "15",
         "-H", "User-Agent: Mozilla/5.0 SecurityAudit/1.0",
         url],
        capture_output=True, text=True
    )
    headers = {}
    for line in result.stdout.split("\n"):
        if ":" in line:
            key, _, value = line.partition(":")
            headers[key.lower().strip()] = value.strip()
    return headers

def main():
    if len(sys.argv) < 2:
        print("Uso: python3 check_headers.py <URL>")
        sys.exit(1)

    url = sys.argv[1]
    print(f"\n{'='*60}")
    print(f"Headers Security Check — NANUTECH")
    print(f"URL: {url}")
    print(f"{'='*60}")

    headers = fetch_headers(url)
    checks  = []
    passed  = 0
    failed  = 0

    # Security headers
    print(f"\n{'HEADER':<38} {'ESTADO':<12} {'VALOR'}")
    print("-" * 80)

    for check in SECURITY_CHECKS:
        value   = headers.get(check["header"])
        present = value is not None

        if present:
            passed += 1
            status = "✅ PASS"
        else:
            failed += 1
            sev    = check["severity"]
            status = f"❌ {sev}"

        val_display = (value[:45] + "…") if value and len(value) > 45 else (value or "NO PRESENTE")
        print(f"{check['name']:<38} {status:<15} {val_display}")

        checks.append({
            "check":          check["name"],
            "header":         check["header"],
            "present":        present,
            "value":          value,
            "severity":       check["severity"],
            "description":    check["description"],
            "recommendation": check["recommendation"] if not present else None,
        })

    score = round((passed / len(SECURITY_CHECKS)) * 100)

    print(f"\n{'='*60}")
    print(f"Score: {score}/100 ({passed}/{len(SECURITY_CHECKS)} headers presentes)")

    # Information disclosure
    print("\n--- Information Disclosure ---")
    for ic in INFO_CHECKS:
        val = headers.get(ic["header"])
        if val:
            print(f"  ⚠️  {ic['label']}: '{val}' → {ic['risk']}")
        else:
            print(f"  ✅ {ic['label']}: oculto")

    # CORS
    cors = headers.get("access-control-allow-origin", "")
    if cors == "*":
        print(f"  ⚠️  CORS: Access-Control-Allow-Origin: * (demasiado permisivo)")
    elif cors:
        print(f"  ✅ CORS configurado: {cors}")

    # CSP warnings (si existe pero tiene directivas peligrosas)
    csp = headers.get("content-security-policy", "")
    if csp:
        if "'unsafe-inline'" in csp:
            print(f"\n  ⚠️  CSP contiene 'unsafe-inline' — revisar")
        if "'unsafe-eval'" in csp:
            print(f"  🔴 CSP contiene 'unsafe-eval' — PELIGROSO")

    # Recomendaciones de los que faltan
    missing_high = [c for c in checks if not c["present"] and c["severity"] == "HIGH"]
    if missing_high:
        print("\n🔴 Acciones requeridas (HIGH):")
        for c in missing_high:
            print(f"\n  {c['check']}:")
            print(f"    {c['description']}")
            print(f"    Añadir en amplify.yml → customHeaders:")
            print(f"    {c['recommendation']}")

    # Guardar reporte
    report = {
        "url":       url,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "score":     score,
        "passed":    passed,
        "failed":    failed,
        "total":     len(SECURITY_CHECKS),
        "headers":   {k: v for k, v in headers.items() if k in [c["header"] for c in SECURITY_CHECKS]},
        "checks":    checks,
    }

    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    with open(OUTPUT, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n✅ Reporte guardado en {OUTPUT}")
    sys.exit(0)

if __name__ == "__main__":
    main()
