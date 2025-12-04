import { useState } from 'react';
import type { FormEvent } from 'react';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import type { PlanType } from '../../models/Linea';
import './LineaForm.css';

interface LineaFormProps {
  onClose: () => void;
}

export const LineaForm = ({ onClose }: LineaFormProps) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [duracion, setDuracion] = useState<number>(12);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [color, setColor] = useState('#646cff');
  const [plan, setPlan] = useState<PlanType>('Plan institucional');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (duracion <= 0) {
      newErrors.duracion = 'La duración debe ser mayor a 0';
    }

    if (!fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }

    if (!fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es requerida';
    }

    if (fechaInicio && fechaFin && new Date(fechaInicio) >= new Date(fechaFin)) {
      newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    if (!color) {
      newErrors.color = 'El color es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await lineaViewModel.addLinea({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        duracion,
        fechaInicio,
        fechaFin,
        color,
      plan,
    });

    // Reset form
    setNombre('');
    setDescripcion('');
    setDuracion(12);
    setFechaInicio('');
    setFechaFin('');
    setColor('#646cff');
    setPlan('Plan institucional');
    setErrors({});

      // Close modal after successful creation
      lineaViewModel.closeForm();
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al crear la línea');
    }
  };

  const handleFechaInicioChange = (value: string) => {
    setFechaInicio(value);
    // Auto-calculate end date based on duration
    if (value && duracion > 0) {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + duracion);
      setFechaFin(endDate.toISOString().split('T')[0]);
    }
  };

  const handleDuracionChange = (value: number) => {
    setDuracion(value);
    // Auto-calculate end date based on duration
    if (fechaInicio && value > 0) {
      const startDate = new Date(fechaInicio);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + value);
      setFechaFin(endDate.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nueva Línea Estratégica</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="linea-form">
          <div className="form-group">
            <label htmlFor="nombre">
              Nombre de la línea <span className="required">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Linea Verde"
              className={errors.nombre ? 'error' : ''}
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">
              Descripción <span className="required">*</span>
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Breve descripción de la línea estratégica"
              rows={3}
              className={errors.descripcion ? 'error' : ''}
            />
            {errors.descripcion && (
              <span className="error-message">{errors.descripcion}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duracion">
                Duración (meses) <span className="required">*</span>
              </label>
              <input
                id="duracion"
                type="number"
                min="1"
                value={duracion}
                onChange={(e) => handleDuracionChange(parseInt(e.target.value) || 0)}
                className={errors.duracion ? 'error' : ''}
              />
              {errors.duracion && (
                <span className="error-message">{errors.duracion}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fechaInicio">
                Fecha de inicio <span className="required">*</span>
              </label>
              <input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => handleFechaInicioChange(e.target.value)}
                className={errors.fechaInicio ? 'error' : ''}
              />
              {errors.fechaInicio && (
                <span className="error-message">{errors.fechaInicio}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fechaFin">
                Fecha de fin <span className="required">*</span>
              </label>
              <input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={errors.fechaFin ? 'error' : ''}
              />
              {errors.fechaFin && (
                <span className="error-message">{errors.fechaFin}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color">
                Color <span className="required">*</span>
              </label>
              <div className="color-input-group">
                <input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#646cff"
                  className="color-text-input"
                />
              </div>
              {errors.color && (
                <span className="error-message">{errors.color}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="plan">
                Plan <span className="required">*</span>
              </label>
              <select
                id="plan"
                value={plan}
                onChange={(e) => setPlan(e.target.value as PlanType)}
                className={errors.plan ? 'error' : ''}
              >
                <option value="Plan institucional">Plan institucional</option>
                <option value="Plan nacional">Plan nacional</option>
              </select>
              {errors.plan && (
                <span className="error-message">{errors.plan}</span>
              )}
            </div>
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

