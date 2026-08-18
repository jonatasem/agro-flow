import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prismaClient from "../../prisma/index.js";

interface LoginCollaboratorProps {
  registration: string;
  password: string;
}

export class LoginCollaboratorService {
  async execute({ registration, password }: LoginCollaboratorProps) {
    // 1. Validação de presença das credenciais obrigatórias
    if (!registration || !password) {
      throw new Error("Matrícula e senha são obrigatórias");
    }

    // 2. Busca o colaborador no banco de dados através da matrícula única
    const collaborator = await prismaClient.collaborator.findUnique({
      where: { registration },
    });

    // 3. Valida se a matrícula existe no banco
    if (!collaborator) {
      throw new Error("Matrícula não autorizada.");
    }

    // 4. Verifica se o cadastro está ativo antes de permitir a comparação da senha
    if (!collaborator.status) {
      throw new Error("Este colaborador está desativado no sistema.");
    }

    // 5. Comparação do hash da senha via bcrypt
    const passwordMatch = await bcrypt.compare(password, collaborator.password);

    if (!passwordMatch) {
      throw new Error("Senha incorreta.");
    }

    // 6. Verificação da existência do segredo JWT no ambiente
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("A variável de ambiente JWT_SECRET não foi definida.");
    }

    // 7. GERAÇÃO DO TOKEN JWT COM SUPORTE A RBAC E ISOLAMENTO DE SETOR:
    // Incluímos 'role' e 'sector' no Payload para que o middleware 'isAuthenticated'
    // e os controllers possam interceptar o cargo e o setor do usuário em tempo real 
    // sem realizar queries adicionais no banco de dados.
    const token = jwt.sign(
      {
        name: collaborator.name,
        role: collaborator.role,     // Cargo (Ex: 'admin', 'lider', 'tecnico') -> Controla O QUE pode fazer
        sector: collaborator.sector, // Setor (Ex: 'Oficina', 'Colheita')       -> Controla QUAIS DADOS pode ver
      },
      secret,
      {
        subject: collaborator.id,    // Identificador único (sub) do colaborador
        expiresIn: "8h",             // Tempo de expiração da sessão do JWT
      },
    );

    // 8. Retorno da autenticação incluindo o 'sector' para persistência no estado do Frontend
    return {
      id: collaborator.id,
      name: collaborator.name,
      role: collaborator.role,
      sector: collaborator.sector, // Adicionado para disponibilizar no Contexto de Auth do Frontend
      city: collaborator.city,
      token,
    };
  }
}