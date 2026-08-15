import type { FastifyRequest, FastifyReply } from "fastify";
import { ListPartService } from "../../services/PartService/ListPartService.js";

export class ListPartController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    const listPartService = new ListPartService();

    try {
      const result = await listPartService.execute();
      reply.status(200).send(result);
    } catch(error : any){
      return reply.status(400).send({error})
    }
  }
}
