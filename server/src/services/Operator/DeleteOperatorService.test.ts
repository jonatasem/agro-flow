import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    operator: {
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { DeleteOperatorService } = await import("./DeleteOperatorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("DeleteOperatorService", () => {
  let deleteOperatorService: InstanceType<typeof DeleteOperatorService>;

  const validPayload = {
    id: "operator-123",
    userRole: "GESTAO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    deleteOperatorService = new DeleteOperatorService();
  });

  it("não deve permitir deletar operador se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      deleteOperatorService.execute({ ...validPayload, userRole: "OPERADOR" })
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores."
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.operator.findFirst).not.toHaveBeenCalled();
    expect(prismaClient.operator.delete).not.toHaveBeenCalled();
  });

  it("não deve permitir deletar se o id do funcionário não for informado", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);

    await expect(
      deleteOperatorService.execute({ id: "", userRole: "GESTAO" })
    ).rejects.toThrow("Id do funcionario não encontrado.");

    expect(prismaClient.operator.findFirst).not.toHaveBeenCalled();
    expect(prismaClient.operator.delete).not.toHaveBeenCalled();
  });

  it("não deve permitir deletar um operador inexistente", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.operator.findFirst).mockResolvedValue(null as never);

    await expect(
      deleteOperatorService.execute(validPayload)
    ).rejects.toThrow("Funcionário não encontrado");

    expect(prismaClient.operator.findFirst).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.operator.delete).not.toHaveBeenCalled();
  });

  it("deve deletar o operador com sucesso", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.operator.findFirst).mockResolvedValue({
      id: validPayload.id,
      name: "Carlos Operador",
      registration: "78910",
    } as any);

    const result = await deleteOperatorService.execute(validPayload);

    expect(prismaClient.operator.findFirst).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.operator.delete).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(result).toEqual({ message: "Funcionário deletado com sucesso." });
  });
});