import { useState, useEffect } from 'react';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import { objetivoViewModel } from '../../viewmodels/ObjetivoViewModel';
import { indicadorViewModel } from '../../viewmodels/IndicadorViewModel';
import { ActividadForm } from '../../components/ActividadForm/ActividadForm';
import { extractId } from '../../utils/modelHelpers';
import type { POAType, Actividad } from '../../models/POA';
import type { Linea } from '../../models/Linea';
import type { Objetivo } from '../../models/Objetivo';
import type { Indicador } from '../../models/Indicador';
import './CreatePOA.css';

export const CreatePOA = () => {
  const [tipo, setTipo] = useState<POAType | ''>('');
  const [areaId, setAreaId] = useState('');
  const [carreraId, setCarreraId] = useState('');
  const [periodo, setPeriodo] = useState(new Date().getFullYear());
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [isActividadFormOpen, setIsActividadFormOpen] = useState(false);
  const [editingActividad, setEditingActividad] = useState<Actividad | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [poaId, setPoaId] = useState<string | null>(null);

  const areas = poaViewModel.getAreas();
  const carreras = poaViewModel.getCarreras();
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);

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

  useEffect(() => {
    const unsubscribe = poaViewModel.subscribe(() => {
      if (poaId) {
        const poa = poaViewModel.getPOA(poaId);
        if (poa) {
          setActividades(poa.actividades);
        }
      }
    });
    return unsubscribe;
  }, [poaId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!tipo) {
      newErrors.tipo = 'Debe seleccionar un tipo';
    }

    if (tipo === 'area' && !areaId) {
      newErrors.areaId = 'Debe seleccionar un área';
    }

    if (tipo === 'carrera' && !carreraId) {
      newErrors.carreraId = 'Debe seleccionar una carrera';
    }

    if (!periodo || periodo < 2000 || periodo > 2100) {
      newErrors.periodo = 'El período debe ser un año válido';
    }

    if (!fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }

    if (!fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es requerida';
    }

    if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
      newErrors.fechaFin = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreatePOA = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const poa = await poaViewModel.createPOA({
        tipo: tipo as POAType,
        areaId: tipo === 'area' ? areaId : undefined,
        carreraId: tipo === 'carrera' ? carreraId : undefined,
        periodo,
        fechaInicio,
        fechaFin,
      });

      setPoaId(poa.id || poa._id || '');
      setActividades([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al crear el POA');
    }
  };

  const handleAddActividad = () => {
    setEditingActividad(undefined);
    setIsActividadFormOpen(true);
  };

  const handleEditActividad = (actividad: Actividad) => {
    setEditingActividad(actividad);
    setIsActividadFormOpen(true);
  };

  const handleSaveActividad = async (actividadData: Omit<Actividad, 'id' | '_id'>) => {
    if (!poaId) {
      alert('Debe crear el POA primero');
      return;
    }

    try {
      const actividadId = editingActividad?.id || editingActividad?._id || '';
      if (editingActividad && actividadId) {
        await poaViewModel.updateActividad(poaId, actividadId, actividadData);
      } else {
        await poaViewModel.addActividadToPOA(poaId, actividadData);
      }
      setIsActividadFormOpen(false);
      setEditingActividad(undefined);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar la actividad');
    }
  };

  const handleDeleteActividad = async (actividadId: string) => {
    if (!poaId) return;
    if (confirm('¿Está seguro de eliminar esta actividad?')) {
      try {
        await poaViewModel.deleteActividad(poaId, actividadId);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al eliminar la actividad');
      }
    }
  };

  const getEstadoBadgeClass = (estado: Actividad['estado']) => {
    switch (estado) {
      case 'Completada':
        return 'estado-completada';
      case 'En Progreso':
        return 'estado-progreso';
      case 'Cancelada':
        return 'estado-cancelada';
      default:
        return 'estado-pendiente';
    }
  };

  // Helper para obtener el ID de un campo que puede ser string o objeto
  const getId = (idOrObj: string | { _id?: string; id?: string } | undefined): string => {
    if (!idOrObj) return '';
    if (typeof idOrObj === 'string') return idOrObj;
    return idOrObj._id || idOrObj.id || '';
  };

  const getLineaNombre = (lineaId: string | { _id: string; nombre: string }): string => {
    if (typeof lineaId === 'object' && lineaId !== null) {
      return lineaId.nombre || 'N/A';
    }
    const linea = lineas.find(l => {
      const lId = extractId(l);
      return lId === lineaId;
    });
    return linea?.nombre || 'N/A';
  };

  const getObjetivoNombre = (objetivoId: string | { _id: string; nombre: string }): string => {
    if (typeof objetivoId === 'object' && objetivoId !== null) {
      return objetivoId.nombre || 'N/A';
    }
    const objetivo = objetivos.find(o => {
      const oId = extractId(o);
      return oId === objetivoId;
    });
    return objetivo ? `${objetivo.codigoReferencia} - ${objetivo.nombre}` : 'N/A';
  };

  const getIndicadorNombre = (indicadorId: string | { _id: string; nombre: string }): string => {
    if (typeof indicadorId === 'object' && indicadorId !== null) {
      return indicadorId.nombre || 'N/A';
    }
    const indicador = indicadores.find(i => {
      const iId = extractId(i);
      return iId === indicadorId;
    });
    return indicador ? `${indicador.codigo} - ${indicador.nombre}` : 'N/A';
  };

  return (
    <div className="create-poa-container">
      <div className="create-poa-header">
        <h1>Crear POA</h1>
      </div>

      <div className="poa-form-section">
        <h2>Información del POA</h2>
        <div className="poa-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipo">
                Tipo <span className="required">*</span>
              </label>
              <select
                id="tipo"
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value as POAType | '');
                  setAreaId('');
                  setCarreraId('');
                }}
                className={errors.tipo ? 'error' : ''}
              >
                <option value="">Seleccione un tipo</option>
                <option value="area">Área</option>
                <option value="carrera">Carrera</option>
              </select>
              {errors.tipo && <span className="error-message">{errors.tipo}</span>}
            </div>

            {tipo === 'area' && (
              <div className="form-group">
                <label htmlFor="areaId">
                  Área <span className="required">*</span>
                </label>
                <select
                  id="areaId"
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className={errors.areaId ? 'error' : ''}
                >
                  <option value="">Seleccione un área</option>
                  {areas.map((area) => {
                    const areaId = extractId(area);
                    return (
                      <option key={areaId} value={areaId}>
                        {area.nombre}
                      </option>
                    );
                  })}
                </select>
                {errors.areaId && <span className="error-message">{errors.areaId}</span>}
              </div>
            )}

            {tipo === 'carrera' && (
              <div className="form-group">
                <label htmlFor="carreraId">
                  Carrera <span className="required">*</span>
                </label>
                <select
                  id="carreraId"
                  value={carreraId}
                  onChange={(e) => setCarreraId(e.target.value)}
                  className={errors.carreraId ? 'error' : ''}
                >
                  <option value="">Seleccione una carrera</option>
                  {carreras.map((carrera) => {
                    const carreraId = extractId(carrera);
                    return (
                      <option key={carreraId} value={carreraId}>
                        {carrera.nombre}
                      </option>
                    );
                  })}
                </select>
                {errors.carreraId && <span className="error-message">{errors.carreraId}</span>}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="periodo">
                Período (Año) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="periodo"
                value={periodo}
                onChange={(e) => setPeriodo(parseInt(e.target.value) || new Date().getFullYear())}
                min="2000"
                max="2100"
                className={errors.periodo ? 'error' : ''}
              />
              {errors.periodo && <span className="error-message">{errors.periodo}</span>}
            </div>

            <div className="form-group">
              {/* Espacio vacío para mantener el grid balanceado */}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fechaInicio">
                Fecha de Inicio <span className="required">*</span>
              </label>
              <input
                type="date"
                id="fechaInicio"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className={errors.fechaInicio ? 'error' : ''}
              />
              {errors.fechaInicio && <span className="error-message">{errors.fechaInicio}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fechaFin">
                Fecha de Fin <span className="required">*</span>
              </label>
              <input
                type="date"
                id="fechaFin"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className={errors.fechaFin ? 'error' : ''}
              />
              {errors.fechaFin && <span className="error-message">{errors.fechaFin}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-create-poa"
              onClick={handleCreatePOA}
              disabled={!!poaId}
            >
              {poaId ? 'POA Creado' : 'Crear POA'}
            </button>
          </div>
        </div>
      </div>

      {poaId && (
        <div className="actividades-section">
          <div className="actividades-header">
            <h2>Actividades</h2>
            <button className="btn-add-actividad" onClick={handleAddActividad}>
              Agregar Actividad
            </button>
          </div>

          {actividades.length === 0 ? (
            <div className="empty-state">
              <p>No hay actividades agregadas. Haga clic en "Agregar Actividad" para comenzar.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="actividades-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Frecuencia</th>
                    <th>Línea Estratégica</th>
                    <th>Objetivo</th>
                    <th>Indicador</th>
                    <th>Responsable</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {actividades.map((actividad) => {
                    const actividadId = actividad.id || actividad._id || '';
                    return (
                      <tr key={actividadId}>
                        <td className="nombre-cell">{actividad.nombre}</td>
                        <td className="descripcion-cell">{actividad.descripcion}</td>
                        <td>{actividad.frecuencia}</td>
                        <td>{getLineaNombre(actividad.lineaId)}</td>
                        <td className="objetivo-cell">{getObjetivoNombre(actividad.objetivoId)}</td>
                        <td className="indicador-cell">{getIndicadorNombre(actividad.indicadorId)}</td>
                        <td>{actividad.responsable}</td>
                        <td>
                          <span className={`estado-badge ${getEstadoBadgeClass(actividad.estado)}`}>
                            {actividad.estado}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-edit"
                              onClick={() => handleEditActividad(actividad)}
                            >
                              Editar
                            </button>
                            <button
                              className="btn-delete"
                              onClick={() => handleDeleteActividad(actividadId)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isActividadFormOpen && (
        <ActividadForm
          onClose={() => {
            setIsActividadFormOpen(false);
            setEditingActividad(undefined);
          }}
          onSave={handleSaveActividad}
          actividad={editingActividad}
          fechaInicioPOA={fechaInicio}
          fechaFinPOA={fechaFin}
        />
      )}
    </div>
  );
};

