import { BrowserRouter, Routes, Route } from 'react-router';
import { DashboardPage } from '../pages/DashboardPage';
import { UserProfile } from '../pages/UserProfile';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';
import { CollaboratorsPage } from '../pages/CollaboratorsPage';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública de login */}
        <Route path="/login" element={<LoginPage />} />

        {/*Redireciona o usuario caso digite uma rota que nao exista, se tiver logado */}
        <Route path="*" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
         } />

        {/* Rotas protegidas por token */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } 
        />

        {/* Acesso ADMIN */}
        <Route 
          path="/collaborators" 
          element={
            <ProtectedRoute allowedRoles={["Admin", "Líder", "Lider", "Gerente", "Supervisor"]}>
              <CollaboratorsPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
};
