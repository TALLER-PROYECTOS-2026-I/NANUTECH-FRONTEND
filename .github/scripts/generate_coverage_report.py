import json
import os
from datetime import datetime
from collections import defaultdict

def safe_pct(covered, total):
    if total == 0:
        return 100.0 if covered == 0 else 0.0
    return round(covered / total * 100, 2)

def get_color(pct):
    return "#22c55e" if pct >= 70 else "#eab308" if pct >= 50 else "#ef4444"

def get_fill(pct):
    return "good" if pct >= 70 else "medium" if pct >= 50 else "bad"

def fmt(pct):
    return f"{pct:.1f}%"

def bar(pct):
    w = min(pct, 100)
    return f'<div class="bar"><div class="bar-fill {get_fill(pct)}" style="width:{w:.1f}%"></div></div>'

def pct_cell(pct, cov=None, tot=None):
    sub = f'<br><span class="sub-num">{cov}/{tot}</span>' if cov is not None else ""
    return f'<td style="color:{get_color(pct)};font-weight:700">{fmt(pct)}{sub}</td>'

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#0a0e27;color:#e2e8f0;padding:24px;min-height:100vh}
.container{max-width:1400px;margin:0 auto}
h1{font-size:28px;font-weight:800;margin-bottom:6px}
h2{font-size:18px;font-weight:700;margin:32px 0 16px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px}
.sub{color:#64748b;font-size:13px;margin-bottom:28px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:36px}
.card{background:#1e293b;border-radius:16px;padding:20px;text-align:center}
.card-num{font-size:36px;font-weight:800;line-height:1}
.card-label{font-size:11px;color:#64748b;margin-top:8px;text-transform:uppercase;letter-spacing:1px}
.table-wrap{overflow-x:auto;border-radius:16px;background:#1e293b}
table{width:100%;border-collapse:collapse}
th{background:#0f172a;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;
   letter-spacing:.5px;padding:14px 18px;text-align:left;white-space:nowrap}
td{padding:14px 18px;border-bottom:1px solid #1e293b;font-size:13px;vertical-align:middle}
tr:last-child td{border-bottom:none}
tbody tr{background:#1e293b}
tbody tr:hover{background:#243044;transition:background .15s}
.name-cell{font-weight:600;color:#e2e8f0}
.name-cell a{color:#60a5fa;text-decoration:none;font-weight:700}
.name-cell a:hover{text-decoration:underline}
.file-count{font-size:11px;color:#475569;margin-top:2px}
.bar{background:#334155;border-radius:8px;height:8px;width:120px;overflow:hidden;display:inline-block}
.bar-fill{height:100%;border-radius:8px}
.good{background:#22c55e}
.medium{background:#eab308}
.bad{background:#ef4444}
.sub-num{font-size:10px;color:#475569;font-weight:400}
.legend{display:flex;gap:20px;flex-wrap:wrap;padding:14px 20px;background:#1e293b;
        border-radius:12px;margin-bottom:24px;font-size:12px;color:#94a3b8}
.legend-dot{width:12px;height:12px;border-radius:50%;display:inline-block;margin-right:6px;vertical-align:middle}
.back{display:inline-flex;align-items:center;gap:6px;color:#60a5fa;font-size:13px;
      text-decoration:none;margin-bottom:20px;padding:8px 14px;background:#1e293b;
      border-radius:8px;font-weight:600}
.back:hover{background:#243044}
.breadcrumb{display:flex;align-items:center;gap:8px;color:#475569;font-size:12px;margin-bottom:16px}
.breadcrumb a{color:#60a5fa;text-decoration:none}
.breadcrumb a:hover{text-decoration:underline}
.breadcrumb span{color:#334155}
.badge{display:inline-block;font-size:10px;padding:3px 10px;border-radius:20px;
       font-weight:700;margin-left:8px;vertical-align:middle}
.badge-app{background:#1e3a8a22;color:#93c5fd;border:1px solid #1e3a8a}
.badge-pkg{background:#14532d22;color:#86efac;border:1px solid #14532d}
.icon{margin-right:6px}
.footer{margin-top:48px;padding:20px;text-align:center;color:#334155;
        border-top:1px solid #1e293b;font-size:12px}
.warning-banner{background:#422006;border:1px solid #92400e;border-radius:12px;
                padding:14px 20px;margin-bottom:24px;color:#fbbf24;font-size:13px}
"""

BASE_DIR = "all-coverage-reports"
mfe_list = []

for mfe_name in sorted(os.listdir(BASE_DIR)):
    summary_path = os.path.join(BASE_DIR, mfe_name, "coverage-summary.json")
    if not os.path.isfile(summary_path):
        continue

    with open(summary_path) as f:
        data = json.load(f)

    total = data.get("total", {})

    mfe_info = {
        "name":         mfe_name,
        "badge":        "badge-pkg" if mfe_name.startswith("pkg-") or mfe_name == "utils" else "badge-app",
        "label":        "package"   if mfe_name.startswith("pkg-") or mfe_name == "utils" else "app",
        "s_pct":        total.get("statements", {}).get("pct",     0),
        "b_pct":        total.get("branches",   {}).get("pct",     0),
        "f_pct":        total.get("functions",  {}).get("pct",     0),
        "l_pct":        total.get("lines",      {}).get("pct",     0),
        "s_cov":        total.get("statements", {}).get("covered", 0),
        "s_tot":        total.get("statements", {}).get("total",   0),
        "b_cov":        total.get("branches",   {}).get("covered", 0),
        "b_tot":        total.get("branches",   {}).get("total",   0),
        "f_cov":        total.get("functions",  {}).get("covered", 0),
        "f_tot":        total.get("functions",  {}).get("total",   0),
        "l_cov":        total.get("lines",      {}).get("covered", 0),
        "l_tot":        total.get("lines",      {}).get("total",   0),
        "folders":      defaultdict(list),
        "file_count":   0,
        "has_real_data": len([k for k in data.keys() if k != "total"]) > 0,
    }

    for file_path, vals in data.items():
        if file_path == "total":
            continue

        fp = file_path.replace("\\", "/")
        if "/src/" in fp:
            rel = fp.split("/src/", 1)[1]
        elif fp.startswith("src/"):
            rel = fp[4:]
        else:
            rel = fp

        parts     = rel.split("/")
        file_name = parts[-1]
        folder    = "/".join(parts[:-1]) if len(parts) > 1 else "(raiz)"

        s_cov = vals.get("statements", {}).get("covered", 0)
        s_tot = vals.get("statements", {}).get("total",   0)
        b_cov = vals.get("branches",   {}).get("covered", 0)
        b_tot = vals.get("branches",   {}).get("total",   0)
        f_cov = vals.get("functions",  {}).get("covered", 0)
        f_tot = vals.get("functions",  {}).get("total",   0)
        l_cov = vals.get("lines",      {}).get("covered", 0)
        l_tot = vals.get("lines",      {}).get("total",   0)

        mfe_info["folders"][folder].append({
            "name":  file_name,
            "s_pct": safe_pct(s_cov, s_tot), "s_cov": s_cov, "s_tot": s_tot,
            "b_pct": safe_pct(b_cov, b_tot), "b_cov": b_cov, "b_tot": b_tot,
            "f_pct": safe_pct(f_cov, f_tot), "f_cov": f_cov, "f_tot": f_tot,
            "l_pct": safe_pct(l_cov, l_tot), "l_cov": l_cov, "l_tot": l_tot,
        })
        mfe_info["file_count"] += 1

    mfe_list.append(mfe_info)

# Metricas globales
gs_cov   = sum(m["s_cov"] for m in mfe_list)
gs_tot   = sum(m["s_tot"] for m in mfe_list)
gb_cov   = sum(m["b_cov"] for m in mfe_list)
gb_tot   = sum(m["b_tot"] for m in mfe_list)
gf_cov   = sum(m["f_cov"] for m in mfe_list)
gf_tot   = sum(m["f_tot"] for m in mfe_list)
gl_cov   = sum(m["l_cov"] for m in mfe_list)
gl_tot   = sum(m["l_tot"] for m in mfe_list)
g_stmt   = safe_pct(gs_cov, gs_tot)
g_branch = safe_pct(gb_cov, gb_tot)
g_func   = safe_pct(gf_cov, gf_tot)
g_lines  = safe_pct(gl_cov, gl_tot)

OUT_DIR = "docs/reports/latest/coverage"
os.makedirs(OUT_DIR, exist_ok=True)

# Paginas de detalle por MFE
for mfe in mfe_list:
    mfe_name = mfe["name"]
    folders  = mfe["folders"]

    folder_sections = ""
    for folder_name in sorted(folders.keys()):
        files  = sorted(folders[folder_name], key=lambda x: x["name"])
        fs_cov = sum(f["s_cov"] for f in files); fs_tot = sum(f["s_tot"] for f in files)
        fb_cov = sum(f["b_cov"] for f in files); fb_tot = sum(f["b_tot"] for f in files)
        ff_cov = sum(f["f_cov"] for f in files); ff_tot = sum(f["f_tot"] for f in files)
        fl_cov = sum(f["l_cov"] for f in files); fl_tot = sum(f["l_tot"] for f in files)
        fs_pct = safe_pct(fs_cov, fs_tot)
        fb_pct = safe_pct(fb_cov, fb_tot)
        ff_pct = safe_pct(ff_cov, ff_tot)
        fl_pct = safe_pct(fl_cov, fl_tot)

        file_rows = ""
        for f in files:
            file_rows += f"""
            <tr>
              <td class="name-cell" style="padding-left:36px">file {f['name']}</td>
              {pct_cell(f['s_pct'], f['s_cov'], f['s_tot'])}
              {pct_cell(f['b_pct'], f['b_cov'], f['b_tot'])}
              {pct_cell(f['f_pct'], f['f_cov'], f['f_tot'])}
              {pct_cell(f['l_pct'], f['l_cov'], f['l_tot'])}
              <td>{bar(f['l_pct'])}</td>
            </tr>"""

        folder_sections += f"""
        <tr style="background:#0f172a">
          <td class="name-cell" style="font-size:12px;color:#94a3b8;padding:10px 18px">
            folder {folder_name}
            <span class="file-count">{len(files)} archivo(s)</span>
          </td>
          {pct_cell(fs_pct)}
          {pct_cell(fb_pct)}
          {pct_cell(ff_pct)}
          {pct_cell(fl_pct)}
          <td>{bar(fl_pct)}</td>
        </tr>
        {file_rows}
        <tr><td colspan="6" style="padding:0;height:4px;background:#0a0e27"></td></tr>
        """

    has_data       = mfe["file_count"] > 0
    warning_banner = ""
    if not mfe["has_real_data"]:
        warning_banner = """
        <div class="warning-banner">
          Los tests de este workspace fallaron. Los datos son placeholder (0%).
          Revisa los logs del CI para mas detalles.
        </div>"""

    no_data_row = "" if has_data else (
        "<tr><td colspan='6' style='text-align:center;padding:40px;color:#475569'>"
        "Sin datos de cobertura — los tests fallaron o no generaron reporte</td></tr>"
    )

    detail_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{mfe_name} - Cobertura</title>
  <style>{CSS}</style>
</head>
<body>
<div class="container">
  <div class="breadcrumb">
    <a href="index.html">Inicio</a>
    <span>&rsaquo;</span>
    <span>{mfe_name}</span>
  </div>
  <h1>
    {"pkg" if mfe["label"]=="package" else "app"} {mfe_name}
    <span class="badge {mfe['badge']}">{mfe['label']}</span>
  </h1>
  <div class="sub">
    {mfe['file_count']} archivo(s) &middot;
    Generado: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}
  </div>
  {warning_banner}
  <div class="cards">
    <div class="card">
      <div class="card-num" style="color:{get_color(mfe['l_pct'])}">{fmt(mfe['l_pct'])}</div>
      <div class="card-label">Lineas</div>
    </div>
    <div class="card">
      <div class="card-num" style="color:{get_color(mfe['s_pct'])}">{fmt(mfe['s_pct'])}</div>
      <div class="card-label">Sentencias</div>
    </div>
    <div class="card">
      <div class="card-num" style="color:{get_color(mfe['b_pct'])}">{fmt(mfe['b_pct'])}</div>
      <div class="card-label">Ramas</div>
    </div>
    <div class="card">
      <div class="card-num" style="color:{get_color(mfe['f_pct'])}">{fmt(mfe['f_pct'])}</div>
      <div class="card-label">Funciones</div>
    </div>
  </div>
  <div class="legend">
    <div><span class="legend-dot" style="background:#22c55e"></span>70% o mas - Excelente</div>
    <div><span class="legend-dot" style="background:#eab308"></span>50%-69% - Aceptable</div>
    <div><span class="legend-dot" style="background:#ef4444"></span>Menos de 50% - Necesita mejora</div>
  </div>
  <h2>Archivos por carpeta</h2>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Carpeta / Archivo</th>
          <th>Sentencias</th>
          <th>Ramas</th>
          <th>Funciones</th>
          <th>Lineas</th>
          <th>Barra</th>
        </tr>
      </thead>
      <tbody>
        {folder_sections if has_data else no_data_row}
      </tbody>
    </table>
  </div>
  <div class="footer">Generado automaticamente por CI/CD Pipeline</div>
</div>
</body>
</html>"""

    out_path = os.path.join(OUT_DIR, f"{mfe_name}.html")
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(detail_html)
    print(f"  OK {mfe_name}.html ({mfe['file_count']} archivos)")

# Pagina principal
mfe_rows = ""
for mfe in mfe_list:
    estado    = "OK" if mfe["l_pct"] >= 50 else "FAIL"
    sin_datos = " (sin datos)" if not mfe["has_real_data"] else ""
    mfe_rows += f"""
    <tr>
      <td class="name-cell">
        <a href="{mfe['name']}.html">
          {"pkg" if mfe["label"]=="package" else "app"} {mfe['name']}
        </a>
        <span class="badge {mfe['badge']}">{mfe['label']}</span>
        <div class="file-count">{mfe['file_count']} archivo(s){sin_datos}</div>
      </td>
      {pct_cell(mfe['s_pct'])}
      {pct_cell(mfe['b_pct'])}
      {pct_cell(mfe['f_pct'])}
      {pct_cell(mfe['l_pct'])}
      <td>{bar(mfe['l_pct'])}</td>
      <td style="font-size:18px;text-align:center">{"OK" if mfe["l_pct"] >= 50 else "FAIL"}</td>
    </tr>"""

index_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>NANUTECH Frontend - Cobertura</title>
  <style>{CSS}</style>
</head>
<body>
<div class="container">
  <h1>NANUTECH Frontend - Reporte de Cobertura</h1>
  <div class="sub">
    {len(mfe_list)} workspace(s) &middot;
    Generado: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}
  </div>
  <div class="cards">
    <div class="card">
      <div class="card-num" style="color:{get_color(g_lines)}">{fmt(g_lines)}</div>
      <div class="card-label">Lineas</div>
    </div>
    <div class="card">
      <div class="card-num" style="color:{get_color(g_stmt)}">{fmt(g_stmt)}</div>
      <div class="card-label">Sentencias</div>
    </div>
    <div class="card">
      <div class="card-num" style="color:{get_color(g_branch)}">{fmt(g_branch)}</div>
      <div class="card-label">Ramas</div>
    </div>
    <div class="card">
      <div class="card-num" style="color:{get_color(g_func)}">{fmt(g_func)}</div>
      <div class="card-label">Funciones</div>
    </div>
    <div class="card">
      <div class="card-num">{len(mfe_list)}</div>
      <div class="card-label">Workspaces</div>
    </div>
  </div>
  <div class="legend">
    <div><span class="legend-dot" style="background:#22c55e"></span>70% o mas - Excelente</div>
    <div><span class="legend-dot" style="background:#eab308"></span>50%-69% - Aceptable</div>
    <div><span class="legend-dot" style="background:#ef4444"></span>Menos de 50% - Necesita mejora</div>
  </div>
  <h2>Microfrontends</h2>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Microfrontend</th>
          <th>Sentencias</th>
          <th>Ramas</th>
          <th>Funciones</th>
          <th>Lineas</th>
          <th>Barra</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {mfe_rows if mfe_rows else "<tr><td colspan='7' style='text-align:center;padding:40px;color:#475569'>No hay datos disponibles</td></tr>"}
      </tbody>
    </table>
  </div>
  <div class="footer">
    Haz clic en cualquier microfrontend para ver sus carpetas y archivos.
    Reporte generado automaticamente por CI/CD Pipeline.
  </div>
</div>
</body>
</html>"""

with open(os.path.join(OUT_DIR, "index.html"), "w", encoding="utf-8") as fh:
    fh.write(index_html)

print(f"OK index.html generado - {len(mfe_list)} MFEs")