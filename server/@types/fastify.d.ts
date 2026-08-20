import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    userRole?: string;
    userSector?: string;
    user?: {
      id: string;
      role: string;
      sector: string;
    };
  }
}