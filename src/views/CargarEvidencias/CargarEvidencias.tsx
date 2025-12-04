import { useState, useEffect } from 'react';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import { evidenciaViewModel } from '../../viewmodels/EvidenciaViewModel';
import { lineaViewModel } from '../../viewmodels/LineaViewModel';
import { objetivoViewModel } from '../../viewmodels/ObjetivoViewModel';
import { indicadorViewModel } from '../../viewmodels/IndicadorViewModel';
import type { POA, Actividad } from '../../models/POA';
import type { Evidencia } from '../../models/Evidencia';
import { extractId } from '../../utils/modelHelpers';
import { evidenciaService } from '../../services/evidenciaService';
import './CargarEvidencias.css';

export const CargarEvidencias = () => {
  const [poas, setPOAs] = useState<POA[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [selectedPOA, setSelectedPOA] = useState<string>('');
  const [selectedActividad, setSelectedActividad] = useState<string>('');
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState<{
    actividadId: string;
    poaId: string;
    nombre: string;
    descripcion: string;
    file: File | null;
  } | null>(null);

  useEffect(() => {
    const unsubscribePOA = poaViewModel.subscribe(() => {
      setPOAs(poaViewModel.getPOAs());
    });

    const unsubscribeEvidencia = evidenciaViewModel.subscribe(() => {
      setEvidencias(evidenciaViewModel.getEvidencias());
    });

    return () => {
      unsubscribePOA();
      unsubscribeEvidencia();
    };
  }, []);

  const getAreaNombre = (areaId: POA['areaId']): string => {
    if (!areaId) return 'N/A';
    if (typeof areaId === 'object' && 'nombre' in areaId) {
      return areaId.nombre || 'N/A';
    }
    const areaIdStr = typeof areaId === 'string' ? areaId : extractId(areaId);
    const area = poaViewModel.getAreas().find(a => extractId(a) === areaIdStr);
    return area?.nombre || 'N/A';
  };

  const getCarreraNombre = (carreraId: POA['carreraId']): string => {
    if (!carreraId) return 'N/A';
    if (typeof carreraId === 'object' && 'nombre' in carreraId) {
      return carreraId.nombre || 'N/A';
    }
    const carreraIdStr = typeof carreraId === 'string' ? carreraId : extractId(carreraId);
    const carrera = poaViewModel.getCarreras().find(c => extractId(c) === carreraIdStr);
    return carrera?.nombre || 'N/A';
  };

  const getLineaNombre = (lineaId: string | { _id?: string; nombre?: string }): string => {
    const id = extractId(lineaId);
    const linea = lineaViewModel.getLineas().find(l => extractId(l) === id);
    return linea?.nombre || 'N/A';
  };

  const getObjetivoNombre = (objetivoId: string | { _id?: string; nombre?: string }): string => {
    const id = extractId(objetivoId);
    const objetivo = objetivoViewModel.getAllObjetivos().find(o => extractId(o) === id);
    return objetivo ? `${objetivo.codigoReferencia} - ${objetivo.nombre}` : 'N/A';
  };

  const getIndicadorNombre = (indicadorId: string | { _id?: string; nombre?: string }): string => {
    const id = extractId(indicadorId);
    const indicador = indicadorViewModel.getAllIndicadores().find(i => extractId(i) === id);
    return indicador ? `${indicador.codigo} - ${indicador.nombre}` : 'N/A';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (actividadId: string, poaId: string) => {
    setUploadForm({
      actividadId,
      poaId,
      nombre: '',
      descripcion: '',
      file: null,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm(prev => prev ? {
        ...prev,
        file: e.target.files![0],
        nombre: prev.nombre || e.target.files![0].name,
      } : null);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm || !uploadForm.file) {
      alert('Por favor seleccione un archivo');
      return;
    }

    setUploading(uploadForm.actividadId);
    try {
      await evidenciaViewModel.uploadEvidencia(
        uploadForm.file,
        uploadForm.actividadId,
        uploadForm.poaId,
        uploadForm.nombre || undefined,
        uploadForm.descripcion || undefined
      );
      alert('Evidencia cargada exitosamente');
      setUploadForm(null);
      await evidenciaViewModel.refreshEvidencias(uploadForm.actividadId, uploadForm.poaId);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al cargar la evidencia');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (evidenciaId: string) => {
    if (!confirm('¿Está seguro de eliminar esta evidencia?')) {
      return;
    }

    try {
      await evidenciaViewModel.deleteEvidencia(evidenciaId);
      alert('Evidencia eliminada exitosamente');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al eliminar la evidencia');
    }
  };

  const getEvidenciasByActividad = (actividadId: string): Evidencia[] => {
    return evidencias.filter(e => extractId(e.actividadId) === actividadId);
  };

  const filteredPOAs = selectedPOA
    ? poas.filter(poa => extractId(poa) === selectedPOA)
    : poas;

  const allActividades: Array<{ actividad: Actividad; poa: POA }> = [];
  filteredPOAs.forEach(poa => {
    poa.actividades.forEach(actividad => {
      allActividades.push({ actividad, poa });
    });
  });

  const filteredActividades = selectedActividad
    ? allActividades.filter(item => extractId(item.actividad) === selectedActividad)
    : allActividades;

  return (
    <div className="cargar-evidencias-container">
      <div className="evidencias-header">
        <h1>Cargar Evidencias</h1>
        <p className="subtitle">Suba evidencias relacionadas con las actividades de los POAs</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="poa-filter">Filtrar por POA:</label>
          <select
            id="poa-filter"
            value={selectedPOA}
            onChange={(e) => {
              setSelectedPOA(e.target.value);
              setSelectedActividad('');
            }}
            className="filter-select"
          >
            <option value="">Todos los POAs</option>
            {poas.map((poa) => (
              <option key={extractId(poa)} value={extractId(poa)}>
                {poa.tipo === 'area' ? getAreaNombre(poa.areaId) : getCarreraNombre(poa.carreraId)} - {poa.periodo}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="actividad-filter">Filtrar por Actividad:</label>
          <select
            id="actividad-filter"
            value={selectedActividad}
            onChange={(e) => setSelectedActividad(e.target.value)}
            className="filter-select"
            disabled={!selectedPOA}
          >
            <option value="">Todas las actividades</option>
            {allActividades.map((item) => (
              <option key={extractId(item.actividad)} value={extractId(item.actividad)}>
                {item.actividad.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Activities List */}
      {filteredActividades.length === 0 ? (
        <div className="empty-state">
          <p>No hay actividades disponibles para mostrar evidencias.</p>
        </div>
      ) : (
        <div className="actividades-evidencias-list">
          {filteredActividades.map(({ actividad, poa }) => {
            const actividadId = extractId(actividad);
            const poaId = extractId(poa);
            const actividadEvidencias = getEvidenciasByActividad(actividadId);
            const isUploading = uploading === actividadId;

            return (
              <div key={actividadId} className="actividad-evidencias-card">
                <div className="actividad-header">
                  <div>
                    <h3>{actividad.nombre}</h3>
                    <p className="actividad-poa">
                      POA: {poa.tipo === 'area' ? getAreaNombre(poa.areaId) : getCarreraNombre(poa.carreraId)} - {poa.periodo}
                    </p>
                  </div>
                  <span className={`estado-badge estado-${actividad.estado.toLowerCase().replace(' ', '-')}`}>
                    {actividad.estado}
                  </span>
                </div>

                {actividad.descripcion && (
                  <p className="actividad-descripcion">{actividad.descripcion}</p>
                )}

                <div className="actividad-details">
                  <div className="detail-item">
                    <span className="detail-label">Responsable:</span>
                    <span className="detail-value">{actividad.responsable}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fechas:</span>
                    <span className="detail-value">
                      {formatDate(actividad.fechaInicio)} - {formatDate(actividad.fechaFin)}
                    </span>
                  </div>
                  {actividad.lineaId && (
                    <div className="detail-item">
                      <span className="detail-label">Línea:</span>
                      <span className="detail-value">{getLineaNombre(actividad.lineaId)}</span>
                    </div>
                  )}
                  {actividad.objetivoId && (
                    <div className="detail-item">
                      <span className="detail-label">Objetivo:</span>
                      <span className="detail-value">{getObjetivoNombre(actividad.objetivoId)}</span>
                    </div>
                  )}
                  {actividad.indicadorId && (
                    <div className="detail-item">
                      <span className="detail-label">Indicador:</span>
                      <span className="detail-value">{getIndicadorNombre(actividad.indicadorId)}</span>
                    </div>
                  )}
                </div>

                {/* Upload Form */}
                {uploadForm && uploadForm.actividadId === actividadId ? (
                  <div className="upload-form">
                    <h4>Subir Nueva Evidencia</h4>
                    <div className="form-group">
                      <label htmlFor="file-input">Archivo *</label>
                      <input
                        id="file-input"
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                        disabled={isUploading}
                      />
                      {uploadForm.file && (
                        <p className="file-info">
                          Archivo seleccionado: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor="nombre-input">Nombre (opcional)</label>
                      <input
                        id="nombre-input"
                        type="text"
                        value={uploadForm.nombre}
                        onChange={(e) => setUploadForm(prev => prev ? { ...prev, nombre: e.target.value } : null)}
                        placeholder="Nombre de la evidencia"
                        disabled={isUploading}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="descripcion-input">Descripción (opcional)</label>
                      <textarea
                        id="descripcion-input"
                        value={uploadForm.descripcion}
                        onChange={(e) => setUploadForm(prev => prev ? { ...prev, descripcion: e.target.value } : null)}
                        placeholder="Descripción de la evidencia"
                        rows={3}
                        disabled={isUploading}
                      />
                    </div>
                    <div className="form-actions">
                      <button
                        className="btn-upload"
                        onClick={handleUpload}
                        disabled={isUploading || !uploadForm.file}
                      >
                        {isUploading ? 'Subiendo...' : 'Subir Evidencia'}
                      </button>
                      <button
                        className="btn-cancel"
                        onClick={() => setUploadForm(null)}
                        disabled={isUploading}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="btn-add-evidencia"
                    onClick={() => handleFileSelect(actividadId, poaId)}
                  >
                    + Agregar Evidencia
                  </button>
                )}

                {/* Existing Evidencias */}
                {actividadEvidencias.length > 0 && (
                  <div className="evidencias-list">
                    <h4>Evidencias Cargadas ({actividadEvidencias.length})</h4>
                    <div className="evidencias-grid">
                      {actividadEvidencias.map((evidencia) => (
                        <div key={extractId(evidencia)} className="evidencia-card">
                          <div className="evidencia-header">
                            <h5>{evidencia.nombre || evidencia.nombreOriginal}</h5>
                            <span className={`tipo-badge tipo-${evidencia.tipo}`}>
                              {evidencia.tipo === 'imagen' ? '🖼️ Imagen' : '📄 Archivo'}
                            </span>
                          </div>
                          {evidencia.descripcion && (
                            <p className="evidencia-descripcion">{evidencia.descripcion}</p>
                          )}
                          <div className="evidencia-details">
                            <div className="detail-row">
                              <span className="detail-label">Archivo:</span>
                              <span className="detail-value">{evidencia.nombreOriginal}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Tamaño:</span>
                              <span className="detail-value">{formatFileSize(evidencia.tamaño)}</span>
                            </div>
                            <div className="detail-row">
                              <span className="detail-label">Tipo:</span>
                              <span className="detail-value">{evidencia.mimeType}</span>
                            </div>
                            {evidencia.uploadedBy && (
                              <div className="detail-row">
                                <span className="detail-label">Subido por:</span>
                                <span className="detail-value">
                                  {evidencia.uploadedBy.nombre && evidencia.uploadedBy.apellido
                                    ? `${evidencia.uploadedBy.nombre} ${evidencia.uploadedBy.apellido}`
                                    : evidencia.uploadedBy.username}
                                </span>
                              </div>
                            )}
                            <div className="detail-row">
                              <span className="detail-label">Fecha:</span>
                              <span className="detail-value">
                                {evidencia.createdAt ? formatDate(evidencia.createdAt) : 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="evidencia-actions">
                            <a
                              href={evidenciaService.getFileUrl(evidencia)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-view"
                            >
                              Ver/Descargar
                            </a>
                            <button
                              className="btn-delete"
                              onClick={() => handleDelete(extractId(evidencia))}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

