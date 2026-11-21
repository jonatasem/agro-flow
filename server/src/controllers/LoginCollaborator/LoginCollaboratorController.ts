// src/controllers/LoginCollaborator/LoginCollaboratorController.ts
import type { FastifyRequest, FastifyReply } from "fastify";
import { LoginCollaboratorService } from "../../services/LoginCollaborator/LoginCollaboratorService.js";

export class LoginCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { registration, password } = (request.body ?? {}) as {
      registration?: string;
      password?: string;
    };

    if (!registration?.trim() || !password) {
      return reply
        .status(400)
        .send({ error: "Matrícula e senha são obrigatórias." });
    }

    try {
      const service = new LoginCollaboratorService();
      const result = await service.execute({
        registration: registration.trim(),
        password,
      });
      return reply.status(200).send(result);
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes("JWT_SECRET não foi definida")
      ) {
        return reply.status(500).send({ error: error.message });
      }

      const message =
        error instanceof Error ? error.message : "Erro ao autenticar.";
      return reply.status(401).send({ error: message });
    }
  }
}