import type { FastifyRequest, FastifyReply } from "fastify";
// Importamos o Service e também a interface de tipos dele
import { 
  FinishSectorServiceService
} from "../../services/SectorService/FinishSectorServiceService.js";

interface FinishSectorServiceProps {
    sectorServiceId: string;
    solucaoTecnico: string;
    tipoCausa?: string;
    tecnicoId: string;
}

export class FinishSectorServiceController {
  async handle(request: FastifyRequest, reply: FastifyReply) {

    // Busca o id do params
    const { id: sectorServiceId } = request.params as { id: string };

    // Busca os dados no corpo da requisição
    const { solucaoTecnico, tipoCausa } = request.body as {
      solucaoTecnico: string;
      tipoCausa?: string;
    };

    // Pega o id do usuario logado
    const tecnicoId = request.userId;

    // Verifica se o id do colaborador esta correto
    if (!tecnicoId) {
      return reply.status(401).send({ error: "Não autorizado. Técnico não identificado." });
    }

    // Cria o servico para finalizar
    const finishService = new FinishSectorServiceService();

    // Tenta salvar no banco de dados
    try {
      const dadosParaFinalizar: FinishSectorServiceProps = {
        sectorServiceId,
        solucaoTecnico,
        tecnicoId,
      };

      // Se o tipoCausa existir, adiciona no objeto
      if (tipoCausa) {
        dadosParaFinalizar.tipoCausa = tipoCausa;
      }

      // Passa o objeto para o Service
      const result = await finishService.execute(dadosParaFinalizar);

      // Retorna a os atualizada
      return reply.status(200).send(result);
    } catch (error: any) {
      // Retorna um erro se nao conseguir salvar
      return reply.status(400).send({ error: error.message });
    }
  }
}