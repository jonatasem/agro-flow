import prismaClient from "../../prisma/index.js";

interface UpdateOfficialProps {
  id: string;
  name?: string;
  registration?: string;
  city?: string;
  status?: boolean;
}

class UpdateOfficialService {
  async execute({ id, name, registration, city, status }: UpdateOfficialProps) {
    if (!id) {
      throw new Error("O ID do funcionário é obrigatório para atualização");
    }

    const officialExists = await prismaClient.official.findUnique({
      where: { id },
    });

    if (!officialExists) {
      throw new Error("Funcionário não encontrado.");
    }

    // Isso evita o erro de tipagem e impede o Prisma de atualizar campos inalterados
    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name;
    if (registration !== undefined) updateData.registration = registration;
    if (city !== undefined) updateData.city = city;
    if (status !== undefined) updateData.status = status;

    // Atualiza apenas com os campos modificados
    const updateOfficial = await prismaClient.official.update({
      where: { id },
      data: updateData,
    });

    return updateOfficial;
  }
}

export default UpdateOfficialService;
