import {
  type FastifyInstance,
  type FastifyPluginOptions,
  type FastifyRequest,
  type FastifyReply,
} from "fastify";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { LoginCollaboratorController } from "../controllers/LoginCollaborator/LoginCollaboratorController.js";
import { CheckRegistrationController } from "../controllers/LoginCollaborator/CheckRegistrationController.js";
import { CreateCollaboratorController } from "../controllers/Collaborator/CreateCollaboratorController.js";
import { ListCollaboratorController } from "../controllers/Collaborator/ListCollaboratorController.js";
import { DeleteCollaboratorController } from "../controllers/Collaborator/DeleteCollaboratorController.js";
import { UpdateCollaboratorController } from "../controllers/Collaborator/UpdateCollaboratorController.js";
import { CreateEquipmentController } from "../controllers/Equipment/CreateEquipmentController.js";
import { ListEquipmentController } from "../controllers/Equipment/ListEquipmentController.js";
import { UpdateEquipmentController } from "../controllers/Equipment/UpdateEquipmentController.js";
import { DeleteEquipmentController } from "../controllers/Equipment/DeleteEquipmentController.js";
import { CreateOperatorController } from "../controllers/Operator/CreateOperatorController.js";
import { ListOperatorController } from "../controllers/Operator/ListOperatorController.js";
import { UpdateOperatorController } from "../controllers/Operator/UpdateOperatorController.js";
import { DeleteOperatorController } from "../controllers/Operator/DeleteOperatorController.js";

// WorkOrder Controllers
import { CreateWorkOrderController } from "../controllers/WorkOrder/CreateWorkOrderController.js";
import { ListWorkOrderController } from "../controllers/WorkOrder/ListWorkOrdernController.js"; 
import { DeleteWorkOrderController } from "../controllers/WorkOrder/DeleteWorkOrderController.js";
import { UpdateWorkOrderController } from "../controllers/WorkOrder/UpdateWorkOrderController.js";

// SectorService Controllers
import { StartSectorServiceController } from "../controllers/SectorService/StartSectorServiceController.js";
import { PauseSectorController } from "../controllers/SectorService/PauseSectorController.js";
import { ResumeSectorController } from "../controllers/SectorService/ResumeSectorController.js";
import { FinishSectorServiceController } from "../controllers/SectorService/FinishSectorServiceController.js";
import { CreatePartController } from "../controllers/PartController/CreatePartController.js";
import { ListPartController } from "../controllers/PartController/ListPartController.js";
import { AddUsedPartController } from "../controllers/PartController/AddUsedPartController.js";
import { CreateToolController } from "../controllers/ToolController/CreateToolController.js";

export async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  fastify.post(
    "/login",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new LoginCollaboratorController().handle(request, reply);
    },
  );

  fastify.post(
    "/collaborator",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new CreateCollaboratorController().handle(request, reply);
    },
  );

  fastify.post(
    "/login/check-registration",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new CheckRegistrationController().handle(request, reply);
    }
  );

  fastify.register(async function protectedRoutes(subFastify) {
    subFastify.addHook("preHandler", isAuthenticated);

    // --- ROTAS DE ORDENS DE SERVIÇO ---
    subFastify.post(
      "/work-order",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreateWorkOrderController().handle(request, reply);
      },
    );

    subFastify.get(
      "/work-order",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new ListWorkOrderController().handle(request, reply);
      },
    );

    // --- ROTAS DE SECTOR SERVICE ---
    subFastify.put(
      "/sector-service/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new UpdateWorkOrderController().handle(request, reply);
      }
    );

    subFastify.delete(
      "/sector-service/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new DeleteWorkOrderController().handle(request, reply);
      }
    );

    subFastify.put(
      "/sector-service/:id/start",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new StartSectorServiceController().handle(request, reply);
      }
    );

    subFastify.put(
      "/sector-service/:id/pause",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new PauseSectorController().handle(request, reply);
      }
    );

    subFastify.put(
      "/sector-service/:id/resume",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new ResumeSectorController().handle(request, reply);
      }
    );

    subFastify.put(
      "/sector-service/:id/finish",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new FinishSectorServiceController().handle(request, reply);
      }
    );

    // --- ROTAS DE COLLABORATOR ---
    subFastify.get(
      "/collaborator",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new ListCollaboratorController().handle(request, reply);
      },
    );
    
    subFastify.put(
      "/collaborator/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new UpdateCollaboratorController().handle(request, reply);
      },
    );

    subFastify.delete(
      "/collaborator/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new DeleteCollaboratorController().handle(request, reply);
      },
    );
       
    // --- ROTAS DE EQUIPMENT ---
    subFastify.get(
      "/equipment",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new ListEquipmentController().handle(request, reply);
      },
    );

    subFastify.post(
      "/equipment",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreateEquipmentController().handle(request, reply);
      },
    );

    subFastify.put(
      "/equipment/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new UpdateEquipmentController().handle(request, reply);
      },
    );

    subFastify.delete(
      "/equipment/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new DeleteEquipmentController().handle(request, reply);
      },
    );

    // --- ROTAS DE OPERATOR ---
    subFastify.get(
      "/operator",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new ListOperatorController().handle(request, reply);
      },
    );

    subFastify.post(
      "/operator",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreateOperatorController().handle(request, reply);
      },
    );

    subFastify.put(
      "/operator/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new UpdateOperatorController().handle(request, reply);
      },
    );

    subFastify.delete(
      "/operator/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new DeleteOperatorController().handle(request, reply);
      },
    );

    // rotas para part
    subFastify.post(
      "/part", 
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreatePartController().handle(request, reply);
      },
    );

    subFastify.get(
      "/part", 
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new ListPartController().handle(request, reply);
      },
    );

    // rota para adicionar peça ao servico do setor
    subFastify.post(
      "/sector-service/:id/parts",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new AddUsedPartController().handle(request, reply);
      }
    );

    // rota para cadastrar uma ferramenta
    subFastify.post(
      "/tool",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreateToolController().handle(request, reply);
      }
    );

  });
}

export default routes;
