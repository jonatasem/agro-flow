import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prismaClient from "../../prisma/index.js";

interface LoginCollaboratorProps {
  registration: string;
  password: string;
}

export class LoginCollaboratorService {
  async execute({ registration, password }: LoginCollaboratorProps) {

    // Verifica se todos os dados foram enviados
    if (!registration || !password) {
      throw new Error("Matrícula e senha são obrigatórias");
    }

    // Busca o colaborador pela matricula
    const collaborator = await prismaClient.collaborator.findUnique({
      where: { registration },
    });

    // Se nao existir, avise
    if (!collaborator) {
      throw new Error("Matrícula não autorizada");
    }

    // Se existir, mas o status nao for ATIVO, avise
    if (!collaborator.status) {
      throw new Error("Este colaborador está desativado no sistema");
    }

    // Compara a senha com bcrypt
    const passwordMatch = await bcrypt.compare(password, collaborator.password);

    // Se a senha não der math, de erro
    if (!passwordMatch) {
      throw new Error("Matrícula ou senha incorreta");
    }

    // Busca o token jwt
    const secret = process.env.JWT_SECRET;

    // Verifica de existe uma variavel de ambiente JWT_SECRET
    if (!secret) {
      throw new Error("A variável de ambiente JWT_SECRET não foi definida");
    }

    // Cria um token de 8 horas
    const token = jwt.sign(
      {
        name: collaborator.name,
        role: collaborator.role,
      },
      secret,
      {
        subject: collaborator.id,
        expiresIn: "8h",
      },
    );
    return {
      id: collaborator.id,
      name: collaborator.name,
      role: collaborator.role,
      token,
    };
  }
}
