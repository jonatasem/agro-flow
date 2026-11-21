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
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({ error: "Token não fornecido." });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return reply
      .status(401)
      .send({ error: "Formato do token inválido. Utilize o padrão Bearer." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return reply.status(401).send({ error: "Token malformatado ou ausente." });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("A variável de ambiente JWT_SECRET não foi configurada.");
  }

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;

    request.userId = decoded.sub;
    request.userRole = decoded.role;
    request.user = {
      id: decoded.sub,
      name: decoded.name,
      role: decoded.role,
      sector: decoded.sector,
    };
  } catch {
    return reply.status(401).send({ error: "Token inválido ou expirado." });
  }
}