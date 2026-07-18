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

    // Busca o id pelo params
    const { id } = request.params as { id: string };

    // Busca os dados no corpo da requisicao
    const { name, fleet, city, status } =
      (request.body as UpdateEquipmentProps) || {};

    // Se o id nao for valido, retorna um erro
    if (!id) {
      return reply.status(400).send({
        error: "O ID do equipamento é obrigatório para a atualização.",
      });
    }

    // Busca o equipamento pelo id
    const equipmentExists = await prismaClient.equipment.findUnique({
      where: { id },
    });

    // Se nao encontrar, de um erro
    if (!equipmentExists) {
      return reply.status(404).send({
        error: "Equipamento não encontrado.",
      });
    }

    // Atualiza somente os dados que o usuario enviar
    const updateData = {
      ...(name !== undefined && { name }),
      ...(fleet !== undefined && { fleet }),
      ...(city !== undefined && { city }),
      ...(status !== undefined && { status }),
    };

    // Atualiza no banco de dados
    const updateEquipment = await prismaClient.equipment.update({
      where: { id },
      data: updateData,
    });

    // Retorna atualizado
    return reply.send(updateEquipment);
  }
}
