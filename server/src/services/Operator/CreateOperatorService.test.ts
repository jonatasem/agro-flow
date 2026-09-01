import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    operator: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { CreateOperatorService } = await import("./CreateOperatorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("CreateOperatorService", () => {
  let createOperatorService: InstanceType<typeof CreateOperatorService>;

  const validPayload = {
    name: "Carlos Operador",
    registration: "78910",
    city: "Ribeirão Preto",
    userRole: "GESTAO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createOperatorService = new CreateOperatorService();
  });

  it("não deve permitir cadastrar operador se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      createOperatorService.execute({ ...validPayload, userRole: "OPERADOR" })
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores."
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.operator.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.operator.create).not.toHaveBeenCalled();
  });

  it("não deve permitir cadastrar operador com matrícula já existente", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.operator.findUnique).mockResolvedValue({
      id: "operator-456",
      name: "Outro Operador",
      registration: "78910",
    } as any);

    await expect(
      createOperatorService.execute(validPayload)
    ).rejects.toThrow("Já existe um funcionário cadastrado com essa matrícula");

    expect(prismaClient.operator.findUnique).toHaveBeenCalledWith({
      where: { registration: validPayload.registration },
    });
    expect(prismaClient.operator.create).not.toHaveBeenCalled();
  });

  it("deve criar um novo operador com sucesso", async () => {
    const mockCreatedOperator = {
      id: "operator-123",
      name: validPayload.name,
      registration: validPayload.registration,
      city: validPayload.city,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.operator.findUnique).mockResolvedValue(null as never);
    jest.mocked(prismaClient.operator.create).mockResolvedValue(mockCreatedOperator as any);

    const result = await createOperatorService.execute(validPayload);

    expect(isManagement).toHaveBeenCalledWith(validPayload.userRole);
    expect(prismaClient.operator.findUnique).toHaveBeenCalledWith({
      where: { registration: validPayload.registration },
    });
    expect(prismaClient.operator.create).toHaveBeenCalledWith({
      data: {
        name: validPayload.name,
        registration: validPayload.registration,
        city: validPayload.city,
      },
    });
    expect(result).toEqual(mockCreatedOperator);
  });
});