import type { FastifyInstance, FastifyPluginOptions, FastifyRequest, FastifyReply } from "fastify";

// controllers
import CreateOfficialController from "../controllers/CreateOfficialController.js";

export async function routes(fastify: FastifyInstance, options: FastifyPluginOptions) {

    // ROTA PARA FUNCIONARIOS
    fastify.post("/official", async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreateOfficialController().handle(request, reply);
    });

}

export default routes;
 
