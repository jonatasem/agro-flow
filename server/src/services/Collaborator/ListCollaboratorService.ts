import prismaClient from "../../prisma/index.js";

export class ListCollaboratorService {
  async execute() {
    const collaborator = await prismaClient.collaborator.findMany();

    return collaborator;
  }
}
