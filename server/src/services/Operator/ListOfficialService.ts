import prismaClient from "../../prisma/index.js";

export class ListOperatorService {
  async execute() {
    const operator = await prismaClient.operator.findMany();

    return operator;
  }
}
