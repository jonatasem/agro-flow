import {
  jest,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    collaborator: {
      findUnique: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: jest.fn(),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
  },
}));

// Importações dinâmicas após o registro dos mocks
const { LoginCollaboratorService } =
  await import("./LoginCollaboratorService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { default: bcrypt } = await import("bcryptjs");
const { default: jwt } = await import("jsonwebtoken");

describe("LoginCollaboratorService", () => {
  let loginCollaboratorService: InstanceType<typeof LoginCollaboratorService>;
  const originalEnv = process.env;

  const validPayload = {
    registration: "123456",
    password: "senhaSegura123",
  };

  const mockCollaborator = {
    id: "collaborator-123",
    name: "João Silva",
    role: "Analista",
    sector: "TI",
    city: "São Paulo",
    registration: "123456",
    password: "hashed_password_123",
    status: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, JWT_SECRET: "secret_key_test" };
    loginCollaboratorService = new LoginCollaboratorService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("não deve permitir login de uma matrícula não cadastrada", async () => {
    jest
      .mocked(prismaClient.collaborator.findUnique)
      .mockResolvedValue(null as never);

    await expect(
      loginCollaboratorService.execute(validPayload),
    ).rejects.toThrow("Matrícula não autorizada.");

    expect(prismaClient.collaborator.findUnique).toHaveBeenCalledWith({
      where: { registration: validPayload.registration },
    });
  });

  it("não deve permitir login de colaborador inativo", async () => {
    jest.mocked(prismaClient.collaborator.findUnique).mockResolvedValue({
      ...mockCollaborator,
      status: false,
    } as any);

    await expect(
      loginCollaboratorService.execute(validPayload),
    ).rejects.toThrow("Este colaborador está desativado no sistema.");

    expect(prismaClient.collaborator.findUnique).toHaveBeenCalledWith({
      where: { registration: validPayload.registration },
    });

    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it("não deve permitir login com senha incorreta", async () => {
    jest
      .mocked(prismaClient.collaborator.findUnique)
      .mockResolvedValue(mockCollaborator as any);
    jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      loginCollaboratorService.execute(validPayload),
    ).rejects.toThrow("Senha incorreta.");

    expect(bcrypt.compare).toHaveBeenCalledWith(
      validPayload.password,
      mockCollaborator.password,
    );

    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it("não deve permitir login se a variável JWT_SECRET não estiver definida", async () => {
    delete process.env.JWT_SECRET;

    jest
      .mocked(prismaClient.collaborator.findUnique)
      .mockResolvedValue(mockCollaborator as any);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await expect(
      loginCollaboratorService.execute(validPayload),
    ).rejects.toThrow("A variável de ambiente JWT_SECRET não foi definida.");

    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it("deve realizar login com sucesso e retornar o token com os dados do colaborador", async () => {
    const mockToken = "generated_jwt_token";

    jest
      .mocked(prismaClient.collaborator.findUnique)
      .mockResolvedValue(mockCollaborator as any);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    jest.mocked(jwt.sign).mockReturnValue(mockToken as never);

    const result = await loginCollaboratorService.execute(validPayload);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      validPayload.password,
      mockCollaborator.password,
    );

    expect(jwt.sign).toHaveBeenCalledWith(
      {
        name: mockCollaborator.name,
        role: mockCollaborator.role,
        sector: mockCollaborator.sector,
      },
      "secret_key_test",
      {
        subject: mockCollaborator.id,
        expiresIn: "8h",
      },
    );

    expect(result).toEqual({
      id: mockCollaborator.id,
      name: mockCollaborator.name,
      role: mockCollaborator.role,
      sector: mockCollaborator.sector,
      city: mockCollaborator.city,
      token: mockToken,
    });
  });
});
