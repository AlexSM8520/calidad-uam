import { useState, useEffect } from 'react';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import { evidenciaViewModel } from '../../viewmodels/EvidenciaViewModel';
import type { POA } from '../../models/POA';
import type { Evidencia } from '../../models/Evidencia';
import { extractId } from '../../utils/modelHelpers';
import { evidenciaService } from '../../services/evidenciaService';
import './VerEvidencias.css';

export const VerEvidencias = () => {
  const [poas, setPOAs] = useState<POA[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [filterPOA, setFilterPOA] = useState<string>('');
  const [filterCarrera, setFilterCarrera] = useState<string>('');
  const [filterArea, setFilterArea] = useState<string>('');

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

  const getPOAFromEvidencia = (evidencia: Evidencia): POA | undefined => {
    const poaId = typeof evidencia.poaId === 'object' ? extractId(evidencia.poaId) : evidencia.poaId;
    return poas.find(p => extractId(p) === poaId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
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

  // Get unique carreras and areas from POAs
  const carreras = Array.from(
    new Set(
      poas
        .filter(poa => poa.tipo === 'carrera' && poa.carreraId)
        .map(poa => {
          if (typeof poa.carreraId === 'object' && 'nombre' in poa.carreraId) {
            return { id: extractId(poa.carreraId), nombre: poa.carreraId.nombre || 'N/A' };
          }
          const carreraId = typeof poa.carreraId === 'string' ? poa.carreraId : extractId(poa.carreraId);
          const carrera = poaViewModel.getCarreras().find(c => extractId(c) === carreraId);
          return { id: carreraId, nombre: carrera?.nombre || 'N/A' };
        })
        .map(c => c.id)
    )
  )
    .map(id => {
      const carrera = poaViewModel.getCarreras().find(c => extractId(c) === id);
      return { id, nombre: carrera?.nombre || 'N/A' };
    })
    .filter((c, index, self) => self.findIndex(cc => cc.id === c.id) === index);

  const areas = Array.from(
    new Set(
      poas
        .filter(poa => poa.tipo === 'area' && poa.areaId)
        .map(poa => {
          if (typeof poa.areaId === 'object' && 'nombre' in poa.areaId) {
            return { id: extractId(poa.areaId), nombre: poa.areaId.nombre || 'N/A' };
          }
          const areaId = typeof poa.areaId === 'string' ? poa.areaId : extractId(poa.areaId);
          const area = poaViewModel.getAreas().find(a => extractId(a) === areaId);
          return { id: areaId, nombre: area?.nombre || 'N/A' };
        })
        .map(a => a.id)
    )
  )
    .map(id => {
      const area = poaViewModel.getAreas().find(a => extractId(a) === id);
      return { id, nombre: area?.nombre || 'N/A' };
    })
    .filter((a, index, self) => self.findIndex(aa => aa.id === a.id) === index);

  // Filter evidencias
  const filteredEvidencias = evidencias.filter(evidencia => {
    const poa = getPOAFromEvidencia(evidencia);
    if (!poa) return false;

    // Filter by POA
    if (filterPOA && extractId(poa) !== filterPOA) return false;

    // Filter by Carrera
    if (filterCarrera && poa.tipo === 'carrera') {
      const carreraId = typeof poa.carreraId === 'object' ? extractId(poa.carreraId) : poa.carreraId;
      if (carreraId !== filterCarrera) return false;
    } else if (filterCarrera && poa.tipo === 'area') {
      return false; // If filtering by carrera, exclude area POAs
    }

    // Filter by Area
    if (filterArea && poa.tipo === 'area') {
      const areaId = typeof poa.areaId === 'object' ? extractId(poa.areaId) : poa.areaId;
      if (areaId !== filterArea) return false;
    } else if (filterArea && poa.tipo === 'carrera') {
      return false; // If filtering by area, exclude carrera POAs
    }

    return true;
  });

  // Group evidencias by POA
  const evidenciasByPOA = filteredEvidencias.reduce((acc, evidencia) => {
    const poa = getPOAFromEvidencia(evidencia);
    if (!poa) return acc;
    const poaId = extractId(poa);
    if (!acc[poaId]) {
      acc[poaId] = { poa, evidencias: [] };
    }
    acc[poaId].evidencias.push(evidencia);
    return acc;
  }, {} as Record<string, { poa: POA; evidencias: Evidencia[] }>);

  const clearFilters = () => {
    setFilterPOA('');
    setFilterCarrera('');
    setFilterArea('');
  };

  return (
    <div className="ver-evidencias-container">
      <div className="evidencias-header">
        <h1>Visualizar Evidencias</h1>
        <p className="subtitle">Filtre y visualice las evidencias cargadas en el sistema</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="poa-filter">Filtrar por POA:</label>
          <select
            id="poa-filter"
            value={filterPOA}
            onChange={(e) => setFilterPOA(e.target.value)}
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
          <label htmlFor="carrera-filter">Filtrar por Carrera:</label>
          <select
            id="carrera-filter"
            value={filterCarrera}
            onChange={(e) => {
              setFilterCarrera(e.target.value);
              setFilterArea(''); // Clear area filter when selecting carrera
            }}
            className="filter-select"
          >
            <option value="">Todas las carreras</option>
            {carreras.map((carrera) => (
              <option key={carrera.id} value={carrera.id}>
                {carrera.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="area-filter">Filtrar por Área:</label>
          <select
            id="area-filter"
            value={filterArea}
            onChange={(e) => {
              setFilterArea(e.target.value);
              setFilterCarrera(''); // Clear carrera filter when selecting area
            }}
            className="filter-select"
          >
            <option value="">Todas las áreas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.nombre}
              </option>
            ))}
          </select>
        </div>

        {(filterPOA || filterCarrera || filterArea) && (
          <button className="btn-clear-filters" onClick={clearFilters}>
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <div className="stat-card">
          <h3>{filteredEvidencias.length}</h3>
          <p>Evidencias encontradas</p>
        </div>
        <div className="stat-card">
          <h3>{Object.keys(evidenciasByPOA).length}</h3>
          <p>POAs con evidencias</p>
        </div>
      </div>

      {/* Evidencias List */}
      {filteredEvidencias.length === 0 ? (
        <div className="empty-state">
          <p>No se encontraron evidencias con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="evidencias-by-poa">
          {Object.values(evidenciasByPOA).map(({ poa, evidencias: poaEvidencias }) => (
            <div key={extractId(poa)} className="poa-evidencias-section">
              <div className="poa-header">
                <div>
                  <h2>
                    {poa.tipo === 'area' ? getAreaNombre(poa.areaId) : getCarreraNombre(poa.carreraId)}
                  </h2>
                  <p className="poa-info">
                    {poa.tipo === 'area' ? 'Área' : 'Carrera'} - Período {poa.periodo} | 
                    {formatDate(poa.fechaInicio)} - {formatDate(poa.fechaFin)}
                  </p>
                </div>
                <span className="evidencias-count-badge">
                  {poaEvidencias.length} evidencia{poaEvidencias.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="evidencias-grid">
                {poaEvidencias.map((evidencia) => (
                  <div key={extractId(evidencia)} className="evidencia-card">
                    <div className="evidencia-header">
                      <h3>{evidencia.nombre || evidencia.nombreOriginal}</h3>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

