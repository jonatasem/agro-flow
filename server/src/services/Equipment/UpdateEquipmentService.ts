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

    // Verifica se passou o id corretamente
    if (!id) {
      throw new Error("O ID do equipamento é obrigatório para atualização");
    }

    // Verifica se o equipamento existe no banco de dados
    const equipmentExists = await prismaClient.equipment.findUnique({
      where: { id },
    });

    // Retorna um erro se nao existir
    if (!equipmentExists) {
      throw new Error("Equipamento não encontrado.");
    }

    // Isso evita o erro de tipagem e impede o Prisma de atualizar campos inalterados
    const updateData: Record<string, any> = {};

    // Atualiza apenas com os campos modificados
    if (name !== undefined) updateData.name = name;
    if (fleet !== undefined) updateData.fleet = fleet;
    if (city !== undefined) updateData.city = city;
    if (status !== undefined) updateData.status = status;

    // Atualiza no banco de dados
    const updateEquipment = await prismaClient.equipment.update({
      where: { id },
      data: updateData,
    });

    // Retorna os dados atualizados
    return updateEquipment;
  }
}
