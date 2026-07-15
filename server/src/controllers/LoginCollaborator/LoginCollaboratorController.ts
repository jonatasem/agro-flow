import type { FastifyRequest, FastifyReply } from "fastify";
import { LoginCollaboratorService } from "../../services/LoginCollaborator/LoginCollaboratorService.js";

export class LoginCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { registration, password } = request.body as {
      registration: string;
      password: string;
    };
    const loginService = new LoginCollaboratorService();

    try {
      const result = await loginService.execute({ registration, password });

      return reply.send(result);
    } catch (error: any) {
      return reply.status(401).send({ error: error.message });
    }
  }
}
