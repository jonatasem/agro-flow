import prismaClient from "../../prisma/index.js";

interface ListWorkOrderProps {
  status?: string | undefined;
}

export class ListWorkOrderService {
  async execute({ status }: ListWorkOrderProps) {
    const whereClause: any = {};

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    const workOrders = await prismaClient.workOrder.findMany({
      where: whereClause,
      include: {
        equipment: true,
        setores: {
          include: {
            operator: true,
            criador: {
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
        createdAt: "desc",
      },
    });

    return workOrders;
  }
}