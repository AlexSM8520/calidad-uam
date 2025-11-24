import { useState } from 'react';
import type { Carrera } from '../../models/Carrera';
import './CarreraForm.css';

interface CarreraFormProps {
  onClose: () => void;
  onSave: (carrera: Omit<Carrera, 'id'>) => void;
  carrera?: Carrera;
}

export const CarreraForm = ({ onClose, onSave, carrera }: CarreraFormProps) => {
  const [formData, setFormData] = useState({
    nombre: carrera?.nombre || '',
    descripcion: carrera?.descripcion || '',
    facultad: carrera?.facultad || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.facultad.trim()) {
      newErrors.facultad = 'La facultad es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{carrera ? 'Editar Carrera' : 'Agregar Carrera'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="carrera-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">
              Nombre <span className="required">*</span>
            </label>
            <input
              type="text"
              id="nombre"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={errors.nombre ? 'error' : ''}
              placeholder="Ingrese el nombre de la carrera"
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="facultad">
              Facultad <span className="required">*</span>
            </label>
            <input
              type="text"
              id="facultad"
              value={formData.facultad}
              onChange={(e) => handleChange('facultad', e.target.value)}
              className={errors.facultad ? 'error' : ''}
              placeholder="Ingrese el nombre de la facultad"
            />
            {errors.facultad && <span className="error-message">{errors.facultad}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              rows={4}
              placeholder="Ingrese una descripción de la carrera (opcional)"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              {carrera ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

