import type { FastifyReply, FastifyRequest } from "fastify";
import { CreateOfficialService } from "../../services/AuthorizedOfficial/CreateOficialService.js";

export class CreateOfficialController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const { name, registration, city } = request.body as {
      name: string;
      registration: string;
      city: string;
    };

    const authorizedService = new CreateOfficialService();
    const authorized = await authorizedService.execute({
      name,
      registration,
      city,
    });

    return reply.status(201).send(authorized);
  }
}
