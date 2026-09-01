import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    workOrder: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { DeleteWorkOrderService } = await import("./DeleteWorkOrderService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("DeleteWorkOrderService", () => {
  let deleteWorkOrderService: InstanceType<typeof DeleteWorkOrderService>;

  const validPayload = {
    id: "workorder-123",
    userRole: "GESTAO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    deleteWorkOrderService = new DeleteWorkOrderService();
  });

  it("não deve permitir deletar ordem de serviço se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      deleteWorkOrderService.execute({ ...validPayload, userRole: "OPERADOR" })
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores."
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.workOrder.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.workOrder.delete).not.toHaveBeenCalled();
  });

  it("não deve permitir deletar se o ID da ordem de serviço não for informado", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);

    await expect(
      deleteWorkOrderService.execute({ id: "", userRole: "GESTAO" })
    ).rejects.toThrow("O ID da ordem de serviço é obrigatório.");

    expect(prismaClient.workOrder.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.workOrder.delete).not.toHaveBeenCalled();
  });

  it("não deve permitir deletar uma ordem de serviço inexistente", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.workOrder.findUnique).mockResolvedValue(null as never);

    await expect(
      deleteWorkOrderService.execute(validPayload)
    ).rejects.toThrow("A ordem de serviço não foi encontrada.");

    expect(prismaClient.workOrder.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.workOrder.delete).not.toHaveBeenCalled();
  });

  it("deve deletar a ordem de serviço com sucesso", async () => {
    const mockDeletedWorkOrder = {
      id: validPayload.id,
      equipmentId: "equipment-123",
      status: "ABERTA",
      createdAt: new Date(),
    };

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.workOrder.findUnique).mockResolvedValue(mockDeletedWorkOrder as any);
    jest.mocked(prismaClient.workOrder.delete).mockResolvedValue(mockDeletedWorkOrder as any);

    const result = await deleteWorkOrderService.execute(validPayload);

    expect(prismaClient.workOrder.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.workOrder.delete).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(result).toEqual(mockDeletedWorkOrder);
  });
});