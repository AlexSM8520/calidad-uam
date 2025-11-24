import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout } from './components/Layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Login } from './views/Login/Login';
import { Home } from './views/Home/Home';
import { Linea } from './views/Linea/Linea';
import { Objetivos } from './views/Objetivos/Objetivos';
import { Indicadores } from './views/Indicadores/Indicadores';
import { Area } from './views/Area/Area';
import { Carrera } from './views/Carrera/Carrera';
import { CreatePOA } from './views/CreatePOA/CreatePOA';
import { EditPOA } from './views/EditPOA/EditPOA';
import { POAs } from './views/POAs/POAs';
import { Facultades } from './views/Facultades/Facultades';
import { Users } from './views/Users/Users';
import { Dashboard } from './views/Dashboard/Dashboard';
import { UserPOAs } from './views/UserPOAs/UserPOAs';
import { RoleProtectedRoute } from './components/RoleProtectedRoute/RoleProtectedRoute';
import { authViewModel } from './viewmodels/AuthViewModel';
import type { AuthState } from './models/User';
import './App.css';

function App() {
  const [authState, setAuthState] = useState<AuthState>(authViewModel.getAuthState());

  useEffect(() => {
    const unsubscribe = authViewModel.subscribe((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          authState.isAuthenticated ? <Navigate to="/home" replace /> : <Login />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <Home />
            </Layout>
          </RoleProtectedRoute>
        } />
        <Route path="/linea" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <Linea />
            </Layout>
          </RoleProtectedRoute>
        } />
        <Route path="/objetivos" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <Objetivos />
            </Layout>
          </RoleProtectedRoute>
        } />
        <Route path="/indicadores" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <Indicadores />
            </Layout>
          </RoleProtectedRoute>
        } />
        <Route path="/create-poa" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <CreatePOA />
            </Layout>
          </RoleProtectedRoute>
        } />
        <Route path="/poas" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <POAs />
            </Layout>
          </RoleProtectedRoute>
        } />
        <Route path="/edit-poa/:id" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <EditPOA />
            </Layout>
          </RoleProtectedRoute>
        } />
        <Route path="/area" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <Area />
            </Layout>
          </RoleProtectedRoute>
        } />
        <Route path="/carrera" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <Carrera />
            </Layout>
          </RoleProtectedRoute>
        } />
        <Route path="/facultades" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <Facultades />
            </Layout>
          </RoleProtectedRoute>
        } />
        <Route path="/users" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <Users />
            </Layout>
          </RoleProtectedRoute>
        } />
        <Route path="/user-poas" element={
          <ProtectedRoute>
            <Layout>
              <UserPOAs />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/user-poas/:id" element={
          <ProtectedRoute>
            <Layout>
              <UserPOAs />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

