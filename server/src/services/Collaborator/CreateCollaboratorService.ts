import prismaClient from "../../prisma/index.js";
import { hash } from "bcryptjs";

interface CreateCollaboratorProps {
  name: string;
  role: string;
  registration: string;
  password: string;
  city: string;
}

export class CreateCollaboratorService {
  async execute({
    name,
    role,
    registration,
    password,
    city,
  }: CreateCollaboratorProps) {

    // Se esses dados nao forem fornecidos, de um erro
    if (!name || !role || !registration || !password || !city) {
      throw new Error("Todos os campos são obrigatórios");
    }

    // Faz a busca da matricula para verificar se o colaborador ja nao esta cadastrado
    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: {
        registration: registration,
      },
    });

    // Se o colaborador existir, retorne uma mensagem
    if (collaboratorExists) {
      throw new Error("Esta matrícula já está cadastrada no sistema");
    }

    // Funcao que mistura as senhas
    const hashedPassword = await hash(password, 8);

    // Salva no banco de dados
    const collaborator = await prismaClient.collaborator.create({
      data: {
        name,
        role,
        registration,
        password: hashedPassword,
        city,
        status: true,
      },
    });

    // Guarda a senha em uma variavel temporaria
    const { password: _, ...collaboratorWithoutPassWord } = collaborator;

    return collaboratorWithoutPassWord;
  }
}
