import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    sectorService: {
      findUnique: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    workOrder: {
      delete: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { DeleteSectorService } = await import("./DeleteSectorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("DeleteSectorService", () => {
  let deleteSectorService: InstanceType<typeof DeleteSectorService>;

  beforeEach(() => {
    jest.clearAllMocks();
    deleteSectorService = new DeleteSectorService();
  });

  it("não deve permitir excluir o setor se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      deleteSectorService.execute({ id: "sec-123", userRole: "OPERADOR" }),
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para excluir setores da ordem de serviço.",
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.sectorService.findUnique).not.toHaveBeenCalled();
  });

  it("não deve permitir excluir se o setor não for encontrado", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(null as never);

    await expect(
      deleteSectorService.execute({ id: "sec-123", userRole: "GESTAO" }),
    ).rejects.toThrow("Setor da ordem de serviço não encontrado.");

    expect(prismaClient.sectorService.findUnique).toHaveBeenCalledWith({
      where: { id: "sec-123" },
      select: { id: true, workOrderId: true },
    });
    expect(prismaClient.sectorService.count).not.toHaveBeenCalled();
  });

  it("deve excluir a Ordem de Serviço inteira se for o único setor vinculado", async () => {
    const mockSector = { id: "sec-123", workOrderId: "wo-999" };

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(mockSector as never);
    jest.mocked(prismaClient.sectorService.count).mockResolvedValue(1 as never);
    jest.mocked(prismaClient.workOrder.delete).mockResolvedValue({} as never);

    const result = await deleteSectorService.execute({
      id: "sec-123",
      userRole: "GESTAO",
    });

    expect(prismaClient.sectorService.count).toHaveBeenCalledWith({
      where: { workOrderId: "wo-999" },
    });
    expect(prismaClient.workOrder.delete).toHaveBeenCalledWith({
      where: { id: "wo-999" },
    });
    expect(prismaClient.sectorService.delete).not.toHaveBeenCalled();
    expect(result.deletedWorkOrder).toBe(true);
  });

  it("deve excluir apenas o setor se houver outros setores na mesma Ordem de Serviço", async () => {
    const mockSector = { id: "sec-123", workOrderId: "wo-999" };
    const mockDeletedSector = { id: "sec-123", setor: "Mecânica" };

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.sectorService.findUnique)
      .mockResolvedValue(mockSector as never);
    jest.mocked(prismaClient.sectorService.count).mockResolvedValue(2 as never);
    jest
      .mocked(prismaClient.sectorService.delete)
      .mockResolvedValue(mockDeletedSector as never);

    const result = await deleteSectorService.execute({
      id: "sec-123",
      userRole: "GESTAO",
    });

    expect(prismaClient.sectorService.count).toHaveBeenCalledWith({
      where: { workOrderId: "wo-999" },
    });
    expect(prismaClient.sectorService.delete).toHaveBeenCalledWith({
      where: { id: "sec-123" },
    });
    expect(prismaClient.workOrder.delete).not.toHaveBeenCalled();
    expect(result.deletedWorkOrder).toBe(false);
  });
});