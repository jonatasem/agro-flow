// Importa a instância customizada do Axios configurada com a URL base e interceptores de token.
import { api } from "./api";

// Define a estrutura de dados completa que representa um Colaborador vindo do back-end.
export interface Collaborator {
  id: string;            // Identificador único universal do colaborador no banco de dados.
  name: string;          // Nome completo do funcionário ou técnico de manutenção.
  role: string;          // Nível de acesso ou cargo (ex: TECNICO, GESTOR, ADMINISTRADOR).
  registration: string;  // Código de matrícula utilizado para identificação e login.
  city?: string;         // Cidade ou polo de atendimento operacional (opcional).
  status?: boolean;      // Status lógico para controle de funcionário ativo/inativo (opcional).
  createdAt?: string;    // Carimbo opcional contendo a data/hora ISO de criação do registro.
  updatedAt?: string;    // Carimbo opcional contendo a data/hora ISO da última modificação salva.
}

// Utilitário de Tipo Avançado: Omete os campos automáticos do banco e adiciona o campo 'password' opcional via interseção (&).
export type CreateCollaboratorInput = Omit<Collaborator, "id" | "createdAt" | "updatedAt"> & {
  password?: string;     // Campo de senha necessário exclusivamente na criação de novos cadastros.
};

// Utilitário Partial: Torna todas as propriedades de criação opcionais para dar suporte a atualizações parciais.
export type UpdateCollaboratorInput = Partial<CreateCollaboratorInput>;

// Objeto que centraliza os métodos assíncronos para gerenciamento do CRUD de colaboradores via API.
export const collaboratorService = {
  
  // Método assíncrono para listar todos os colaboradores cadastrados no sistema.
  getAll: async (): Promise<Collaborator[]> => {
    // Realiza uma requisição HTTP GET esperando um array estruturado de objetos do tipo Collaborator.
    const response = await api.get<Collaborator[]>("/collaborator");
    return response.data; // Extrai e retorna o corpo de dados puros contido na resposta da API.
  },

  // Método assíncrono para obter dados detalhados de um colaborador específico baseado em seu ID exclusivo.
  getById: async (id: string): Promise<Collaborator> => {
    // Injeta dinamicamente o identificador na rota da requisição HTTP GET.
    const response = await api.get<Collaborator>(`/collaborator/${id}`);
    return response.data; // Retorna o objeto do colaborador localizado pelo servidor.
  },

  // Método assíncrono para enviar os dados estruturados e salvar um novo colaborador no banco.
  create: async (payload: CreateCollaboratorInput): Promise<Collaborator> => {
    // Faz uma chamada HTTP POST transmitindo as credenciais informadas no corpo (payload) da mensagem.
    const response = await api.post<Collaborator>("/collaborator", payload);
    return response.data; // Retorna o novo colaborador registrado integrado com seu ID gerado.
  },

  // Método assíncrono para modificar atributos específicos de um registro de funcionário existente.
  update: async (id: string, payload: UpdateCollaboratorInput): Promise<Collaborator> => {
    // Realiza uma chamada HTTP PUT enviando as propriedades modificadas para o endpoint indexado pelo ID.
    const response = await api.put<Collaborator>(`/collaborator/${id}`, payload);
    return response.data; // Retorna o objeto atualizado com as novas alterações salvas com sucesso.
  },

  // Método assíncrono para remover de forma permanente um colaborador da base de dados.
  delete: async (id: string): Promise<void> => {
    // Dispara uma exclusão direta através do método HTTP DELETE referenciando a rota correspondente.
    await api.delete(`/collaborator/${id}`);
  },
};
