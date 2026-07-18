import prismaClient from "../../prisma/index.js";

interface ListWorkOrderProps {
  status?: string;
}

export class ListWorkOrderService {
  async execute({ status }: ListWorkOrderProps) {
    const whereClause: any = {};

    // Se o usuário passar um status na URL, aplicamos o filtro
    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const workOrders = await prismaClient.workOrder.findMany({
      where: whereClause,
      include: {
        equipment: true, // Traz os dados do veículo
        operator: true, // Traz os dados do operador
        setores: {
          // Traz todos os setores associados a esta O.S.
          include: {
            criador: {
              // Dentro de cada serviço, traz quem o criou (apenas dados essenciais)
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
            tecnicoResponsavel: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Mostra as ordens mais recentes primeiro
      },
    });

    // Retorna as os salvas em aberto
    return workOrders;
  }
}
