import type { FastifyRequest, FastifyReply } from "fastify";
import prismaClient from "../../prisma/index.js";

interface UpdateEquipmentProps {
  name?: string;
  fleet?: string;
}

export class UpdateEquipmentController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const { name, fleet } = request.body as UpdateEquipmentProps;

    const equipmentExists = await prismaClient.equipment.findUnique({
      where : { id },
    });

    if(!equipmentExists) {
      throw new Error("Esse equipamento não existe")
    }

    const updateData = {
      ...(name !== undefined && { name }),
      ...(fleet !== undefined && { fleet }),
    };

    const result = await prismaClient.equipment.update({
      where: { id },
      data: updateData,
    });

    return reply.send(result);
  }
}
