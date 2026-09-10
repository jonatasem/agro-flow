import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    sectorService: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    servicePause: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Importações dinâmicas após o registro dos mocks
const { PauseSectorService } = await import("./PauseSectorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");

describe("PauseSectorService", () => {
  let pauseSectorService: InstanceType<typeof PauseSectorService>;

  const validPayload = {
    sectorServiceId: "service-123",
    pauseReason: "FALTA_DE_PECA" as const,
    observation: "Aguardando chegada da peça X",
    tecnicoId: "tec-123",
  };

  const mockSectorService = {
    id: "service-123",
    tecnicoResponsavelId: "tec-123",
    status: "EM_MANUTENCAO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    pauseSectorService = new PauseSectorService();
  });

  it("não deve permitir pausar se o atendimento do setor não for encontrado", async () => {
    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(null as never);

    await expect(pauseSectorService.execute(validPayload)).rejects.toThrow(
      "Atendimento do setor não encontrado.",
    );

    expect(prismaClient.sectorService.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
    });
    expect(prismaClient.$transaction).not.toHaveBeenCalled();
  });

  it("não deve permitir pausar se o técnico responsável for diferente do informado", async () => {
    jest.mocked(prismaClient.sectorService.findUnique).mockResolvedValue({
      ...mockSectorService,
      tecnicoResponsavelId: "tec-outro",
    } as any);

    await expect(pauseSectorService.execute(validPayload)).rejects.toThrow(
      "Apenas o técnico que iniciou a manutenção pode pausa-la.",
    );

    expect(prismaClient.$transaction).not.toHaveBeenCalled();
  });

  it("não deve permitir pausar se o status do atendimento não for 'EM_MANUTENCAO'", async () => {
    jest.mocked(prismaClient.sectorService.findUnique).mockResolvedValue({
      ...mockSectorService,
      status: "FINALIZADO",
    } as any);

    await expect(pauseSectorService.execute(validPayload)).rejects.toThrow(
      "Apenas atendimentos em manutenção podem ser pausados.",
    );

    expect(prismaClient.$transaction).not.toHaveBeenCalled();
  });

  it("deve pausar o atendimento com sucesso", async () => {
    const mockUpdatedService = {
      ...mockSectorService,
      status: "PAUSADO",
      motivoPausa: validPayload.observation,
    };

    const mockServicePause = {
      id: "pause-123",
      sectorServiceId: validPayload.sectorServiceId,
      reason: validPayload.pauseReason,
      description: validPayload.observation,
      pausedAt: new Date(),
    };

    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(mockSectorService as any);
    jest
      .mocked(prismaClient.$transaction)
      .mockResolvedValue([mockUpdatedService, mockServicePause] as any);

    const result = await pauseSectorService.execute(validPayload);

    expect(prismaClient.sectorService.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
    });

    expect(prismaClient.sectorService.update).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
      data: {
        status: "PAUSADO",
        motivoPausa: validPayload.observation,
      },
    });

    expect(prismaClient.servicePause.create).toHaveBeenCalledWith({
      data: {
        sectorServiceId: validPayload.sectorServiceId,
        reason: validPayload.pauseReason,
        description: validPayload.observation,
        pausedAt: expect.any(Date),
      },
    });

    expect(prismaClient.$transaction).toHaveBeenCalled();
    expect(result).toEqual(mockUpdatedService);
  });
});
