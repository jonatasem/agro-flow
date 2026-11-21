import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    userId?: string;
    userRole?: string;
    user?: {
      id: string;
      name: string;
      role: string;
      sector: string;
    };
  }
}