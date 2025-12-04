import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Layout } from './components/Layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Login } from './views/Login/Login';
import { Register } from './views/Register/Register';
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
import { CargarEvidencias } from './views/CargarEvidencias/CargarEvidencias';
import { RoleProtectedRoute } from './components/RoleProtectedRoute/RoleProtectedRoute';
import { useAuthStore } from './stores/authStore';
import './App.css';

function App() {
  const { isAuthenticated, isInitializing, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize after component mounts
    // Zustand persist will have rehydrated by this point
    initialize();
  }, [initialize]);

  // Show loading state while initializing session
  if (isInitializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'var(--color-text-secondary)'
      }}>
        Cargando...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Register />
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
        <Route path="/cargar-evidencias" element={
          <RoleProtectedRoute allowedRoles={['Administrador']}>
            <Layout>
              <CargarEvidencias />
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

