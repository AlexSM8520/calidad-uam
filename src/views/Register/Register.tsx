import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { areaService } from '../../services/areaService';
import { carreraService } from '../../services/carreraService';
import { normalizeArray } from '../../utils/modelHelpers';
import './Register.css';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    nombre: '',
    apellido: '',
    tipoRelacion: '' as 'carrera' | 'area' | '',
    carreraId: '',
    areaId: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [carreras, setCarreras] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const { isAuthenticated, register } = useAuthStore();

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated) {
      navigate('/home');
    }

    // Load carreras and areas (public endpoints, no auth required)
    const loadData = async () => {
      try {
        const [carrerasData, areasData] = await Promise.all([
          carreraService.getAll(),
          areaService.getAll(),
        ]);
        setCarreras(normalizeArray(carrerasData));
        setAreas(normalizeArray(areasData));
      } catch (error) {
        console.error('Error loading carreras and areas:', error);
      }
    };

    loadData();
  }, [navigate]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validate = (): boolean => {
    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido');
      return false;
    }

    if (formData.password.length < 3) {
      setError('La contraseña debe tener al menos 3 caracteres');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('El email no es válido');
      return false;
    }

    // Must provide either carreraId OR areaId
    if (!formData.tipoRelacion) {
      setError('Debe seleccionar si está relacionado con una carrera o área');
      return false;
    }

    if (formData.tipoRelacion === 'carrera' && !formData.carreraId) {
      setError('Debe seleccionar una carrera');
      return false;
    }

    if (formData.tipoRelacion === 'area' && !formData.areaId) {
      setError('Debe seleccionar un área');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, tipoRelacion, ...registerData } = formData;
      
      // Prepare request body according to API spec
      const requestBody: any = {
        username: registerData.username,
        password: registerData.password,
        email: registerData.email || undefined,
        nombre: registerData.nombre || undefined,
        apellido: registerData.apellido || undefined,
      };

      // Add carreraId or areaId (not both, not neither)
      if (tipoRelacion === 'carrera') {
        requestBody.carreraId = registerData.carreraId;
      } else if (tipoRelacion === 'area') {
        requestBody.areaId = registerData.areaId;
      }

      // Register and update auth state
      const success = await register(requestBody);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Error al registrar el usuario');
      }
    } catch (error: any) {
      setError(error.message || 'Error al registrar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Registro de Usuario</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario *</label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="Ingrese nombre de usuario"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Ingrese email (opcional)"
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ingrese nombre"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                type="text"
                value={formData.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                placeholder="Ingrese apellido"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña *</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Mínimo 3 caracteres"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Confirme la contraseña"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipoRelacion">Relacionado con *</label>
            <select
              id="tipoRelacion"
              value={formData.tipoRelacion}
              onChange={(e) => {
                handleChange('tipoRelacion', e.target.value);
                // Reset selection when tipo changes
                setFormData(prev => ({ ...prev, carreraId: '', areaId: '' }));
              }}
              className="form-select"
              required
              disabled={isLoading}
            >
              <option value="">Seleccione...</option>
              <option value="carrera">Carrera</option>
              <option value="area">Área</option>
            </select>
          </div>

          {formData.tipoRelacion === 'carrera' && (
            <div className="form-group">
              <label htmlFor="carreraId">Carrera *</label>
              <select
                id="carreraId"
                value={formData.carreraId}
                onChange={(e) => handleChange('carreraId', e.target.value)}
                className="form-select"
                required
                disabled={isLoading}
              >
                <option value="">Seleccione una carrera</option>
                {carreras.map((carrera) => (
                  <option key={carrera.id || carrera._id} value={carrera.id || carrera._id}>
                    {carrera.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.tipoRelacion === 'area' && (
            <div className="form-group">
              <label htmlFor="areaId">Área *</label>
              <select
                id="areaId"
                value={formData.areaId}
                onChange={(e) => handleChange('areaId', e.target.value)}
                className="form-select"
                required
                disabled={isLoading}
              >
                <option value="">Seleccione un área</option>
                {areas.map((area) => (
                  <option key={area.id || area._id} value={area.id || area._id}>
                    {area.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading} className="register-button">
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>

          <div className="register-footer">
            <p>
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

