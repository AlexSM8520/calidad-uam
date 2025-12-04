import { useState, useEffect } from 'react';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import { AreaForm } from '../../components/AreaForm/AreaForm';
import type { Area as AreaType } from '../../models/Area';
import { extractId } from '../../utils/modelHelpers';
import './Area.css';

export const Area = () => {
  const [areas, setAreas] = useState<AreaType[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaType | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = poaViewModel.subscribe(() => {
      setAreas(poaViewModel.getAreas());
    });
    return unsubscribe;
  }, []);

  const handleOpenForm = () => {
    setEditingArea(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingArea(undefined);
  };

  const handleSaveArea = async (areaData: Omit<AreaType, 'id'>) => {
    try {
      if (editingArea) {
        const areaId = extractId(editingArea);
        if (areaId) {
          await poaViewModel.updateArea(areaId, areaData);
        }
      } else {
        await poaViewModel.createArea(areaData);
      }
      handleCloseForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar el área');
    }
  };

  const handleEditArea = (area: AreaType) => {
    setEditingArea(area);
    setIsFormOpen(true);
  };

  const handleDeleteArea = async (areaId: string) => {
    if (confirm('¿Está seguro de eliminar esta área?')) {
      try {
        await poaViewModel.deleteArea(areaId);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al eliminar el área. Puede estar siendo utilizada en algún POA.');
      }
    }
  };

  return (
    <div className="area-container">
      <div className="area-header">
        <h1>Áreas</h1>
        <button className="btn-add" onClick={handleOpenForm}>
          Agregar Área
        </button>
      </div>

      {areas.length === 0 ? (
        <div className="empty-state">
          <p>No hay áreas registradas. Haga clic en "Agregar Área" para comenzar.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="area-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => (
                <tr key={area.id}>
                  <td className="nombre-cell">{area.nombre}</td>
                  <td className="descripcion-cell">
                    {area.descripcion || <span className="no-descripcion">Sin descripción</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditArea(area)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => {
                          const areaId = extractId(area);
                          if (areaId) handleDeleteArea(areaId);
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <AreaForm
          onClose={handleCloseForm}
          onSave={handleSaveArea}
          area={editingArea}
        />
      )}
    </div>
  );
};

