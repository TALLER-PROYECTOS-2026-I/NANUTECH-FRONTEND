import { Contrato } from '../types';

const AlertaVencimiento = (
  { contrato }: { contrato: Contrato }
) => {
  const mostrarAlerta = contrato.diasVencimiento <= 7 && contrato.diasVencimiento > 0;

  if (!mostrarAlerta) {
    return null;
  }

  return (
    <div className="alerta-vencimiento">
      <div className="alerta-vencimiento-icon">⚠️</div>
      <div className="alerta-vencimiento-content">
        <h4>Contrato próximo a expirar</h4>
        <p>Este contrato expirará en {contrato.diasVencimiento} día(s) ({contrato.fechaFin})</p>
      </div>
    </div>
  );
};

export default AlertaVencimiento;
