import type { FastifyRequest, FastifyReply } from "fastify";
import { UpdateCollaboratorService } from "../../services/Collaborator/UpdateCollaboratorService.js";

export interface UpdateCollaboratorProps {
  name?: string;
  registration?: string;
  city?: string;
  status?: boolean;
}

export class UpdateCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado
    const userRole = request.userRole;

    if (!userRole) {
      return reply
      .status(401)
      .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { id } = request.params as { id: string };

    if(!id){
      return reply
      .status(400)
      .send({ error: "O id do colaborador é necessario!" });
    }

    const { name, registration, city, status } = request.body as UpdateCollaboratorProps;

    // Valida se ao menos um campo foi enviado
    if (name === undefined && registration === undefined && city === undefined && status === undefined) {
      return reply
      .status(400)
      .send({ error: "Informe ao menos um campo para atualização." });
    }

    const updateCollaboratorService = new UpdateCollaboratorService();

    try {
      const result = await updateCollaboratorService.execute({
        id,
        name,
        registration,
        city,
        status,
        userRole
      });

      return reply.status(200).send(result);
    } catch (error: any) {
      const isPermissionError = error.message?.includes("Acesso negado");
      const statusCode = isPermissionError ? 403 : 400;

      return reply.status(statusCode).send({ error: error.message });
    }
  }
}