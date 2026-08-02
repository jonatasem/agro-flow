// Importa o React e os hooks necessários para controlar ciclo de vida e estados.
import React, { useEffect, useState } from "react";

// Importa o serviço de ordens de serviço e seu respectivo tipo de dado.
import { workOrderService, type WorkOrder } from "../services/workOrderService";

// Importa o hook customizado para buscar e listar os equipamentos disponíveis.
import { useEquipments } from "../../equipments/hooks/useEquipment";

// Importa o utilitário seguro para tratamento e exibição de mensagens de erro.
import { getErrorMessage } from "../../../utility/getErrorMessage";

// Define a interface TypeScript especificando as propriedades que o modal deve receber do componente pai.
interface CreateWorkOrderModalProps {
  isOpen: boolean;             // Controla se o modal está visível na tela.
  onClose: () => void;         // Função disparada para fechar o modal.
  onSuccess: () => void;       // Função disparada quando uma OS é salva com sucesso (atualiza a lista).
  initialData?: WorkOrder | null; // Dados opcionais da OS recebidos quando o fluxo for de edição.
}

// Define e exporta o componente do modal utilizando a tipagem de Functional Component (FC) do React.
export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}) => {
  // Extrai a lista de equipamentos e a função de atualização do hook de equipamentos.
  const { equipments, refetch: fetchEquipments } = useEquipments();

  // Estados locais para controlar cada campo do formulário, inicializados com dados existentes em caso de edição.
  const [fleet, setFleet] = useState(() => initialData?.equipment?.fleet || "");
  const [setor, setSetor] = useState(() => initialData?.setores?.[0]?.setor || "");
  const [qruDescricao, setQruDescricao] = useState(() => initialData?.setores?.[0]?.qruDescricao || "");
  const [qth, setQth] = useState(() => initialData?.setores?.[0]?.qth || "");
  const [city, setCity] = useState(() => initialData?.setores?.[0]?.city || "");
  
  // Estados para controlar o processo de salvamento (loading) e exibição de mensagens de erro.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Efeito responsável por monitorar a abertura do modal e preencher os inputs com os dados corretos.
  useEffect(() => {
    // Se o modal estiver fechado, interrompe a execução do efeito imediatamente.
    if (!isOpen) return;
    
    // Busca a lista atualizada de equipamentos no servidor assim que o modal abre.
    fetchEquipments();

    // Cria um timer assíncrono para garantir que os inputs atualizem logo após a montagem do modal na tela.
    const timer = setTimeout(() => {
      // Atualiza os estados locais com as propriedades da OS (edição) ou com campos vazios (criação).
      setFleet(initialData?.equipment?.fleet || "");
      setSetor(initialData?.setores?.[0]?.setor || "");
      setQruDescricao(initialData?.setores?.[0]?.qruDescricao || "");
      setQth(initialData?.setores?.[0]?.qth || "");
      setCity(initialData?.setores?.[0]?.city || "");
    }, 0);

    // Função de limpeza (cleanup) que desfaz o timer caso o modal feche antes do processamento acabar.
    return () => clearTimeout(timer);
  }, [isOpen, initialData, fetchEquipments]); // Monitora mudanças de abertura, dados iniciais ou do serviço.

  // Curto-circuito: se o estado 'isOpen' for falso, remove completamente o modal da árvore do DOM.
  if (!isOpen) return null;

  // Manipulador assíncrono disparado no envio do formulário.
  const handleSubmit = async (e: React.FormEvent) => {
    // Evita o comportamento padrão do navegador de recarregar a tela inteira.
    e.preventDefault();
    
    // Validação de segurança para garantir que nenhum dos campos obrigatórios possua apenas espaços em branco.
    if (!fleet.trim() || !setor.trim() || !qruDescricao.trim() || !qth.trim() || !city.trim()) return;

    try {
      // Ativa o estado de carregamento e limpa alertas de erros anteriores.
      setLoading(true);
      setError("");

      // Monta o objeto de dados estruturado no formato esperado pela API.
      const payload = {
        fleet,
        setor,
        qruDescricao,
        qth,
        city,
      };

      // Verifica se a propriedade 'initialData' possui um ID válido para decidir o fluxo.
      if (initialData?.id) {
        // Fluxo de Edição: chama o método PUT passando o ID da OS e as alterações feitas.
        await workOrderService.update(initialData.id, payload);
      } else {
        // Fluxo de Criação: chama o método POST para salvar um novo registro no banco.
        await workOrderService.create(payload);
      }

      // Reseta todos os campos de entrada de dados do formulário para o valor original vazio.
      setFleet("");
      setSetor("");
      setQruDescricao("");
      setQth("");
      setCity("");
      
      // Notifica o componente pai sobre a alteração bem-sucedida para recarregar as tabelas.
      onSuccess();
      // Fecha a janela do modal.
      onClose();
    } catch (err: unknown) {
      // Trata e exibe uma mensagem amigável na tela em caso de falhas na requisição HTTP.
      setError(getErrorMessage(err, "Erro ao salvar Ordem de Serviço."));
    } finally {
      // Desativa o indicador visual de processamento de dados.
      setLoading(false); 
    }
  };

  return (
    // Telhado de fundo escuro e semi-transparente fixado cobrindo toda a tela.
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      {/* Card principal do formulário com bordas arredondadas e sombra pesada. */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-lg space-y-4 shadow-2xl">
        
        {/* Barra superior contendo o título dinâmico e o botão rápido de fechar. */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white">
            {/* Muda o título baseando-se no contexto de criação ou edição. */}
            {initialData ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
          </h2>
          <button
            onClick={onClose} // Aciona o fechamento do modal ao clicar no 'X'.
            type="button"
            className="text-slate-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>

        {/* Alerta de Erro condicional: exibido apenas se houver falhas no envio. */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Formulário integrado com manipulação de envio. */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-300">
          
          {/* Input 1: Caixa de Seleção Dinâmica (Select) carregando frotas existentes. */}
          <div className="space-y-1">
            <label className="font-semibold">Frota / Equipamento *</label>
            <select
              required
              value={fleet}
              onChange={(e) => setFleet(e.target.value)}
              disabled={loading} // Bloqueia alterações enquanto salva os dados.
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="">Selecione o equipamento...</option>
              {/* Mapeia a lista trazida do banco para gerar as opções visíveis do select. */}
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.fleet}>
                  Frota #{eq.fleet} - {eq.name}
                </option>
              ))}
            </select>
          </div>

          {/* Input 2: Setor Afetado. */}
          <div className="space-y-1">
            <label className="font-semibold">Setor Afetado *</label>
            <input
              type="text"
              required
              placeholder="Ex: Mecânica, Elétrica, Hidráulica"
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              disabled={loading}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
          </div>

          {/* Divisor em Grid contendo duas colunas lado a lado para Localização e Cidade. */}
          <div className="grid grid-cols-2 gap-3">
            {/* Input 3: QTH (Local/Fazenda). */}
            <div className="space-y-1">
              <label className="font-semibold">QTH (Local/Fazenda) *</label>
              <input
                type="text"
                required
                placeholder="Ex: Talhão 04 / Fazenda Santa Maria"
                value={qth}
                onChange={(e) => setQth(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>

            {/* Input 4: Cidade. */}
            <div className="space-y-1">
              <label className="font-semibold">Cidade *</label>
              <input
                type="text"
                required
                placeholder="Ex: Lucélia"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loading}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Input 5: Área de texto multilinha para o QRU (Problema). */}
          <div className="space-y-1">
            <label className="font-semibold">Descrição do QRU (Problema) *</label>
            <textarea
              required
              rows={3} // Define a altura inicial da caixa de texto para 3 linhas visíveis.
              placeholder="Descreva a falha ou manutenção necessária..."
              value={qruDescricao}
              // Atualiza o estado da descrição do problema a cada caractere digitado.
              onChange={(e) => setQruDescricao(e.target.value)}
              disabled={loading} // Bloqueia a digitação enquanto a requisição HTTP está sendo enviada.
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
          </div>

          {/* Container inferior alinhado à direita para os botões de ação do formulário. */}
          <div className="flex justify-end gap-2 pt-2">
            {/* Botão de Cancelar: fecha o modal sem salvar nenhuma informação. */}
            <button
              type="button"
              onClick={onClose} // Dispara a função de fechamento vinda do componente pai.
              disabled={loading} // Desabilita o botão se o formulário estiver salvando dados.
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
            >
              Cancelar
            </button>
            
            {/* Botão de Envio: submete todos os dados inseridos no formulário. */}
            <button
              type="submit"
              disabled={loading} // Evita cliques duplicados desativando o botão durante o salvamento.
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {/* Exibe dinamicamente o status textual com base no carregamento e no modo (edição ou criação). */}
              {loading ? "Salvando..." : initialData ? "Salvar Alterações" : "Abrir Ordem de Serviço"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
