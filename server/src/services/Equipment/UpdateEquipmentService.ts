import prismaClient from "../../prisma/index.js";

// Interface com as propriedades reais do modelo Equipment
export interface UpdateEquipmentProps {
  id: string;
  name?: string | undefined;
  fleet?: string | undefined;
  userRole: string;
}

export class UpdateEquipmentService {
  async execute({ id, name, fleet }: UpdateEquipmentProps) {
    // Verifica se o equipamento existe
    const equipmentExists = await prismaClient.equipment.findUnique({
      where: { id },
    });

    if (!equipmentExists) {
      throw new Error("Equipamento não encontrado.");
    }

    // Valida se a nova frota já está cadastrada em outro equipamento
    if (fleet && fleet !== equipmentExists.fleet) {
      const fleetInUse = await prismaClient.equipment.findUnique({
        where: { fleet },
      });

      if (fleetInUse) {
        throw new Error("Esta frota já está em uso por outro equipamento.");
      }
    }

    // Filtra apenas os atributos enviados na requisição
    const updateData = {
      ...(name !== undefined && { name }),
      ...(fleet !== undefined && { fleet }),
    };

    const result = await prismaClient.equipment.update({
      where: { id },
      data: updateData,
    });

    return result;
  }
}