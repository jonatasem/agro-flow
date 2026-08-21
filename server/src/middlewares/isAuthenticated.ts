import type { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";

interface TokenPayload {
  sub: string;
  name: string;
  role: string;
  sector: string;
}

export async function isAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Pega o header
  const authHeader = request.headers.authorization;

  // Verifica se existe um token
  if (!authHeader) {
    return reply.status(401).send({ error: "Token não fornecido" });
  }

  // Separando o texto do token
  const [, token] = authHeader.split(" ");

  // Se não reconhecer o token, avise
  if (!token) {
    return reply.status(401).send({ error: "Token malformatado ou ausente" });
  }

  // Busca o segredo JWT
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Não foi fornecido nenhum token JWT_SECRET");
  }

  try {
    // Valida o token utilizando a chave secreta
    const decoded = jwt.verify(token, secret) as TokenPayload;

    // Injeta as propriedades na requisição
    request.userId = decoded.sub;
    request.userRole = decoded.role;
    request.user = {
      id: decoded.sub,
      name: decoded.name,
      role: decoded.role,
      sector: decoded.sector,
    };
  } catch (err) {
    return reply.status(401).send({ error: "Token inválido ou expirado" });
  }
}