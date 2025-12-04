import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import { objetivoViewModel } from '../../viewmodels/ObjetivoViewModel';
import { indicadorViewModel } from '../../viewmodels/IndicadorViewModel';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import type { Linea } from '../../models/Linea';
import type { Actividad } from '../../models/POA';
import { extractId } from '../../utils/modelHelpers';
import './Home.css';

export const Home = () => {
  const navigate = useNavigate();
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [objetivos, setObjetivos] = useState<any[]>([]);
  const [indicadores, setIndicadores] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeLinea = lineaViewModel.subscribe(() => {
      setLineas(lineaViewModel.getLineas());
    });

    const unsubscribeObjetivo = objetivoViewModel.subscribe(() => {
      setObjetivos(objetivoViewModel.getAllObjetivos());
    });

    const unsubscribeIndicador = indicadorViewModel.subscribe(() => {
      setIndicadores(indicadorViewModel.getAllIndicadores());
    });

    const unsubscribePOA = poaViewModel.subscribe(() => {
      const allPOAs = poaViewModel.getPOAs();
      const allActividades: Actividad[] = [];
      allPOAs.forEach(poa => {
        if (poa.actividades && poa.actividades.length > 0) {
          allActividades.push(...poa.actividades);
        }
      });
      setActividades(allActividades);
    });

    return () => {
      unsubscribeLinea();
      unsubscribeObjetivo();
      unsubscribeIndicador();
      unsubscribePOA();
    };
  }, []);

  const getLineaNombre = (lineaId: string | { _id?: string; nombre?: string }): string => {
    const id = extractId(lineaId);
    const linea = lineas.find(l => extractId(l) === id);
    return linea?.nombre || 'N/A';
  };

  const getObjetivoNombre = (objetivoId: string | { _id?: string; nombre?: string }): string => {
    const id = extractId(objetivoId);
    const objetivo = objetivos.find(o => extractId(o) === id);
    return objetivo ? `${objetivo.codigoReferencia} - ${objetivo.nombre}` : 'N/A';
  };

  const getIndicadorNombre = (indicadorId: string | { _id?: string; nombre?: string }): string => {
    const id = extractId(indicadorId);
    const indicador = indicadores.find(i => extractId(i) === id);
    return indicador ? `${indicador.codigo} - ${indicador.nombre}` : 'N/A';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Statistics
  const totalLineas = lineas.length;
  const totalObjetivos = objetivos.length;
  const totalIndicadores = indicadores.length;
  const totalActividades = actividades.length;
  
  const actividadesPorEstado = {
    Pendiente: actividades.filter(a => a.estado === 'Pendiente').length,
    'En Progreso': actividades.filter(a => a.estado === 'En Progreso').length,
    Completada: actividades.filter(a => a.estado === 'Completada').length,
    Cancelada: actividades.filter(a => a.estado === 'Cancelada').length,
  };

  // Get recent activities (last 10)
  const recentActividades = [...actividades]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Dashboard</h1>
        <p className="welcome-text">Vista general del sistema de gestión de calidad</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#0099a8' }}>
            📊
          </div>
          <div className="stat-content">
            <h3>{totalLineas}</h3>
            <p>Líneas Estratégicas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#6dc700' }}>
            🎯
          </div>
          <div className="stat-content">
            <h3>{totalObjetivos}</h3>
            <p>Objetivos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#646cff' }}>
            📈
          </div>
          <div className="stat-content">
            <h3>{totalIndicadores}</h3>
            <p>Indicadores</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ff6b6b' }}>
            ✅
          </div>
          <div className="stat-content">
            <h3>{totalActividades}</h3>
            <p>Actividades</p>
          </div>
        </div>
      </div>

      {/* Activities Status */}
      <div className="activities-status-section">
        <h2>Estado de Actividades</h2>
        <div className="status-grid">
          <div className="status-card status-pendiente">
            <h3>{actividadesPorEstado.Pendiente}</h3>
            <p>Pendientes</p>
          </div>
          <div className="status-card status-progreso">
            <h3>{actividadesPorEstado['En Progreso']}</h3>
            <p>En Progreso</p>
          </div>
          <div className="status-card status-completada">
            <h3>{actividadesPorEstado.Completada}</h3>
            <p>Completadas</p>
          </div>
          <div className="status-card status-cancelada">
            <h3>{actividadesPorEstado.Cancelada}</h3>
            <p>Canceladas</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Líneas Estratégicas */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Líneas Estratégicas</h2>
            <button className="btn-view-all" onClick={() => navigate('/linea')}>
              Ver Todas
            </button>
          </div>
          {lineas.length === 0 ? (
            <div className="empty-state">
              <p>No hay líneas estratégicas registradas.</p>
            </div>
          ) : (
            <div className="lineas-grid">
              {lineas.slice(0, 6).map((linea) => (
                <div key={extractId(linea)} className="linea-card">
                  <div className="linea-header" style={{ borderLeftColor: linea.color }}>
                    <h3>{linea.nombre}</h3>
                    <span className="plan-badge">{linea.plan}</span>
                  </div>
                  <p className="linea-descripcion">{linea.descripcion}</p>
                  <div className="linea-details">
                    <div className="detail-item">
                      <span className="detail-label">Duración:</span>
                      <span className="detail-value">{linea.duracion} meses</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Fechas:</span>
                      <span className="detail-value">
                        {formatDate(linea.fechaInicio)} - {formatDate(linea.fechaFin)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Objetivos:</span>
                      <span className="detail-value">
                        {objetivos.filter(o => extractId(o.lineaId) === extractId(linea)).length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actividades Recientes */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Actividades Recientes</h2>
            <button className="btn-view-all" onClick={() => navigate('/poas')}>
              Ver Todas
            </button>
          </div>
          {actividades.length === 0 ? (
            <div className="empty-state">
              <p>No hay actividades registradas.</p>
            </div>
          ) : (
            <div className="actividades-list">
              {recentActividades.map((actividad) => (
                <div key={extractId(actividad)} className="actividad-item">
                  <div className="actividad-header">
                    <h3>{actividad.nombre}</h3>
                    <span className={`estado-badge estado-${actividad.estado.toLowerCase().replace(' ', '-')}`}>
                      {actividad.estado}
                    </span>
                  </div>
                  {actividad.descripcion && (
                    <p className="actividad-descripcion">{actividad.descripcion}</p>
                  )}
                  <div className="actividad-details">
                    <div className="detail-row">
                      <span className="detail-label">Responsable:</span>
                      <span className="detail-value">{actividad.responsable}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Frecuencia:</span>
                      <span className="detail-value">{actividad.frecuencia}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Fechas:</span>
                      <span className="detail-value">
                        {formatDate(actividad.fechaInicio)} - {formatDate(actividad.fechaFin)}
                      </span>
                    </div>
                    {actividad.lineaId && (
                      <div className="detail-row">
                        <span className="detail-label">Línea:</span>
                        <span className="detail-value">{getLineaNombre(actividad.lineaId)}</span>
                      </div>
                    )}
                    {actividad.objetivoId && (
                      <div className="detail-row">
                        <span className="detail-label">Objetivo:</span>
                        <span className="detail-value">{getObjetivoNombre(actividad.objetivoId)}</span>
                      </div>
                    )}
                    {actividad.indicadorId && (
                      <div className="detail-row">
                        <span className="detail-label">Indicador:</span>
                        <span className="detail-value">{getIndicadorNombre(actividad.indicadorId)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

