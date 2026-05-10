import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom' //Importamos el enrutador

// Debug: mostrar la URL base de la API cargada por Vite
console.log('VITE_API_URL=', import.meta.env.VITE_API_URL);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/*Envolvemos la App */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)