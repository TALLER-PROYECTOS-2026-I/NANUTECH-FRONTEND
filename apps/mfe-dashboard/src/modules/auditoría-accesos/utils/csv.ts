import type { AuditLogItem } from '@nanutech/api-client';

export function exportarAuditoriaCsv(items: AuditLogItem[]) {
  const headers = ['ID Registro', 'Usuario', 'Email', 'Rol', 'Fecha', 'Hora', 'Direccion IP', 'Navegador/SO'];
  const rows = items.map(item => [
    item.id,
    item.usuario,
    item.email,
    item.rol,
    item.fecha,
    item.hora,
    item.ip,
    item.navegador
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(value => `"${value}"`).join(','))
  ].join('\n');

  // Add BOM for Excel compatibility in UTF-8
  const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `auditoria_accesos_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
