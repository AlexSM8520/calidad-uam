import { useState, useEffect } from 'react';
import { userViewModel } from '../../viewmodels/UserViewModel';
import { poaViewModel } from '../../viewmodels/POAViewModel';
import { UserForm } from '../../components/UserForm/UserForm';
import type { User as UserType } from '../../models/User';
import { extractId } from '../../utils/modelHelpers';
import './Users.css';

export const Users = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | undefined>(undefined);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterActivo, setFilterActivo] = useState<string>('');

  useEffect(() => {
    console.log('Users component: Setting up subscription');
    const unsubscribe = userViewModel.subscribe(() => {
      const loadedUsers = userViewModel.getUsers();
      console.log('Users component: Users from ViewModel:', loadedUsers);
      setUsers(loadedUsers);
    });
    return unsubscribe;
  }, []);

  const handleOpenForm = () => {
    setEditingUser(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(undefined);
  };

  const handleSaveUser = async (userData: Omit<UserType, 'id'>) => {
    try {
      if (editingUser) {
        const userId = extractId(editingUser);
        if (userId) {
          await userViewModel.updateUser(userId, userData);
        }
      } else {
        await userViewModel.createUser(userData);
      }
      handleCloseForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar el usuario');
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await userViewModel.deleteUser(userId);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al eliminar el usuario');
      }
    }
  };

  const handleToggleActivo = async (user: UserType) => {
    try {
      const userId = extractId(user);
      if (userId) {
        await userViewModel.updateUser(userId, { activo: !user.activo });
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al actualizar el estado del usuario');
    }
  };

  const filteredUsers = users.filter(user => {
    // Filter out invalid users (must have username)
    if (!user || !user.username) return false;
    if (filterRole && user.rol !== filterRole) return false;
    if (filterActivo === 'activo' && !user.activo) return false;
    if (filterActivo === 'inactivo' && user.activo) return false;
    return true;
  });

  const roles = userViewModel.getRoles();

  const getRelacionNombre = (user: UserType) => {
    if (user.carreraId) {
      const carrera = poaViewModel.getCarreras().find(c => c.id === user.carreraId);
      return carrera ? `Carrera: ${carrera.nombre}` : 'N/A';
    }
    if (user.areaId) {
      const area = poaViewModel.getAreas().find(a => a.id === user.areaId);
      return area ? `Área: ${area.nombre}` : 'N/A';
    }
    return '-';
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Usuarios</h1>
        <button className="btn-add" onClick={handleOpenForm}>
          Agregar Usuario
        </button>
      </div>

      {users.length > 0 && (
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="role-filter">Filtrar por Rol:</label>
            <select
              id="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="activo-filter">Filtrar por Estado:</label>
            <select
              id="activo-filter"
              value={filterActivo}
              onChange={(e) => setFilterActivo(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No hay usuarios registrados. Haga clic en "Agregar Usuario" para comenzar.</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>No hay usuarios que coincidan con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Relación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const userId = extractId(user);
                return (
                <tr key={userId || user.username}>
                  <td className="username-cell">{user.username}</td>
                  <td className="name-cell">
                    {user.nombre || user.apellido
                      ? `${user.nombre || ''} ${user.apellido || ''}`.trim()
                      : <span className="no-data">-</span>}
                  </td>
                  <td className="email-cell">
                    {user.email || <span className="no-data">-</span>}
                  </td>
                  <td>
                    <span className={`role-badge role-${user.rol.toLowerCase()}`}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="relacion-cell">
                    {user.rol === 'Usuario' ? getRelacionNombre(user) : '-'}
                  </td>
                  <td>
                    <button
                      className={`status-toggle ${user.activo ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActivo(user)}
                      title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                    >
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditUser(user)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => {
                          const userId = extractId(user);
                          if (userId) handleDeleteUser(userId);
                        }}
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

      {isFormOpen && (
        <UserForm
          onClose={handleCloseForm}
          onSave={handleSaveUser}
          user={editingUser}
        />
      )}
    </div>
  );
};

