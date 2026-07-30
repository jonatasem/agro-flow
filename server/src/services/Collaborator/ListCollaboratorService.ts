import prismaClient from "../../prisma/index.js";

export class ListCollaboratorService {
  async execute() {
    const result = await prismaClient.collaborator.findMany({
      select: {
        id: true,
        name: true,
        role: true,
        registration: true,
        city: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return result;
  }
}
