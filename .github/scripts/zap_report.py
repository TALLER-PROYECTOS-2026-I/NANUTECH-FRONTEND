import json
import sys
import os
from datetime import datetime, timezone

workspace = os.environ.get('WORKSPACE', '/home/runner/work/NANUTECH-FRONTEND/NANUTECH-FRONTEND')
json_report = os.path.join(workspace, 'report_json.json')

HIGH = 0
MEDIUM = 0
LOW = 0
INFO = 0
TOTAL = 0
ALERTS_ROWS = '<tr><td colspan="6" style="color:#3fb950;text-align:center;padding:20px">Sin alertas de riesgo</td></tr>'

if os.path.exists(json_report):
    with open(json_report) as f:
        data = json.load(f)
    alerts = [a for s in data.get('site', []) for a in s.get('alerts', [])]
    HIGH   = len([a for a in alerts if a.get('riskcode') == '3'])
    MEDIUM = len([a for a in alerts if a.get('riskcode') == '2'])
    LOW    = len([a for a in alerts if a.get('riskcode') == '1'])
    INFO   = len([a for a in alerts if a.get('riskcode') == '0'])
    TOTAL  = HIGH + MEDIUM + LOW + INFO
    risk_labels = {'3':'HIGH','2':'MEDIUM','1':'LOW','0':'INFO'}
    risk_classes = {'3':'b-red','2':'b-warn','1':'b-warn','0':'b-info'}
    rows = []
    for alert in alerts:
        rc = alert.get('riskcode','0')
        name = alert.get('name','').replace('<','&lt;').replace('>','&gt;')
        desc = alert.get('desc','')[:150].replace('<','&lt;').replace('>','&gt;')
        cwe  = alert.get('cweid','-')
        inst = len(alert.get('instances',[]))
        sol  = alert.get('solution','')[:100].replace('<','&lt;').replace('>','&gt;')
        rows.append(
            f'<tr><td><span class="badge {risk_classes[rc]}">{risk_labels[rc]}</span></td>'
            f'<td>{name}</td>'
            f'<td><span class="badge b-info">CWE-{cwe}</span></td>'
            f'<td style="color:#8b949e;font-size:.82rem">{desc}</td>'
            f'<td style="color:#8b949e;font-size:.82rem">{sol}</td>'
            f'<td style="color:#8b949e">{inst}</td></tr>'
        )
    if rows:
        ALERTS_ROWS = ''.join(rows)

if HIGH > 0:
    STATUS_BADGE = f'HIGH {HIGH}'
    STATUS_COLOR = '#3a1a1a;color:#f85149;border:1px solid #f85149'
elif MEDIUM > 0:
    STATUS_BADGE = f'MEDIUM {MEDIUM}'
    STATUS_COLOR = '#3a2a1a;color:#f0883e;border:1px solid #f0883e'
else:
    STATUS_BADGE = 'SIN CRITICOS'
    STATUS_COLOR = '#1a3a2a;color:#3fb950;border:1px solid #3fb950'

FECHA = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')

report_path = 'docs/reports/zap/report.html'
with open(report_path) as f:
    content = f.read()

content = content.replace('{{HIGH}}', str(HIGH))
content = content.replace('{{MEDIUM}}', str(MEDIUM))
content = content.replace('{{LOW}}', str(LOW))
content = content.replace('{{INFO}}', str(INFO))
content = content.replace('{{TOTAL}}', str(TOTAL))
content = content.replace('{{FECHA}}', FECHA)
content = content.replace('{{STATUS_BADGE}}', STATUS_BADGE)
content = content.replace('{{STATUS_COLOR}}', STATUS_COLOR)
content = content.replace('{{ALERTS_ROWS}}', ALERTS_ROWS)

with open(report_path, 'w') as f:
    f.write(content)

print(f'Reporte generado: HIGH={HIGH} MEDIUM={MEDIUM} LOW={LOW} INFO={INFO}')