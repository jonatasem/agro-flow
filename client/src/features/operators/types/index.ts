// Define a estrutura TypeScript para representar um operador retornado pelo banco de dados.
export interface Operator {
  id: string;            // Identificador único do operador.
  name: string;          // Nome completo do profissional.
  registration: string;  // Código de matrícula utilizado no login.
  city?: string;         // Cidade ou base de atuação operacional (opcional).
  createdAt?: string;    // Carimbo de data/hora de criação do registro (opcional).
}

// Define os campos aceitos no momento de cadastrar um novo operador no sistema.
export interface CreateOperatorInput {
  name: string;          // Nome completo obrigatório.
  registration: string;  // Código de matrícula obrigatório.
  city?: string;         // Cidade ou base operacional (opcional).
  password?: string;     // Senha de autenticação inicial (opcional).
}

// Define os campos editáveis de um operador, mapeando todos como opcionais.
export interface UpdateOperatorInput {
  name?: string;
  registration?: string;
  city?: string;
  password?: string;
}