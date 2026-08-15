import prismaClient from "../../prisma/index.js";

export class ListPartService {
    async execute() {
        const result = await prismaClient.part.findMany({
            select: {
                id: true,
                name: true,
                partNumber: true,
                sector: true,
                stockQuantity: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return result;
    }
}