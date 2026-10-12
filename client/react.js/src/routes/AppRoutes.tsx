import { BrowserRouter, Routes, Route, Navigate } from "react-router";

// Páginas da aplicação
import { LoginPage } from "../pages/Login/LoginPage";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { UserProfile } from "../pages/Profile/UserProfile";
import { CollaboratorsPage } from "../pages/Collaborators/CollaboratorsPage";

// Componente de proteção de rotas e permissões
import { ProtectedRoute } from "./ProtectedRoute";
import { PERMISSIONS } from "../utils/permission";

// Módulo central de roteamento e navegação da aplicação
export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública de login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas protegidas padrão */}
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

        {/* Rota protegida com validação de permissão específica */}
        <Route
          path="/collaborators"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.COLLABORATOR_MANAGE}>
              <CollaboratorsPage />
            </ProtectedRoute>
          }
        />

        {/* Redirecionamento de segurança para rotas inexistentes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}