// Importa a instância customizada do Axios configurada com os tokens e a URL base da API.
import { api } from "../../../services/api";

// Define a estrutura de dados completa de um Equipamento conforme gravado no banco de dados.
export interface Equipment {
  id: string;          // Identificador único universal (UUID ou ID sequencial) do equipamento.
  fleet: string;       // Prefixo de identificação ou número da frota (ex: "TR-102", "COL-05").
  name: string;        // Nome ou modelo descritivo do maquinário (ex: "Trator John Deere 6125J").
  createdAt?: string;  // Carimbo opcional contendo a data/hora ISO de criação do registro.
  updatedAt?: string;  // Carimbo opcional contendo a data/hora ISO da última modificação salva.
}

// Utilitário Omit: Gera um tipo para criação omitindo chaves que o servidor gera automaticamente.
export type CreateEquipmentInput = Omit<Equipment, "id" | "createdAt" | "updatedAt">;

// Utilitário Partial: Torna todos os campos de entrada opcionais para suportar atualizações fracionadas (PATCH/PUT parcial).
export type UpdateEquipmentInput = Partial<CreateEquipmentInput>;

// Objeto que unifica todas as chamadas assíncronas do CRUD de equipamentos.
export const equipmentService = {
  
  // Método assíncrono para listar todos os maquinários e frotas agrícolas do sistema.
  getAll: async (): Promise<Equipment[]> => {
    // Realiza uma requisição HTTP GET esperando um array estruturado de objetos Equipment.
    const response = await api.get<Equipment[]>("/equipment");
    return response.data; // Extrai e retorna o corpo de dados puros contido na resposta da API.
  },

  // Método assíncrono para obter dados detalhados de um único equipamento específico.
  getById: async (id: string): Promise<Equipment> => {
    // Executa uma chamada HTTP GET embutindo o parâmetro ID na rota do endpoint.
    const response = await api.get<Equipment>(`/equipment/${id}`);
    return response.data; // Retorna o objeto do equipamento localizado.
  },

  // Método assíncrono para submeter os dados básicos e salvar um novo equipamento no banco.
  create: async (payload: CreateEquipmentInput): Promise<Equipment> => {
    // Faz uma requisição HTTP POST transmitindo os dados de frota e nome no corpo da mensagem.
    const response = await api.post<Equipment>("/equipment", payload);
    return response.data; // Retorna o equipamento recém-criado já integrado com seu ID gerado.
  },

  // Método assíncrono para modificar atributos cadastrais de um equipamento existente.
  update: async (id: string, payload: UpdateEquipmentInput): Promise<Equipment> => {
    // Realiza uma chamada HTTP PUT enviando apenas os blocos de dados atualizados para a rota do ID.
    const response = await api.put<Equipment>(`/equipment/${id}`, payload);
    return response.data; // Retorna o objeto modificado com as novas atualizações aplicadas.
  },

  // Método assíncrono para deletar permanentemente um registro de equipamento da base de dados.
  delete: async (id: string): Promise<void> => {
    // Dispara uma exclusão direta através do método HTTP DELETE referenciando a rota indexada pelo ID.
    await api.delete(`/equipment/${id}`);
  },
};
