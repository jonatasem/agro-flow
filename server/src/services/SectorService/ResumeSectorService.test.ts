import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    sectorService: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    servicePause: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Importações dinâmicas após o registro dos mocks
const { ResumeSectorService } = await import("./ResumeSectorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");

describe("ResumeSectorService", () => {
  let resumeSectorService: InstanceType<typeof ResumeSectorService>;

  const validPayload = {
    sectorServiceId: "service-123",
  };

  const mockSectorService = {
    id: "service-123",
    status: "PAUSADO",
  };

  const mockPause = {
    id: "pause-123",
    sectorServiceId: "service-123",
    pausedAt: new Date("2026-08-01T10:00:00Z"),
    resumedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    resumeSectorService = new ResumeSectorService();
  });

  it("não deve permitir retomar se o serviço não for encontrado", async () => {
    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(null as never);

    await expect(resumeSectorService.execute(validPayload)).rejects.toThrow(
      "Serviço não encontrado.",
    );

    expect(prismaClient.sectorService.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
    });
    expect(prismaClient.servicePause.findFirst).not.toHaveBeenCalled();
    expect(prismaClient.sectorService.update).not.toHaveBeenCalled();
  });

  it("não deve permitir retomar se o serviço não estiver com status PAUSADO", async () => {
    jest.mocked(prismaClient.sectorService.findUnique).mockResolvedValue({
      ...mockSectorService,
      status: "EM_MANUTENCAO",
    } as any);

    await expect(resumeSectorService.execute(validPayload)).rejects.toThrow(
      "Este serviço não está pausado. Status atual: EM_MANUTENCAO",
    );

    expect(prismaClient.servicePause.findFirst).not.toHaveBeenCalled();
    expect(prismaClient.sectorService.update).not.toHaveBeenCalled();
  });

  it("deve retomar o serviço e atualizar a data de retorno da pausa quando houver pausa em aberto", async () => {
    const mockUpdatedService = {
      ...mockSectorService,
      status: "EM_MANUTENCAO",
    };

    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(mockSectorService as any);
    jest
      .mocked(prismaClient.servicePause.findFirst)
      .mockResolvedValue(mockPause as any);
    jest
      .mocked(prismaClient.sectorService.update)
      .mockResolvedValue(mockUpdatedService as any);

    const result = await resumeSectorService.execute(validPayload);

    expect(prismaClient.servicePause.findFirst).toHaveBeenCalledWith({
      where: { sectorServiceId: validPayload.sectorServiceId },
      orderBy: { pausedAt: "desc" },
    });

    expect(prismaClient.servicePause.update).toHaveBeenCalledWith({
      where: { id: mockPause.id },
      data: { resumedAt: expect.any(Date) },
    });

    expect(prismaClient.sectorService.update).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
      data: { status: "EM_MANUTENCAO" },
    });

    expect(result).toEqual(mockUpdatedService);
  });

  it("deve retomar o serviço sem atualizar pausa se não houver pausa pendente ou se já tiver horário de retorno", async () => {
    const mockUpdatedService = {
      ...mockSectorService,
      status: "EM_MANUTENCAO",
    };

    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(mockSectorService as any);
    jest.mocked(prismaClient.servicePause.findFirst).mockResolvedValue({
      ...mockPause,
      resumedAt: new Date("2026-08-01T11:00:00Z"),
    } as any);
    jest
      .mocked(prismaClient.sectorService.update)
      .mockResolvedValue(mockUpdatedService as any);

    const result = await resumeSectorService.execute(validPayload);

    expect(prismaClient.servicePause.update).not.toHaveBeenCalled();
    expect(prismaClient.sectorService.update).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
      data: { status: "EM_MANUTENCAO" },
    });
    expect(result).toEqual(mockUpdatedService);
  });
});
