import type { FastifyRequest, FastifyReply } from "fastify";
import prismaClient from "../../prisma/index.js";

interface UpdateOperatorProps {
  id: string;
  name?: string;
  registration?: string;
  city?: string;
  status?: boolean;
}

export class UpdateOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    // Busca o id pelo params
    const { id } = request.params as { id: string };

    // Busca os dados no corpo da requisicao
    const { name, registration, city, status } =
      (request.body as UpdateOperatorProps) || {};

    // Se o id nao for valido, de erro
    if (!id) {
      return reply.status(400).send({
        error: "O ID do funcionário é obrigatório para a atualização.",
      });
    }

    // Busca o operador pelo id
    const operatorExists = await prismaClient.operator.findUnique({
      where: { id },
    });

    // Se nao existir, retorne um erro
    if (!operatorExists) {
      return reply.status(404).send({
        error: "Funcionário não encontrado.",
      });
    }

    // Atualiza somente os dados enviados pelo usuario
    const updateData = {
      ...(name !== undefined && { name }),
      ...(registration !== undefined && { registration }),
      ...(city !== undefined && { city }),
      ...(status !== undefined && { status }),
    };

    // Atualiza no banco de dados
    const updateOperator = await prismaClient.operator.update({
      where: { id },
      data: updateData,
    });

    // Retorna os dados atualizados
    return reply.send(updateOperator);
  }
}
