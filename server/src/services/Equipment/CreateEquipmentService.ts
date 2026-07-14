import prismaClient from "../../prisma/index.js";

interface CreateEquipmentProps {
    name: string;
    fleet: string;
    city: string;
}

export class CreateEquipmentService {
    async execute({name, fleet, city}: CreateEquipmentProps) {

        if(!name || !fleet || !city) {
            throw new Error("Todos os campos são obrigatórios");
        }

        const equipment = await prismaClient.equipment.create({
            data: {
                name, 
                fleet, 
                city,
                status: true,
            }
        });

        return equipment;
    }
}