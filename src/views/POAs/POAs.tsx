import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import type { POA } from '../../models/POA';
import { extractId } from '../../utils/modelHelpers';
import './POAs.css';

export const POAs = () => {
  const navigate = useNavigate();
  const [poas, setPOAs] = useState<POA[]>([]);
  const [filterCarrera, setFilterCarrera] = useState<string>('');
  const [filterArea, setFilterArea] = useState<string>('');
  const [filterEstado, setFilterEstado] = useState<string>('');

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

  const getPOAEstado = (poa: POA): 'activo' | 'pendiente' | 'finalizado' => {
    const hoy = new Date();
    const inicio = new Date(poa.fechaInicio);
    const fin = new Date(poa.fechaFin);
    
    if (hoy < inicio) return 'pendiente';
    if (hoy > fin) return 'finalizado';
    return 'activo';
  };

  // Get unique carreras and areas from POAs
  const carreras = Array.from(
    new Set(
      poas
        .filter(poa => poa.tipo === 'carrera' && poa.carreraId)
        .map(poa => {
          if (typeof poa.carreraId === 'object' && 'nombre' in poa.carreraId) {
            return extractId(poa.carreraId);
          }
          return typeof poa.carreraId === 'string' ? poa.carreraId : extractId(poa.carreraId);
        })
    )
  )
    .map(id => {
      const carrera = poaViewModel.getCarreras().find(c => extractId(c) === id);
      return { id, nombre: carrera?.nombre || 'N/A' };
    })
    .filter(c => c.nombre !== 'N/A');

  const areas = Array.from(
    new Set(
      poas
        .filter(poa => poa.tipo === 'area' && poa.areaId)
        .map(poa => {
          if (typeof poa.areaId === 'object' && 'nombre' in poa.areaId) {
            return extractId(poa.areaId);
          }
          return typeof poa.areaId === 'string' ? poa.areaId : extractId(poa.areaId);
        })
    )
  )
    .map(id => {
      const area = poaViewModel.getAreas().find(a => extractId(a) === id);
      return { id, nombre: area?.nombre || 'N/A' };
    })
    .filter(a => a.nombre !== 'N/A');

  // Filter POAs
  const filteredPOAs = poas.filter(poa => {
    // Filter by Carrera
    if (filterCarrera && poa.tipo === 'carrera') {
      const carreraId = typeof poa.carreraId === 'object' ? extractId(poa.carreraId) : poa.carreraId;
      if (carreraId !== filterCarrera) return false;
    } else if (filterCarrera && poa.tipo === 'area') {
      return false; // If filtering by carrera, exclude area POAs
    }

    // Filter by Area
    if (filterArea && poa.tipo === 'area') {
      const areaId = typeof poa.areaId === 'object' ? extractId(poa.areaId) : poa.areaId;
      if (areaId !== filterArea) return false;
    } else if (filterArea && poa.tipo === 'carrera') {
      return false; // If filtering by area, exclude carrera POAs
    }

    // Filter by Estado
    if (filterEstado) {
      const estado = getPOAEstado(poa);
      if (estado !== filterEstado) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setFilterCarrera('');
    setFilterArea('');
    setFilterEstado('');
  };

  return (
    <div className="poas-container">
      <div className="poas-header">
        <h1>POAs</h1>
        <button className="btn-create" onClick={() => navigate('/create-poa')}>
          Crear POA
        </button>
      </div>

      {/* Filters */}
      {poas.length > 0 && (
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="carrera-filter">Filtrar por Carrera:</label>
            <select
              id="carrera-filter"
              value={filterCarrera}
              onChange={(e) => {
                setFilterCarrera(e.target.value);
                setFilterArea(''); // Clear area filter when selecting carrera
              }}
              className="filter-select"
            >
              <option value="">Todas las carreras</option>
              {carreras.map((carrera) => (
                <option key={carrera.id} value={carrera.id}>
                  {carrera.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="area-filter">Filtrar por Área:</label>
            <select
              id="area-filter"
              value={filterArea}
              onChange={(e) => {
                setFilterArea(e.target.value);
                setFilterCarrera(''); // Clear carrera filter when selecting area
              }}
              className="filter-select"
            >
              <option value="">Todas las áreas</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="estado-filter">Filtrar por Estado:</label>
            <select
              id="estado-filter"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="pendiente">Pendiente</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          {(filterCarrera || filterArea || filterEstado) && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              Limpiar Filtros
            </button>
          )}
        </div>
      )}

      {poas.length === 0 ? (
        <div className="empty-state">
          <p>No hay POAs creados. Haga clic en "Crear POA" para comenzar.</p>
        </div>
      ) : filteredPOAs.length === 0 ? (
        <div className="empty-state">
          <p>No hay POAs que coincidan con los filtros seleccionados.</p>
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
                <th>Estado</th>
                <th>Actividades</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOAs.map((poa) => {
                const estado = getPOAEstado(poa);
                return (
                  <tr key={extractId(poa)}>
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
                      <span className={`estado-badge estado-${estado}`}>
                        {estado === 'activo' ? 'Activo' : estado === 'pendiente' ? 'Pendiente' : 'Finalizado'}
                      </span>
                    </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

