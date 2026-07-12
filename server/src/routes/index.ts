import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";

// controllers
import CreateOfficialController from "../controllers/AuthorizedOfficial/CreateOfficialController.js";
import ListOfficialController from "../controllers/AuthorizedOfficial/ListOfficialController.js";
import DeleteOfficialController from "../controllers/AuthorizedOfficial/DeleteOfficialController.js";

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {

    // ROTA PARA FUNCIONARIOS
    fastify.post("/official", async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreateOfficialController().handle(request, reply);
    });

    fastify.get("/official", async (request: FastifyRequest, reply: FastifyReply) => {
        return new ListOfficialController().handle(request, reply);
    });

    fastify.delete("/official", async (request, reply) => {
        return new DeleteOfficialController().handle(request, reply);
    });
}

export default routes;
 
