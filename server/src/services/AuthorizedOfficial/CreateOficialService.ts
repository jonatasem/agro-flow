import prismaClient from "../../prisma/index.js";

interface CreateOfficialProps {
    name: string,
    registration: string,
    city: string
}

class CreateOfficialService {
    async execute({ name, registration, city }: CreateOfficialProps) {

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

export default CreateOfficialService;
