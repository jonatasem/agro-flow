import prismaClient from "../../prisma/index.js";

interface AddUsedPartProps {
  sectorServiceId: string;
  partId: string;
  quantity: number;
}

export class AddUsedPartService {
  async execute({ sectorServiceId, partId, quantity }: AddUsedPartProps) {
    if (!sectorServiceId || !partId) {
      throw new Error("ID do serviço e ID da peça são obrigatórios.");
    }

    if (!quantity || quantity <= 0) {
      throw new Error("A quantidade de peças deve ser maior que zero.");
    }

    const part = await prismaClient.part.findUnique({
      where: { id: partId },
    });

    if (!part) {
      throw new Error("Peça/insumo não encontrado.");
    }

    if (part.stockQuantity < quantity) {
      throw new Error(`Estoque insuficiente. Quantidade disponível: ${part.stockQuantity}`);
    }

    // Executa em transação para garantir integridade do estoque
    const [usedPart] = await prismaClient.$transaction([
      prismaClient.usedPart.create({
        data: {
          sectorServiceId,
          partId,
          quantity,
        },
      }),
      prismaClient.part.update({
        where: { id: partId },
        data: {
          stockQuantity: {
            decrement: quantity,
          },
        },
      }),
    ]);

    return usedPart;
  }
}