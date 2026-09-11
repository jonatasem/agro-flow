import prismaClient from "../../prisma/index.js";
import { isManagement } from "../../config/roles.js";

// Interface com as propriedades reais do modelo Equipment
export interface UpdateEquipmentProps {
  id: string;
  name?: string | undefined;
  fleet?: string | undefined;
  userRole: string;
}

export class UpdateEquipmentService {
  async execute({ id, name, fleet, userRole }: UpdateEquipmentProps) {
    if (!isManagement(userRole)) {
      throw new Error(
        "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
      );
    }

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
