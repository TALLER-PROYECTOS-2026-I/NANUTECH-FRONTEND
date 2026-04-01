import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom' //Importamos el enrutador

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/*Envolvemos la App */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)