import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { indicadorViewModel } from '../../viewmodels/IndicadorViewModel';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import { objetivoViewModel } from '../../viewmodels/ObjetivoViewModel';
import type { Linea as LineaType } from '../../models/Linea';
import type { Objetivo as ObjetivoType } from '../../models/Objetivo';
import type { Frecuencia, EstadoIndicador } from '../../models/Indicador';
import './IndicadorForm.css';

interface IndicadorFormProps {
  onClose: () => void;
}

export const IndicadorForm = ({ onClose }: IndicadorFormProps) => {
  const [lineaId, setLineaId] = useState('');
  const [objetivoId, setObjetivoId] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [calculo, setCalculo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [frecuencia, setFrecuencia] = useState<Frecuencia>('Mensual');
  const [unidad, setUnidad] = useState('');
  const [meta, setMeta] = useState<number>(0);
  const [estado, setEstado] = useState<EstadoIndicador>('Activo');
  const [lineas, setLineas] = useState<LineaType[]>([]);
  const [objetivos, setObjetivos] = useState<ObjetivoType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribeLinea = lineaViewModel.subscribe(() => {
      setLineas(lineaViewModel.getLineas());
    });

    const unsubscribeObjetivo = objetivoViewModel.subscribe(() => {
      setObjetivos(objetivoViewModel.getAllObjetivos());
    });

    return () => {
      unsubscribeLinea();
      unsubscribeObjetivo();
    };
  }, []);

  const getObjetivosByLinea = (): ObjetivoType[] => {
    if (!lineaId) return [];
    return objetivos.filter(obj => obj.lineaId === lineaId);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!lineaId) {
      newErrors.lineaId = 'Debe seleccionar una línea estratégica';
    }

    if (!objetivoId) {
      newErrors.objetivoId = 'Debe seleccionar un objetivo';
    }

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!calculo.trim()) {
      newErrors.calculo = 'El cálculo o métrica es requerido';
    }

    if (!codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    }

    if (!unidad.trim()) {
      newErrors.unidad = 'La unidad es requerida';
    }

    if (meta <= 0) {
      newErrors.meta = 'La meta debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    indicadorViewModel.addIndicador({
      lineaId,
      objetivoId,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      calculo: calculo.trim(),
      codigo: codigo.trim().toUpperCase(),
      frecuencia,
      unidad: unidad.trim(),
      meta,
      estado,
    });

    // Reset form
    setLineaId('');
    setObjetivoId('');
    setNombre('');
    setDescripcion('');
    setCalculo('');
    setCodigo('');
    setFrecuencia('Mensual');
    setUnidad('');
    setMeta(0);
    setEstado('Activo');
    setErrors({});

    onClose();
  };

  const getSelectedLinea = (): LineaType | null => {
    if (!lineaId) return null;
    return lineas.find(l => l.id === lineaId) || null;
  };

  const getSelectedObjetivo = (): ObjetivoType | null => {
    if (!objetivoId) return null;
    return objetivos.find(obj => obj.id === objetivoId) || null;
  };

  const selectedLinea = getSelectedLinea();
  const selectedObjetivo = getSelectedObjetivo();
  const objetivosFiltrados = getObjetivosByLinea();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nuevo Indicador</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="indicador-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lineaId">
                Línea Estratégica <span className="required">*</span>
              </label>
              <select
                id="lineaId"
                value={lineaId}
                onChange={(e) => {
                  setLineaId(e.target.value);
                  setObjetivoId(''); // Reset objetivo when linea changes
                }}
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
                <div className="selected-preview">
                  <div
                    className="linea-color-preview"
                    style={{ backgroundColor: selectedLinea.color }}
                  ></div>
                  <span>{selectedLinea.nombre}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="objetivoId">
                Objetivo <span className="required">*</span>
              </label>
              <select
                id="objetivoId"
                value={objetivoId}
                onChange={(e) => setObjetivoId(e.target.value)}
                disabled={!lineaId}
                className={errors.objetivoId ? 'error' : ''}
              >
                <option value="">
                  {lineaId ? '-- Seleccione un objetivo --' : '-- Primero seleccione una línea --'}
                </option>
                {objetivosFiltrados.map((objetivo) => (
                  <option key={objetivo.id} value={objetivo.id}>
                    {objetivo.codigoReferencia} - {objetivo.nombre}
                  </option>
                ))}
              </select>
              {errors.objetivoId && (
                <span className="error-message">{errors.objetivoId}</span>
              )}
              {selectedObjetivo && (
                <div className="selected-preview">
                  <span className="codigo-preview">{selectedObjetivo.codigoReferencia}</span>
                  <span>{selectedObjetivo.nombre}</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="codigo">
              Código <span className="required">*</span>
            </label>
            <input
              id="codigo"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: LV-OBJ-001-IND-001"
              className={errors.codigo ? 'error' : ''}
            />
            {errors.codigo && (
              <span className="error-message">{errors.codigo}</span>
            )}
            <small className="form-hint">
              Formato sugerido: [Línea]-[Objetivo]-IND-[Número]
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="nombre">
              Nombre <span className="required">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Reducción porcentual de consumo energético"
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
              placeholder="Descripción detallada del indicador"
              rows={3}
              className={errors.descripcion ? 'error' : ''}
            />
            {errors.descripcion && (
              <span className="error-message">{errors.descripcion}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="calculo">
              Cálculo o Métrica <span className="required">*</span>
            </label>
            <textarea
              id="calculo"
              value={calculo}
              onChange={(e) => setCalculo(e.target.value)}
              placeholder="Ej: (Consumo año anterior - Consumo año actual) / Consumo año anterior * 100"
              rows={2}
              className={errors.calculo ? 'error' : ''}
            />
            {errors.calculo && (
              <span className="error-message">{errors.calculo}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="frecuencia">
                Frecuencia <span className="required">*</span>
              </label>
              <select
                id="frecuencia"
                value={frecuencia}
                onChange={(e) => setFrecuencia(e.target.value as Frecuencia)}
              >
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="unidad">
                Unidad <span className="required">*</span>
              </label>
              <input
                id="unidad"
                type="text"
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                placeholder="Ej: %, kWh, días, publicaciones"
                className={errors.unidad ? 'error' : ''}
              />
              {errors.unidad && (
                <span className="error-message">{errors.unidad}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="meta">
                Meta <span className="required">*</span>
              </label>
              <input
                id="meta"
                type="number"
                min="0"
                step="0.01"
                value={meta}
                onChange={(e) => setMeta(parseFloat(e.target.value) || 0)}
                className={errors.meta ? 'error' : ''}
              />
              {errors.meta && (
                <span className="error-message">{errors.meta}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="estado">
                Estado <span className="required">*</span>
              </label>
              <select
                id="estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value as EstadoIndicador)}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Completado">Completado</option>
              </select>
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

