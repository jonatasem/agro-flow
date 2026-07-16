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

export async function isAuthenticated(request: FastifyRequest, reply: FastifyReply) {
    const authHeader = request.headers.authorization;

    if(!authHeader) {
        return reply.status(401).send({ error: "Token nao fornecido" });
    }

    // Separando o texto do token
    const [ ,token ] = authHeader.split(" ");

    if(!token){
        return reply.status(401).send({ error: "Token malformatado ou ausente" })
    }

    const secret = process.env.JWT_SECRET;

    if(!secret){
        throw new Error("Não foi fornecido nenhum token JWT_SECRET")
    }

    try {
        const decoded = jwt.verify(token, secret) as TokenPayload;
            request.userId = decoded.sub;

        } catch (err) {
        return reply.status(401).send({ error: "Token invalido ou expirado" });
    }
}
