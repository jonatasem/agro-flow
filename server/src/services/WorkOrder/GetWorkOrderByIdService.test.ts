import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// 1. Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    workOrder: {
      findUnique: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// 2. Importações dinâmicas após o registro dos mocks
const { GetWorkOrderByIdService } = await import("./GetWorkOrderByIdService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("GetWorkOrderByIdService", () => {
  let getWorkOrderByIdService: InstanceType<typeof GetWorkOrderByIdService>;

  const validPayload = {
    workOrderId: "workorder-123",
    userRole: "GESTAO",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    getWorkOrderByIdService = new GetWorkOrderByIdService();
  });

  it("não deve permitir buscar ordem de serviço se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      getWorkOrderByIdService.execute({ ...validPayload, userRole: "OPERADOR" })
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores."
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.workOrder.findUnique).not.toHaveBeenCalled();
  });

  it("não deve permitir buscar se o ID da ordem de serviço não for informado", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);

    await expect(
      getWorkOrderByIdService.execute({ workOrderId: "", userRole: "GESTAO" })
    ).rejects.toThrow("ID da Ordem de Serviço é obrigatório.");

    expect(prismaClient.workOrder.findUnique).not.toHaveBeenCalled();
  });

  it("não deve permitir buscar uma ordem de serviço inexistente", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.workOrder.findUnique).mockResolvedValue(null as never);

    await expect(
      getWorkOrderByIdService.execute(validPayload)
    ).rejects.toThrow("Ordem de Serviço não encontrada.");

    expect(prismaClient.workOrder.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.workOrderId },
      include: {
        equipment: true,
        setores: {
          include: {
            operator: true,
            criador: { select: { id: true, name: true, role: true } },
            tecnicoResponsavel: { select: { id: true, name: true, role: true } },
            pauses: true,
          },
        },
      },
    });
  });

  it("deve buscar a ordem de serviço por ID com sucesso trazendo todas as relações", async () => {
    const mockWorkOrder = {
      id: validPayload.workOrderId,
      equipmentId: "equipment-123",
      status: "ABERTA",
      equipment: { id: "equipment-123", name: "Trator John Deere", fleet: "EQ-001" },
      setores: [
        {
          id: "sector-1",
          setor: "Mecanica",
          operator: { id: "op-1", name: "Carlos Operador" },
          criador: { id: "user-1", name: "Gestor Silva", role: "GESTAO" },
          tecnicoResponsavel: { id: "tec-1", name: "João Técnico", role: "TECNICO" },
          pauses: [],
        },
      ],
    };

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.workOrder.findUnique).mockResolvedValue(mockWorkOrder as any);

    const result = await getWorkOrderByIdService.execute(validPayload);

    expect(prismaClient.workOrder.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.workOrderId },
      include: {
        equipment: true,
        setores: {
          include: {
            operator: true,
            criador: { select: { id: true, name: true, role: true } },
            tecnicoResponsavel: { select: { id: true, name: true, role: true } },
            pauses: true,
          },
        },
      },
    });
    expect(result).toEqual(mockWorkOrder);
  });
});