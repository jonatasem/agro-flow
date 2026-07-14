import type { FastifyRequest, FastifyReply } from "fastify";
import prismaClient from "../../prisma/index.js";

interface UpdateEquipmentProps {
  id: string;
  name?: string;
  fleet?: string;
  city?: string;
  status?: boolean;
}

export class UpdateEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const { name, fleet, city, status } =
      (request.body as UpdateEquipmentProps) || {};

    if (!id) {
      return reply.status(400).send({
        error: "O ID do equipamento é obrigatório para a atualização.",
      });
    }

    const equipmentExists = await prismaClient.equipment.findUnique({
      where: { id },
    });

    if (!equipmentExists) {
      return reply.status(404).send({
        error: "Equipamento não encontrado.",
      });
    }

    // Criando o objeto dinamicamente. Se a variável for undefined,
    // a propriedade sequer existirá no objeto final enviado ao Prisma.
    const updateData = {
      ...(name !== undefined && { name }),
      ...(fleet !== undefined && { fleet }),
      ...(city !== undefined && { city }),
      ...(status !== undefined && { status }),
    };

    const updateEquipment = await prismaClient.equipment.update({
      where: { id },
      data: updateData,
    });

    return reply.send(updateEquipment);
  }
}
