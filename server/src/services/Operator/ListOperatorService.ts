// src/services/Operator/ListOperatorService.ts
import prismaClient from "../../prisma/index.js";

export class ListOperatorService {
  async execute() {
    return prismaClient.operator.findMany({
      orderBy: { name: "asc" },
    });
  }
}