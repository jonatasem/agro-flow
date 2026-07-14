import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";

// CONTROLLERS

// FUNCIONARIOS AUTORIZADOS
import { CreateOfficialController } from "../controllers/AuthorizedOfficial/CreateOfficialController.js";
import { ListOfficialController } from "../controllers/AuthorizedOfficial/ListOfficialController.js";
import { DeleteOfficialController } from "../controllers/AuthorizedOfficial/DeleteOfficialController.js";
import { UpdateOfficialController } from "../controllers/AuthorizedOfficial/UpdateOfficialController.js";

// EQUIPAMENTOS
import { CreateEquipmentController } from "../controllers/Equipment/CreateEquipmentController.js";
import { ListEquipmentController } from "../controllers/Equipment/ListEquipmentController.js";
import { UpdateEquipmentController } from "../controllers/Equipment/UpdateEquipmentController.js";
import { DeleteEquipmentController } from "../controllers/Equipment/DeleteEquipmentController.js";

// OPERADORES
import { CreateOperatorController } from "../controllers/Operator/CreateOperatorController.js";
import { ListOperatorController } from "../controllers/Operator/ListOperatorController.js";
import { UpdateOperatorController } from "../controllers/Operator/UpdateOperatorController.js";
import { DeleteOperatorController } from "../controllers/Operator/DeleteOperatorController.js";

export async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {

  // ROTA PARA FUNCIONARIOS
  fastify.get(
    "/official",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new ListOfficialController().handle(request, reply);
    },
  );

  fastify.post(
    "/official",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new CreateOfficialController().handle(request, reply);
    },
  );

  fastify.put(
    "/official/:id",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new UpdateOfficialController().handle(request, reply);
    },
  );

  fastify.delete(
    "/official",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new DeleteOfficialController().handle(request, reply);
    },
  );

  // ROTAS PARA EQUIPAMENTOS
  fastify.get(
    "/equipment",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new ListEquipmentController().handle(request, reply);
    },
  );

  fastify.post(
    "/equipment",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new CreateEquipmentController().handle(request, reply);
    }
  );

  fastify.put(
    "/equipment/:id",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new UpdateEquipmentController().handle(request, reply);
    },
  );

  fastify.delete(
    "/equipment",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new DeleteEquipmentController().handle(request, reply);
    },
  );

  // ROTAS PARA OPERADORES
  fastify.get(
    "/operator",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new ListOperatorController().handle(request, reply);
    },
  );

  fastify.post(
    "/operator",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new CreateOperatorController().handle(request, reply);
    }
  );

  fastify.put(
    "/operator/:id",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new UpdateOperatorController().handle(request, reply);
    },
  );

  fastify.delete(
    "/operator",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new DeleteOperatorController().handle(request, reply);
    },
  );




}

export default routes;