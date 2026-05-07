import { DetalleContratoPage, mockContratos, mockCamionesAsignados, mockHistorialCambios } from './index';

const DetalleContratoExample = () => {
  // Obtener el contrato (en este caso el primero del mock)
  const contrato = mockContratos[0];

  const handleVolver = () => {
    // Navegar de vuelta a la lista de contratos
    console.log('Volviendo a la lista de contratos');
  };

  return (
    <DetalleContratoPage
      contrato={contrato}
      camionesAsignados={mockCamionesAsignados}
      cambiosHistorial={mockHistorialCambios}
      onVolver={handleVolver}
    />
  );
};

export default DetalleContratoExample;
