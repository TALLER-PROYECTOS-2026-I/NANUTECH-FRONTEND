import React from 'react';
import '../styles/Sidebar.css';

/**
 * Componente Sidebar
 * Panel de navegación lateral con menú y información del conductor
 */
export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-badge">cb</div>
        <div className="sidebar__logo-text">
          <div className="sidebar__logo-brand">NANU TECH</div>
          <div className="sidebar__logo-subtitle">Gestión de Flota</div>
        </div>
      </div>

      {/* Menú Principal */}
      <nav className="sidebar__nav">
        <a href="#dashboard" className="sidebar__nav-item sidebar__nav-item--active">
          <span className="sidebar__nav-icon">📊</span>
          <span className="sidebar__nav-text">Mi Dashboard</span>
        </a>
        <a href="#historial" className="sidebar__nav-item">
          <span className="sidebar__nav-icon">📋</span>
          <span className="sidebar__nav-text">Historial de Jornadas</span>
        </a>
        <a href="#licencia" className="sidebar__nav-item">
          <span className="sidebar__nav-icon">📄</span>
          <span className="sidebar__nav-text">Mi Licencia</span>
        </a>
      </nav>

      {/* Separador */}
      <div className="sidebar__separator"></div>

      {/* Sesión Activa */}
      <div className="sidebar__session">
        <div className="sidebar__session-label">Sesión activa</div>
        <div className="sidebar__session-time">1h 59m</div>
      </div>

      {/* Perfil del Usuario */}
      <div className="sidebar__profile">
        <div className="sidebar__profile-avatar">JP</div>
        <div className="sidebar__profile-info">
          <div className="sidebar__profile-name">Juan Pérez</div>
          <div className="sidebar__profile-role">Conductor</div>
        </div>
        <button className="sidebar__profile-menu" aria-label="Más opciones">
          ⋮
        </button>
      </div>
    </aside>
  );
};
