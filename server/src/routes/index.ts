import {
  type FastifyInstance,
  type FastifyPluginOptions,
  type FastifyRequest,
  type FastifyReply,
} from "fastify";

// Middleware de Autenticação JWT
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

// --- CONTROLLERS: Autenticação & Registro ---
import { LoginCollaboratorController } from "../controllers/LoginCollaborator/LoginCollaboratorController.js";
import { CheckRegistrationController } from "../controllers/LoginCollaborator/CheckRegistrationController.js";

// --- CONTROLLERS: Colaborador ---
import { CreateCollaboratorController } from "../controllers/Collaborator/CreateCollaboratorController.js";
import { ListCollaboratorController } from "../controllers/Collaborator/ListCollaboratorController.js";
import { DeleteCollaboratorController } from "../controllers/Collaborator/DeleteCollaboratorController.js";
import { UpdateCollaboratorController } from "../controllers/Collaborator/UpdateCollaboratorController.js";

// --- CONTROLLERS: Equipamento ---
import { CreateEquipmentController } from "../controllers/Equipment/CreateEquipmentController.js";
import { ListEquipmentController } from "../controllers/Equipment/ListEquipmentController.js";
import { UpdateEquipmentController } from "../controllers/Equipment/UpdateEquipmentController.js";
import { DeleteEquipmentController } from "../controllers/Equipment/DeleteEquipmentController.js";

// --- CONTROLLERS: Operador ---
import { CreateOperatorController } from "../controllers/Operator/CreateOperatorController.js";
import { ListOperatorController } from "../controllers/Operator/ListOperatorController.js";
import { UpdateOperatorController } from "../controllers/Operator/UpdateOperatorController.js";
import { DeleteOperatorController } from "../controllers/Operator/DeleteOperatorController.js";

// --- CONTROLLERS: Ordem de Serviço (WorkOrder) ---
import { CreateWorkOrderController } from "../controllers/WorkOrder/CreateWorkOrderController.js";
import { ListWorkOrderController } from "../controllers/WorkOrder/ListWorkOrdernController.js"; 
import { DeleteWorkOrderController } from "../controllers/WorkOrder/DeleteWorkOrderController.js";
import { UpdateWorkOrderController } from "../controllers/WorkOrder/UpdateWorkOrderController.js";
import { GetWorkOrderByIdController } from "../controllers/WorkOrder/GetWorkOrderByIdController.js";

// --- CONTROLLERS: Atendimento de Setor (SectorService) ---
import { StartSectorServiceController } from "../controllers/SectorService/StartSectorServiceController.js";
import { PauseSectorController } from "../controllers/SectorService/PauseSectorController.js";
import { ResumeSectorController } from "../controllers/SectorService/ResumeSectorController.js";
import { FinishSectorServiceController } from "../controllers/SectorService/FinishSectorServiceController.js";

// --- CONTROLLERS: Dashboard & Métricas ---
import { GetDashboardMetricsController } from "../controllers/Metrics/GetDashboardMetricsController.js";

export async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  // =========================================================================
  // ROTAS PÚBLICAS (Nenhum token JWT é exigido)
  // =========================================================================

  // Autenticação de colaborador
  fastify.post(
    "/login",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new LoginCollaboratorController().handle(request, reply);
    },
  );

  // Validação de matrícula existente
  fastify.post(
    "/login/check-registration",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new CheckRegistrationController().handle(request, reply);
    }
  );

  // =========================================================================
  // ROTAS PROTEGIDAS (Exigem Header "Authorization: Bearer <token>")
  // =========================================================================
  fastify.register(async function protectedRoutes(subFastify) {
    // Hook executado antes de qualquer manipulador dentro deste bloco
    subFastify.addHook("preHandler", isAuthenticated);

    // -----------------------------------------------------------------------
    // DASHBOARD & MÉTRICAS
    // -----------------------------------------------------------------------
    subFastify.get(
      "/metrics",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new GetDashboardMetricsController().handle(request, reply);
      }
    );

    // -----------------------------------------------------------------------
    // ORDENS DE SERVIÇO (WORK ORDER)
    // -----------------------------------------------------------------------
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

    subFastify.get(
      "/work-order/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new GetWorkOrderByIdController().handle(request, reply);
      },
    );

    subFastify.put(
      "/work-order/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new UpdateWorkOrderController().handle(request, reply);
      }
    );

    subFastify.delete(
      "/work-order/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new DeleteWorkOrderController().handle(request, reply);
      }
    );

    // -----------------------------------------------------------------------
    // FLUXO DE MANUTENÇÃO DO SETOR (SECTOR SERVICE)
    // -----------------------------------------------------------------------
    // Iniciar atendimento
    subFastify.put(
      "/sector-service/:id/start",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new StartSectorServiceController().handle(request, reply);
      }
    );

    // Pausar atendimento (aguardando peça ou outro setor)
    subFastify.put(
      "/sector-service/:id/pause",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new PauseSectorController().handle(request, reply);
      }
    );

    // Retomar atendimento pausado
    subFastify.put(
      "/sector-service/:id/resume",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new ResumeSectorController().handle(request, reply);
      }
    );

    // Finalizar atendimento e calcular tempo líquido
    subFastify.put(
      "/sector-service/:id/finish",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new FinishSectorServiceController().handle(request, reply);
      }
    );

    // -----------------------------------------------------------------------
    // COLABORADORES
    // -----------------------------------------------------------------------
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

    // Cadastro inicial de colaborador
    subFastify.post(
      "/collaborator",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreateCollaboratorController().handle(request, reply);
      },
    );
       
    // -----------------------------------------------------------------------
    // EQUIPAMENTOS 
    // -----------------------------------------------------------------------
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

    // -----------------------------------------------------------------------
    // OPERADORES
    // -----------------------------------------------------------------------
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
  });
}

export default routes;

