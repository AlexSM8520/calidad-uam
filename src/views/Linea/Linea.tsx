import { useEffect, useState } from 'react';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import type { Linea as LineaType } from '../../models/Linea';
import { LineaForm } from '../../components/LineaForm/LineaForm';
import './Linea.css';

export const Linea = () => {
  const [lineas, setLineas] = useState<LineaType[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = lineaViewModel.subscribe(() => {
      setLineas(lineaViewModel.getLineas());
      setIsFormOpen(lineaViewModel.getIsFormOpen());
    });

    return unsubscribe;
  }, []);

  const handleOpenForm = () => {
    lineaViewModel.openForm();
  };

  const handleCloseForm = () => {
    lineaViewModel.closeForm();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="linea-container">
      <div className="linea-header">
        <h1>Líneas Estratégicas</h1>
        <button className="btn-add" onClick={handleOpenForm}>
          + Nueva Línea
        </button>
      </div>

      <div className="table-container">
        <table className="linea-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Duración</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Color</th>
              <th>Plan</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lineas.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-state">
                  No hay líneas estratégicas registradas
                </td>
              </tr>
            ) : (
              lineas.map((linea) => (
                <tr key={linea.id}>
                  <td className="nombre-cell">{linea.nombre}</td>
                  <td className="descripcion-cell">{linea.descripcion}</td>
                  <td>{linea.duracion} meses</td>
                  <td>{formatDate(linea.fechaInicio)}</td>
                  <td>{formatDate(linea.fechaFin)}</td>
                  <td>
                    <div className="color-indicator">
                      <span
                        className="color-dot"
                        style={{ backgroundColor: linea.color }}
                      ></span>
                      <span className="color-code">{linea.color}</span>
                    </div>
                  </td>
                  <td>
                    <span className="plan-badge">{linea.plan}</span>
                  </td>
                  <td>
                    <button
                      className="btn-delete"
                      onClick={() => lineaViewModel.deleteLinea(linea.id)}
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

      {isFormOpen && <LineaForm onClose={handleCloseForm} />}
    </div>
  );
};

