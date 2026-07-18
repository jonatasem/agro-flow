import prismaClient from "../../prisma/index.js";

export class ListCollaboratorService {
  async execute() {

    // Verifica se existe colaborador cadastrado
    const collaborator = await prismaClient.collaborator.findMany();

    // Retorna todos que encontrar
    return collaborator;
  }
}
