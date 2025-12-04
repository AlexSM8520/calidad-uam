import { useState, useEffect } from 'react';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import { FacultadForm } from '../../components/FacultadForm/FacultadForm';
import type { Facultad as FacultadType } from '../../models/Facultad';
import { extractId } from '../../utils/modelHelpers';
import './Facultades.css';

export const Facultades = () => {
  const [facultades, setFacultades] = useState<FacultadType[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFacultad, setEditingFacultad] = useState<FacultadType | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = poaViewModel.subscribe(() => {
      setFacultades(poaViewModel.getFacultades());
    });
    return unsubscribe;
  }, []);

  const handleOpenForm = () => {
    setEditingFacultad(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingFacultad(undefined);
  };

  const handleSaveFacultad = (facultadData: Omit<FacultadType, 'id'>) => {
    if (editingFacultad) {
      const facultadId = extractId(editingFacultad);
      if (facultadId) {
        poaViewModel.updateFacultad(facultadId, facultadData);
      }
    } else {
      poaViewModel.createFacultad(facultadData);
    }
    handleCloseForm();
  };

  const handleEditFacultad = (facultad: FacultadType) => {
    setEditingFacultad(facultad);
    setIsFormOpen(true);
  };

  const handleDeleteFacultad = (facultadId: string) => {
    if (confirm('¿Está seguro de eliminar esta facultad?')) {
      try {
        poaViewModel.deleteFacultad(facultadId);
      } catch (error) {
        alert('Error al eliminar la facultad. Puede estar siendo utilizada por una o más carreras.');
      }
    }
  };

  return (
    <div className="facultades-container">
      <div className="facultades-header">
        <h1>Facultades</h1>
        <button className="btn-add" onClick={handleOpenForm}>
          Agregar Facultad
        </button>
      </div>

      {facultades.length === 0 ? (
        <div className="empty-state">
          <p>No hay facultades registradas. Haga clic en "Agregar Facultad" para comenzar.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="facultades-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facultades.map((facultad) => (
                <tr key={facultad.id}>
                  <td className="nombre-cell">{facultad.nombre}</td>
                  <td className="descripcion-cell">
                    {facultad.descripcion || <span className="no-descripcion">Sin descripción</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditFacultad(facultad)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => {
                          const facultadId = extractId(facultad);
                          if (facultadId) handleDeleteFacultad(facultadId);
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
        <FacultadForm
          onClose={handleCloseForm}
          onSave={handleSaveFacultad}
          facultad={editingFacultad}
        />
      )}
    </div>
  );
};

