import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

declare module "fastify" {
  interface FastifyRequest {
    userId: string;
  }
}

interface TokenPayload {
  sub: string;
}

export async function isAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply,
) {

  // Pega o header
  const authHeader = request.headers.authorization;

  // Verifica se existe um token
  if (!authHeader) {
    return reply.status(401).send({ error: "Token nao fornecido" });
  }

  // Separando o texto do token
  const [, token] = authHeader.split(" ");

  // Se nao reconhecer o token, avise
  if (!token) {
    return reply.status(401).send({ error: "Token malformatado ou ausente" });
  }

  // Busca os token JWT
  const secret = process.env.JWT_SECRET;

  // Se nao existir um token, avise
  if (!secret) {
    throw new Error("Não foi fornecido nenhum token JWT_SECRET");
  }

  try {
    // Pega o token e tenta validar utlizando a chave secrete
    const decoded = jwt.verify(token, secret) as TokenPayload;
    request.userId = decoded.sub;
  } catch (err) {
    return reply.status(401).send({ error: "Token invalido ou expirado" });
  }
}
