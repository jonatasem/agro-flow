import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// 1. Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    sectorService: {
      findMany: jest.fn(),
    },
  },
}));

// 2. Importações dinâmicas após o registro dos mocks
const { GetDashboardMetricsService } = await import("./GetDashboardMetricsService.js");
const { default: prismaClient } = await import("../../prisma/index.js");

describe("GetDashboardMetricsService", () => {
  let getDashboardMetricsService: InstanceType<typeof GetDashboardMetricsService>;

  beforeEach(() => {
    jest.clearAllMocks();
    getDashboardMetricsService = new GetDashboardMetricsService();
  });

  it("deve retornar métricas zeradas quando nenhum serviço for encontrado", async () => {
    jest.mocked(prismaClient.sectorService.findMany).mockResolvedValue([] as never);

    const result = await getDashboardMetricsService.execute({});

    expect(prismaClient.sectorService.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      overview: {
        totalWorkOrders: 0,
        totalDowntimeMinutes: 0,
        totalDowntimeHours: 0,
        averageRepairTimeMinutes: 0,
      },
      causesDistribution: {},
      topProblematicEquipments: [],
      topRequestingOperators: [],
      timeline: [],
    });
  });

  it("deve aplicar corretamente os filtros na consulta ao Prisma", async () => {
    jest.mocked(prismaClient.sectorService.findMany).mockResolvedValue([] as never);

    const filters = {
      startDate: "2026-08-01",
      endDate: "2026-08-31",
      equipmentId: "eq-123",
      operatorId: "op-456",
      tecnicoId: "tec-789",
      setor: "Mecanica",
      tipoCausa: "DESGASTE_NATURAL",
    };

    await getDashboardMetricsService.execute(filters);

    expect(prismaClient.sectorService.findMany).toHaveBeenCalledWith({
      where: {
        dataCriacao: {
          gte: expect.any(Date),
          lte: expect.any(Date),
        },
        setor: filters.setor,
        tipoCausa: filters.tipoCausa,
        tecnicoResponsavelId: filters.tecnicoId,
        operatorId: filters.operatorId,
        workOrder: { equipmentId: filters.equipmentId },
      },
      include: {
        operator: true,
        workOrder: { include: { equipment: true } },
      },
      orderBy: { dataCriacao: "asc" },
    });
  });

  it("deve calcular e agregar corretamente as métricas do dashboard", async () => {
    const mockServices = [
      {
        id: "service-1",
        tempoManutencao: 120,
        tipoCausa: "MECANICA",
        dataCriacao: new Date("2026-08-10T10:00:00Z"),
        operator: { id: "op-1", name: "Carlos Silva", registration: "1001" },
        workOrder: {
          equipment: { id: "eq-1", fleet: "TR-01", name: "Trator 01" },
        },
      },
      {
        id: "service-2",
        tempoManutencao: 60,
        tipoCausa: "MECANICA",
        dataCriacao: new Date("2026-08-10T14:00:00Z"),
        operator: { id: "op-1", name: "Carlos Silva", registration: "1001" },
        workOrder: {
          equipment: { id: "eq-2", fleet: "TR-02", name: "Trator 02" },
        },
      },
      {
        id: "service-3",
        tempoManutencao: 90,
        tipoCausa: "ELETRICA",
        dataCriacao: new Date("2026-08-11T09:00:00Z"),
        operator: { id: "op-2", name: "Ana Souza", registration: "1002" },
        workOrder: {
          equipment: { id: "eq-1", fleet: "TR-01", name: "Trator 01" },
        },
      },
    ];

    jest.mocked(prismaClient.sectorService.findMany).mockResolvedValue(mockServices as any);

    const result = await getDashboardMetricsService.execute({
      startDate: "2026-08-01",
      endDate: "2026-08-31",
    });

    expect(result.overview).toEqual({
      totalWorkOrders: 3,
      totalDowntimeMinutes: 270,
      totalDowntimeHours: 4.5,
      averageRepairTimeMinutes: 90, // 270 / 3
    });

    expect(result.causesDistribution).toEqual({
      MECANICA: 2,
      ELETRICA: 1,
    });

    expect(result.topProblematicEquipments).toEqual([
      { fleet: "TR-01", name: "Trator 01", count: 2, totalMinutes: 210 },
      { fleet: "TR-02", name: "Trator 02", count: 1, totalMinutes: 60 },
    ]);

    expect(result.topRequestingOperators).toEqual([
      {
        name: "Carlos Silva",
        totalOS: 2,
        causes: { MECANICA: 2 },
      },
      {
        name: "Ana Souza",
        totalOS: 1,
        causes: { ELETRICA: 1 },
      },
    ]);

    expect(result.timeline).toEqual([
      { date: "2026-08-10", count: 2 },
      { date: "2026-08-11", count: 1 },
    ]);
  });

  it("deve atribuir 'NÃO_INFORMADO' quando o tipoCausa estiver ausente", async () => {
    const mockServices = [
      {
        id: "service-1",
        tempoManutencao: 30,
        tipoCausa: null,
        dataCriacao: new Date("2026-08-15T08:00:00Z"),
        operator: null,
        workOrder: null,
      },
    ];

    jest.mocked(prismaClient.sectorService.findMany).mockResolvedValue(mockServices as any);

    const result = await getDashboardMetricsService.execute({});

    expect(result.causesDistribution).toEqual({
      NÃO_INFORMADO: 1,
    });
  });
});