import { useState, useEffect } from 'react';
import type { Actividad, FrecuenciaReporte } from '../../models/POA';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import { objetivoViewModel } from '../../viewmodels/ObjetivoViewModel';
import { indicadorViewModel } from '../../viewmodels/IndicadorViewModel';
import type { Linea } from '../../models/Linea';
import type { Objetivo } from '../../models/Objetivo';
import type { Indicador } from '../../models/Indicador';
import './ActividadForm.css';

interface ActividadFormProps {
  onClose: () => void;
  onSave: (actividad: Omit<Actividad, 'id'>) => void;
  actividad?: Actividad;
  fechaInicioPOA: string; // Fechas del POA
  fechaFinPOA: string;
}

export const ActividadForm = ({ onClose, onSave, actividad, fechaInicioPOA, fechaFinPOA }: ActividadFormProps) => {
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);

  const [formData, setFormData] = useState({
    nombre: actividad?.nombre || '',
    descripcion: actividad?.descripcion || '',
    fechaInicio: actividad?.fechaInicio || fechaInicioPOA,
    fechaFin: actividad?.fechaFin || fechaFinPOA,
    responsable: actividad?.responsable || '',
    estado: actividad?.estado || 'Pendiente' as Actividad['estado'],
    frecuencia: actividad?.frecuencia || 'Mensual' as FrecuenciaReporte,
    lineaId: actividad?.lineaId || '',
    objetivoId: actividad?.objetivoId || '',
    indicadorId: actividad?.indicadorId || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribeLinea = lineaViewModel.subscribe(() => {
      setLineas(lineaViewModel.getLineas());
    });

    const unsubscribeObjetivo = objetivoViewModel.subscribe(() => {
      setObjetivos(objetivoViewModel.getAllObjetivos());
    });

    const unsubscribeIndicador = indicadorViewModel.subscribe(() => {
      setIndicadores(indicadorViewModel.getAllIndicadores());
    });

    return () => {
      unsubscribeLinea();
      unsubscribeObjetivo();
      unsubscribeIndicador();
    };
  }, []);

  // Filtrar objetivos por línea seleccionada
  const objetivosFiltrados = formData.lineaId
    ? objetivos.filter(obj => obj.lineaId === formData.lineaId)
    : [];

  // Filtrar indicadores por objetivo seleccionado
  const indicadoresFiltrados = formData.objetivoId
    ? indicadores.filter(ind => ind.objetivoId === formData.objetivoId)
    : [];

  // Reset objetivo e indicador cuando cambia la línea
  useEffect(() => {
    if (formData.lineaId && formData.objetivoId) {
      const objetivo = objetivos.find(obj => obj.id === formData.objetivoId);
      if (objetivo && objetivo.lineaId !== formData.lineaId) {
        setFormData(prev => ({ ...prev, objetivoId: '', indicadorId: '' }));
      }
    }
  }, [formData.lineaId, objetivos]);

  // Reset indicador cuando cambia el objetivo
  useEffect(() => {
    if (formData.objetivoId && formData.indicadorId) {
      const indicador = indicadores.find(ind => ind.id === formData.indicadorId);
      if (indicador && indicador.objetivoId !== formData.objetivoId) {
        setFormData(prev => ({ ...prev, indicadorId: '' }));
      }
    }
  }, [formData.objetivoId, indicadores]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.responsable.trim()) {
      newErrors.responsable = 'El responsable es requerido';
    }

    if (!formData.lineaId) {
      newErrors.lineaId = 'Debe seleccionar una línea estratégica';
    }

    if (!formData.objetivoId) {
      newErrors.objetivoId = 'Debe seleccionar un objetivo';
    }

    if (!formData.indicadorId) {
      newErrors.indicadorId = 'Debe seleccionar un indicador';
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
          <h2>{actividad ? 'Editar Actividad' : 'Agregar Actividad'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="actividad-form" onSubmit={handleSubmit}>
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
            />
            {errors.nombre && <span className="error-message">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">
              Descripción <span className="required">*</span>
            </label>
            <textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              className={errors.descripcion ? 'error' : ''}
              rows={4}
            />
            {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fechaInicio">Fecha de Inicio (del POA)</label>
              <input
                type="date"
                id="fechaInicio"
                value={formData.fechaInicio}
                disabled
                className="disabled-input"
              />
              <span className="form-hint">Las fechas se toman del POA</span>
            </div>

            <div className="form-group">
              <label htmlFor="fechaFin">Fecha de Fin (del POA)</label>
              <input
                type="date"
                id="fechaFin"
                value={formData.fechaFin}
                disabled
                className="disabled-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="frecuencia">
              Frecuencia de Reporte <span className="required">*</span>
            </label>
            <select
              id="frecuencia"
              value={formData.frecuencia}
              onChange={(e) => handleChange('frecuencia', e.target.value)}
            >
              <option value="Mensual">Mensual</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="lineaId">
              Línea Estratégica <span className="required">*</span>
            </label>
            <select
              id="lineaId"
              value={formData.lineaId}
              onChange={(e) => {
                handleChange('lineaId', e.target.value);
                setFormData(prev => ({ ...prev, objetivoId: '', indicadorId: '' }));
              }}
              className={errors.lineaId ? 'error' : ''}
            >
              <option value="">Seleccione una línea estratégica</option>
              {lineas.map((linea) => (
                <option key={linea.id} value={linea.id}>
                  {linea.nombre}
                </option>
              ))}
            </select>
            {errors.lineaId && <span className="error-message">{errors.lineaId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="objetivoId">
              Objetivo <span className="required">*</span>
            </label>
            <select
              id="objetivoId"
              value={formData.objetivoId}
              onChange={(e) => {
                handleChange('objetivoId', e.target.value);
                setFormData(prev => ({ ...prev, indicadorId: '' }));
              }}
              className={errors.objetivoId ? 'error' : ''}
              disabled={!formData.lineaId}
            >
              <option value="">
                {formData.lineaId ? 'Seleccione un objetivo' : 'Primero seleccione una línea'}
              </option>
              {objetivosFiltrados.map((objetivo) => (
                <option key={objetivo.id} value={objetivo.id}>
                  {objetivo.codigoReferencia} - {objetivo.nombre}
                </option>
              ))}
            </select>
            {errors.objetivoId && <span className="error-message">{errors.objetivoId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="indicadorId">
              Indicador <span className="required">*</span>
            </label>
            <select
              id="indicadorId"
              value={formData.indicadorId}
              onChange={(e) => handleChange('indicadorId', e.target.value)}
              className={errors.indicadorId ? 'error' : ''}
              disabled={!formData.objetivoId}
            >
              <option value="">
                {formData.objetivoId ? 'Seleccione un indicador' : 'Primero seleccione un objetivo'}
              </option>
              {indicadoresFiltrados.map((indicador) => (
                <option key={indicador.id} value={indicador.id}>
                  {indicador.codigo} - {indicador.nombre}
                </option>
              ))}
            </select>
            {errors.indicadorId && <span className="error-message">{errors.indicadorId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="responsable">
              Responsable <span className="required">*</span>
            </label>
            <input
              type="text"
              id="responsable"
              value={formData.responsable}
              onChange={(e) => handleChange('responsable', e.target.value)}
              className={errors.responsable ? 'error' : ''}
            />
            {errors.responsable && <span className="error-message">{errors.responsable}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En Progreso">En Progreso</option>
              <option value="Completada">Completada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              {actividad ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

