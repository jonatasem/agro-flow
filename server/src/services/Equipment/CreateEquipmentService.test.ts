import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    equipment: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { CreateEquipmentService } = await import("./CreateEquipmentService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("CreateEquipmentService", () => {
  let createEquipmentService: InstanceType<typeof CreateEquipmentService>;

  const validPayload = {
    name: "Trator John Deere 6130J",
    fleet: "EQ-001",
    userRole: "GESTAO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createEquipmentService = new CreateEquipmentService();
  });

  it("não deve permitir a criação de equipamento se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      createEquipmentService.execute({ ...validPayload, userRole: "OPERADOR" }),
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.equipment.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.equipment.create).not.toHaveBeenCalled();
  });

  it("não deve permitir cadastrar um equipamento com frota já existente", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.equipment.findUnique).mockResolvedValue({
      id: "equipment-456",
      name: "Outro Equipamento",
      fleet: "EQ-001",
    } as any);

    await expect(createEquipmentService.execute(validPayload)).rejects.toThrow(
      "Já existe um equipamento cadastrado com essa frota.",
    );

    expect(prismaClient.equipment.findUnique).toHaveBeenCalledWith({
      where: { fleet: validPayload.fleet },
    });
    expect(prismaClient.equipment.create).not.toHaveBeenCalled();
  });

  it("deve criar um novo equipamento com sucesso", async () => {
    const mockCreatedEquipment = {
      id: "equipment-123",
      name: validPayload.name,
      fleet: validPayload.fleet,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.equipment.findUnique)
      .mockResolvedValue(null as never);
    jest
      .mocked(prismaClient.equipment.create)
      .mockResolvedValue(mockCreatedEquipment as any);

    const result = await createEquipmentService.execute(validPayload);

    expect(isManagement).toHaveBeenCalledWith(validPayload.userRole);
    expect(prismaClient.equipment.findUnique).toHaveBeenCalledWith({
      where: { fleet: validPayload.fleet },
    });
    expect(prismaClient.equipment.create).toHaveBeenCalledWith({
      data: {
        name: validPayload.name,
        fleet: validPayload.fleet,
      },
    });
    expect(result).toEqual(mockCreatedEquipment);
  });
});
