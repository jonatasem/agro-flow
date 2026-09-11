import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    sectorService: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    operator: {
      findUnique: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { UpdateSectorService } = await import("./UpdateSectorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("UpdateSectorService", () => {
  let updateSectorService: InstanceType<typeof UpdateSectorService>;

  const validPayload = {
    id: "sector-service-123",
    setor: "Eletrica",
    qruDescricao: "Bateria descarregada",
    qth: "Talhão 05",
    city: "Sertãozinho",
    solucaoTecnico: "Substituída bateria",
    tipoCausa: "FALHA_ELETRICA",
    status: "FINALIZADO",
    tecnicoResponsavelId: "tec-123",
    operatorId: "operator-123",
  };

  const mockExistingSector = {
    id: "sector-service-123",
    workOrderId: "workorder-123",
    setor: "Mecanica",
    status: "EM_MANUTENCAO",
  };

  const mockOperator = {
    id: "operator-123",
    name: "Carlos Operador",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    updateSectorService = new UpdateSectorService();
  });

  it("não deve permitir atualizar o setor se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      updateSectorService.execute(validPayload, "OPERADOR"),
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para atualizar ordens de serviço.",
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.sectorService.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.sectorService.update).not.toHaveBeenCalled();
  });

  it("não deve permitir atualizar se o setor da ordem de serviço não for encontrado", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(null as never);

    await expect(
      updateSectorService.execute(validPayload, "GESTAO"),
    ).rejects.toThrow("Setor da ordem de serviço não encontrado.");

    expect(prismaClient.sectorService.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.operator.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.sectorService.update).not.toHaveBeenCalled();
  });

  it("não deve permitir atualizar se o operatorId for informado mas o operador não for encontrado", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(mockExistingSector as any);
    jest
      .mocked(prismaClient.operator.findUnique)
      .mockResolvedValue(null as never);

    await expect(
      updateSectorService.execute(validPayload, "GESTAO"),
    ).rejects.toThrow("Operador não encontrado com este ID.");

    expect(prismaClient.operator.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.operatorId },
    });
    expect(prismaClient.sectorService.update).not.toHaveBeenCalled();
  });

  it("deve atualizar o setor da ordem de serviço com sucesso quando todos os dados forem passados", async () => {
    const mockUpdatedSector = {
      ...mockExistingSector,
      ...validPayload,
      operator: mockOperator,
      criador: { id: "user-1", name: "Gestor Silva", role: "GESTAO" },
      tecnicoResponsavel: {
        id: "tec-123",
        name: "João Técnico",
        role: "TECNICO",
      },
    };

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(mockExistingSector as any);
    jest
      .mocked(prismaClient.operator.findUnique)
      .mockResolvedValue(mockOperator as any);
    jest
      .mocked(prismaClient.sectorService.update)
      .mockResolvedValue(mockUpdatedSector as any);

    const result = await updateSectorService.execute(validPayload, "GESTAO");

    expect(prismaClient.sectorService.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });

    expect(prismaClient.operator.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.operatorId },
    });

    expect(prismaClient.sectorService.update).toHaveBeenCalledWith({
      where: { id: validPayload.id },
      data: {
        setor: validPayload.setor,
        qruDescricao: validPayload.qruDescricao,
        qth: validPayload.qth,
        city: validPayload.city,
        solucaoTecnico: validPayload.solucaoTecnico,
        tipoCausa: validPayload.tipoCausa,
        status: validPayload.status,
        tecnicoResponsavelId: validPayload.tecnicoResponsavelId,
        operatorId: validPayload.operatorId,
      },
      include: {
        operator: true,
        criador: { select: { id: true, name: true, role: true } },
        tecnicoResponsavel: { select: { id: true, name: true, role: true } },
      },
    });

    expect(result).toEqual(mockUpdatedSector);
  });

  it("deve atualizar apenas os campos fornecidos sem buscar o operador se operatorId não for informado", async () => {
    const partialPayload = {
      id: "sector-service-123",
      solucaoTecnico: "Ajuste de cabo solto",
      status: "FINALIZADO",
    };

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(mockExistingSector as any);
    jest
      .mocked(prismaClient.sectorService.update)
      .mockResolvedValue({ ...mockExistingSector, ...partialPayload } as any);

    await updateSectorService.execute(partialPayload, "GESTAO");

    expect(prismaClient.operator.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.sectorService.update).toHaveBeenCalledWith({
      where: { id: partialPayload.id },
      data: {
        solucaoTecnico: partialPayload.solucaoTecnico,
        status: partialPayload.status,
      },
      include: {
        operator: true,
        criador: { select: { id: true, name: true, role: true } },
        tecnicoResponsavel: { select: { id: true, name: true, role: true } },
      },
    });
  });
});