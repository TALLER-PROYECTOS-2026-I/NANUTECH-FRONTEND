import React, { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Componente Layout
 * Estructura principal con Sidebar + Contenido
 */
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <main className="ml-[280px] flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};
