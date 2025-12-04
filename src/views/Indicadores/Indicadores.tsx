import { useEffect, useState } from 'react';
import { indicadorViewModel } from '../../viewmodels/IndicadorViewModel';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import { objetivoViewModel } from '../../viewmodels/ObjetivoViewModel';
import { extractId } from '../../utils/modelHelpers';
import type { Indicador as IndicadorType } from '../../models/Indicador';
import type { Linea as LineaType } from '../../models/Linea';
import type { Objetivo as ObjetivoType } from '../../models/Objetivo';
import { IndicadorForm } from '../../components/IndicadorForm/IndicadorForm';
import './Indicadores.css';

export const Indicadores = () => {
  const [indicadores, setIndicadores] = useState<IndicadorType[]>([]);
  const [lineas, setLineas] = useState<LineaType[]>([]);
  const [objetivos, setObjetivos] = useState<ObjetivoType[]>([]);
  const [selectedLineaId, setSelectedLineaId] = useState<string | null>(null);
  const [selectedObjetivoId, setSelectedObjetivoId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const unsubscribeIndicador = indicadorViewModel.subscribe(() => {
      setIndicadores(indicadorViewModel.getIndicadores());
      setSelectedLineaId(indicadorViewModel.getSelectedLineaId());
      setSelectedObjetivoId(indicadorViewModel.getSelectedObjetivoId());
      setIsFormOpen(indicadorViewModel.getIsFormOpen());
    });

    const unsubscribeLinea = lineaViewModel.subscribe(() => {
      setLineas(lineaViewModel.getLineas());
    });

    const unsubscribeObjetivo = objetivoViewModel.subscribe(() => {
      setObjetivos(objetivoViewModel.getAllObjetivos());
    });

    return () => {
      unsubscribeIndicador();
      unsubscribeLinea();
      unsubscribeObjetivo();
    };
  }, []);

  const handleLineaChange = (lineaId: string) => {
    if (lineaId === '') {
      indicadorViewModel.setSelectedLineaId(null);
    } else {
      indicadorViewModel.setSelectedLineaId(lineaId);
    }
  };

  const handleObjetivoChange = (objetivoId: string) => {
    if (objetivoId === '') {
      indicadorViewModel.setSelectedObjetivoId(null);
    } else {
      indicadorViewModel.setSelectedObjetivoId(objetivoId);
    }
  };

  const getSelectedLinea = (): LineaType | null => {
    if (!selectedLineaId) return null;
    return lineas.find(l => l.id === selectedLineaId) || null;
  };

  const getSelectedObjetivo = (): ObjetivoType | null => {
    if (!selectedObjetivoId) return null;
    return objetivos.find(obj => obj.id === selectedObjetivoId) || null;
  };

  const getObjetivosByLinea = (): ObjetivoType[] => {
    if (!selectedLineaId) return [];
    return objetivos.filter(obj => {
      if (!obj) return false;
      // Handle lineaId as string or object - use extractId helper
      const objLineaId = extractId(obj.lineaId);
      return objLineaId === selectedLineaId;
    });
  };

  const selectedLinea = getSelectedLinea();
  const selectedObjetivo = getSelectedObjetivo();
  const objetivosFiltrados = getObjetivosByLinea();

  const handleOpenForm = () => {
    indicadorViewModel.openForm();
  };

  const handleCloseForm = () => {
    indicadorViewModel.closeForm();
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'estado-activo';
      case 'Inactivo':
        return 'estado-inactivo';
      case 'En Revisión':
        return 'estado-revision';
      case 'Completado':
        return 'estado-completado';
      default:
        return '';
    }
  };

  return (
    <div className="indicadores-container">
      <div className="indicadores-header">
        <h1>Indicadores</h1>
        <button className="btn-add" onClick={handleOpenForm}>
          + Nuevo Indicador
        </button>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="linea-select" className="filter-label">
            Línea Estratégica
          </label>
          <select
            id="linea-select"
            className="filter-select"
            value={selectedLineaId || ''}
            onChange={(e) => handleLineaChange(e.target.value)}
          >
            <option value="">-- Seleccione una línea estratégica --</option>
            {lineas.map((linea) => (
              <option key={linea.id} value={linea.id}>
                {linea.nombre}
              </option>
            ))}
          </select>
          {selectedLinea && (
            <div className="selected-info">
              <div
                className="linea-color-indicator"
                style={{ backgroundColor: selectedLinea.color }}
              ></div>
              <span>{selectedLinea.nombre}</span>
            </div>
          )}
        </div>

        {selectedLineaId && (
          <div className="filter-group">
            <label htmlFor="objetivo-select" className="filter-label">
              Objetivo
            </label>
            <select
              id="objetivo-select"
              className="filter-select"
              value={selectedObjetivoId || ''}
              onChange={(e) => handleObjetivoChange(e.target.value)}
            >
              <option value="">-- Todos los objetivos --</option>
              {objetivosFiltrados.map((objetivo) => (
                <option key={objetivo.id} value={objetivo.id}>
                  {objetivo.codigoReferencia} - {objetivo.nombre}
                </option>
              ))}
            </select>
            {selectedObjetivo && (
              <div className="selected-info">
                <span className="codigo-preview">{selectedObjetivo.codigoReferencia}</span>
                <span>{selectedObjetivo.nombre}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedLineaId && (
        <div className="table-container">
          <div className="table-header">
            <h2>
              Indicadores
              {selectedObjetivo && ` - ${selectedObjetivo.nombre}`}
            </h2>
            <span className="indicadores-count">
              {indicadores.length} indicador{indicadores.length !== 1 ? 'es' : ''}
            </span>
          </div>
          <table className="indicadores-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Cálculo/Métrica</th>
                <th>Frecuencia</th>
                <th>Unidad</th>
                <th>Meta</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {indicadores.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-state">
                    No hay indicadores registrados para esta selección
                  </td>
                </tr>
              ) : (
                indicadores
                  .filter((indicador) => indicador && indicador.nombre) // Filter out undefined/null or incomplete indicadores
                  .map((indicador) => {
                    const indicadorId = extractId(indicador);
                    return (
                      <tr key={indicadorId}>
                        <td className="codigo-cell">
                          <span className="codigo-badge">{indicador.codigo}</span>
                        </td>
                        <td className="nombre-cell">{indicador.nombre}</td>
                        <td className="descripcion-cell">{indicador.descripcion}</td>
                        <td className="calculo-cell">{indicador.calculo}</td>
                        <td>{indicador.frecuencia}</td>
                        <td>{indicador.unidad}</td>
                        <td className="meta-cell">
                          {indicador.meta} {indicador.unidad}
                        </td>
                        <td>
                          <span className={`estado-badge ${getEstadoBadgeClass(indicador.estado)}`}>
                            {indicador.estado}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-delete"
                            onClick={async () => {
                              if (confirm('¿Está seguro de eliminar este indicador?')) {
                                try {
                                  await indicadorViewModel.deleteIndicador(indicadorId);
                                } catch (error) {
                                  alert(error instanceof Error ? error.message : 'Error al eliminar el indicador');
                                }
                              }
                            }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      )}

      {!selectedLineaId && (
        <div className="empty-selection">
          <p>Por favor, seleccione una línea estratégica para ver sus indicadores</p>
        </div>
      )}

      {isFormOpen && <IndicadorForm onClose={handleCloseForm} />}
    </div>
  );
};

