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
    if (!name || !role || !registration || !password || !city) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: {
        registration: registration
      },
    });

    if(collaboratorExists){
      throw new Error("Esta matrícula já está cadastrada no sistema");
    }

    const hashedPassword = await hash(password, 8);

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

    const { password: _, ...collaboratorWithoutPassWord } = collaborator;

    return collaboratorWithoutPassWord;
  }
}
