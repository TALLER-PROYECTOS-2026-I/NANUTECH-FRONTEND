import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import '../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Componente Layout
 * Estructura principal con Sidebar + Contenido
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="layout__main">
        {children}
      </main>
    </div>
  );
};
