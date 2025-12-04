import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import type { POA } from '../../models/POA';
import { extractId } from '../../utils/modelHelpers';
import './POAs.css';

export const POAs = () => {
  const navigate = useNavigate();
  const [poas, setPOAs] = useState<POA[]>([]);

  useEffect(() => {
    const unsubscribe = poaViewModel.subscribe(() => {
      setPOAs(poaViewModel.getPOAs());
    });
    return unsubscribe;
  }, []);

  const handleEdit = (poaId: string) => {
    navigate(`/edit-poa/${poaId}`);
  };

  const getTipoNombre = (tipo: POA['tipo']) => {
    return tipo === 'area' ? 'Área' : 'Carrera';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAreaNombre = (areaId: POA['areaId']): string => {
    if (!areaId) return 'N/A';
    // If areaId is an object with nombre property
    if (typeof areaId === 'object' && 'nombre' in areaId) {
      return areaId.nombre;
    }
    // If areaId is a string, find it in the areas list
    const areaIdStr = typeof areaId === 'string' ? areaId : extractId(areaId);
    const area = poaViewModel.getAreas().find(a => extractId(a) === areaIdStr);
    return area?.nombre || 'N/A';
  };

  const getCarreraNombre = (carreraId: POA['carreraId']): string => {
    if (!carreraId) return 'N/A';
    // If carreraId is an object with nombre property
    if (typeof carreraId === 'object' && 'nombre' in carreraId) {
      return carreraId.nombre;
    }
    // If carreraId is a string, find it in the carreras list
    const carreraIdStr = typeof carreraId === 'string' ? carreraId : extractId(carreraId);
    const carrera = poaViewModel.getCarreras().find(c => extractId(c) === carreraIdStr);
    return carrera?.nombre || 'N/A';
  };

  return (
    <div className="poas-container">
      <div className="poas-header">
        <h1>POAs</h1>
        <button className="btn-create" onClick={() => navigate('/create-poa')}>
          Crear POA
        </button>
      </div>

      {poas.length === 0 ? (
        <div className="empty-state">
          <p>No hay POAs creados. Haga clic en "Crear POA" para comenzar.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="poas-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Área/Carrera</th>
                <th>Período</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Actividades</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {poas.map((poa) => (
                <tr key={poa.id}>
                  <td>
                    <span className="tipo-badge">{getTipoNombre(poa.tipo)}</span>
                  </td>
                  <td className="nombre-cell">
                    {poa.tipo === 'area'
                      ? getAreaNombre(poa.areaId)
                      : getCarreraNombre(poa.carreraId)}
                  </td>
                  <td>{poa.periodo}</td>
                  <td>{formatDate(poa.fechaInicio)}</td>
                  <td>{formatDate(poa.fechaFin)}</td>
                  <td>
                    <span className="actividades-count">
                      {poa.actividades.length} actividad{poa.actividades.length !== 1 ? 'es' : ''}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => {
                        const poaId = extractId(poa);
                        if (poaId) handleEdit(poaId);
                      }}
                    >
                      Editar
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

