// Importa o provedor de autenticação global para gerenciar e persistir as credenciais de login.
import { AuthProvider } from "./contexts/AuthProvider";

// Importa o componente de barreira protetora que impede acessos de usuários deslogados.
import { ProtectedRoute } from "./components/ProtectedRoute";

// Importa o painel principal (Dashboard) contendo as abas e cartões de Ordens de Serviço.
import { DashboardPage } from "./features/work-orders/pages/DashboardPage";

// Define e exporta como padrão o componente raiz da árvore do React chamado App.
export default function App() {
  return (
    // Inicializa o contexto global de login para que toda a árvore abaixo tenha acesso aos dados da sessão.
    <AuthProvider>
      {/* Aplica a barreira protetora: Se o usuário não estiver autenticado, ele será interceptado e verá a tela de Login. */}
      <ProtectedRoute>
        {/* Se a sessão estiver ativa e validada, o DashboardPage é renderizado com sucesso. */}
        <DashboardPage />
      </ProtectedRoute>
    </AuthProvider>
  );
}
