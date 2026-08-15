import prismaClient from "../../prisma/index.js";

interface CreatePartServiceProps {
    name: string;
    sector: string;
    stockQuantity: number;
}

export class CreatePartService {
    async execute({ name, sector, stockQuantity }: CreatePartServiceProps) {
        // 1. Validação básica de estoque
        if (stockQuantity <= 0) {
            throw new Error("A quantidade de estoque deve ser maior que zero.");
        };

        if(!name){
            throw new Error("O campo nome é obrigatório!")
        };

        if(!sector){
            throw new Error("O campo setor é obrigatório!")
        }

        // Gera o partNumber padronizado
        const partNumber = name.replace(/\s+/g, "").toUpperCase();

        // 2. Busca e atualiza se existir, ou cria se não existir (Upsert)
        const part = await prismaClient.part.upsert({
            where: {
                partNumber,
            },
            update: {
                stockQuantity: {
                    increment: stockQuantity,
                },
            },
            create: {
                name,
                partNumber,
                sector,
                stockQuantity,
            },
        });

        return part;
    }
}