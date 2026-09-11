import type { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { UpdateCollaboratorService } from '../../services/Collaborator/UpdateCollaboratorService.js';

// Esquema de validação para os parâmetros da URL
export const updateCollaboratorParamsSchema = z.object({
  id: z.string().min(1, { message: 'O ID do colaborador é obrigatório.' }),
});

// Esquema de validação para o corpo da requisição
export const updateCollaboratorBodySchema = z
  .object({
    name: z.string().min(1, { message: 'O nome não pode ser vazio.' }).optional(),
    registration: z.string().min(1, { message: 'A matrícula não pode ser vazia.' }).optional(),
    city: z.string().min(1, { message: 'A cidade não pode ser vazia.' }).optional(),
    status: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.registration !== undefined ||
      data.city !== undefined ||
      data.status !== undefined,
    {
      message: 'Informe ao menos um campo para atualização.',
    }
  );

export type UpdateCollaboratorProps = z.infer<typeof updateCollaboratorBodySchema>;

export class UpdateCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const userRole = request.userRole;

    if (!userRole) {
      return reply
        .status(401)
        .send({ error: 'Sessão inválida ou usuário não autenticado.' });
    }

    // Validação dos parâmetros (params)
    const paramsResult = updateCollaboratorParamsSchema.safeParse(request.params);

    if (!paramsResult.success) {
      const { fieldErrors } = z.flattenError(paramsResult.error);

      return reply.status(400).send({
        error: 'ID do colaborador inválido.',
        details: fieldErrors,
      });
    }

    // Validação do corpo da requisição (body)
    const bodyResult = updateCollaboratorBodySchema.safeParse(request.body);

    if (!bodyResult.success) {
      const { fieldErrors, formErrors } = z.flattenError(bodyResult.error);

      return reply.status(400).send({
        error: formErrors.length > 0 ? formErrors[0] : 'Dados de atualização inválidos.',
        details: fieldErrors,
      });
    }

    const { id } = paramsResult.data;
    const { name, registration, city, status } = bodyResult.data;

    try {
      const updateCollaboratorService = new UpdateCollaboratorService();

      const result = await updateCollaboratorService.execute({
        id,
        name,
        registration,
        city,
        status,
        userRole,
      });

      return reply.status(200).send(result);
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