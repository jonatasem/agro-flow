// src/controllers/LoginCollaborator/CheckRegistrationController.ts
import type { FastifyRequest, FastifyReply } from "fastify";
import { CheckRegistrationService } from "../../services/LoginCollaborator/CheckRegistrationService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class CheckRegistrationController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { registration } = (request.body ?? {}) as { registration?: string };

    if (!registration?.trim()) {
      return reply.status(400).send({ error: "A matrícula é obrigatória." });
    }

    try {
      const service = new CheckRegistrationService();
      const result = await service.execute({
        registration: registration.trim(),
      });
      return reply.status(200).send(result);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao verificar matrícula.");
    }
  }
}