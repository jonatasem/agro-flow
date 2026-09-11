import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração do mock ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    collaborator: {
      findUnique: jest.fn(),
    },
  },
}));

// Importações dinâmicas após o registro do mock
const { CheckRegistrationService } =
  await import("./CheckRegistrationService.js");
const { default: prismaClient } = await import("../../prisma/index.js");

describe("CheckRegistrationService", () => {
  let checkRegistrationService: InstanceType<typeof CheckRegistrationService>;

  const validPayload = {
    registration: "123456",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    checkRegistrationService = new CheckRegistrationService();
  });

  it("não deve permitir verificação se a matrícula não for encontrada", async () => {
    jest
      .mocked(prismaClient.collaborator.findUnique)
      .mockResolvedValue(null as never);

    await expect(
      checkRegistrationService.execute(validPayload),
    ).rejects.toThrow("Matrícula não encontrada.");

    expect(prismaClient.collaborator.findUnique).toHaveBeenCalledWith({
      where: { registration: validPayload.registration },
      select: {
        name: true,
        status: true,
      },
    });
  });

  it("não deve permitir verificação se o cadastro estiver inativo", async () => {
    jest.mocked(prismaClient.collaborator.findUnique).mockResolvedValue({
      name: "João Silva",
      status: false,
    } as any);

    await expect(
      checkRegistrationService.execute(validPayload),
    ).rejects.toThrow("Este cadastro está inativo. Contate o administrador.");

    expect(prismaClient.collaborator.findUnique).toHaveBeenCalledWith({
      where: { registration: validPayload.registration },
      select: {
        name: true,
        status: true,
      },
    });
  });

  it("deve retornar o nome do colaborador quando a matrícula for ativa", async () => {
    const mockCollaborator = {
      name: "João Silva",
      status: true,
    };

    jest
      .mocked(prismaClient.collaborator.findUnique)
      .mockResolvedValue(mockCollaborator as any);

    const result = await checkRegistrationService.execute(validPayload);

    expect(prismaClient.collaborator.findUnique).toHaveBeenCalledWith({
      where: { registration: validPayload.registration },
      select: {
        name: true,
        status: true,
      },
    });
    expect(result).toEqual({ name: mockCollaborator.name });
  });
});
