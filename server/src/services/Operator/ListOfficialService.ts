import prismaClient from "../../prisma/index.js";

export class ListOperatorService {
  async execute() {

    // Busca todos operadores cadastrados
    const operator = await prismaClient.operator.findMany();

    // Retorna o operador criado
    return operator;
  }
}
