import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// 1. Configuração dos mocks ESM
jest.unstable_mockModule("../../prisma/index.js", () => ({
  default: {
    collaborator: {
      findUnique: jest.fn(),
    },
    equipment: {
      findUnique: jest.fn(),
    },
    operator: {
      findUnique: jest.fn(),
    },
    workOrder: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    sectorService: {
      create: jest.fn(),
    },
  },
}));

jest.unstable_mockModule("../../config/roles.js", () => ({
  isManagement: jest.fn(),
}));

// 2. Importações dinâmicas após o registro dos mocks
const { CreateWorkOrderService } = await import("./CreateWorkOrderService.js");
const { default: prismaClient } = await import("../../prisma/index.js");
const { isManagement } = await import("../../config/roles.js");

describe("CreateWorkOrderService", () => {
  let createWorkOrderService: InstanceType<typeof CreateWorkOrderService>;

  const validPayload = {
    fleet: "EQ-001",
    operatorId: "operator-123",
    setor: "Mecanica",
    qruDescricao: "Vazamento de óleo no motor",
    qth: "Talhão 12",
    city: "Ribeirão Preto",
    criadoPor: "collaborator-123",
    userRole: "GESTAO",
  };

  const mockCollaborator = {
    id: "collaborator-123",
    name: "Gestor Silva",
  };

  const mockEquipment = {
    id: "equipment-123",
    fleet: "EQ-001",
    name: "Trator John Deere",
  };

  const mockOperator = {
    id: "operator-123",
    name: "Carlos Operador",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createWorkOrderService = new CreateWorkOrderService();
  });

  it("não deve permitir criar O.S. se o usuário não for da Gestão/COA", async () => {
    jest.mocked(isManagement).mockReturnValue(false as never);

    await expect(
      createWorkOrderService.execute({ ...validPayload, userRole: "OPERADOR" })
    ).rejects.toThrow(
      "Acesso negado. Apenas colaboradores da Gestão e COA têm permissão para cadastrar novos colaboradores."
    );

    expect(isManagement).toHaveBeenCalledWith("OPERADOR");
    expect(prismaClient.collaborator.findUnique).not.toHaveBeenCalled();
    expect(prismaClient.workOrder.create).not.toHaveBeenCalled();
  });

  it("não deve permitir criar O.S. se o colaborador criador não for encontrado", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.collaborator.findUnique).mockResolvedValue(null as never);

    await expect(
      createWorkOrderService.execute(validPayload)
    ).rejects.toThrow("Usuário criador não encontrado.");

    expect(prismaClient.collaborator.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.criadoPor },
    });
    expect(prismaClient.equipment.findUnique).not.toHaveBeenCalled();
  });

  it("não deve permitir criar O.S. se o equipamento não for encontrado", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.collaborator.findUnique).mockResolvedValue(mockCollaborator as any);
    jest.mocked(prismaClient.equipment.findUnique).mockResolvedValue(null as never);

    await expect(
      createWorkOrderService.execute(validPayload)
    ).rejects.toThrow("Equipamento não encontrado.");

    expect(prismaClient.equipment.findUnique).toHaveBeenCalledWith({
      where: { fleet: validPayload.fleet },
    });
    expect(prismaClient.operator.findUnique).not.toHaveBeenCalled();
  });

  it("não deve permitir criar O.S. se o operador não for encontrado", async () => {
    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.collaborator.findUnique).mockResolvedValue(mockCollaborator as any);
    jest.mocked(prismaClient.equipment.findUnique).mockResolvedValue(mockEquipment as any);
    jest.mocked(prismaClient.operator.findUnique).mockResolvedValue(null as never);

    await expect(
      createWorkOrderService.execute(validPayload)
    ).rejects.toThrow("Operador não encontrado no banco de dados.");

    expect(prismaClient.operator.findUnique).toHaveBeenCalledWith({
      where: { id: validPayload.operatorId },
    });
    expect(prismaClient.workOrder.findFirst).not.toHaveBeenCalled();
  });

  it("deve adicionar novo serviço do setor a uma O.S. ativa existente", async () => {
    const activeWorkOrder = {
      id: "workorder-active-123",
      equipmentId: mockEquipment.id,
      status: "ABERTA",
    };

    const mockUpdatedWorkOrder = {
      ...activeWorkOrder,
      equipment: mockEquipment,
      setores: [
        {
          id: "sector-service-1",
          setor: validPayload.setor,
          operator: mockOperator,
        },
      ],
    };

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.collaborator.findUnique).mockResolvedValue(mockCollaborator as any);
    jest.mocked(prismaClient.equipment.findUnique).mockResolvedValue(mockEquipment as any);
    jest.mocked(prismaClient.operator.findUnique).mockResolvedValue(mockOperator as any);
    jest.mocked(prismaClient.workOrder.findFirst).mockResolvedValue(activeWorkOrder as any);
    jest.mocked(prismaClient.workOrder.findUnique).mockResolvedValue(mockUpdatedWorkOrder as any);

    const result = await createWorkOrderService.execute(validPayload);

    expect(prismaClient.sectorService.create).toHaveBeenCalledWith({
      data: {
        workOrderId: activeWorkOrder.id,
        operatorId: mockOperator.id,
        setor: validPayload.setor,
        qruDescricao: validPayload.qruDescricao,
        qth: validPayload.qth,
        city: validPayload.city,
        criadoPorId: validPayload.criadoPor,
        status: "AGUARDANDO_MANUTENCAO",
      },
    });

    expect(prismaClient.workOrder.findUnique).toHaveBeenCalledWith({
      where: { id: activeWorkOrder.id },
      include: {
        equipment: true,
        setores: {
          include: {
            operator: true,
            criador: {
              select: { id: true, name: true, role: true },
            },
            tecnicoResponsavel: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    expect(prismaClient.workOrder.create).not.toHaveBeenCalled();
    expect(result).toEqual(mockUpdatedWorkOrder);
  });

  it("deve criar uma nova O.S. com serviço de setor quando não houver O.S. ativa", async () => {
    const mockCreatedWorkOrder = {
      id: "workorder-new-123",
      equipmentId: mockEquipment.id,
      status: "ABERTA",
      equipment: mockEquipment,
      setores: [
        {
          id: "sector-service-1",
          setor: validPayload.setor,
          operator: mockOperator,
        },
      ],
    };

    jest.mocked(isManagement).mockReturnValue(true as never);
    jest.mocked(prismaClient.collaborator.findUnique).mockResolvedValue(mockCollaborator as any);
    jest.mocked(prismaClient.equipment.findUnique).mockResolvedValue(mockEquipment as any);
    jest.mocked(prismaClient.operator.findUnique).mockResolvedValue(mockOperator as any);
    jest.mocked(prismaClient.workOrder.findFirst).mockResolvedValue(null as never);
    jest.mocked(prismaClient.workOrder.create).mockResolvedValue(mockCreatedWorkOrder as any);

    const result = await createWorkOrderService.execute(validPayload);

    expect(prismaClient.workOrder.create).toHaveBeenCalledWith({
      data: {
        equipmentId: mockEquipment.id,
        status: "ABERTA",
        setores: {
          create: {
            operatorId: mockOperator.id,
            setor: validPayload.setor,
            qruDescricao: validPayload.qruDescricao,
            qth: validPayload.qth,
            city: validPayload.city,
            criadoPorId: validPayload.criadoPor,
            status: "AGUARDANDO_MANUTENCAO",
          },
        },
      },
      include: {
        equipment: true,
        setores: {
          include: {
            operator: true,
            criador: {
              select: { id: true, name: true, role: true },
            },
            tecnicoResponsavel: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    expect(prismaClient.sectorService.create).not.toHaveBeenCalled();
    expect(result).toEqual(mockCreatedWorkOrder);
  });
});