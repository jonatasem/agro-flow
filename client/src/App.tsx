import { ProtectedRoute } from "./routes/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";

export default function App() {
  return (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  );
}
