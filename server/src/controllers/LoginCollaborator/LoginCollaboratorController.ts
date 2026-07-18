import type { FastifyRequest, FastifyReply } from "fastify";
import { LoginCollaboratorService } from "../../services/LoginCollaborator/LoginCollaboratorService.js";

export class LoginCollaboratorController {
  async handle(request: FastifyRequest, reply: FastifyReply) {
    
    // Busca os dados no corpo da requisicao
    const { registration, password } = request.body as {
      registration: string;
      password: string;
    };

    // Cria o servico pra fazer login
    const loginService = new LoginCollaboratorService();

    // Tenta fazer login utilizando os dados matricula e senha
    try {
      const result = await loginService.execute({ registration, password });

      // Se conseguir, retorne o login
      return reply.send(result);
    } catch (error: any) {
      
      // Se der erro, mostre um erro
      return reply.status(401).send({ error: error.message });
    }
  }
}
