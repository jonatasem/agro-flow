import prismaClient from "../prisma/index.js";

interface CreateAuthorizedProps {
    name: string,
    registration: string,
    city: string
}

class CreateAuthorizedService {
    async execute({ name, registration, city }: CreateAuthorizedProps) {

        if(!name || !registration || !city){
            throw new Error('Todos os campos são obrigatórios');
        }

        const authorized = await prismaClient.official.create({
            data: {
                name,
                registration,
                city,
                status: true
            }
        })

        return authorized;
    }
}

export default CreateAuthorizedService;
