import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    operator: {
      findMany: jest.fn(),
    },
  },
}));

// Importações dinâmicas após o registro dos mocks
const { ListOperatorService } = await import("./ListOperatorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");

describe("ListOperatorService", () => {
  let listOperatorService: InstanceType<typeof ListOperatorService>;

  beforeEach(() => {
    jest.clearAllMocks();
    listOperatorService = new ListOperatorService();
  });

  it("deve listar todos os operadores com sucesso", async () => {
    const mockOperators = [
      {
        id: "operator-1",
        name: "Carlos Operador",
        registration: "78910",
        city: "Ribeirão Preto",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "operator-2",
        name: "Ana Operadora",
        registration: "111213",
        city: "Sertãozinho",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    jest.mocked(prismaClient.operator.findMany).mockResolvedValue(mockOperators as any);

    const result = await listOperatorService.execute();

    expect(prismaClient.operator.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockOperators);
  });
});