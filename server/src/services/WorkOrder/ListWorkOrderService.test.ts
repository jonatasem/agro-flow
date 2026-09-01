import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// 1. Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    workOrder: {
      findMany: jest.fn(),
    },
  },
}));

// 2. Importações dinâmicas após o registro dos mocks
const { ListWorkOrderService } = await import("./ListWorkOrderService.js");
const { default: prismaClient } = await import("../../prisma/index.js");

describe("ListWorkOrderService", () => {
  let listWorkOrderService: InstanceType<typeof ListWorkOrderService>;

  const mockWorkOrders = [
    {
      id: "workorder-1",
      status: "ABERTA",
      createdAt: new Date("2026-08-01T10:00:00Z"),
      equipment: { id: "eq-1", name: "Trator John Deere", fleet: "EQ-001" },
      setores: [
        {
          id: "sector-1",
          setor: "Mecanica",
          operator: { id: "op-1", name: "Carlos Operador" },
          criador: { id: "user-1", name: "Gestor Silva", role: "GESTAO" },
          tecnicoResponsavel: { id: "tec-1", name: "João Técnico", role: "TECNICO" },
        },
      ],
    },
    {
      id: "workorder-2",
      status: "FINALIZADA",
      createdAt: new Date("2026-07-28T09:00:00Z"),
      equipment: { id: "eq-2", name: "Colhedora Case", fleet: "EQ-002" },
      setores: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    listWorkOrderService = new ListWorkOrderService();
  });

  it("deve listar todas as ordens de serviço quando nenhum status for informado", async () => {
    jest.mocked(prismaClient.workOrder.findMany).mockResolvedValue(mockWorkOrders as any);

    const result = await listWorkOrderService.execute({});

    expect(prismaClient.workOrder.findMany).toHaveBeenCalledWith({
      where: {},
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
    expect(result).toEqual(mockWorkOrders);
  });

  it("deve listar ordens de serviço filtradas por status convertido para maiúsculas", async () => {
    const filteredOrders = [mockWorkOrders[0]];
    jest.mocked(prismaClient.workOrder.findMany).mockResolvedValue(filteredOrders as any);

    const result = await listWorkOrderService.execute({ status: "aberta" });

    expect(prismaClient.workOrder.findMany).toHaveBeenCalledWith({
      where: { status: "ABERTA" },
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
    expect(result).toEqual(filteredOrders);
  });

  it("deve retornar uma lista vazia se nenhuma ordem de serviço for encontrada com o status informado", async () => {
    jest.mocked(prismaClient.workOrder.findMany).mockResolvedValue([] as any);

    const result = await listWorkOrderService.execute({ status: "CANCELADA" });

    expect(prismaClient.workOrder.findMany).toHaveBeenCalledWith({
      where: { status: "CANCELADA" },
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
    expect(result).toEqual([]);
  });
});