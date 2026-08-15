import prismaClient from "../../prisma/index.js";

interface CreateToolProps {
  name: string;
  sector: string;
}

export class CreateToolService {
  async execute({ name, sector }: CreateToolProps) {
    if (!name) {
      throw new Error("O nome da ferramenta é obrigatório.");
    }

    if (!sector) {
      throw new Error("O setor da ferramenta é obrigatório.");
    }

    const tool = await prismaClient.tool.create({
      data: {
        name,
        sector
      },
    });

    return tool;
  }
}