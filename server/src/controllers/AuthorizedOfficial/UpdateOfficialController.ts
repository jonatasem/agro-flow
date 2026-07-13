import type { FastifyRequest, FastifyReply } from "fastify";
import prismaClient from "../../prisma/index.js";

interface UpdateOfficialProps {
  id: string;
  name?: string;
  registration?: string;
  city?: string;
  status?: boolean;
}

class UpdateOfficialController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const { name, registration, city, status } =
      (request.body as UpdateOfficialProps) || {};

    if (!id) {
      return reply.status(400).send({
        error: "O ID do funcionário é obrigatório para a atualização.",
      });
    }

    const officialExists = await prismaClient.official.findUnique({
      where: { id },
    });

    if (!officialExists) {
      return reply.status(404).send({
        error: "Funcionário não encontrado.",
      });
    }

    // Criando o objeto dinamicamente. Se a variável for undefined,
    // a propriedade sequer existirá no objeto final enviado ao Prisma.
    const updateData = {
      ...(name !== undefined && { name }),
      ...(registration !== undefined && { registration }),
      ...(city !== undefined && { city }),
      ...(status !== undefined && { status }),
    };

    const updateOfficial = await prismaClient.official.update({
      where: { id },
      data: updateData,
    });

    return reply.send(updateOfficial);
  }
}

export default UpdateOfficialController;
