import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    sectorService: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Importações dinâmicas após o registro dos mocks
const { StartSectorServiceService } = await import("./StartSectorServiceService.js");
const { default: prismaClient } = await import("../../prisma/index.js");

describe("StartSectorServiceService", () => {
  let startSectorServiceService: InstanceType<typeof StartSectorServiceService>;

  const validPayload = {
    sectorServiceId: "service-123",
    tecnicoId: "tec-123",
  };

  const mockSectorService = {
    id: "service-123",
    status: "AGUARDANDO_MANUTENCAO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    startSectorServiceService = new StartSectorServiceService();
  });

  it("não deve permitir iniciar se o serviço não for encontrado", async () => {
    jest.mocked(prismaClient.sectorService.findUnique).mockResolvedValue(null as never);

    await expect(
      startSectorServiceService.execute(validPayload)
    ).rejects.toThrow("Serviço não encontrado");

    expect(prismaClient.sectorService.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
    });
    expect(prismaClient.sectorService.update).not.toHaveBeenCalled();
  });

  it("não deve permitir iniciar se o status do serviço não for 'AGUARDANDO_MANUTENCAO'", async () => {
    jest.mocked(prismaClient.sectorService.findUnique).mockResolvedValue({
      ...mockSectorService,
      status: "EM_MANUTENCAO",
    } as any);

    await expect(
      startSectorServiceService.execute(validPayload)
    ).rejects.toThrow(
      "Este serviço não pode ser iniciado pois seu status atual é: EM_MANUTENCAO"
    );

    expect(prismaClient.sectorService.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
    });
    expect(prismaClient.sectorService.update).not.toHaveBeenCalled();
  });

  it("deve iniciar a manutenção do setor com sucesso", async () => {
    const mockUpdatedService = {
      id: validPayload.sectorServiceId,
      status: "EM_MANUTENCAO",
      tecnicoResponsavelId: validPayload.tecnicoId,
      dataInicioManutencao: new Date(),
      workOrder: { id: "order-123" },
      tecnicoResponsavel: { name: "João Técnico", role: "TECNICO" },
    };

    jest.mocked(prismaClient.sectorService.findUnique).mockResolvedValue(mockSectorService as any);
    jest.mocked(prismaClient.sectorService.update).mockResolvedValue(mockUpdatedService as any);

    const result = await startSectorServiceService.execute(validPayload);

    expect(prismaClient.sectorService.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
    });

    expect(prismaClient.sectorService.update).toHaveBeenCalledWith({
      where: { id: validPayload.sectorServiceId },
      data: {
        status: "EM_MANUTENCAO",
        tecnicoResponsavelId: validPayload.tecnicoId,
        dataInicioManutencao: expect.any(Date),
      },
      include: {
        workOrder: true,
        tecnicoResponsavel: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    expect(result).toEqual(mockUpdatedService);
  });
});