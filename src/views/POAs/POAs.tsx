import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import type { POA } from '../../models/POA';
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
                      ? poaViewModel.getAreas().find(a => a.id === poa.areaId)?.nombre || 'N/A'
                      : poaViewModel.getCarreras().find(c => c.id === poa.carreraId)?.nombre || 'N/A'}
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
                      onClick={() => handleEdit(poa.id)}
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

