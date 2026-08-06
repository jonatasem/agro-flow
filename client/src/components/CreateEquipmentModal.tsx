// Importa a biblioteca React e o hook useState para o controle de estados locais do formulário.
import React, { useState } from "react";

// Importa a instância pré-configurada do Axios para comunicação HTTP com o back-end.
import { api } from "../services/api"

// Importa o utilitário seguro para tratamento e exibição amigável de mensagens de erro.
import { getErrorMessage } from "../utility/getErrorMessage";

// Define a interface TypeScript mapeando as propriedades (props) obrigatórias que o modal receberá do componente pai.
interface ModalProps {
  isOpen: boolean;       // Controla a visibilidade (abrir/fechar) do modal na interface.
  onClose: () => void;   // Callback acionado para fechar a janela do modal.
  onSuccess: () => void; // Callback acionado após o cadastro bem-sucedido para atualizar as tabelas em tela.
}

// Define e exporta o componente utilizando a tipagem padrão Functional Component (FC) do React.
export const CreateEquipmentModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Estados locais para controlar individualmente o valor textual dos inputs do formulário.
  const [fleet, setFleet] = useState("");
  const [name, setName] = useState("");
  
  // Estados de controle para gerenciar o andamento assíncrono do envio (loading) e alertas de erro.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Curto-circuito: se o estado 'isOpen' for falso, remove completamente o modal da árvore do DOM.
  if (!isOpen) return null;

  // Manipulador assíncrono responsável por submeter os dados inseridos e salvar o equipamento.
  const handleSubmit = async (e: React.FormEvent) => {
    // Intercepta e impede o comportamento padrão do navegador de recarregar a tela inteira.
    e.preventDefault();
    
    // Validação de segurança: barra a execução se a frota ou o modelo contiverem apenas espaços vazios.
    if (!fleet.trim() || !name.trim()) return;

    try {
      // Ativa o estado de carregamento e limpa traços de mensagens de erro antigas da interface.
      setLoading(true);
      setError("");
      
      // Rota do backend: Dispara uma requisição HTTP POST transmitindo os dados de frota e modelo.
      await api.post("/equipment", { fleet, name });
      
      // Se a requisição foi salva com sucesso, reseta todos os campos do formulário para o valor original vazio.
      setFleet("");
      setName("");
      
      // Notifica o painel pai sobre o sucesso do cadastro para recarregar a listagem e fecha o modal.
      onSuccess();
      onClose();
    } catch (err: unknown) {
      // Captura a falha na requisição e exibe um aviso dinâmico amigável na tela.
      setError(getErrorMessage(err, "Erro ao cadastrar equipamento."));
    } finally {
      // Garante a desativação do indicador visual de carregamento (sucesso ou falha na API).
      setLoading(false);
    }
  };

  return (
    // Telhado/Overlay escuro e semi-transparente fixado cobrindo toda a tela para focar a atenção no modal.
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      {/* Caixa/Card principal do formulário com bordas arredondadas e sombra pesada. */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
        
        {/* Cabeçalho do modal contendo o título da ação e o botão rápido de fechar (X). */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-100">Novo Equipamento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Bloco de alerta visual para mensagens de erro, renderizado de forma condicional. */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Início do Formulário de Cadastro. */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo 1: Frota / Prefixo identificador do maquinário. */}
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Frota / Prefixo</label>
            <input
              type="text"
              required // Ativa a validação nativa de campo obrigatório pelo navegador.
              placeholder="Ex: TR-102"
              value={fleet}
              onChange={(e) => setFleet(e.target.value)} // Sincroniza a digitação do usuário com o estado local.
              disabled={loading} // Bloqueia edições nos inputs enquanto os dados são enviados.
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Campo 2: Nome / Modelo descritivo do maquinário agrícola. */}
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-semibold">Nome / Modelo</label>
            <input
              type="text"
              required
              placeholder="Ex: Trator John Deere 6115J"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Seção inferior alinhada à direita contendo os botões de controle final. */}
          <div className="flex justify-end gap-2 pt-2">
            {/* Botão de Cancelar: aborta a operação corrente e fecha a janela. */}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-xl"
            >
              Cancelar
            </button>
            
            {/* Botão de Envio: dispara a rotina de envio e validação do formulário. */}
            <button
              type="submit"
              disabled={loading} // Desativa cliques duplicados para evitar múltiplos cadastros seguidos na API.
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all"
            >
              {/* Texto dinâmico que informa o andamento do registro interno. */}
              {loading ? "Salvando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
