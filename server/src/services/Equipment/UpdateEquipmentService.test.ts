import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    equipment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { UpdateEquipmentService } = await import("./UpdateEquipmentService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("UpdateEquipmentService", () => {
  let updateEquipmentService: InstanceType<typeof UpdateEquipmentService>;

  const validPayload = {
    id: "equipment-123",
    name: "Trator John Deere 6130J Atualizado",
    fleet: "EQ-002",
    userRole: "GESTAO",
  };

  const existingEquipment = {
    id: "equipment-123",
    name: "Trator John Deere 6130J",
    fleet: "EQ-001",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    updateEquipmentService = new UpdateEquipmentService();
  });

  it("não deve permitir atualizar equipamento se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      updateEquipmentService.execute({ ...validPayload, userRole: "OPERADOR" }),
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.equipment.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.equipment.update).not.toHaveBeenCalled();
  });

  it("não deve permitir atualizar um equipamento inexistente", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.equipment.findUnique)
      .mockResolvedValue(null as never);

    await expect(updateEquipmentService.execute(validPayload)).rejects.toThrow(
      "Equipamento não encontrado.",
    );

    expect(prismaClient.equipment.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.equipment.update).not.toHaveBeenCalled();
  });

  it("não deve permitir alterar para uma frota já em uso por outro equipamento", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);

    // 1ª busca (por ID) encontra o equipamento; 2ª busca (por frota) encontra outro cadastro
    jest
      .mocked(prismaClient.equipment.findUnique)
      .mockResolvedValueOnce(existingEquipment as any)
      .mockResolvedValueOnce({ id: "equipment-456", fleet: "EQ-002" } as any);

    await expect(updateEquipmentService.execute(validPayload)).rejects.toThrow(
      "Esta frota já está em uso por outro equipamento.",
    );

    expect(prismaClient.equipment.findUnique).toHaveBeenNthCalledWith(1, {
      where: { id: validPayload.id },
    });
    expect(prismaClient.equipment.findUnique).toHaveBeenNthCalledWith(2, {
      where: { fleet: validPayload.fleet },
    });
    expect(prismaClient.equipment.update).not.toHaveBeenCalled();
  });

  it("deve atualizar o equipamento com sucesso", async () => {
    const updatedResult = {
      id: validPayload.id,
      name: validPayload.name,
      fleet: validPayload.fleet,
      createdAt: existingEquipment.createdAt,
      updatedAt: new Date(),
    };

    jest.mocked(isManagement).mockReturnValue(true as never);
    // 1ª busca encontra o equipamento; 2ª confirma que a nova frota está livre
    jest
      .mocked(prismaClient.equipment.findUnique)
      .mockResolvedValueOnce(existingEquipment as any)
      .mockResolvedValueOnce(null as never);

    jest
      .mocked(prismaClient.equipment.update)
      .mockResolvedValue(updatedResult as any);

    const result = await updateEquipmentService.execute(validPayload);

    expect(prismaClient.equipment.update).toHaveBeenCalledWith({
      where: { id: validPayload.id },
      data: {
        name: validPayload.name,
        fleet: validPayload.fleet,
      },
    });
    expect(result).toEqual(updatedResult);
  });
});
