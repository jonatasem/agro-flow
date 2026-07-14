import prismaClient from "../../prisma/index.js";

export class ListOfficialService {
  async execute() {
    const official = await prismaClient.official.findMany();

    return official;
  }
}
