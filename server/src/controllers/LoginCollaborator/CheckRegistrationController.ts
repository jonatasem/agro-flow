import type { FastifyRequest, FastifyReply } from "fastify";
import {
  CheckRegistrationService,
  type CheckProps,
} from "../../services/LoginCollaborator/CheckRegistrationService.js";

export class CheckRegistrationController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { registration } = (request.body || {}) as CheckProps;

    const checkService = new CheckRegistrationService();

    try {
      const result = await checkService.execute({ registration });

      return reply.status(200).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}