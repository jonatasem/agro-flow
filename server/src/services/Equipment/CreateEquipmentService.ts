import prismaClient from "../../prisma/index.js";

interface CreateEquipmentProps {
  name: string;
  fleet: string;
}

export class CreateEquipmentService {
  async execute({ name, fleet }: CreateEquipmentProps) {

    // Verifica se todos os dados foram enviados
    if (!name || !fleet) {
      throw new Error("Todos os campos são obrigatórios");
    }

    // Salva no banco de dados
    const equipment = await prismaClient.equipment.create({
      data: {
        name,
        fleet,
      },
    });

    // Retorna o equipamento cadastrado
    return equipment;
  }
}
