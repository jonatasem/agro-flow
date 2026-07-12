import prismaClient from "../prisma/index.js";

class ListOfficialService {
    async execute() {
        const official = await prismaClient.official.findMany();

        return official;
    }
}

export default ListOfficialService;