import prismaClient from "../../prisma/index.js";

interface UpdateCollaboratorProps {
  id: string;
  name?: string;
  registration?: string;
  city?: string;
  status?: boolean;
}

export class UpdatecollaboratorService {
  async execute({
    id,
    name,
    registration,
    city,
    status,
  }: UpdateCollaboratorProps) {

    // Verifica se passou o id corretamente
    if (!id) {
      throw new Error("O ID do funcionário é obrigatório para atualização");
    }

    // Verifica se o colaborador existe no banco de dados
    const collaboratorExists = await prismaClient.collaborator.findUnique({
      where: { id },
    });

    // Retorna um erro se nao existir
    if (!collaboratorExists) {
      throw new Error("Funcionário não encontrado.");
    }

    // Isso evita o erro de tipagem e impede o Prisma de atualizar campos inalterados
    const updateData: Record<string, any> = {};
    
    // Atualiza apenas com os campos modificados
    if (name !== undefined) updateData.name = name;
    if (registration !== undefined) updateData.registration = registration;
    if (city !== undefined) updateData.city = city;
    if (status !== undefined) updateData.status = status;

    // Atualiza no banco de dados
    const updateCollaborator = await prismaClient.collaborator.update({
      where: { id },
      data: updateData,
    });

    // Retorna os dados atualizados
    return updateCollaborator;
  }
}
