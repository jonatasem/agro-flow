import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM para o Prisma
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    workOrder: {
      findMany: jest.fn(),
    },
  },
}));

// Importações dinâmicas necessárias para testes no ambiente ESM
const { GetDashboardMetricsService } = await import(
  "./GetDashboardMetricsService.js"
);
const { default: prismaClient } = await import("../../prisma/index.js");

describe("GetDashboardMetricsService", () => {
  let getDashboardMetricsService: InstanceType<
    typeof GetDashboardMetricsService
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    getDashboardMetricsService = new GetDashboardMetricsService();
  });

  it("deve retornar métricas zeradas quando nenhuma ordem de serviço for encontrada", async () => {
    jest
      .mocked(prismaClient.workOrder.findMany)
      .mockResolvedValue([] as never);

    const result = await getDashboardMetricsService.execute();

    expect(prismaClient.workOrder.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      volumeOperacional: {
        totalOrdens: 0,
        ordensPorStatus: {},
        totalServicosSetoriais: 0,
        servicosPorStatus: {},
        servicosPorCidade: {},
      },
      indicadoresDeTempo: {
        global: {
          mttrMinutos: 0,
          tempoMedioEsperaMinutos: 0,
          tempoTotalParadaMinutos: 0,
        },
        mttrPorTecnico: [],
        mttrPorSetor: [],
        mttrPorCidade: [],
      },
      analiseDeOfensores: {
        operadoresComMaisQuebras: [],
        equipamentosComMaisQuebras: [],
        setoresComMaisProblemas: [],
        principaisCausas: [],
        tecnicosMaisAtivos: [],
      },
    });
  });

  it("deve aplicar os relacionamentos corretos na consulta do Prisma", async () => {
    jest
      .mocked(prismaClient.workOrder.findMany)
      .mockResolvedValue([] as never);

    await getDashboardMetricsService.execute();

    expect(prismaClient.workOrder.findMany).toHaveBeenCalledWith({
      include: {
        equipment: true,
        setores: {
          include: {
            operator: true,
            tecnicoResponsavel: true,
            criador: true,
            pauses: true,
          },
        },
      },
    });
  });

  it("deve calcular e agregar corretamente as métricas dos 3 pilares", async () => {
    const mockWorkOrders = [
      {
        id: "wo-1",
        status: "FINALIZADA",
        equipment: { id: "eq-1", fleet: "100200", name: "Trator John Deere" },
        setores: [
          {
            id: "sec-1",
            setor: "Mecânica",
            status: "FINALIZADO",
            city: "Lucélia - SP",
            tipoCausa: "Desgaste",
            dataCriacao: new Date("2026-03-01T08:00:00Z"),
            dataInicioManutencao: new Date("2026-03-01T09:00:00Z"),
            dataFimManutencao: new Date("2026-03-01T10:00:00Z"),
            operator: {
              id: "op-1",
              name: "João Carlos",
              registration: "500100",
            },
            tecnicoResponsavel: { id: "tec-1", name: "Usuário teste" },
            pauses: [],
          },
        ],
      },
    ];

    jest
      .mocked(prismaClient.workOrder.findMany)
      .mockResolvedValue(mockWorkOrders as never);

    const result = await getDashboardMetricsService.execute();

    // Pilar 1: Volume
    expect(result.volumeOperacional.totalOrdens).toBe(1);
    expect(result.volumeOperacional.ordensPorStatus).toEqual({
      FINALIZADA: 1,
    });
    expect(result.volumeOperacional.servicosPorCidade).toEqual({
      "Lucélia - SP": 1,
    });

    // Pilar 2: Tempo
    expect(result.indicadoresDeTempo.global.mttrMinutos).toBe(60);
    expect(result.indicadoresDeTempo.global.tempoMedioEsperaMinutos).toBe(60);

    // Pilar 3: Ofensores
    expect(result.analiseDeOfensores.equipamentosComMaisQuebras).toEqual([
      {
        equipamentoId: "eq-1",
        frota: "100200",
        nome: "Trator John Deere",
        totalOrdens: 1,
      },
    ]);
    expect(result.analiseDeOfensores.operadoresComMaisQuebras).toEqual([
      {
        operadorId: "op-1",
        nome: "João Carlos",
        matricula: "500100",
        totalOcorrencias: 1,
      },
    ]);
  });

  it("deve tratar valores nulos e opcionais sem quebrar a execução", async () => {
    const mockWorkOrders = [
      {
        id: "wo-2",
        status: "ABERTA",
        equipment: null,
        setores: [
          {
            id: "sec-2",
            setor: null,
            status: "AGUARDANDO_MANUTENCAO",
            city: null,
            tipoCausa: null,
            dataCriacao: new Date(),
            dataInicioManutencao: null,
            dataFimManutencao: null,
            operator: null,
            tecnicoResponsavel: null,
            pauses: [],
          },
        ],
      },
    ];

    jest
      .mocked(prismaClient.workOrder.findMany)
      .mockResolvedValue(mockWorkOrders as never);

    const result = await getDashboardMetricsService.execute();

    expect(result.volumeOperacional.totalOrdens).toBe(1);
    expect(result.indicadoresDeTempo.global.mttrMinutos).toBe(0);
    expect(result.analiseDeOfensores.principaisCausas.length).toBe(0);
    expect(result.analiseDeOfensores.operadoresComMaisQuebras.length).toBe(0);
  });
});