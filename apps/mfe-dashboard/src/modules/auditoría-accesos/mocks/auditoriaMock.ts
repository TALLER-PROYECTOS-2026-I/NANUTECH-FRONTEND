import type { AuditLogItem } from '@nanutech/api-client';

const getTodayDateString = () => {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const todayStr = getTodayDateString();

export const auditoriaMock: AuditLogItem[] = [
  {
    id: 'AUDIT-177542',
    usuario: 'Carlos Administrador',
    email: 'admin@nanutech.com',
    rol: 'Administrador',
    fecha: todayStr,
    hora: '17:01:00',
    ip: '190.237.123.52',
    navegador: 'Chrome - Windows'
  },
  {
    id: 'AUDIT-177541',
    usuario: 'Juan Chofer',
    email: 'juan.chofer@nanutech.com',
    rol: 'Conductor',
    fecha: todayStr,
    hora: '16:45:12',
    ip: '190.237.123.52',
    navegador: 'Firefox - Android'
  },
  {
    id: 'AUDIT-177540',
    usuario: 'Pedro Gerente',
    email: 'pedro.gerente@nanutech.com',
    rol: 'Gerente',
    fecha: todayStr,
    hora: '15:30:22',
    ip: '190.237.123.52',
    navegador: 'Safari - macOS'
  },
  {
    id: 'AUDIT-177539',
    usuario: 'Luis Chofer',
    email: 'luis.chofer@nanutech.com',
    rol: 'Conductor',
    fecha: todayStr,
    hora: '14:20:05',
    ip: '190.237.123.52',
    navegador: 'Chrome - Android'
  },
  {
    id: 'AUDIT-177538',
    usuario: 'Jorge Chofer',
    email: 'jorge.chofer@nanutech.com',
    rol: 'Conductor',
    fecha: todayStr,
    hora: '11:15:30',
    ip: '190.237.123.52',
    navegador: 'Edge - Windows'
  },
  {
    id: 'AUDIT-177537',
    usuario: 'Carlos Administrador',
    email: 'admin@nanutech.com',
    rol: 'Administrador',
    fecha: todayStr,
    hora: '09:10:44',
    ip: '190.237.123.52',
    navegador: 'Chrome - Windows'
  },
  {
    id: 'AUDIT-177536',
    usuario: 'Juan Chofer',
    email: 'juan.chofer@nanutech.com',
    rol: 'Conductor',
    fecha: todayStr,
    hora: '07:05:19',
    ip: '190.237.123.52',
    navegador: 'Safari - iOS'
  }
];
