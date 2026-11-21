// src/routes/index.ts
import type {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

import { LoginCollaboratorController } from "../controllers/LoginCollaborator/LoginCollaboratorController.js";
import { CheckRegistrationController } from "../controllers/LoginCollaborator/CheckRegistrationController.js";

import { CreateCollaboratorController } from "../controllers/Collaborator/CreateCollaboratorController.js";
import { ListCollaboratorController } from "../controllers/Collaborator/ListCollaboratorController.js";
import { UpdateCollaboratorController } from "../controllers/Collaborator/UpdateCollaboratorController.js";
import { DeleteCollaboratorController } from "../controllers/Collaborator/DeleteCollaboratorController.js";

import { CreateEquipmentController } from "../controllers/Equipment/CreateEquipmentController.js";
import { ListEquipmentController } from "../controllers/Equipment/ListEquipmentController.js";
import { UpdateEquipmentController } from "../controllers/Equipment/UpdateEquipmentController.js";
import { DeleteEquipmentController } from "../controllers/Equipment/DeleteEquipmentController.js";

import { CreateOperatorController } from "../controllers/Operator/CreateOperatorController.js";
import { ListOperatorController } from "../controllers/Operator/ListOperatorController.js";
import { UpdateOperatorController } from "../controllers/Operator/UpdateOperatorController.js";
import { DeleteOperatorController } from "../controllers/Operator/DeleteOperatorController.js";

import { CreateWorkOrderController } from "../controllers/WorkOrder/CreateWorkOrderController.js";
import { ListWorkOrderController } from "../controllers/WorkOrder/ListWorkOrderController.js";
import { GetWorkOrderByIdController } from "../controllers/WorkOrder/GetWorkOrderByIdController.js";

import { UpdateSectorController } from "../controllers/SectorService/UpdateSectorController.js";
import { StartSectorServiceController } from "../controllers/SectorService/StartSectorServiceController.js";
import { PauseSectorController } from "../controllers/SectorService/PauseSectorController.js";
import { ResumeSectorController } from "../controllers/SectorService/ResumeSectorController.js";
import { FinishSectorServiceController } from "../controllers/SectorService/FinishSectorServiceController.js";
import { DeleteSectorController } from "../controllers/SectorService/DeleteSectorController.js";

export async function routes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
) {
  // Rotas públicas
  fastify.post("/login", (req: FastifyRequest, reply: FastifyReply) =>
    new LoginCollaboratorController().handle(req, reply),
  );

  fastify.post(
    "/login/check-registration",
    (req: FastifyRequest, reply: FastifyReply) =>
      new CheckRegistrationController().handle(req, reply),
  );

  // Rotas protegidas
  fastify.register(async function protectedRoutes(subFastify) {
    subFastify.addHook("preHandler", isAuthenticated);

    // Ordens de Serviço
    subFastify.post("/work-order", (req: FastifyRequest, reply: FastifyReply) =>
      new CreateWorkOrderController().handle(req, reply),
    );
    subFastify.get("/work-order", (req: FastifyRequest, reply: FastifyReply) =>
      new ListWorkOrderController().handle(req, reply),
    );
    subFastify.get(
      "/work-order/:id",
      (req: FastifyRequest, reply: FastifyReply) =>
        new GetWorkOrderByIdController().handle(req, reply),
    );

    // Atendimento por Setor
    subFastify.delete(
      "/sector-service/:id",
      (req: FastifyRequest, reply: FastifyReply) =>
        new DeleteSectorController().handle(req, reply),
    );
    subFastify.put(
      "/sector-service/:id",
      (req: FastifyRequest, reply: FastifyReply) =>
        new UpdateSectorController().handle(req, reply),
    );
    subFastify.put(
      "/sector-service/:id/start",
      (req: FastifyRequest, reply: FastifyReply) =>
        new StartSectorServiceController().handle(req, reply),
    );
    subFastify.put(
      "/sector-service/:id/pause",
      (req: FastifyRequest, reply: FastifyReply) =>
        new PauseSectorController().handle(req, reply),
    );
    subFastify.put(
      "/sector-service/:id/resume",
      (req: FastifyRequest, reply: FastifyReply) =>
        new ResumeSectorController().handle(req, reply),
    );
    subFastify.put(
      "/sector-service/:id/finish",
      (req: FastifyRequest, reply: FastifyReply) =>
        new FinishSectorServiceController().handle(req, reply),
    );

    // Colaboradores
    subFastify.get(
      "/collaborator",
      (req: FastifyRequest, reply: FastifyReply) =>
        new ListCollaboratorController().handle(req, reply),
    );
    subFastify.post(
      "/collaborator",
      (req: FastifyRequest, reply: FastifyReply) =>
        new CreateCollaboratorController().handle(req, reply),
    );
    subFastify.put(
      "/collaborator/:id",
      (req: FastifyRequest, reply: FastifyReply) =>
        new UpdateCollaboratorController().handle(req, reply),
    );
    subFastify.delete(
      "/collaborator/:id",
      (req: FastifyRequest, reply: FastifyReply) =>
        new DeleteCollaboratorController().handle(req, reply),
    );

    // Equipamentos
    subFastify.get("/equipment", (req: FastifyRequest, reply: FastifyReply) =>
      new ListEquipmentController().handle(req, reply),
    );
    subFastify.post("/equipment", (req: FastifyRequest, reply: FastifyReply) =>
      new CreateEquipmentController().handle(req, reply),
    );
    subFastify.put(
      "/equipment/:id",
      (req: FastifyRequest, reply: FastifyReply) =>
        new UpdateEquipmentController().handle(req, reply),
    );
    subFastify.delete(
      "/equipment/:id",
      (req: FastifyRequest, reply: FastifyReply) =>
        new DeleteEquipmentController().handle(req, reply),
    );

    // Operadores
    subFastify.get("/operator", (req: FastifyRequest, reply: FastifyReply) =>
      new ListOperatorController().handle(req, reply),
    );
    subFastify.post("/operator", (req: FastifyRequest, reply: FastifyReply) =>
      new CreateOperatorController().handle(req, reply),
    );
    subFastify.put(
      "/operator/:id",
      (req: FastifyRequest, reply: FastifyReply) =>
        new UpdateOperatorController().handle(req, reply),
    );
    subFastify.delete(
      "/operator/:id",
      (req: FastifyRequest, reply: FastifyReply) =>
        new DeleteOperatorController().handle(req, reply),
    );
  });
}

export default routes;