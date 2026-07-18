import type { FastifyRequest, FastifyReply } from "fastify";
import prismaClient from "../../prisma/index.js";

interface UpdateCollaboratorProps {
  id: string;
  name?: string;
  registration?: string;
  city?: string;
  status?: boolean;
}

export class UpdateCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {

    // Busca o id pelo params
    const { id } = request.params as { id: string };

    // Busca os dados no corpo da requicao
    const { name, registration, city, status } =
      (request.body as UpdateCollaboratorProps) || {};

    // Verifica se o id e valido
    if (!id) {
      return reply.status(400).send({
        error: "O ID do funcionário é obrigatório para a atualização.",
      });
    }

    // Busca o colaborador pelo id
    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: { id },
    });

    // Retorna um erro se nao existir
    if (!collaboratorExists) {
      return reply.status(404).send({
        error: "Funcionário não encontrado.",
      });
    }

    // Atualiza somente os dados que o usuario enviar
    const updateData = {
      ...(name !== undefined && { name }),
      ...(registration !== undefined && { registration }),
      ...(city !== undefined && { city }),
      ...(status !== undefined && { status }),
    };

    // Atualiza no banco de dados
    const updateCollaborator = await prismaClient.collaborator.update({
      where: { id },
      data: updateData,
    });

    // Retorna o operador cadastrado
    return reply.send(updateCollaborator);
  }
}
