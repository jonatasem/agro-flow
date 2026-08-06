// Importa a biblioteca React e o hook useState para o gerenciamento de estados locais.
import React, { useState } from "react";

// Importa a instância global pré-configurada do Axios para realizar as requisições HTTP.
import { api } from "../services/api";

// Importa o utilitário seguro para extração e tratamento de mensagens de erro vindas do servidor.
import { getErrorMessage } from "../utility/getErrorMessage";

// Define a interface TypeScript especificando as propriedades (props) obrigatórias que o modal receberá.
interface ModalProps {
  isOpen: boolean;       // Controla se a janela do modal está aberta ou invisível na tela.
  onClose: () => void;   // Callback acionado para fechar o modal.
  onSuccess: () => void; // Callback acionado quando o cadastro é bem-sucedido (atualiza as tabelas externas).
}

// Define e exporta o componente utilizando a tipagem padrão Functional Component (FC) do React.
export const CreateOperatorModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Estados locais para controlar individualmente o valor digitado em cada campo do formulário.
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados de controle para monitorar o andamento da requisição HTTP (loading) e alertas de erros.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Curto-circuito: se o modal não estiver com status de aberto, não renderiza absolutamente nada no DOM.
  if (!isOpen) return null;

  // CORREÇÃO: Método assíncrono disparado no envio do formulário, usando corretamente React.FormEvent.
  const handleSubmit = async (e: React.FormEvent) => {
    // Intercepta e impede o comportamento padrão do navegador de recarregar a tela inteira.
    e.preventDefault();
    
    // Validação de segurança: barra a execução se o nome ou a matrícula forem compostos apenas por espaços.
    if (!name.trim() || !registration.trim()) return;

    try {
      // Ativa o estado de carregamento e limpa traços de mensagens de erro antigas da interface.
      setLoading(true);
      setError("");

      // Envia uma requisição POST com o payload estruturado contendo as credenciais do novo operador.
      await api.post("/operator", {
        name,
        registration,
        city,
        password,
      });

      // Se a requisição foi bem-sucedida, reseta todos os campos do formulário de volta para o valor inicial vazio.
      setName("");
      setRegistration("");
      setCity("");
      setPassword("");
      
      // Notifica o painel pai sobre o sucesso do cadastro e fecha o modal.
      onSuccess();
      onClose();
    } catch (err: unknown) {
      // Captura a falha na requisição e exibe um aviso dinâmico amigável na tela.
      setError(getErrorMessage(err, "Erro ao cadastrar operador. Verifique os dados fornecidos."));
    } finally {
      // Garante a desativação do indicador de carregamento, independentemente de sucesso ou falha na API.
      setLoading(false);
    }
  };

  return (
    // Telhado/Overlay escuro fixado em toda a tela para dar foco visual ao modal centralizado.
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      {/* Caixa/Card principal do formulário com bordas arredondadas e sombra pesada. */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
        
        {/* Cabeçalho do modal contendo o título da ação e o botão rápido de fechamento. */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-100">Novo Operador</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Bloco de alerta visual para mensagens de erro, renderizado condicionalmente. */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Início do Formulário de Cadastro. */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo 1: Nome Completo do Operador. */}
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Nome Completo *</label>
            <input
              type="text"
              required // Torna o preenchimento deste campo obrigatório nativamente pelo navegador.
              placeholder="Ex: Carlos Silva"
              value={name}
              onChange={(e) => setName(e.target.value)} // Vincula a digitação do usuário ao estado local.
              disabled={loading} // Bloqueia edições enquanto os dados estão sendo enviados à API.
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Campo 2: Matrícula identificadora (Código de acesso principal). */}
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Matrícula *</label>
            <input
              type="text"
              required
              placeholder="Ex: OP-503"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Campo 3: Cidade ou Base operacional (Opcional). */}
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Cidade / Base</label>
            <input
              type="text"
              placeholder="Ex: Lucélia - SP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Campo 4: Senha secreta de acesso para o Login (Opcional, com placeholder indicativo). */}
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Senha de Acesso</label>
            <input
              type="password" // Oculta os caracteres digitados por privacidade e segurança.
              placeholder="Padrão: 123456"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Seção inferior contendo as ações finais do formulário. */}
          <div className="flex justify-end gap-2 pt-2">
            {/* Botão de Cancelar: aborta a operação e fecha a janela. */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl"
            >
              Cancelar
            </button>
            {/* Botão de Cadastro: aciona a validação e o envio do formulário. */}
            <button
              type="submit"
              disabled={loading} // Desativa cliques extras para evitar múltiplas criações seguidas na API.
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all"
            >
              {/* Texto dinâmico informando o andamento do registro interno. */}
              {loading ? "Salvando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
