import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    operator: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { UpdateOperatorService } = await import("./UpdateOperatorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("UpdateOperatorService", () => {
  let updateOperatorService: InstanceType<typeof UpdateOperatorService>;

  const validPayload = {
    id: "operator-123",
    name: "Carlos Operador Atualizado",
    registration: "78910",
    city: "Ribeirão Preto",
    status: true,
    userRole: "GESTAO",
  };

  const existingOperator = {
    id: "operator-123",
    name: "Carlos Operador",
    registration: "12345",
    city: "Campinas",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    updateOperatorService = new UpdateOperatorService();
  });

  it("não deve permitir atualizar operador se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      updateOperatorService.execute({ ...validPayload, userRole: "OPERADOR" }),
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.operator.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.operator.update).not.toHaveBeenCalled();
  });

  it("não deve permitir atualizar um operador inexistente", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.operator.findUnique)
      .mockResolvedValue(null as never);

    await expect(updateOperatorService.execute(validPayload)).rejects.toThrow(
      "Funcionário não encontrado.",
    );

    expect(prismaClient.operator.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.operator.update).not.toHaveBeenCalled();
  });

  it("não deve permitir alterar para uma matrícula já em uso por outro funcionário", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);

    // 1ª busca (por ID) encontra o operador; 2ª busca (por matrícula) encontra outro cadastro
    jest
      .mocked(prismaClient.operator.findUnique)
      .mockResolvedValueOnce(existingOperator as any)
      .mockResolvedValueOnce({
        id: "operator-456",
        registration: "78910",
      } as any);

    await expect(updateOperatorService.execute(validPayload)).rejects.toThrow(
      "Esta matricula já está em uso por outro funcionário.",
    );

    expect(prismaClient.operator.findUnique).toHaveBeenNthCalledWith(1, {
      where: { id: validPayload.id },
    });
    expect(prismaClient.operator.findUnique).toHaveBeenNthCalledWith(2, {
      where: { registration: validPayload.registration },
    });
    expect(prismaClient.operator.update).not.toHaveBeenCalled();
  });

  it("deve atualizar o operador com sucesso", async () => {
    const updatedResult = {
      id: validPayload.id,
      name: validPayload.name,
      registration: validPayload.registration,
      city: validPayload.city,
      status: validPayload.status,
      createdAt: existingOperator.createdAt,
      updatedAt: new Date(),
    };

    jest.mocked(isManagement).mockReturnValue(true as never);
    // 1ª busca encontra o operador; 2ª confirma que a nova matrícula está livre
    jest
      .mocked(prismaClient.operator.findUnique)
      .mockResolvedValueOnce(existingOperator as any)
      .mockResolvedValueOnce(null as never);

    jest
      .mocked(prismaClient.operator.update)
      .mockResolvedValue(updatedResult as any);

    const result = await updateOperatorService.execute(validPayload);

    expect(prismaClient.operator.update).toHaveBeenCalledWith({
      where: { id: validPayload.id },
      data: {
        name: validPayload.name,
        registration: validPayload.registration,
        city: validPayload.city,
        status: validPayload.status,
      },
    });
    expect(result).toEqual(updatedResult);
  });
});
