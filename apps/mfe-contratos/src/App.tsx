import { useState } from 'react';
import ContratosPage from './modules/contratos/pages/ContratosPage';
import RegistroContratoPage from './modules/registro-contrato/pages/RegistroContratoPage';
import './App.css';

export default function App() {
  const [view, setView] = useState<'contratos' | 'registro'>('contratos');

  if (view === 'registro') {
    return <RegistroContratoPage onBack={() => setView('contratos')} />;
  }

  return <ContratosPage onNuevoContrato={() => setView('registro')} />;
}