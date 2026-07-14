import prismaClient from "../../prisma/index.js";

interface CreateCollaboratorProps {
  name: string;
  role: string;
  registration: string;
  city: string;
}

export class CreateCollaboratorService {
  async execute({ name, role, registration, city }: CreateCollaboratorProps) {
    if (!name || !role || !registration || !city) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const collaborator = await prismaClient.collaborator.create({
      data: {
        name,
        role,
        registration,
        city,
        status: true,
      },
    });

    return collaborator;
  }
}
