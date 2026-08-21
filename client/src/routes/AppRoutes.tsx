import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { LoginPage } from "../pages/Login/LoginPage";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { UserProfile } from "../pages/Profile/UserProfile";
import { CollaboratorsPage } from "../pages/Collaborators/CollaboratorsPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { PERMISSIONS } from "../utils/permission";

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas protegidas */}
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

        {/* Gestão de Acesso - Protegido por permissão explícita */}
        <Route
          path="/collaborators"
          element={
            <ProtectedRoute requiredPermission={PERMISSIONS.COLLABORATOR_MANAGE}>
              <CollaboratorsPage />
            </ProtectedRoute>
          }
        />

        {/* Redirecionamento padrão para URLs inexistentes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};