import {
  type FastifyInstance,
  type FastifyPluginOptions,
  type FastifyRequest,
  type FastifyReply,
} from "fastify";

// Middleware de autenticacao
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { LoginCollaboratorController } from "../controllers/LoginCollaborator/LoginCollaboratorController.js";
import { CheckRegistrationController } from "../controllers/LoginCollaborator/CheckRegistrationController.js";

// Funcionarios autorizados
import { CreateCollaboratorController } from "../controllers/Collaborator/CreateCollaboratorController.js";
import { ListCollaboratorController } from "../controllers/Collaborator/ListCollaboratorController.js";
import { DeleteCollaboratorController } from "../controllers/Collaborator/DeleteCollaboratorController.js";
import { UpdateCollaboratorController } from "../controllers/Collaborator/UpdateCollaboratorController.js";

// Equipamentos
import { CreateEquipmentController } from "../controllers/Equipment/CreateEquipmentController.js";
import { ListEquipmentController } from "../controllers/Equipment/ListEquipmentController.js";
import { UpdateEquipmentController } from "../controllers/Equipment/UpdateEquipmentController.js";
import { DeleteEquipmentController } from "../controllers/Equipment/DeleteEquipmentController.js";

// Operadores
import { CreateOperatorController } from "../controllers/Operator/CreateOperatorController.js";
import { ListOperatorController } from "../controllers/Operator/ListOperatorController.js";
import { UpdateOperatorController } from "../controllers/Operator/UpdateOperatorController.js";
import { DeleteOperatorController } from "../controllers/Operator/DeleteOperatorController.js";

// Ordem de servico
import { CreateWorkOrderController } from "../controllers/WorkOrder/CreateWorkOrderController.js";
import { ListWorkOrderController } from "../controllers/WorkOrder/ListWorkOrdernController.js";

export async function routes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
) {
  // Rotas publicas
  fastify.post(
    "/login",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new LoginCollaboratorController().handle(request, reply);
    },
  );

  // Cadastra um novo colaborador
  fastify.post(
    "/collaborator",
    async (request: FastifyRequest, reply: FastifyReply) => {
      return new CreateCollaboratorController().handle(request, reply);
    },
  );

  // Verificar se a matrícula existe, e se o usuario nao ta desativado, retorna o nome 
    fastify.post(
      "/login/check-registration",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new CheckRegistrationController().handle(request, reply);
      }
    );




  // Rotas privadas
  fastify.register(async function protectedRoutes(subFastify) {
    subFastify.addHook("preHandler", isAuthenticated);

    // Cria uma nova os
    subFastify.post(
      "/work-order",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreateWorkOrderController().handle(request, reply);
      },
    );

    // Busca as ordens cadastradas
    subFastify.get(
      "/work-order",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new ListWorkOrderController().handle(request, reply);
      },
    );

    // Busca os colaborador cadastrados
    subFastify.get(
      "/collaborator",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new ListCollaboratorController().handle(request, reply);
      },
    );

    // Atualiza um colaborador
    subFastify.put(
      "/collaborator/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new UpdateCollaboratorController().handle(request, reply);
      },
    );

    // Deleta um colaborador
    subFastify.delete(
      "/collaborator",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new DeleteCollaboratorController().handle(request, reply);
      },
    );

    // Busca os equipamentos cadastrados
    subFastify.get(
      "/equipment",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new ListEquipmentController().handle(request, reply);
      },
    );

    // Cria um novo equipamento
    subFastify.post(
      "/equipment",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreateEquipmentController().handle(request, reply);
      },
    );

    // Atualiza um equipamento
    subFastify.put(
      "/equipment/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new UpdateEquipmentController().handle(request, reply);
      },
    );

    // Deleta um equipamento
    subFastify.delete(
      "/equipment",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new DeleteEquipmentController().handle(request, reply);
      },
    );

    // Lista os operadores cadastrados
    subFastify.get(
      "/operator",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new ListOperatorController().handle(request, reply);
      },
    );

    // Cadastra um operador
    subFastify.post(
      "/operator",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new CreateOperatorController().handle(request, reply);
      },
    );

    // Atualiza um operador
    subFastify.put(
      "/operator/:id",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new UpdateOperatorController().handle(request, reply);
      },
    );

    // Deleta um operador
    subFastify.delete(
      "/operator",
      async (request: FastifyRequest, reply: FastifyReply) => {
        return new DeleteOperatorController().handle(request, reply);
      },
    );
  });
}

export default routes;
