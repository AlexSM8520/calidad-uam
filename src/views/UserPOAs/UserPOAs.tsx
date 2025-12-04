import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import { useAuthStore } from '../../stores/authStore';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import { objetivoViewModel } from '../../viewmodels/ObjetivoViewModel';
import { indicadorViewModel } from '../../viewmodels/IndicadorViewModel';
import type { POA } from '../../models/POA';
import { extractId } from '../../utils/modelHelpers';
import './UserPOAs.css';

export const UserPOAs = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const user = useAuthStore((state) => state.user);
  const [poas, setPoas] = useState<POA[]>([]);
  const [selectedPOA, setSelectedPOA] = useState<POA | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = poaViewModel.subscribe(() => {
      const allPOAs = poaViewModel.getPOAs();
      // Filter POAs based on user's carrera or area
      let filteredPOAs = allPOAs;
      if (user && user.rol === 'Usuario') {
        filteredPOAs = allPOAs.filter(poa => {
          if (user.carreraId && poa.tipo === 'carrera') {
            const poaCarreraId = typeof poa.carreraId === 'string' ? poa.carreraId : extractId(poa.carreraId);
            return poaCarreraId === user.carreraId;
          }
          if (user.areaId && poa.tipo === 'area') {
            const poaAreaId = typeof poa.areaId === 'string' ? poa.areaId : extractId(poa.areaId);
            return poaAreaId === user.areaId;
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
  }, [id, user]);

  const getEntityName = (poa: POA) => {
    if (poa.tipo === 'area' && poa.areaId) {
      // If areaId is an object with nombre property
      if (typeof poa.areaId === 'object' && 'nombre' in poa.areaId) {
        return poa.areaId.nombre;
      }
      // If areaId is a string, find it in the areas list
      const areaIdStr = typeof poa.areaId === 'string' ? poa.areaId : extractId(poa.areaId);
      const area = poaViewModel.getAreas().find(a => extractId(a) === areaIdStr);
      return area?.nombre || 'N/A';
    }
    if (poa.tipo === 'carrera' && poa.carreraId) {
      // If carreraId is an object with nombre property
      if (typeof poa.carreraId === 'object' && 'nombre' in poa.carreraId) {
        return poa.carreraId.nombre;
      }
      // If carreraId is a string, find it in the carreras list
      const carreraIdStr = typeof poa.carreraId === 'string' ? poa.carreraId : extractId(poa.carreraId);
      const carrera = poaViewModel.getCarreras().find(c => extractId(c) === carreraIdStr);
      return carrera?.nombre || 'N/A';
    }
    return 'N/A';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getLineaNombre = (lineaId: string | { _id?: string; nombre?: string }): string => {
    const id = extractId(lineaId);
    const linea = lineaViewModel.getLineas().find(l => extractId(l) === id);
    return linea?.nombre || 'N/A';
  };

  const getObjetivoNombre = (objetivoId: string | { _id?: string; nombre?: string }): string => {
    const id = extractId(objetivoId);
    const objetivo = objetivoViewModel.getAllObjetivos().find(o => extractId(o) === id);
    return objetivo ? `${objetivo.codigoReferencia} - ${objetivo.nombre}` : 'N/A';
  };

  const getIndicadorNombre = (indicadorId: string | { _id?: string; nombre?: string }): string => {
    const id = extractId(indicadorId);
    const indicador = indicadorViewModel.getAllIndicadores().find(i => extractId(i) === id);
    return indicador ? `${indicador.codigo} - ${indicador.nombre}` : 'N/A';
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

