import type { FastifyRequest, FastifyReply } from "fastify";
import ListOfficialService from "../../services/AuthorizedOfficial/ListOfficialService.js";

class ListOfficialController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        const listOfficialService = new ListOfficialService();
        const official = await listOfficialService.execute();

        reply.status(200).send(official);
    }
}

export default ListOfficialController;