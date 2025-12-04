import { useState, useEffect } from 'react';
import type { Actividad, FrecuenciaReporte } from '../../models/POA';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import { objetivoViewModel } from '../../viewmodels/ObjetivoViewModel';
import { indicadorViewModel } from '../../viewmodels/IndicadorViewModel';
import { userViewModel } from '../../viewmodels/UserViewModel';
import type { Linea } from '../../models/Linea';
import type { Objetivo } from '../../models/Objetivo';
import type { Indicador } from '../../models/Indicador';
import type { User } from '../../models/User';
import { extractId } from '../../utils/modelHelpers';
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
  const [usuarios, setUsuarios] = useState<User[]>([]);

  // Helper to get user display name
  const getUserDisplayName = (user: User): string => {
    if (user.nombre && user.apellido) {
      return `${user.nombre} ${user.apellido} (${user.username})`;
    }
    return user.username;
  };

  // Find matching user for existing responsable
  const findMatchingUser = (responsableValue: string, users: User[]): string => {
    if (!responsableValue || users.length === 0) return responsableValue || '';
    // Try to find exact match first
    const exactMatch = users.find(user => {
      const displayName = getUserDisplayName(user);
      return displayName === responsableValue || user.username === responsableValue;
    });
    if (exactMatch) {
      return getUserDisplayName(exactMatch);
    }
    // Try to find by username if responsable is just a username
    const usernameMatch = users.find(user => user.username === responsableValue);
    if (usernameMatch) {
      return getUserDisplayName(usernameMatch);
    }
    // Return original value if no match found (for backward compatibility)
    return responsableValue;
  };

  const [formData, setFormData] = useState({
    nombre: actividad?.nombre || '',
    descripcion: actividad?.descripcion || '',
    fechaInicio: actividad?.fechaInicio || fechaInicioPOA,
    fechaFin: actividad?.fechaFin || fechaFinPOA,
    responsable: actividad?.responsable || '',
    estado: actividad?.estado || 'Pendiente' as Actividad['estado'],
    frecuencia: actividad?.frecuencia || 'Mensual' as FrecuenciaReporte,
    lineaId: extractId(actividad?.lineaId),
    objetivoId: extractId(actividad?.objetivoId),
    indicadorId: extractId(actividad?.indicadorId),
  });

  // Update responsable when usuarios are loaded and actividad has a responsable
  useEffect(() => {
    if (actividad?.responsable && usuarios.length > 0) {
      const matchingUser = findMatchingUser(actividad.responsable, usuarios);
      if (matchingUser && matchingUser !== formData.responsable) {
        setFormData(prev => ({ ...prev, responsable: matchingUser }));
      }
    }
  }, [usuarios.length, actividad?.responsable]); // Update when usuarios load or actividad changes

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

    const unsubscribeUser = userViewModel.subscribe(() => {
      // Filter only users with role "Usuario" and active
      const usuariosActivos = userViewModel.getUsers().filter(
        user => user.rol === 'Usuario' && user.activo !== false
      );
      setUsuarios(usuariosActivos);
    });

    return () => {
      unsubscribeLinea();
      unsubscribeObjetivo();
      unsubscribeIndicador();
      unsubscribeUser();
    };
  }, []);

  // Helper para obtener el ID de un campo que puede ser string o objeto
  const getId = (idOrObj: string | { _id?: string; id?: string } | undefined): string => {
    if (!idOrObj) return '';
    if (typeof idOrObj === 'string') return idOrObj;
    return idOrObj._id || idOrObj.id || '';
  };

  // Filtrar objetivos por línea seleccionada
  const objetivosFiltrados = formData.lineaId
    ? objetivos.filter(obj => {
        const objLineaId = getId(obj.lineaId);
        return objLineaId === formData.lineaId;
      })
    : [];

  // Filtrar indicadores por objetivo seleccionado
  const indicadoresFiltrados = formData.objetivoId
    ? indicadores.filter(ind => {
        const indObjetivoId = getId(ind.objetivoId);
        return indObjetivoId === formData.objetivoId;
      })
    : [];

  // Reset objetivo e indicador cuando cambia la línea
  useEffect(() => {
    if (formData.lineaId && formData.objetivoId) {
      const objetivo = objetivos.find(obj => {
        const objId = extractId(obj);
        return objId === formData.objetivoId;
      });
      if (objetivo) {
        const objLineaId = getId(objetivo.lineaId);
        if (objLineaId !== formData.lineaId) {
          setFormData(prev => ({ ...prev, objetivoId: '', indicadorId: '' }));
        }
      }
    }
  }, [formData.lineaId, formData.objetivoId, objetivos]);

  // Reset indicador cuando cambia el objetivo
  useEffect(() => {
    if (formData.objetivoId && formData.indicadorId) {
      const indicador = indicadores.find(ind => {
        const indId = extractId(ind);
        return indId === formData.indicadorId;
      });
      if (indicador) {
        const indObjetivoId = getId(indicador.objetivoId);
        if (indObjetivoId !== formData.objetivoId) {
          setFormData(prev => ({ ...prev, indicadorId: '' }));
        }
      }
    }
  }, [formData.objetivoId, formData.indicadorId, indicadores]);

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
              {lineas.map((linea) => {
                const lineaId = extractId(linea);
                return (
                  <option key={lineaId} value={lineaId}>
                    {linea.nombre}
                  </option>
                );
              })}
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
              {objetivosFiltrados.map((objetivo) => {
                const objetivoId = extractId(objetivo);
                return (
                  <option key={objetivoId} value={objetivoId}>
                    {objetivo.codigoReferencia} - {objetivo.nombre}
                  </option>
                );
              })}
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
              {indicadoresFiltrados.map((indicador) => {
                const indicadorId = extractId(indicador);
                return (
                  <option key={indicadorId} value={indicadorId}>
                    {indicador.codigo} - {indicador.nombre}
                  </option>
                );
              })}
            </select>
            {errors.indicadorId && <span className="error-message">{errors.indicadorId}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="responsable">
              Responsable <span className="required">*</span>
            </label>
            <select
              id="responsable"
              value={formData.responsable}
              onChange={(e) => handleChange('responsable', e.target.value)}
              className={errors.responsable ? 'error' : ''}
            >
              <option value="">Seleccione un responsable</option>
              {usuarios.map((usuario) => {
                const userId = extractId(usuario);
                const displayName = getUserDisplayName(usuario);
                return (
                  <option key={userId} value={displayName}>
                    {displayName}
                  </option>
                );
              })}
            </select>
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

