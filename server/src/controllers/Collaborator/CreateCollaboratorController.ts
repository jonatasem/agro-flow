import type { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { CreateCollaboratorService } from "../../services/Collaborator/CreateCollaboratorService.js";
import { sendError } from "../../utils/handleControllerError.js";

const createCollaboratorSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  role: z.string().min(1, "O cargo é obrigatório."),
  sector: z.string().min(1, "O setor é obrigatório."),
  registration: z.string().min(1, "A matrícula é obrigatória."),
  password: z.string().min(1, "A senha é obrigatória."),
  city: z.string().min(1, "A cidade é obrigatória."),
});

export class CreateCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const parsed = createCollaboratorSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: "Dados do colaborador inválidos.",
        details: z.flattenError(parsed.error).fieldErrors,
      });
    }

    try {
      const created = await new CreateCollaboratorService().execute({
        ...parsed.data,
        userRole: request.userRole,
      });
      return reply.status(201).send(created);
    } catch (error: unknown) {
      return sendError(reply, error, "Erro ao cadastrar colaborador.");
    }
  }
}