import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { CreateCollaboratorService } from '../../services/Collaborator/CreateCollaboratorService.js';

// Define o esquema de validação
export const createCollaboratorSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório.' }),
  role: z.string().min(1, { message: 'O cargo é obrigatório.' }),
  sector: z.string().min(1, { message: 'O setor é obrigatório.' }),
  registration: z.string().min(1, { message: 'A matrícula é obrigatória.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
  city: z.string().min(1, { message: 'A cidade é obrigatória.' }),
});

export type CreateCollaboratorProps = z.infer<typeof createCollaboratorSchema>;

export class CreateCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.userRole;

    if (!userRole) {
      return reply
        .status(401)
        .send({ error: 'Sessão inválida ou usuário não autenticado.' });
    }

    const result = createCollaboratorSchema.safeParse(request.body);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);

      return reply.status(400).send({
        error: 'Dados do colaborador inválidos.',
        details: fieldErrors,
      });
    }

    const { name, role, sector, registration, password, city } = result.data;

    try {
      const collaboratorService = new CreateCollaboratorService();

      const collaborator = await collaboratorService.execute({
        name,
        role,
        sector,
        registration,
        password,
        city,
        userRole,
      });

      return reply.status(201).send(collaborator);
    } catch (error) {
      if (error instanceof Error) {
        const isPermissionError = error.message?.includes('Acesso negado');
        const statusCode = isPermissionError ? 403 : 400;

        return reply.status(statusCode).send({ error: error.message });
      }

      return reply.status(500).send({ error: 'Erro interno no servidor.' });
    }
  }
}