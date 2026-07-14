import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";

// CONTROLLERS

// FUNCIONARIOS AUTORIZADOS
import { CreateCollaboratorController } from "../controllers/Collaborator/CreateCollaboratorController.js";
import { ListCollaboratorController } from "../controllers/Collaborator/ListCollaboratorController.js";
import { DeleteCollaboratorController } from "../controllers/Collaborator/DeleteCollaboratorController.js";
import { UpdateCollaboratorController } from "../controllers/Collaborator/UpdateCollaboratorController.js";

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
import { CreateWorkOrderController } from "../controllers/WorkOrder/CreateWorkOrderController.js";

export async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  // ROTA PARA FUNCIONARIOS
  fastify.get(
    "/collaborator",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new ListCollaboratorController().handle(request, reply);
    },
  );

  fastify.post(
    "/collaborator",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new CreateCollaboratorController().handle(request, reply);
    },
  );

  fastify.put(
    "/collaborator/:id",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new UpdateCollaboratorController().handle(request, reply);
    },
  );

  fastify.delete(
    "/collaborator",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new DeleteCollaboratorController().handle(request, reply);
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
    },
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
    },
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

  // ROTAS PARA ORDENS
  fastify.post(
    "/work-order",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new CreateWorkOrderController().handle(request, reply);
    },
  );
}

export default routes;
