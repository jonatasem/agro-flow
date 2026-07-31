import { useAuth } from "./hooks/useAuth";
import { AuthProvider } from "./contexts/AuthProvider";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";

const Main: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-sm animate-pulse">Carregando dados da sessão...</p>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <Login />;
};

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
