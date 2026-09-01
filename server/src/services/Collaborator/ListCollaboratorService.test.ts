import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    collaborator: {
      findMany: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { ListCollaboratorService } = await import("./ListCollaboratorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("ListCollaboratorService", () => {
  let listCollaboratorService: InstanceType<typeof ListCollaboratorService>;

  const validPayload = {
    userRole: "GESTAO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    listCollaboratorService = new ListCollaboratorService();
  });

  it("não deve permitir listar colaboradores se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      listCollaboratorService.execute({ userRole: "OPERADOR" })
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para listar os colaboradores."
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.collaborator.findMany).not.toHaveBeenCalled();
  });

  it("deve listar os colaboradores com sucesso", async () => {
    const mockCollaborators = [
      {
        id: "collaborator-1",
        name: "João Silva",
        role: "Analista",
        registration: "123456",
        city: "São Paulo",
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "collaborator-2",
        name: "Maria Oliveira",
        role: "Gerente",
        registration: "654321",
        city: "Campinas",
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.collaborator.findMany).mockResolvedValue(mockCollaborators as any);

    const result = await listCollaboratorService.execute(validPayload);

    expect(isManagement).toHaveBeenCalledWith(validPayload.userRole);
    expect(prismaClient.collaborator.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        role: true,
        registration: true,
        city: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(result).toEqual(mockCollaborators);
  });
});