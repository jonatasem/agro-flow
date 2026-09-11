import type { FastifyRequest, FastifyReply } from "fastify";
import { CreateWorkOrderService } from "../../services/WorkOrder/CreateWorkOrderService.js";

interface CreateWorkServiceProps {
  fleet: string;
  operatorId: string; // Matrícula informada no formulário
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
}

export class CreateWorkOrderController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado
    const userRole = request.userRole;

    // Se o middleware falhar ou não injetar o papel, barra antes do Service
    if (!userRole) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const criadoPor = request.userId;

    if (!criadoPor) {
      return reply
        .status(401)
        .send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { fleet, operatorId, setor, qruDescricao, qth, city } =
      request.body as CreateWorkServiceProps;

    if (
      !fleet ||
      !operatorId ||
      !setor ||
      !qruDescricao ||
      !qth ||
      !city ||
      !criadoPor
    ) {
      return reply
        .status(400)
        .send({ error: "Todos os campos são obrigatórios." });
    }

    const workOrderService = new CreateWorkOrderService();

    try {
      const result = await workOrderService.execute({
        fleet,
        operatorRegistration: operatorId,
        setor,
        qruDescricao,
        qth,
        city,
        criadoPor,
        userRole,
      });

      return reply.status(201).send(result);
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
