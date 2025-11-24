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
              <Home />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/home" element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/linea" element={
          <ProtectedRoute>
            <Layout>
              <Linea />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/objetivos" element={
          <ProtectedRoute>
            <Layout>
              <Objetivos />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/indicadores" element={
          <ProtectedRoute>
            <Layout>
              <Indicadores />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/create-poa" element={
          <ProtectedRoute>
            <Layout>
              <CreatePOA />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/poas" element={
          <ProtectedRoute>
            <Layout>
              <POAs />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/edit-poa/:id" element={
          <ProtectedRoute>
            <Layout>
              <EditPOA />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/area" element={
          <ProtectedRoute>
            <Layout>
              <Area />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/carrera" element={
          <ProtectedRoute>
            <Layout>
              <Carrera />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/facultades" element={
          <ProtectedRoute>
            <Layout>
              <Facultades />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

