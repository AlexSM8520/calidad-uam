import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { objetivoViewModel } from '../../viewmodels/ObjetivoViewModel';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import type { Linea as LineaType } from '../../models/Linea';
import './ObjetivoForm.css';

interface ObjetivoFormProps {
  onClose: () => void;
}

export const ObjetivoForm = ({ onClose }: ObjetivoFormProps) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [codigoReferencia, setCodigoReferencia] = useState('');
  const [lineaId, setLineaId] = useState('');
  const [lineas, setLineas] = useState<LineaType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = lineaViewModel.subscribe(() => {
      setLineas(lineaViewModel.getLineas());
    });

    return unsubscribe;
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!codigoReferencia.trim()) {
      newErrors.codigoReferencia = 'El código de referencia es requerido';
    }

    if (!lineaId) {
      newErrors.lineaId = 'Debe seleccionar una línea estratégica';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    objetivoViewModel.addObjetivo({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      codigoReferencia: codigoReferencia.trim().toUpperCase(),
      lineaId,
    });

    // Reset form
    setNombre('');
    setDescripcion('');
    setCodigoReferencia('');
    setLineaId('');
    setErrors({});

    onClose();
  };

  const getSelectedLinea = (): LineaType | null => {
    if (!lineaId) return null;
    return lineas.find(l => l.id === lineaId) || null;
  };

  const selectedLinea = getSelectedLinea();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nuevo Objetivo</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="objetivo-form">
          <div className="form-group">
            <label htmlFor="lineaId">
              Línea Estratégica <span className="required">*</span>
            </label>
            <select
              id="lineaId"
              value={lineaId}
              onChange={(e) => setLineaId(e.target.value)}
              className={errors.lineaId ? 'error' : ''}
            >
              <option value="">-- Seleccione una línea estratégica --</option>
              {lineas.map((linea) => (
                <option key={linea.id} value={linea.id}>
                  {linea.nombre}
                </option>
              ))}
            </select>
            {errors.lineaId && (
              <span className="error-message">{errors.lineaId}</span>
            )}
            {selectedLinea && (
              <div className="selected-linea-preview">
                <div
                  className="linea-color-preview"
                  style={{ backgroundColor: selectedLinea.color }}
                ></div>
                <span>{selectedLinea.nombre}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="codigoReferencia">
              Código de Referencia <span className="required">*</span>
            </label>
            <input
              id="codigoReferencia"
              type="text"
              value={codigoReferencia}
              onChange={(e) => setCodigoReferencia(e.target.value)}
              placeholder="Ej: LV-OBJ-004"
              className={errors.codigoReferencia ? 'error' : ''}
            />
            {errors.codigoReferencia && (
              <span className="error-message">{errors.codigoReferencia}</span>
            )}
            <small className="form-hint">
              Formato sugerido: [Prefijo]-OBJ-[Número]
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="nombre">
              Nombre del Objetivo <span className="required">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Reducir consumo energético en un 30%"
              className={errors.nombre ? 'error' : ''}
            />
            {errors.nombre && (
              <span className="error-message">{errors.nombre}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">
              Descripción <span className="required">*</span>
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción detallada del objetivo"
              rows={4}
              className={errors.descripcion ? 'error' : ''}
            />
            {errors.descripcion && (
              <span className="error-message">{errors.descripcion}</span>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

