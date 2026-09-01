import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    collaborator: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { DeleteCollaboratorService } = await import("./DeleteCollaboratorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("DeleteCollaboratorService", () => {
  let deleteCollaboratorService: InstanceType<typeof DeleteCollaboratorService>;

  const validPayload = {
    id: "collaborator-123",
    userRole: "GESTAO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    deleteCollaboratorService = new DeleteCollaboratorService();
  });

  it("não deve permitir deletar se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      deleteCollaboratorService.execute(validPayload)
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para deletar colaboradores."
    );

    expect(isManagement).toHaveBeenCalledWith(validPayload.userRole);
    expect(prismaClient.collaborator.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.collaborator.delete).not.toHaveBeenCalled();
  });

  it("não deve permitir deletar um colaborador inexistente", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.collaborator.findUnique).mockResolvedValue(null as never);

    await expect(
      deleteCollaboratorService.execute(validPayload)
    ).rejects.toThrow("Funcionário não encontrado.");

    expect(prismaClient.collaborator.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.collaborator.delete).not.toHaveBeenCalled();
  });

  it("deve deletar o colaborador com sucesso", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.collaborator.findUnique).mockResolvedValue({
      id: validPayload.id,
      name: "João Silva",
    } as any);

    const result = await deleteCollaboratorService.execute(validPayload);

    expect(prismaClient.collaborator.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.collaborator.delete).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(result).toEqual({ message: "Funcionário deletado com sucesso." });
  });
});