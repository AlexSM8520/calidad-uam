import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import { authViewModel } from '../../viewmodels/AuthViewModel';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import { objetivoViewModel } from '../../viewmodels/ObjetivoViewModel';
import { indicadorViewModel } from '../../viewmodels/IndicadorViewModel';
import type { POA } from '../../models/POA';
import './UserPOAs.css';

export const UserPOAs = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [poas, setPoas] = useState<POA[]>([]);
  const [selectedPOA, setSelectedPOA] = useState<POA | undefined>(undefined);

  useEffect(() => {
    const user = authViewModel.getAuthState().user;
    const unsubscribe = poaViewModel.subscribe(() => {
      const allPOAs = poaViewModel.getPOAs();
      // Filter POAs based on user's carrera or area
      let filteredPOAs = allPOAs;
      if (user && user.rol === 'Usuario') {
        filteredPOAs = allPOAs.filter(poa => {
          if (user.carreraId && poa.tipo === 'carrera') {
            return poa.carreraId === user.carreraId;
          }
          if (user.areaId && poa.tipo === 'area') {
            return poa.areaId === user.areaId;
          }
          return false;
        });
      }
      setPoas(filteredPOAs);
      if (id) {
        const poa = filteredPOAs.find(p => p.id === id);
        setSelectedPOA(poa);
      }
    });
    return unsubscribe;
  }, [id]);

  const getEntityName = (poa: POA) => {
    if (poa.tipo === 'area' && poa.areaId) {
      const area = poaViewModel.getAreas().find(a => a.id === poa.areaId);
      return area?.nombre || 'N/A';
    }
    if (poa.tipo === 'carrera' && poa.carreraId) {
      const carrera = poaViewModel.getCarreras().find(c => c.id === poa.carreraId);
      return carrera?.nombre || 'N/A';
    }
    return 'N/A';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getLineaNombre = (lineaId: string) => {
    const linea = lineaViewModel.getLineas().find(l => l.id === lineaId);
    return linea?.nombre || 'N/A';
  };

  const getObjetivoNombre = (objetivoId: string) => {
    const objetivo = objetivoViewModel.getObjetivos().find(o => o.id === objetivoId);
    return objetivo?.nombre || 'N/A';
  };

  const getIndicadorNombre = (indicadorId: string) => {
    const indicador = indicadorViewModel.getIndicadores().find(i => i.id === indicadorId);
    return indicador?.nombre || 'N/A';
  };

  if (id && selectedPOA) {
    return (
      <div className="user-poa-detail-container">
        <div className="poa-detail-header">
          <button className="btn-back" onClick={() => navigate('/user-poas')}>
            ← Volver
          </button>
          <h1>Detalle del POA</h1>
        </div>

        <div className="poa-detail-card">
          <div className="poa-detail-info">
            <div className="info-row">
              <span className="info-label">Tipo:</span>
              <span className="info-value">{selectedPOA.tipo === 'area' ? 'Área' : 'Carrera'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">{selectedPOA.tipo === 'area' ? 'Área' : 'Carrera'}:</span>
              <span className="info-value">{getEntityName(selectedPOA)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Período:</span>
              <span className="info-value">{selectedPOA.periodo}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Fecha Inicio:</span>
              <span className="info-value">{formatDate(selectedPOA.fechaInicio)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Fecha Fin:</span>
              <span className="info-value">{formatDate(selectedPOA.fechaFin)}</span>
            </div>
          </div>

          <div className="actividades-section">
            <h2>Actividades ({selectedPOA.actividades.length})</h2>
            {selectedPOA.actividades.length === 0 ? (
              <div className="empty-state">
                <p>No hay actividades registradas.</p>
              </div>
            ) : (
              <div className="actividades-list">
                {selectedPOA.actividades.map((actividad) => (
                  <div key={actividad.id} className="actividad-card">
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
                      <div className="detail-item">
                        <span className="detail-label">Responsable:</span>
                        <span className="detail-value">{actividad.responsable}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Frecuencia:</span>
                        <span className="detail-value">{actividad.frecuencia}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Fechas:</span>
                        <span className="detail-value">
                          {formatDate(actividad.fechaInicio)} - {formatDate(actividad.fechaFin)}
                        </span>
                      </div>
                      {actividad.lineaId && (
                        <div className="detail-item">
                          <span className="detail-label">Línea Estratégica:</span>
                          <span className="detail-value">{getLineaNombre(actividad.lineaId)}</span>
                        </div>
                      )}
                      {actividad.objetivoId && (
                        <div className="detail-item">
                          <span className="detail-label">Objetivo:</span>
                          <span className="detail-value">{getObjetivoNombre(actividad.objetivoId)}</span>
                        </div>
                      )}
                      {actividad.indicadorId && (
                        <div className="detail-item">
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
  }

  return (
    <div className="user-poas-container">
      <div className="user-poas-header">
        <h1>POAs</h1>
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
      </div>

      {poas.length === 0 ? (
        <div className="empty-state">
          <p>No hay POAs disponibles.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="user-poas-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Área/Carrera</th>
                <th>Período</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Actividades</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {poas.map((poa) => (
                <tr key={poa.id}>
                  <td>{poa.tipo === 'area' ? 'Área' : 'Carrera'}</td>
                  <td>{getEntityName(poa)}</td>
                  <td>{poa.periodo}</td>
                  <td>{formatDate(poa.fechaInicio)}</td>
                  <td>{formatDate(poa.fechaFin)}</td>
                  <td>{poa.actividades.length}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/user-poas/${poa.id}`)}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

