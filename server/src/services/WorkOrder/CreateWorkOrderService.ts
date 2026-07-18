import prismaClient from "../../prisma/index.js";

interface CreateWorkOrderProps {
  fleet: string;
  setor: string;
  qruDescricao: string;
  qth: string;
  city: string;
  criadoPor: string;
}

export class CreateWorkOrderService {
  async execute({
    fleet,
    setor,
    qruDescricao,
    qth,
    city,
    criadoPor,
  }: CreateWorkOrderProps) {

    // Verifica se todos os dados foram enviados
    if (!fleet || !setor || !qruDescricao || !qth || !city || !criadoPor) {
      throw new Error("Todos os campos são obrigatórios");
    }

    // Busca o equipamento pela frota
    const equipment = await prismaClient.equipment.findUnique({
      where: { fleet },
    });

    // Se nao existir, avise
    if (!equipment) {
      throw new Error("Equipamento não encontrado");
    }

    // Verifica se existe alguma os aberta com a frota do equipamento que quero criar
    const activeWorkOrder = await prismaClient.workOrder.findFirst({
      where: {
        equipmentId: equipment.id,
        status: "ABERTA",
      },
    });

    // Se existir, cadastre um novo setor dentro dessa os
    if (activeWorkOrder) {
      const newSectorService = await prismaClient.sectorService.create({
        data: {
          workOrderId: activeWorkOrder.id,
          setor,
          qruDescricao,
          qth,
          city,
          criadoPorId: criadoPor,
          status: "Aguardando Manutenção",
        },
      });

      // Retorna o setor criado
      return newSectorService;
    }

    // Cria uma nova os com o status ABERTA
    const newWorkOrder = await prismaClient.workOrder.create({
      data: {
        equipmentId: equipment.id,
        status: "ABERTA",
        setores: {
          create: {
            setor,
            qruDescricao,
            qth,
            city,
            criadoPorId: criadoPor,
            status: "Aguardando Manutenção",
          },
        },
      },
      include: {
        setores: true,
      },
    });

    // Retorna a os criada
    return newWorkOrder;
  }
}
