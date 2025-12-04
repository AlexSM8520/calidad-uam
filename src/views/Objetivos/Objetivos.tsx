import { useEffect, useState } from 'react';
import { objetivoViewModel } from '../../viewmodels/ObjetivoViewModel';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import type { Objetivo as ObjetivoType } from '../../models/Objetivo';
import type { Linea as LineaType } from '../../models/Linea';
import { ObjetivoForm } from '../../components/ObjetivoForm/ObjetivoForm';
import './Objetivos.css';

export const Objetivos = () => {
  const [objetivos, setObjetivos] = useState<ObjetivoType[]>([]);
  const [lineas, setLineas] = useState<LineaType[]>([]);
  const [selectedLineaId, setSelectedLineaId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const unsubscribeObjetivo = objetivoViewModel.subscribe(() => {
      setObjetivos(objetivoViewModel.getObjetivos());
      setSelectedLineaId(objetivoViewModel.getSelectedLineaId());
      setIsFormOpen(objetivoViewModel.getIsFormOpen());
    });

    const unsubscribeLinea = lineaViewModel.subscribe(() => {
      setLineas(lineaViewModel.getLineas());
    });

    return () => {
      unsubscribeObjetivo();
      unsubscribeLinea();
    };
  }, []);

  const handleLineaChange = (lineaId: string) => {
    if (lineaId === '') {
      objetivoViewModel.setSelectedLineaId(null);
    } else {
      objetivoViewModel.setSelectedLineaId(lineaId);
    }
  };

  const getSelectedLinea = (): LineaType | null => {
    if (!selectedLineaId) return null;
    return lineas.find(l => l.id === selectedLineaId) || null;
  };

  const selectedLinea = getSelectedLinea();

  const handleOpenForm = () => {
    objetivoViewModel.openForm();
  };

  const handleCloseForm = () => {
    objetivoViewModel.closeForm();
  };

  return (
    <div className="objetivos-container">
      <div className="objetivos-header">
        <h1>Objetivos</h1>
        <button className="btn-add" onClick={handleOpenForm}>
          + Nuevo Objetivo
        </button>
      </div>

      <div className="linea-selector-container">
        <label htmlFor="linea-select" className="selector-label">
          Seleccionar Línea Estratégica
        </label>
        <select
          id="linea-select"
          className="linea-select"
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
          <div className="selected-linea-info">
            <div
              className="linea-color-indicator"
              style={{ backgroundColor: selectedLinea.color }}
            ></div>
            <span className="linea-name">{selectedLinea.nombre}</span>
          </div>
        )}
      </div>

      {selectedLineaId && (
        <div className="table-container">
          <div className="table-header">
            <h2>Objetivos de {selectedLinea?.nombre}</h2>
            <span className="objetivos-count">
              {objetivos.length} objetivo{objetivos.length !== 1 ? 's' : ''}
            </span>
          </div>
          <table className="objetivos-table">
            <thead>
              <tr>
                <th>Código de Referencia</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {objetivos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No hay objetivos registrados para esta línea estratégica
                  </td>
                </tr>
              ) : (
                objetivos.map((objetivo) => (
                  <tr key={objetivo.id}>
                    <td className="codigo-cell">
                      <span className="codigo-badge">{objetivo.codigoReferencia}</span>
                    </td>
                    <td className="nombre-cell">{objetivo.nombre}</td>
                    <td className="descripcion-cell">{objetivo.descripcion}</td>
                    <td>
                      <button
                        className="btn-delete"
                        onClick={async () => {
                          if (confirm('¿Está seguro de eliminar este objetivo?')) {
                            try {
                              const objetivoId = objetivo.id || objetivo._id || '';
                              await objetivoViewModel.deleteObjetivo(objetivoId);
                            } catch (error) {
                              alert(error instanceof Error ? error.message : 'Error al eliminar el objetivo');
                            }
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!selectedLineaId && (
        <div className="empty-selection">
          <p>Por favor, seleccione una línea estratégica para ver sus objetivos</p>
        </div>
      )}

      {isFormOpen && <ObjetivoForm onClose={handleCloseForm} />}
    </div>
  );
};

