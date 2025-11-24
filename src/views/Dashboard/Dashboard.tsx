import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authViewModel } from '../../viewmodels/AuthViewModel';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import type { POA } from '../../models/POA';
import './Dashboard.css';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(authViewModel.getAuthState().user);
  const [poas, setPoas] = useState<POA[]>([]);

  useEffect(() => {
    const unsubscribe = poaViewModel.subscribe(() => {
      const allPOAs = poaViewModel.getPOAs();
      // Filter POAs based on user's carrera or area
      if (user && user.rol === 'Usuario') {
        const filteredPOAs = allPOAs.filter(poa => {
          if (user.carreraId && poa.tipo === 'carrera') {
            return poa.carreraId === user.carreraId;
          }
          if (user.areaId && poa.tipo === 'area') {
            return poa.areaId === user.areaId;
          }
          return false;
        });
        setPoas(filteredPOAs);
      } else {
        setPoas(allPOAs);
      }
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const unsubscribe = authViewModel.subscribe((state) => {
      setUser(state.user);
    });
    return unsubscribe;
  }, []);

  const getEntityName = (poa: POA) => {
    if (poa.tipo === 'area' && poa.areaId) {
      const area = poaViewModel.getAreas().find(a => a.id === poa.areaId);
      return area?.nombre || 'N/A';
    }
    if (poa.tipo === 'carrera' && poa.carreraId) {
      const carrera = poaViewModel.getCarreras().find(c => c.id === poa.carreraId);
      return carrera?.nombre || 'N/A';
    }
    return 'N/A';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const totalPOAs = poas.length;
  const totalActividades = poas.reduce((sum, poa) => sum + poa.actividades.length, 0);
  const poasActivos = poas.filter(poa => {
    const hoy = new Date();
    const inicio = new Date(poa.fechaInicio);
    const fin = new Date(poa.fechaFin);
    return inicio <= hoy && hoy <= fin;
  }).length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="welcome-message">
            Bienvenido, {user?.nombre || user?.username || 'Usuario'}
          </p>
        </div>
        <div className="user-info">
          <span className="user-role">{user?.rol}</span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{totalPOAs}</h3>
            <p>POAs Totales</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{poasActivos}</h3>
            <p>POAs Activos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{totalActividades}</h3>
            <p>Actividades Totales</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>POAs Recientes</h2>
          <button className="btn-view-all" onClick={() => navigate('/user-poas')}>
            Ver Todos
          </button>
        </div>

        {poas.length === 0 ? (
          <div className="empty-state">
            <p>No hay POAs disponibles.</p>
          </div>
        ) : (
          <div className="poas-grid">
            {poas.slice(0, 6).map((poa) => (
              <div key={poa.id} className="poa-card" onClick={() => navigate(`/user-poas/${poa.id}`)}>
                <div className="poa-card-header">
                  <span className="poa-type">{poa.tipo === 'area' ? 'Área' : 'Carrera'}</span>
                  <span className="poa-periodo">{poa.periodo}</span>
                </div>
                <div className="poa-card-body">
                  <h3>{getEntityName(poa)}</h3>
                  <div className="poa-dates">
                    <span>📅 {formatDate(poa.fechaInicio)} - {formatDate(poa.fechaFin)}</span>
                  </div>
                  <div className="poa-activities">
                    <span>📋 {poa.actividades.length} actividad{poa.actividades.length !== 1 ? 'es' : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

