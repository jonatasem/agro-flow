import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";

// controllers
import CreateOfficialController from "../controllers/CreateOfficialController.js";
import ListOfficialController from "../controllers/ListOfficialController.js";

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {

    // ROTA PARA FUNCIONARIOS
    fastify.post("/official", async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreateOfficialController().handle(request, reply);
    });

    fastify.get("/official", async (request: FastifyRequest, reply: FastifyReply) => {
        return new ListOfficialController().handle(request, reply);
    });

}

export default routes;
 
