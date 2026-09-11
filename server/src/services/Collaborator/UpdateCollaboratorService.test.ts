import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    collaborator: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { UpdateCollaboratorService } =
  await import("./UpdateCollaboratorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("UpdateCollaboratorService", () => {
  let updateCollaboratorService: InstanceType<typeof UpdateCollaboratorService>;

  const validPayload = {
    id: "collaborator-123",
    name: "João da Silva Atualizado",
    registration: "654321",
    city: "Campinas",
    status: false,
    userRole: "GESTAO",
  };

  const existingCollaborator = {
    id: "collaborator-123",
    name: "João da Silva",
    role: "Analista",
    registration: "123456",
    city: "São Paulo",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    updateCollaboratorService = new UpdateCollaboratorService();
  });

  it("não deve permitir atualizar colaboradores se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      updateCollaboratorService.execute({
        ...validPayload,
        userRole: "OPERADOR",
      }),
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para atualizar colaboradores.",
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.collaborator.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.collaborator.update).not.toHaveBeenCalled();
  });

  it("não deve permitir atualizar um colaborador inexistente", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.collaborator.findUnique)
      .mockResolvedValue(null as never);

    await expect(
      updateCollaboratorService.execute(validPayload),
    ).rejects.toThrow("Funcionário não encontrado.");

    expect(prismaClient.collaborator.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.collaborator.update).not.toHaveBeenCalled();
  });

  it("não deve permitir alterar para uma matrícula já em uso por outro colaborador", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);

    // Primeira busca (por ID) encontra o colaborador; a segunda (por matrícula) encontra outro cadastro
    jest
      .mocked(prismaClient.collaborator.findUnique)
      .mockResolvedValueOnce(existingCollaborator as any)
      .mockResolvedValueOnce({
        id: "collaborator-456",
        registration: "654321",
      } as any);

    await expect(
      updateCollaboratorService.execute(validPayload),
    ).rejects.toThrow("Esta matrícula já está em uso por outro colaborador.");

    expect(prismaClient.collaborator.findUnique).toHaveBeenNthCalledWith(1, {
      where: { id: validPayload.id },
    });
    expect(prismaClient.collaborator.findUnique).toHaveBeenNthCalledWith(2, {
      where: { registration: validPayload.registration },
    });
    expect(prismaClient.collaborator.update).not.toHaveBeenCalled();
  });

  it("deve atualizar o colaborador com sucesso", async () => {
    const updatedResult = {
      id: validPayload.id,
      name: validPayload.name,
      role: existingCollaborator.role,
      registration: validPayload.registration,
      city: validPayload.city,
      status: validPayload.status,
      createdAt: existingCollaborator.createdAt,
      updatedAt: new Date(),
    };

    jest.mocked(isManagement).mockReturnValue(true as never);
    // Primeira busca encontra o colaborador; a segunda confirma que a nova matrícula está livre
    jest
      .mocked(prismaClient.collaborator.findUnique)
      .mockResolvedValueOnce(existingCollaborator as any)
      .mockResolvedValueOnce(null as never);

    jest
      .mocked(prismaClient.collaborator.update)
      .mockResolvedValue(updatedResult as any);

    const result = await updateCollaboratorService.execute(validPayload);

    expect(prismaClient.collaborator.update).toHaveBeenCalledWith({
      where: { id: validPayload.id },
      data: {
        name: validPayload.name,
        registration: validPayload.registration,
        city: validPayload.city,
        status: validPayload.status,
      },
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
    expect(result).toEqual(updatedResult);
  });
});
