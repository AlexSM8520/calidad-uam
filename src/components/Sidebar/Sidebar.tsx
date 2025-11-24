import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authViewModel } from '../../viewmodels/AuthViewModel';
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

  // Auto-expand sections based on current route
  useEffect(() => {
    const path = location.pathname;
    setExpandedSections({
      lineaEstrategica: path === '/linea' || path === '/objetivos' || path === '/indicadores',
      poa: path === '/create-poa' || path === '/poas' || path.startsWith('/edit-poa/'),
      carreraArea: path === '/area' || path === '/carrera' || path === '/facultades',
    });
  }, [location.pathname]);

  const handleLogout = () => {
    authViewModel.logout();
    navigate('/login');
  };

  const toggleSection = (section: 'lineaEstrategica' | 'poa' | 'carreraArea') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <UAMLogo />
        <h2>Calidad UAM</h2>
      </div>
      
      <nav className="sidebar-nav">
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
              <button
                className={`nav-item ${isActive('/facultades') ? 'active' : ''}`}
                onClick={() => navigate('/facultades')}
              >
                Facultades
              </button>
            </div>
          )}
        </div>

        <button className="nav-item logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </aside>
  );
};

