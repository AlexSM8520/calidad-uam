import { useState } from 'react';
import type { User, UserRole } from '../../models/User';
import { userViewModel } from '../../viewmodels/UserViewModel';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import './UserForm.css';

interface UserFormProps {
  onClose: () => void;
  onSave: (user: Omit<User, 'id'>) => void;
  user?: User;
}

export const UserForm = ({ onClose, onSave, user }: UserFormProps) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    password: user ? '' : '', // Only required for new users
    email: user?.email || '',
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    rol: user?.rol || 'Usuario' as UserRole,
    activo: user?.activo ?? true,
    tipoRelacion: (user?.carreraId ? 'carrera' : user?.areaId ? 'area' : '') as 'carrera' | 'area' | '',
    carreraId: user?.carreraId || '',
    areaId: user?.areaId || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida para nuevos usuarios';
    }

    if (formData.password && formData.password.length < 3) {
      newErrors.password = 'La contraseña debe tener al menos 3 caracteres';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (formData.rol === 'Usuario') {
      if (!formData.tipoRelacion) {
        newErrors.tipoRelacion = 'Debe seleccionar si está relacionado con una carrera o área';
      }
      if (formData.tipoRelacion === 'carrera' && !formData.carreraId) {
        newErrors.carreraId = 'Debe seleccionar una carrera';
      }
      if (formData.tipoRelacion === 'area' && !formData.areaId) {
        newErrors.areaId = 'Debe seleccionar un área';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Build user data according to API requirements
      const userData: Omit<User, 'id'> = {
        username: formData.username,
        email: formData.email || undefined,
        nombre: formData.nombre || undefined,
        apellido: formData.apellido || undefined,
        rol: formData.rol,
        activo: formData.activo,
        carreraId: formData.rol === 'Usuario' && formData.tipoRelacion === 'carrera' ? formData.carreraId : undefined,
        areaId: formData.rol === 'Usuario' && formData.tipoRelacion === 'area' ? formData.areaId : undefined,
      };

      // Password is required for new users, optional for updates
      if (!user) {
        // Creating new user - password is required
        userData.password = formData.password;
      } else if (formData.password.trim()) {
        // Updating user - only include password if it was changed
        userData.password = formData.password;
      }
      // If editing and password is empty, don't include it in the update

      onSave(userData);
      onClose();
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Reset relacion when tipoRelacion changes
      if (field === 'tipoRelacion') {
        newData.carreraId = '';
        newData.areaId = '';
      }
      return newData;
    });
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const roles = userViewModel.getRoles();
  const carreras = poaViewModel.getCarreras();
  const areas = poaViewModel.getAreas();
  const isUsuario = formData.rol === 'Usuario';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{user ? 'Editar Usuario' : 'Agregar Usuario'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="user-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">
                Nombre de Usuario <span className="required">*</span>
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                className={errors.username ? 'error' : ''}
                placeholder="Ingrese el nombre de usuario"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Contraseña {!user && <span className="required">*</span>}
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={errors.password ? 'error' : ''}
                  placeholder={user ? 'Dejar vacío para mantener la actual' : 'Ingrese la contraseña'}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
              {user && <small className="form-hint">Dejar vacío para mantener la contraseña actual</small>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ingrese el nombre"
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                type="text"
                id="apellido"
                value={formData.apellido}
                onChange={(e) => handleChange('apellido', e.target.value)}
                placeholder="Ingrese el apellido"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={errors.email ? 'error' : ''}
                placeholder="usuario@uam.edu.ni"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="rol">
                Rol <span className="required">*</span>
              </label>
              <select
                id="rol"
                value={formData.rol}
                onChange={(e) => handleChange('rol', e.target.value)}
                className="form-select"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isUsuario && (
            <>
              <div className="form-group">
                <label htmlFor="tipoRelacion">
                  Relacionado con <span className="required">*</span>
                </label>
                <select
                  id="tipoRelacion"
                  value={formData.tipoRelacion}
                  onChange={(e) => handleChange('tipoRelacion', e.target.value)}
                  className={`form-select ${errors.tipoRelacion ? 'error' : ''}`}
                >
                  <option value="">Seleccione...</option>
                  <option value="carrera">Carrera</option>
                  <option value="area">Área</option>
                </select>
                {errors.tipoRelacion && <span className="error-message">{errors.tipoRelacion}</span>}
              </div>

              {formData.tipoRelacion === 'carrera' && (
                <div className="form-group">
                  <label htmlFor="carreraId">
                    Carrera <span className="required">*</span>
                  </label>
                  <select
                    id="carreraId"
                    value={formData.carreraId}
                    onChange={(e) => handleChange('carreraId', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Seleccione una carrera</option>
                    {carreras.map((carrera) => (
                      <option key={carrera.id} value={carrera.id}>
                        {carrera.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.carreraId && <span className="error-message">{errors.carreraId}</span>}
                </div>
              )}

              {formData.tipoRelacion === 'area' && (
                <div className="form-group">
                  <label htmlFor="areaId">
                    Área <span className="required">*</span>
                  </label>
                  <select
                    id="areaId"
                    value={formData.areaId}
                    onChange={(e) => handleChange('areaId', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Seleccione un área</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.areaId && <span className="error-message">{errors.areaId}</span>}
                </div>
              )}
            </>
          )}

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => handleChange('activo', e.target.checked)}
              />
              <span>Usuario activo</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              {user ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

