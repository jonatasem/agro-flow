import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prismaClient from "../../prisma/index.js";

interface LoginCollaboratorProps {
  registration: string;
  password: string;
}

export class LoginCollaboratorService {
  async execute({ registration, password }: LoginCollaboratorProps) {
    if (!registration || !password) {
      throw new Error("Matrícula e senha são obrigatórias");
    }

    const collaborator = await prismaClient.collaborator.findUnique({
      where: { registration },
    });

    if (!collaborator) {
      throw new Error("Matrícula não autorizada");
    }

    if(!collaborator.status){
      throw new Error("Este colaborador está desativado no sistema");
    }

    const passwordMatch = await bcrypt.compare(password, collaborator.password);

    if (!passwordMatch) {
      throw new Error("Matrícula ou senha incorreta");
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("A variável de ambiente JWT_SECRET não foi definida");
    }

    const token = jwt.sign(
      {
        name: collaborator.name,
        role: collaborator.role,
      },
      secret,
      { 
        subject: collaborator.id,
        expiresIn: "30d",

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
