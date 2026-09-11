import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    equipment: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// Importações dinâmicas após o registro dos mocks
const { DeleteEquipmentService } = await import("./DeleteEquipmentService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("DeleteEquipmentService", () => {
  let deleteEquipmentService: InstanceType<typeof DeleteEquipmentService>;

  const validPayload = {
    id: "equipment-123",
    userRole: "GESTAO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    deleteEquipmentService = new DeleteEquipmentService();
  });

  it("não deve permitir deletar se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      deleteEquipmentService.execute({ ...validPayload, userRole: "OPERADOR" }),
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores.",
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.equipment.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.equipment.delete).not.toHaveBeenCalled();
  });

  it("não deve permitir deletar um equipamento inexistente", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest
      .mocked(prismaClient.equipment.findUnique)
      .mockResolvedValue(null as never);

    await expect(deleteEquipmentService.execute(validPayload)).rejects.toThrow(
      "Equipamento não encontrado",
    );

    expect(prismaClient.equipment.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.equipment.delete).not.toHaveBeenCalled();
  });

  it("deve deletar o equipamento com sucesso", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.equipment.findUnique).mockResolvedValue({
      id: validPayload.id,
      name: "Trator John Deere 6130J",
      fleet: "EQ-001",
    } as any);

    const result = await deleteEquipmentService.execute(validPayload);

    expect(prismaClient.equipment.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(prismaClient.equipment.delete).toHaveBeenCalledWith({
      where: { id: validPayload.id },
    });
    expect(result).toEqual({ message: "Equipamento deletado com sucesso." });
  });
});
