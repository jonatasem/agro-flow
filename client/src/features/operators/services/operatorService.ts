// Importa a instância pré-configurada do Axios para comunicação HTTP com o back-end.
import { api } from "../../../services/api";

// Define a estrutura de dados completa que representa um Operador retornado pelo servidor.
export interface Operator {
  id: string;            // Identificador único do operador no banco de dados.
  name: string;          // Nome completo do profissional.
  role: string;          // Cargo ou nível de acesso atribuído no sistema (ex: OPERADOR, ADMINISTRADOR).
  registration?: string; // Código de matrícula opcional para autenticação.
  city?: string;         // Cidade ou polo de atendimento operacional (opcional).
  status?: boolean;      // Status lógico indicando se o operador está ativo ou inativo (opcional).
  createdAt?: string;    // Carimbo de data/hora ISO de criação do registro (opcional).
  updatedAt?: string;    // Carimbo de data/hora ISO da última modificação efetuada (opcional).
}

// Utilitário de Tipo Omit: Cria a tipagem de entrada removendo os campos gerenciados automaticamente pelo banco de dados.
export type CreateOperatorInput = Omit<Operator, "id" | "createdAt" | "updatedAt">;

// Utilitário de Tipo Partial: Transforma todas as propriedades de criação em opcionais para permitir atualizações parciais.
export type UpdateOperatorInput = Partial<CreateOperatorInput>;

// Objeto que encapsula os métodos assíncronos para gerenciamento do CRUD de operadores via API.
export const OperatorService = {
  
  // Método assíncrono para listar todos os operadores/colaboradores cadastrados.
  getAll: async (): Promise<Operator[]> => {
    // Faz uma chamada HTTP GET esperada para retornar um array de objetos do tipo Operator.
    const response = await api.get<Operator[]>("/operator");
    return response.data; // Retorna os dados puros extraídos da resposta do servidor.
  },

  // Método assíncrono para localizar e retornar um operador específico baseado em seu ID exclusivo.
  getById: async (id: string): Promise<Operator> => {
    // Injeta dinamicamente o identificador na rota da requisição GET.
    const response = await api.get<Operator>(`/operator/${id}`);
    return response.data; // Retorna os detalhes do registro localizado.
  },

  // Método assíncrono para registrar um novo operador enviando as informações obrigatórias.
  create: async (payload: CreateOperatorInput): Promise<Operator> => {
    // Envia uma requisição HTTP POST contendo o corpo de dados estruturado do formulário.
    const response = await api.post<Operator>("/operator", payload);
    return response.data; // Retorna o novo operador com o ID gerado pelo back-end.
  },

  // Método assíncrono para modificar atributos específicos de um registro existente.
  update: async (id: string, payload: UpdateOperatorInput): Promise<Operator> => {
    // Realiza uma requisição PUT passando os campos alterados para a rota indexada pelo ID.
    // Observação: Verifique se a rota em caixa alta "/Operator/" não causará problemas de case-sensitivity no servidor.
    const response = await api.put<Operator>(`/Operator/${id}`, payload);
    return response.data; // Retorna o objeto atualizado com as novas alterações salvas.
  },

  // Método assíncrono para remover de forma definitiva um operador da base de dados.
  delete: async (id: string): Promise<void> => {
    // Executa uma chamada HTTP DELETE na rota do ID correspondente e não aguarda corpo de resposta.
    // Observação: Idem à observação anterior sobre a grafia "/Operator/" com "O" maiúsculo.
    await api.delete(`/Operator/${id}`);
  },
};
