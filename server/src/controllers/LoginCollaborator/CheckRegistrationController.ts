import type { FastifyRequest, FastifyReply } from "fastify";
import { CheckRegistrationService } from "../../services/LoginCollaborator/CheckRegistrationService.js";

export class CheckRegistrationController {
  async handle(request: FastifyRequest, reply: FastifyReply) {

    // Busca a matricula no corpo da requisicao
    const { registration } = request.body as { registration: string };

    // Cria um novo servico pra verificar se a matricula existe
    const checkService = new CheckRegistrationService();

    try {
        // Se existir
        const result = await checkService.execute({ registration });

        // Retorne o nome do colaborador
        return reply.status(200).send(result);
    } catch (error: any) {

        // Se nao, retorne um erro
        return reply.status(400).send({ error: error.message });
    }
  }
}