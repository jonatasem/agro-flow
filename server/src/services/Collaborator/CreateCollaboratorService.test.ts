import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Define os mocks antes de carregar os módulos
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    collaborator: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("bcryptjs", () => ({
  hash: jest.fn(),
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importa os módulos dinamicamente após o registro dos mocks
const { CreateCollaboratorService } = await import("./CreateCollaboratorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { hash } = await import("bcryptjs");
const { isManagement } = await import("../../config/roles.js");

describe("CreateCollaboratorService", () => {
  let createCollaboratorService: InstanceType<typeof CreateCollaboratorService>;

  const validPayload = {
    name: "João Silva",
    role: "Analista",
    sector: "TI",
    registration: "123456",
    password: "senhaSegura123",
    city: "São Paulo",
    userRole: "GESTAO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createCollaboratorService = new CreateCollaboratorService();
  });

  it("não deve permitir a criação de colaborador se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      createCollaboratorService.execute(validPayload)
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores."
    );

    expect(isManagement).toHaveBeenCalledWith(validPayload.userRole);
    expect(prismaClient.collaborator.findUnique).not.toHaveBeenCalled();
  });

  it("não deve permitir cadastrar um colaborador com matrícula já existente", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.collaborator.findUnique).mockResolvedValue({
      id: "1",
      registration: "123456",
      name: "Outro Colaborador",
    } as any);

    await expect(
      createCollaboratorService.execute(validPayload)
    ).rejects.toThrow("Esta matrícula já está cadastrada no sistema.");

    expect(prismaClient.collaborator.findUnique).toHaveBeenCalledWith({
      where: { registration: validPayload.registration },
    });
    expect(prismaClient.collaborator.create).not.toHaveBeenCalled();
  });

  it("deve criar um novo colaborador com sucesso e omitir a senha no retorno", async () => {
    const hashedPassword = "hashed_password_123";

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.collaborator.findUnique).mockResolvedValue(null as never);
    jest.mocked(hash).mockResolvedValue(hashedPassword as never);

    const mockCreatedCollaborator = {
      id: "collaborator-id-1",
      name: validPayload.name,
      role: validPayload.role,
      sector: validPayload.sector,
      registration: validPayload.registration,
      password: hashedPassword,
      city: validPayload.city,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.mocked(prismaClient.collaborator.create).mockResolvedValue(mockCreatedCollaborator as any);

    const result = await createCollaboratorService.execute(validPayload);

    expect(hash).toHaveBeenCalledWith(validPayload.password, 8);
    expect(prismaClient.collaborator.create).toHaveBeenCalledWith({
      data: {
        name: validPayload.name,
        role: validPayload.role,
        sector: validPayload.sector,
        registration: validPayload.registration,
        password: hashedPassword,
        city: validPayload.city,
        status: true,
      },
    });

    expect(result).not.toHaveProperty("password");
    expect(result).toEqual({
      id: "collaborator-id-1",
      name: validPayload.name,
      role: validPayload.role,
      sector: validPayload.sector,
      registration: validPayload.registration,
      city: validPayload.city,
      status: true,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});