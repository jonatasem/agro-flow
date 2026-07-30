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

    // Se tiver uma frota, verifique se a frota que escolher já nao existe
    if(fleet && fleet !== equipmentExists.fleet){
      const fleetInUse = await prismaClient.equipment.findUnique({
        where: { fleet },
      });

      if(!fleetInUse){
        throw new Error("Esta frota já está em uso por outro equipamento.");
      }
    }

    // Filtra os dados diferente de undefined
    const updateData = {
      ...(name !== undefined && { name }),
      ...(fleet !== undefined && { fleet }),
      ...(city !== undefined && { city }),
      ...(status !== undefined && { status }),
    }

    const result = await prismaClient.equipment.update({
      where: { id },
      data: updateData,
    });

    return result;
  }
}
