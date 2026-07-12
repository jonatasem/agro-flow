import type { FastifyRequest, FastifyReply } from "fastify";
import DeleteOfficialService from "../../services/AuthorizedOfficial/DeleteOfficialService.js";

class DeleteOfficialController {
    async handle(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.query as {
            id: string;
        }

        if(!id) {
            return reply.status(400).send({error: "O ID do funcionario é obrigatório."})
        }

        const officialService = new DeleteOfficialService();

        const official = await officialService.execute({id});

        reply.status(200).send(official);
    }
}

export default DeleteOfficialController;