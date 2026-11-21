import type { FastifyReply } from "fastify";

export function sendError(
  reply: FastifyReply,
  error: unknown,
  fallbackMessage = "Erro interno no servidor.",
) {
  if (!(error instanceof Error)) {
    return reply.status(500).send({ error: fallbackMessage });
  }

  const message = error.message;

  if (message.includes("Acesso negado")) {
    return reply.status(403).send({ error: message });
  }

  if (message.toLowerCase().includes("não encontrado")) {
    return reply.status(404).send({ error: message });
  }

  return reply.status(400).send({ error: message });
}