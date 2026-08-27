import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

// Estrutura dos dados contidos dentro do Payload do JWT
interface TokenPayload {
  sub: string;
  name: string;
  role: string;
  sector: string;
}

/**
 * Middleware para validar o token JWT nas rotas protegidas.
 */
export async function isAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai o cabeçalho de autorização da requisição
  const authHeader = request.headers.authorization;

  // Verifica se o cabeçalho Authorization foi enviado
  if (!authHeader) {
    return reply.status(401).send({ error: "Token não fornecido." });
  }

  // Valida se o cabeçalho segue o padrão 'Bearer <token>'
  if (!authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Formato do token inválido. Utilize o padrão Bearer." });
  }

  // Separa o prefixo 'Bearer' e obtém apenas a hash do token
  const token = authHeader.split(" ")[1];

  // Garante que o token realmente existe após a divisão
  if (!token) {
    return reply.status(401).send({ error: "Token malformatado ou ausente." });
  }

  // Obtém a chave secreta de assinatura das variáveis de ambiente
  const secret = process.env.JWT_SECRET;

  // Se a chave secreta não estiver configurada no servidor, interrompe a execução com um erro de infraestrutura
  if (!secret) {
    throw new Error("A variável de ambiente JWT_SECRET não foi configurada.");
  }

  try {
    // Decodifica e valida a assinatura e a expiração do token JWT
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Anexa as informações do usuário autenticado no objeto da requisição (disponível nos controllers)
    request.userId = decoded.sub;
    request.userRole = decoded.role;
    request.user = {
      id: decoded.sub,
      name: decoded.name,
      role: decoded.role,
      sector: decoded.sector,
    };
  } catch (err) {
    // Caso a assinatura seja inválida ou o token esteja expirado
    return reply.status(401).send({ error: "Token inválido ou expirado." });
  }
}