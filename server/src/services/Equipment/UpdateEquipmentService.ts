import prismaClient from "../../prisma/index.js";

interface UpdateEquipmentProps {
  id: string;
  name?: string;
  fleet?: string;
  city?: string;
  status?: boolean;
}

export class UpdateEquipmentService {
  async execute({ id, name, fleet, city, status }: UpdateEquipmentProps) {
    if (!id) {
      throw new Error("O ID do equipamento é obrigatório para atualização");
    }

    const equipmentExists = await prismaClient.equipment.findUnique({
      where: { id },
    });

    if (!equipmentExists) {
      throw new Error("Equipamento não encontrado.");
    }

    // Isso evita o erro de tipagem e impede o Prisma de atualizar campos inalterados
    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name;
    if (fleet !== undefined) updateData.fleet = fleet;
    if (city !== undefined) updateData.city = city;
    if (status !== undefined) updateData.status = status;

    // Atualiza apenas com os campos modificados
    const updateEquipment = await prismaClient.equipment.update({
      where: { id },
      data: updateData,
    });

    return updateEquipment;
  }
}
