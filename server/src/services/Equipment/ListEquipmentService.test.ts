import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    equipment: {
      findMany: jest.fn(),
    },
  },
}));

// Importações dinâmicas após o registro dos mocks
const { ListEquipmentService } = await import("./ListEquipmentService.js");
const { default: prismaClient } = await import("../../prisma/index.js");

describe("ListEquipmentService", () => {
  let listEquipmentService: InstanceType<typeof ListEquipmentService>;

  beforeEach(() => {
    jest.clearAllMocks();
    listEquipmentService = new ListEquipmentService();
  });

  it("deve listar todos os equipamentos com sucesso", async () => {
    const mockEquipments = [
      {
        id: "equipment-1",
        name: "Trator John Deere 6130J",
        fleet: "EQ-001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "equipment-2",
        name: "Colhedora Case IH A8810",
        fleet: "EQ-002",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    jest.mocked(prismaClient.equipment.findMany).mockResolvedValue(mockEquipments as any);

    const result = await listEquipmentService.execute();

    expect(prismaClient.equipment.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockEquipments);
  });
});