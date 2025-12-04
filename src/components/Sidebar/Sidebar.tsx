import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UAMLogo } from '../UAMLogo/UAMLogo';
import './Sidebar.css';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState<{
    lineaEstrategica: boolean;
    poa: boolean;
    carreraArea: boolean;
  }>({
    lineaEstrategica: false,
    poa: false,
    carreraArea: false,
  });

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Auto-expand sections based on current route (only for admin)
  useEffect(() => {
    if (user?.rol !== 'Administrador') {
      return;
    }
    const path = location.pathname;
    setExpandedSections({
      lineaEstrategica: path === '/linea' || path === '/objetivos' || path === '/indicadores',
      poa: path === '/create-poa' || path === '/poas' || path.startsWith('/edit-poa/') || path === '/cargar-evidencias',
      carreraArea: path === '/area' || path === '/carrera' || path === '/facultades',
    });
  }, [location.pathname, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSection = (section: 'lineaEstrategica' | 'poa' | 'carreraArea') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isActive = (path: string) => location.pathname === path;
  const isAdmin = user?.rol === 'Administrador';
  const isUsuario = user?.rol === 'Usuario';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <UAMLogo />
        <h2>Calidad UAM</h2>
      </div>
      
      <nav className="sidebar-nav">
        {isUsuario && (
          <>
            <button
              className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`nav-item ${isActive('/user-poas') || location.pathname.startsWith('/user-poas/') ? 'active' : ''}`}
              onClick={() => navigate('/user-poas')}
            >
              POAs
            </button>
          </>
        )}

        {isAdmin && (
          <>
            <button
              className={`nav-item ${isActive('/home') ? 'active' : ''}`}
              onClick={() => navigate('/home')}
            >
              Home
            </button>

        <div className="nav-section">
          <button
            className="nav-section-header"
            onClick={() => toggleSection('lineaEstrategica')}
          >
            <span>LINEA ESTRATEGICA</span>
            <span className="arrow">{expandedSections.lineaEstrategica ? '▼' : '▶'}</span>
          </button>
          {expandedSections.lineaEstrategica && (
            <div className="nav-subsection">
              <button
                className={`nav-item ${isActive('/linea') ? 'active' : ''}`}
                onClick={() => navigate('/linea')}
              >
                Linea
              </button>
              <button
                className={`nav-item ${isActive('/objetivos') ? 'active' : ''}`}
                onClick={() => navigate('/objetivos')}
              >
                Objetivos
              </button>
              <button
                className={`nav-item ${isActive('/indicadores') ? 'active' : ''}`}
                onClick={() => navigate('/indicadores')}
              >
                Indicadores
              </button>
            </div>
          )}
        </div>

        <div className="nav-section">
          <button
            className="nav-section-header"
            onClick={() => toggleSection('poa')}
          >
            <span>POA</span>
            <span className="arrow">{expandedSections.poa ? '▼' : '▶'}</span>
          </button>
          {expandedSections.poa && (
            <div className="nav-subsection">
              <button
                className={`nav-item ${isActive('/create-poa') ? 'active' : ''}`}
                onClick={() => navigate('/create-poa')}
              >
                Crear POA
              </button>
              <button
                className={`nav-item ${isActive('/poas') ? 'active' : ''}`}
                onClick={() => navigate('/poas')}
              >
                Lista de POAs
              </button>
              <button
                className={`nav-item ${isActive('/cargar-evidencias') ? 'active' : ''}`}
                onClick={() => navigate('/cargar-evidencias')}
              >
                Cargar Evidencias
              </button>
            </div>
          )}
        </div>

        <div className="nav-section">
          <button
            className="nav-section-header"
            onClick={() => toggleSection('carreraArea')}
          >
            <span>AREA/CARRERA</span>
            <span className="arrow">{expandedSections.carreraArea ? '▼' : '▶'}</span>
          </button>
          {expandedSections.carreraArea && (
            <div className="nav-subsection">
              <button
                className={`nav-item ${isActive('/area') ? 'active' : ''}`}
                onClick={() => navigate('/area')}
              >
                Area
              </button>
              <button
                className={`nav-item ${isActive('/carrera') ? 'active' : ''}`}
                onClick={() => navigate('/carrera')}
              >
                Carrera
              </button>
            </div>
          )}
        </div>

            <button
              className={`nav-item ${isActive('/users') ? 'active' : ''}`}
              onClick={() => navigate('/users')}
            >
              Usuarios
            </button>
          </>
        )}

        <button className="nav-item logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </aside>
  );
};

