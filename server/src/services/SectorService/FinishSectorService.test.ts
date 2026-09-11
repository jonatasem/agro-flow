import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    sectorService: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    workOrder: {
      update: jest.fn(),
    },
  },
}));

// Importações dinâmicas após o registro dos mocks
const { FinishSectorServiceService } =
  await import("./FinishSectorServiceService.js");
const { default: prismaClient } = await import("../../prisma/index.js");

describe("FinishSectorServiceService", () => {
  let finishSectorServiceService: InstanceType<
    typeof FinishSectorServiceService
  >;

  const validPayload = {
    sectorServiceId: "service-123",
    solucaoTecnico: "Trocado componente danificado",
    tipoCausa: "DESGASTE_NATURAL",
    tecnicoId: "tec-123",
  };

  const mockSectorService = {
    id: "service-123",
    workOrderId: "order-123",
    status: "EM_MANUTENCAO",
    tecnicoResponsavelId: "tec-123",
    dataInicioManutencao: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
    pauses: [
      {
        pausedAt: new Date(Date.now() - 40 * 60 * 1000),
        resumedAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutos de pausa
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    finishSectorServiceService = new FinishSectorServiceService();
  });

  it("não deve permitir finalizar se o serviço não for encontrado", async () => {
    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(null as never);

    await expect(
      finishSectorServiceService.execute(validPayload),
    ).rejects.toThrow("Serviço não encontrado.");

    expect(prismaClient.sectorService.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
      include: { pauses: true },
    });
    expect(prismaClient.sectorService.update).not.toHaveBeenCalled();
  });

  it("não deve permitir finalizar se o status do serviço não for 'EM_MANUTENCAO'", async () => {
    jest.mocked(prismaClient.sectorService.findUnique).mockResolvedValue({
      ...mockSectorService,
      status: "ABERTO",
    } as any);

    await expect(
      finishSectorServiceService.execute(validPayload),
    ).rejects.toThrow("Este serviço não está em manutenção.");

    expect(prismaClient.sectorService.update).not.toHaveBeenCalled();
  });

  it("não deve permitir finalizar se o técnico responsável for diferente do que iniciou", async () => {
    jest.mocked(prismaClient.sectorService.findUnique).mockResolvedValue({
      ...mockSectorService,
      tecnicoResponsavelId: "tec-outro",
    } as any);

    await expect(
      finishSectorServiceService.execute(validPayload),
    ).rejects.toThrow(
      "Apenas o técnico que iniciou a manutenção pode finalizá-la.",
    );

    expect(prismaClient.sectorService.update).not.toHaveBeenCalled();
  });

  it("não deve permitir finalizar se não houver data de início da manutenção", async () => {
    jest.mocked(prismaClient.sectorService.findUnique).mockResolvedValue({
      ...mockSectorService,
      dataInicioManutencao: null,
    } as any);

    await expect(
      finishSectorServiceService.execute(validPayload),
    ).rejects.toThrow("Dados do início da manutenção ausente.");

    expect(prismaClient.sectorService.update).not.toHaveBeenCalled();
  });

  it("deve finalizar o serviço com sucesso sem finalizar a O.S. global se houverem outros serviços pendentes", async () => {
    const mockUpdatedService = {
      ...mockSectorService,
      status: "FINALIZADO",
      solucaoTecnico: validPayload.solucaoTecnico,
      tipoCausa: validPayload.tipoCausa,
      tempoManutencao: 40,
    };

    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(mockSectorService as any);
    jest
      .mocked(prismaClient.sectorService.update)
      .mockResolvedValue(mockUpdatedService as any);

    // 1ª contagem: total de serviços = 2
    // 2ª contagem: serviços finalizados = 1 (ainda resta 1 pendente)
    jest
      .mocked(prismaClient.sectorService.count)
      .mockResolvedValueOnce(2 as never)
      .mockResolvedValueOnce(1 as never);

    const result = await finishSectorServiceService.execute(validPayload);

    expect(prismaClient.sectorService.update).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
      data: {
        status: "FINALIZADO",
        solucaoTecnico: validPayload.solucaoTecnico,
        tipoCausa: validPayload.tipoCausa,
        dataFimManutencao: expect.any(Date),
        tempoManutencao: expect.any(Number),
      },
      include: { pauses: true },
    });

    expect(prismaClient.workOrder.update).not.toHaveBeenCalled();
    expect(result).toEqual(mockUpdatedService);
  });

  it("deve finalizar o serviço e também a O.S. global quando todos os serviços da ordem forem finalizados", async () => {
    const mockUpdatedService = {
      ...mockSectorService,
      status: "FINALIZADO",
      solucaoTecnico: validPayload.solucaoTecnico,
      tipoCausa: validPayload.tipoCausa,
      tempoManutencao: 40,
    };

    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(mockSectorService as any);
    jest
      .mocked(prismaClient.sectorService.update)
      .mockResolvedValue(mockUpdatedService as any);

    // 1ª contagem: total de serviços = 2
    // 2ª contagem: serviços finalizados = 2 (todos finalizados)
    jest
      .mocked(prismaClient.sectorService.count)
      .mockResolvedValueOnce(2 as never)
      .mockResolvedValueOnce(2 as never);

    const result = await finishSectorServiceService.execute(validPayload);

    expect(prismaClient.workOrder.update).toHaveBeenCalledWith({
      where: { id: mockSectorService.workOrderId },
      data: { status: "FINALIZADA" },
    });

    expect(result).toEqual(mockUpdatedService);
  });
});
