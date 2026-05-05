import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Contratos</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
