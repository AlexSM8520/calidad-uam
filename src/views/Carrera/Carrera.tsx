import { useState, useEffect } from 'react';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import { CarreraForm } from '../../components/CarreraForm/CarreraForm';
import type { Carrera as CarreraType } from '../../models/Carrera';
import { extractId } from '../../utils/modelHelpers';
import './Carrera.css';

export const Carrera = () => {
  const [carreras, setCarreras] = useState<CarreraType[]>([]);
  const [filteredCarreras, setFilteredCarreras] = useState<CarreraType[]>([]);
  const [selectedFacultad, setSelectedFacultad] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCarrera, setEditingCarrera] = useState<CarreraType | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = poaViewModel.subscribe(() => {
      const allCarreras = poaViewModel.getCarreras();
      setCarreras(allCarreras);
      applyFilter(allCarreras, selectedFacultad);
    });
    return unsubscribe;
  }, [selectedFacultad]);

  const applyFilter = (carrerasList: CarreraType[], facultad: string) => {
    if (!facultad) {
      setFilteredCarreras(carrerasList);
    } else {
      setFilteredCarreras(carrerasList.filter(c => c.facultad === facultad));
    }
  };

  useEffect(() => {
    applyFilter(carreras, selectedFacultad);
  }, [carreras, selectedFacultad]);

  const getFacultades = (): string[] => {
    const facultades = new Set(carreras.map(c => c.facultad));
    return Array.from(facultades).sort();
  };

  const handleOpenForm = () => {
    setEditingCarrera(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCarrera(undefined);
  };

  const handleSaveCarrera = async (carreraData: Omit<CarreraType, 'id'>) => {
    try {
      if (editingCarrera) {
        const carreraId = extractId(editingCarrera);
        if (carreraId) {
          await poaViewModel.updateCarrera(carreraId, carreraData);
        }
      } else {
        await poaViewModel.createCarrera(carreraData);
      }
      handleCloseForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar la carrera');
    }
  };

  const handleEditCarrera = (carrera: CarreraType) => {
    setEditingCarrera(carrera);
    setIsFormOpen(true);
  };

  const handleDeleteCarrera = async (carreraId: string) => {
    if (confirm('¿Está seguro de eliminar esta carrera?')) {
      try {
        await poaViewModel.deleteCarrera(carreraId);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al eliminar la carrera. Puede estar siendo utilizada en algún POA.');
      }
    }
  };

  return (
    <div className="carrera-container">
      <div className="carrera-header">
        <h1>Carreras</h1>
        <button className="btn-add" onClick={handleOpenForm}>
          Agregar Carrera
        </button>
      </div>

      {carreras.length > 0 && (
        <div className="filter-section">
          <label htmlFor="facultad-filter">Filtrar por Facultad:</label>
          <select
            id="facultad-filter"
            value={selectedFacultad}
            onChange={(e) => setSelectedFacultad(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las facultades</option>
            {getFacultades().map((facultad) => (
              <option key={facultad} value={facultad}>
                {facultad}
              </option>
            ))}
          </select>
        </div>
      )}

      {carreras.length === 0 ? (
        <div className="empty-state">
          <p>No hay carreras registradas. Haga clic en "Agregar Carrera" para comenzar.</p>
        </div>
      ) : filteredCarreras.length === 0 ? (
        <div className="empty-state">
          <p>No hay carreras que coincidan con el filtro seleccionado.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="carrera-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Facultad</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarreras.map((carrera) => (
                <tr key={carrera.id}>
                  <td className="nombre-cell">{carrera.nombre}</td>
                  <td className="facultad-cell">{carrera.facultad}</td>
                  <td className="descripcion-cell">
                    {carrera.descripcion || <span className="no-descripcion">Sin descripción</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditCarrera(carrera)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => {
                          const carreraId = extractId(carrera);
                          if (carreraId) handleDeleteCarrera(carreraId);
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
        <CarreraForm
          onClose={handleCloseForm}
          onSave={handleSaveCarrera}
          carrera={editingCarrera}
        />
      )}
    </div>
  );
};

