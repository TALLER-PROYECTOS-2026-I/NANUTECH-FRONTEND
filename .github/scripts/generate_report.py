#!/usr/bin/env python3
"""
generate_report.py
Lee todos los summaries de los jobs anteriores y genera
el reporte HTML final que se publica en GitHub Pages.
Usado por job6-report.yml.
"""
import json, os, glob
from datetime import datetime, timezone

# ── Helpers ────────────────────────────────────────────────────────────

def safe_load(path, default=None):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return default if default is not None else {}

def severity_badge(sev):
    colors = {
        "CRITICAL": "#dc2626",
        "ERROR":    "#dc2626",
        "HIGH":     "#ea580c",
        "MEDIUM":   "#ca8a04",
        "WARNING":  "#ca8a04",
        "LOW":      "#2563eb",
        "INFO":     "#6b7280",
        "PASS":     "#16a34a",
    }
    color = colors.get(sev.upper(), "#6b7280")
    return (
        f'<span style="background:{color};color:white;padding:2px 8px;'
        f'border-radius:12px;font-size:11px;font-weight:700">{sev}</span>'
    )

def table_rows(findings, cols):
    """
    findings: list of dicts
    cols: list of (key, label, transform_fn?)
    """
    if not findings:
        return (
            f'<tr><td colspan="{len(cols)}" '
            f'style="text-align:center;color:#6b7280;padding:16px">'
            f'✅ Sin hallazgos</td></tr>'
        )
    rows = ""
    for item in findings[:50]:
        cells = ""
        for col in cols:
            key = col[0]
            val = item.get(key, "")
            if len(col) > 2:
                val = col[2](val)  # transform fn
            cells += f"<td style='padding:10px 12px;border-bottom:1px solid #f8fafc;vertical-align:top;font-size:13px'>{val}</td>"
        rows += f"<tr>{cells}</tr>"
    return rows

# ── Leer datos ─────────────────────────────────────────────────────────

def load_all():
    eslint   = safe_load("security-reports/sast/eslint-summary.json")
    semgrep  = safe_load("security-reports/sast/semgrep-summary.json")
    gitleaks = safe_load("security-reports/sast/gitleaks-summary.json")
    npm      = safe_load("security-reports/deps/npm-audit-summary.json")
    browser  = safe_load("security-reports/browser/browser-analysis.json")
    headers  = safe_load("security-reports/headers/headers-analysis.json")
    return eslint, semgrep, gitleaks, npm, browser, headers

# ── Calcular score global ──────────────────────────────────────────────

def compute_score(gitleaks, npm, browser, headers):
    leaks         = gitleaks.get("leaks_found", 0)
    npm_totals    = npm.get("totals", {})
    browser_finds = browser.get("securityFindings", [])
    headers_score = headers.get("score", 100)

    critical = leaks + npm_totals.get("critical", 0) + len([f for f in browser_finds if f.get("severity") == "CRITICAL"])
    high     = npm_totals.get("high", 0)     + len([f for f in browser_finds if f.get("severity") == "HIGH"])
    medium   = npm_totals.get("moderate", 0) + len([f for f in browser_finds if f.get("severity") == "MEDIUM"])
    low      = npm_totals.get("low", 0)

    score = max(0, 100 - critical * 20 - high * 10 - medium * 3 - low)
    score = int(score * 0.7 + headers_score * 0.3)  # Ponderado con headers

    return score, critical, high, medium, low

# ── HTML ───────────────────────────────────────────────────────────────

def build_html(eslint, semgrep, gitleaks, npm, browser, headers):
    score, issues_critical, issues_high, issues_medium, issues_low = compute_score(gitleaks, npm, browser, headers)

    score_color = "#22c55e" if score >= 80 else "#f59e0b" if score >= 60 else "#ef4444"
    score_label = "BUENO" if score >= 80 else "MEDIO" if score >= 60 else "CRÍTICO"

    npm_totals      = npm.get("totals", {})
    semgrep_finds   = semgrep.get("findings", [])
    eslint_errors   = eslint.get("total_errors", 0)
    eslint_warnings = eslint.get("total_warnings", 0)
    leaks           = gitleaks.get("leaks_found", 0)
    browser_finds   = browser.get("securityFindings", [])
    browser_score   = browser.get("score", "N/A")
    headers_score   = headers.get("score", "N/A")
    headers_checks  = headers.get("checks", [])
    cookies         = browser.get("cookies", [])
    local_keys      = list(browser.get("localStorage", {}).keys())
    session_keys    = list(browser.get("sessionStorage", {}).keys())

    NOW  = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    REPO = os.environ.get("GITHUB_REPOSITORY", "NANUTECH-FRONTEND")
    SHA  = os.environ.get("GITHUB_SHA", "?")[:7]
    RUN  = os.environ.get("GITHUB_RUN_ID", "?")

    # ── Rows ────────────────────────────────────────────────────────

    # Semgrep
    semgrep_rows = table_rows(semgrep_finds, [
        ("severity", "Sev", severity_badge),
        ("file",     "Archivo"),
        ("rule",     "Regla"),
        ("message",  "Descripción"),
    ])

    # ESLint
    eslint_finds = eslint.get("findings", [])
    eslint_rows  = table_rows(eslint_finds, [
        ("severity", "Sev", severity_badge),
        ("file",     "Archivo"),
        ("rule",     "Regla"),
        ("message",  "Descripción"),
    ])

    # Gitleaks
    leaks_list  = gitleaks.get("leaks", [])
    gitleaks_rows = table_rows(leaks_list, [
        ("RuleID", "Regla"),
        ("File",   "Archivo"),
        ("Commit", "Commit"),
        ("Author", "Autor"),
    ])

    # npm advisories
    npm_adv  = npm.get("critical_advisories", [])
    npm_rows = table_rows(npm_adv, [
        ("severity", "Sev",     lambda s: severity_badge(s.upper())),
        ("package",  "Paquete"),
        ("title",    "Vulnerabilidad"),
        ("fixAvailable", "Fix", lambda v: "✅ Disponible" if v else "⚠️ Manual"),
    ])

    # npm por workspace
    ws_rows = ""
    for ws, data in npm.get("by_workspace", {}).items():
        icon = "🔴" if data["critical"] > 0 else "🟠" if data["high"] > 0 else "🟡" if data["moderate"] > 0 else "✅"
        ws_rows += (
            f"<tr>"
            f"<td style='padding:10px 12px;font-weight:600;font-size:13px'>{icon} {ws}</td>"
            f"<td style='padding:10px 12px;text-align:center;color:#dc2626;font-weight:700'>{data['critical']}</td>"
            f"<td style='padding:10px 12px;text-align:center;color:#ea580c;font-weight:700'>{data['high']}</td>"
            f"<td style='padding:10px 12px;text-align:center;color:#ca8a04;font-weight:700'>{data['moderate']}</td>"
            f"<td style='padding:10px 12px;text-align:center;color:#2563eb'>{data['low']}</td>"
            f"</tr>"
        )
    if not ws_rows:
        ws_rows = '<tr><td colspan="5" style="text-align:center;color:#6b7280;padding:16px">Sin datos de workspace</td></tr>'

    # Browser findings
    browser_rows = table_rows(browser_finds, [
        ("severity", "Sev",      severity_badge),
        ("category", "Categoría"),
        ("message",  "Hallazgo"),
    ])

    # Cookies
    cookies_rows = ""
    for c in cookies:
        name   = c.get("name", "?")
        ho     = "✅" if c.get("httpOnly") else "❌"
        sec    = "✅" if c.get("secure")   else "❌"
        ss     = c.get("sameSite", "None")
        ss_ico = "✅" if ss in ["Strict","Lax"] else "⚠️"
        cookies_rows += (
            f"<tr>"
            f"<td style='padding:10px 12px;font-family:monospace;font-size:12px'>{name}</td>"
            f"<td style='padding:10px 12px;text-align:center'>{ho}</td>"
            f"<td style='padding:10px 12px;text-align:center'>{sec}</td>"
            f"<td style='padding:10px 12px;text-align:center'>{ss_ico} {ss}</td>"
            f"</tr>"
        )
    if not cookies_rows:
        cookies_rows = '<tr><td colspan="4" style="text-align:center;color:#6b7280;padding:16px">Sin cookies detectadas (puede requerir login)</td></tr>'

    # Headers checks
    headers_rows = ""
    for c in headers_checks:
        status = "✅ Presente" if c.get("present") else "❌ Ausente"
        sev    = c.get("severity","LOW") if not c.get("present") else "PASS"
        badge  = severity_badge(sev)
        rec    = (c.get("recommendation") or "")[:70]
        headers_rows += (
            f"<tr>"
            f"<td style='padding:10px 12px;font-weight:600;font-size:13px'>{c.get('check','?')}</td>"
            f"<td style='padding:10px 12px;font-size:13px'>{status}</td>"
            f"<td style='padding:10px 12px'>{badge}</td>"
            f"<td style='padding:10px 12px;font-size:11px;color:#64748b'>{rec}</td>"
            f"</tr>"
        )
    if not headers_rows:
        headers_rows = '<tr><td colspan="4" style="text-align:center;color:#6b7280;padding:16px">JOB 5 no ejecutado en este run</td></tr>'

    # ── Alertas de acción ────────────────────────────────────────────

    def alert(color, msg):
        bg   = {"red":"#fef2f2","amber":"#fffbeb","green":"#f0fdf4"}[color]
        bord = {"red":"#fecaca","amber":"#fde68a","green":"#bbf7d0"}[color]
        text = {"red":"#991b1b","amber":"#92400e","green":"#166534"}[color]
        return f'<div style="padding:12px 16px;border-radius:8px;background:{bg};border:1px solid {bord};color:{text};font-size:13px;margin-bottom:10px">{msg}</div>'

    action_alerts = ""
    if leaks > 0:
        action_alerts += alert("red", f"🔴 <strong>INMEDIATO:</strong> {leaks} secreto(s) detectado(s) por Gitleaks. Rotar credenciales y activar GitHub Secret Scanning.")
    if any(f.get("severity") == "CRITICAL" and "localStorage" in f.get("category","") for f in browser_finds):
        action_alerts += alert("red", "🔴 <strong>INMEDIATO:</strong> Token JWT en localStorage. Migrar a cookies HttpOnly+Secure desde el backend Cognito.")
    if npm_totals.get("critical", 0) > 0:
        action_alerts += alert("red", f"🔴 <strong>ESTA SEMANA:</strong> {npm_totals['critical']} CVEs críticos en dependencias. Ejecutar <code>npm audit fix</code>.")
    elif npm_totals.get("high", 0) > 0:
        action_alerts += alert("amber", f"🟠 <strong>PRÓXIMO SPRINT:</strong> {npm_totals['high']} CVEs high en dependencias.")
    if isinstance(headers_score, int) and headers_score < 80:
        action_alerts += alert("amber", "🟠 <strong>PRÓXIMO SPRINT:</strong> Añadir security headers en amplify.yml. Ver artifacts del JOB 5.")
    if not action_alerts:
        action_alerts = alert("green", "✅ Sin acciones críticas pendientes. Continuar monitoreando.")

    # ── Ensamblar HTML ───────────────────────────────────────────────

    th = "style='text-align:left;font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;padding:8px 12px;border-bottom:2px solid #f1f5f9'"

    html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Report — NANUTECH FRONTEND</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; }}
    header {{ background: #0f172a; color: white; padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }}
    header h1 {{ font-size: 20px; font-weight: 700; }}
    header .meta {{ font-size: 11px; color: #94a3b8; text-align: right; line-height: 1.8; }}
    .main {{ max-width: 1200px; margin: 0 auto; padding: 28px 20px; }}
    .hero {{ background: white; border-radius: 16px; padding: 28px; box-shadow: 0 1px 3px rgba(0,0,0,.08); margin-bottom: 20px; display: flex; align-items: center; gap: 28px; flex-wrap: wrap; }}
    .score-circle {{ width: 96px; height: 96px; border-radius: 50%; background: {score_color}; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; flex-shrink: 0; }}
    .score-circle .num {{ font-size: 30px; font-weight: 800; line-height: 1; }}
    .score-circle .lbl {{ font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-top: 2px; }}
    .kpi-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(130px,1fr)); gap: 14px; margin-bottom: 20px; }}
    .kpi {{ background: white; border-radius: 12px; padding: 18px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.08); text-align: center; }}
    .kpi .val {{ font-size: 26px; font-weight: 800; }}
    .kpi .lbl {{ font-size: 11px; color: #64748b; margin-top: 4px; }}
    .kpi.red .val    {{ color: #dc2626; }}
    .kpi.orange .val {{ color: #ea580c; }}
    .kpi.yellow .val {{ color: #ca8a04; }}
    .kpi.green .val  {{ color: #16a34a; }}
    .kpi.blue .val   {{ color: #2563eb; }}
    .section {{ background: white; border-radius: 12px; padding: 22px; box-shadow: 0 1px 3px rgba(0,0,0,.08); margin-bottom: 18px; }}
    .section h2 {{ font-size: 15px; font-weight: 700; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; gap: 8px; }}
    .section h3 {{ font-size: 13px; font-weight: 600; color: #374151; margin: 18px 0 10px; }}
    table {{ width: 100%; border-collapse: collapse; }}
    th {{ {th} }}
    code {{ background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-size: 12px; font-family: monospace; }}
    footer {{ text-align: center; padding: 24px; color: #94a3b8; font-size: 11px; }}
    .two-col {{ display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }}
    .mono-box {{ background: #f8fafc; border-radius: 8px; padding: 12px; font-size: 12px; font-family: monospace; color: #475569; min-height: 36px; }}
    @media(max-width:640px) {{ .two-col {{ grid-template-columns: 1fr; }} .hero {{ flex-direction: column; }} }}
  </style>
</head>
<body>

<header>
  <div>
    <h1>🛡️ Security Report — NANUTECH FRONTEND</h1>
    <div style="font-size:12px;color:#94a3b8;margin-top:4px">Monorepo microfrontend · React + Vite + Amplify</div>
  </div>
  <div class="meta">
    <div>Generado: {NOW}</div>
    <div>Commit: <code style="background:#1e293b;color:#94a3b8">{SHA}</code> · Run #{RUN}</div>
    <div>{REPO}</div>
  </div>
</header>

<div class="main">

  <!-- Hero score -->
  <div class="hero">
    <div class="score-circle">
      <span class="num">{score}</span>
      <span class="lbl">{score_label}</span>
    </div>
    <div>
      <h2 style="font-size:18px;font-weight:700;margin-bottom:8px">Score de Seguridad Global</h2>
      <p style="color:#64748b;font-size:13px;margin-bottom:12px">Ponderado: 70% hallazgos + 30% headers HTTP</p>
      <div style="display:flex;gap:18px;font-size:13px;flex-wrap:wrap">
        <span>🔴 {issues_critical} críticos</span>
        <span>🟠 {issues_high} altos</span>
        <span>🟡 {issues_medium} medios</span>
        <span>🔵 {issues_low} bajos</span>
      </div>
    </div>
  </div>

  <!-- KPIs -->
  <div class="kpi-grid">
    <div class="kpi {'red' if npm_totals.get('critical',0) > 0 else 'green'}">
      <div class="val">{npm_totals.get('critical',0)}</div>
      <div class="lbl">CVEs Críticos</div>
    </div>
    <div class="kpi {'orange' if npm_totals.get('high',0) > 0 else 'green'}">
      <div class="val">{npm_totals.get('high',0)}</div>
      <div class="lbl">CVEs High</div>
    </div>
    <div class="kpi {'orange' if len(semgrep_finds) > 0 else 'green'}">
      <div class="val">{len(semgrep_finds)}</div>
      <div class="lbl">Semgrep Findings</div>
    </div>
    <div class="kpi {'red' if leaks > 0 else 'green'}">
      <div class="val">{leaks}</div>
      <div class="lbl">Secretos (Gitleaks)</div>
    </div>
    <div class="kpi {'yellow' if isinstance(browser_score,int) and browser_score < 80 else 'green'}">
      <div class="val">{browser_score}</div>
      <div class="lbl">Score Browser</div>
    </div>
    <div class="kpi {'yellow' if isinstance(headers_score,int) and headers_score < 80 else 'green'}">
      <div class="val">{headers_score}</div>
      <div class="lbl">Score Headers</div>
    </div>
  </div>

  <!-- Plan de acción -->
  <div class="section">
    <h2>🎯 Plan de Acción</h2>
    {action_alerts}
  </div>

  <!-- JOB 1 — SAST -->
  <div class="section">
    <h2>🔍 JOB 1 — SAST</h2>

    <h3>Semgrep · {len(semgrep_finds)} hallazgos</h3>
    <table>
      <thead><tr><th>Severidad</th><th>Archivo</th><th>Regla</th><th>Descripción</th></tr></thead>
      <tbody>{semgrep_rows}</tbody>
    </table>

    <h3>ESLint Security · {eslint_errors} errores · {eslint_warnings} advertencias</h3>
    <table>
      <thead><tr><th>Severidad</th><th>Archivo</th><th>Regla</th><th>Descripción</th></tr></thead>
      <tbody>{eslint_rows}</tbody>
    </table>

    <h3>Gitleaks · {leaks} secreto(s) en historial git</h3>
    {'<div style="padding:10px 14px;border-radius:8px;background:#fef2f2;border:1px solid #fecaca;color:#991b1b;font-size:13px;font-weight:600">🚨 Secretos encontrados — ver tabla</div>' if leaks > 0 else '<div style="padding:10px 14px;border-radius:8px;background:#f0fdf4;border:1px solid #bbf7d0;color:#166534;font-size:13px">✅ Sin secretos en el historial de git</div>'}
    {f'<table style="margin-top:12px"><thead><tr><th>Regla</th><th>Archivo</th><th>Commit</th><th>Autor</th></tr></thead><tbody>{gitleaks_rows}</tbody></table>' if leaks > 0 else ''}
  </div>

  <!-- JOB 2 — Dependencies -->
  <div class="section">
    <h2>📦 JOB 2 — Dependencias</h2>

    <h3>npm audit · por workspace</h3>
    <table>
      <thead><tr><th>Workspace</th><th>Critical</th><th>High</th><th>Moderate</th><th>Low</th></tr></thead>
      <tbody>{ws_rows}</tbody>
    </table>

    <h3>Advisories críticos/high</h3>
    <table>
      <thead><tr><th>Severidad</th><th>Paquete</th><th>Vulnerabilidad</th><th>Fix</th></tr></thead>
      <tbody>{npm_rows}</tbody>
    </table>
  </div>

  <!-- JOB 4 — Browser -->
  <div class="section">
    <h2>🌐 JOB 4 — Browser Analysis (Playwright)</h2>

    <div class="two-col">
      <div>
        <h3>localStorage keys</h3>
        <div class="mono-box">{', '.join(local_keys) if local_keys else '(vacío)'}</div>
      </div>
      <div>
        <h3>sessionStorage keys</h3>
        <div class="mono-box">{', '.join(session_keys) if session_keys else '(vacío)'}</div>
      </div>
    </div>

    <h3>Cookies · {len(cookies)} detectada(s)</h3>
    <table>
      <thead><tr><th>Nombre</th><th>HttpOnly</th><th>Secure</th><th>SameSite</th></tr></thead>
      <tbody>{cookies_rows}</tbody>
    </table>

    <h3>Hallazgos de seguridad browser · {len(browser_finds)}</h3>
    <table>
      <thead><tr><th>Severidad</th><th>Categoría</th><th>Hallazgo</th></tr></thead>
      <tbody>{browser_rows}</tbody>
    </table>
  </div>

  <!-- JOB 5 — Headers -->
  <div class="section">
    <h2>🔒 JOB 5 — Headers HTTP · score {headers_score}/100</h2>
    <table>
      <thead><tr><th>Header</th><th>Estado</th><th>Severidad</th><th>Recomendación</th></tr></thead>
      <tbody>{headers_rows}</tbody>
    </table>
  </div>

</div>

<footer>🛡️ NANUTECH Security Report · Generado por GitHub Actions · {NOW}</footer>
</body>
</html>"""

    return html

# ── Main ───────────────────────────────────────────────────────────────

def main():
    eslint, semgrep, gitleaks, npm, browser, headers = load_all()
    html = build_html(eslint, semgrep, gitleaks, npm, browser, headers)

    os.makedirs("public", exist_ok=True)
    with open("public/index.html", "w") as f:
        f.write(html)

    print("✅ Reporte generado en public/index.html")

if __name__ == "__main__":
    main()
