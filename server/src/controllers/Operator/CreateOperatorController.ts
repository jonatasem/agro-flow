import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateOperatorService } from "../../services/Operator/CreateOperatorService.js";

interface CreateOperatorProps {
    name: string;
    registration: string;
    city: string;
}

export class CreateOperatorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    // Extrai o cargo autenticado
    const userRole = request.userRole;

    // Se o middleware falhar ou não injetar o papel, barra antes do Service
    if (!userRole) {
      return reply.status(401).send({ error: "Sessão inválida ou usuário não autenticado." });
    }

    const { name, registration, city } = request.body as CreateOperatorProps;

    if (!name || !registration || !city) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const operatorService = new CreateOperatorService();

    try {
      const result = await operatorService.execute({
        name,
        registration,
        city,
        userRole
      });

      return reply.status(201).send(result);    
    } catch (error: any) {
      return reply.status(400).send({ error: error.message });
    }
  }
}
