import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateOperatorService } from "../../services/Operator/CreateOperatorService.js";
import { sendError } from "../../utils/handleControllerError.js";

export class CreateOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { name, registration, city } = (request.body ?? {}) as {
      name?: string;
      registration?: string;
      city?: string;
    };

    if (!name?.trim() || !registration?.trim() || !city?.trim()) {
      return reply
        .status(400)
        .send({ error: "Nome, matrícula e cidade são obrigatórios." });
    }

    try {
      const created = await new CreateOperatorService().execute({
        name: name.trim(),
        registration: registration.trim(),
        city: city.trim(),
        userRole: request.userRole,
      });
      return reply.status(201).send(created);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao cadastrar operador.");
    }
  }
}