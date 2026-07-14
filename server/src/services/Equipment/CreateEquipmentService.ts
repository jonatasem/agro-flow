import prismaClient from "../../prisma/index.js";

interface CreateEquipmentProps {
    name: string;
    fleet: string;
}

export class CreateEquipmentService {
    async execute({name, fleet}: CreateEquipmentProps) {

        if(!name || !fleet ) {
            throw new Error("Todos os campos são obrigatórios");
        }

        const equipment = await prismaClient.equipment.create({
            data: {
                name, 
                fleet
            }
        });

        return equipment;
    }
}