import prismaClient from "../../prisma/index.js";

interface DeleteOfficialProps {
  id: string;
}

export class DeleteOfficialService {
  async execute(id: DeleteOfficialProps) {
    if (!id) {
      throw new Error("Id do funcionario não encontrado.");
    }

    const findOfficial = await prismaClient.official.findFirst({
      where: {
        id: id.id,
      },
    });

    if (!findOfficial) {
      throw new Error("Funcionário não encontrado");
    }

    await prismaClient.official.delete({
      where: {
        id: findOfficial.id,
      },
    });

    return { message: "Funcionário deletado com sucesso." };
  }
}
