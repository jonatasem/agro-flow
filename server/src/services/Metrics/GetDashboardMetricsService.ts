// Importa a instância do cliente do Prisma para comunicação com o banco de dados
import prismaClient from "../../prisma/index.js";

// Interface que define todos os filtros opcionais aceitos pela requisição do Dashboard
export interface DashboardFiltersProps {
  // Data inicial do período de análise (Formato ISO ou YYYY-MM-DD)
  startDate?: string | undefined;
  // Data final do período de análise (Formato ISO ou YYYY-MM-DD)
  endDate?: string | undefined;
  // ID do Equipamento específico para filtrar
  equipmentId?: string | undefined;
  // ID do Operador específico para filtrar
  operatorId?: string | undefined;
  // ID do Técnico responsável para filtrar
  tecnicoId?: string | undefined;
  // Setor responsável pelo atendimento (ex: "Mecânica", "Elétrica")
  setor?: string | undefined;
  // Filtro por classificação da causa (ex: "Erro Operacional", "Desgaste Natural")
  tipoCausa?: string | undefined;
}

// Classe de serviço responsável pelo cálculo e cruzamento de métricas para gráficos
export class GetDashboardMetricsService {
  // Método principal que processa os filtros e retorna os dados consolidados
  async execute(filters: DashboardFiltersProps) {
    // Define a data inicial padrão como 30 dias atrás caso não seja informada
    const start = filters.startDate
      ? new Date(filters.startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));

    // Define a data final padrão como o momento atual caso não seja informada
    const end = filters.endDate ? new Date(filters.endDate) : new Date();

    // Constrói a cláusula WHERE do Prisma dinamicamente para SectorService
    const sectorWhereClause: any = {
      // Filtra atendimentos criados dentro do intervalo de datas especificado
      dataCriacao: {
        gte: start,
        lte: end,
      },
    };

    // Adiciona filtro por setor se o parâmetro foi enviado
    if (filters.setor) sectorWhereClause.setor = filters.setor;
    // Adiciona filtro por tipo de causa se o parâmetro foi enviado
    if (filters.tipoCausa) sectorWhereClause.tipoCausa = filters.tipoCausa;
    // Adiciona filtro por técnico responsável se o parâmetro foi enviado
    if (filters.tecnicoId) sectorWhereClause.tecnicoResponsavelId = filters.tecnicoId;

    // Constrói a cláusula WHERE para filtrar a Ordem de Serviço pai
    const workOrderWhereClause: any = {};
    // Adiciona filtro de equipamento se o parâmetro foi informado
    if (filters.equipmentId) workOrderWhereClause.equipmentId = filters.equipmentId;
    // Adiciona filtro de operador se o parâmetro foi informado
    if (filters.operatorId) workOrderWhereClause.operatorId = filters.operatorId;

    // Se houver filtros na Ordem de Serviço pai, anexa na consulta de SectorService
    if (Object.keys(workOrderWhereClause).length > 0) {
      sectorWhereClause.workOrder = workOrderWhereClause;
    }

    // Busca todos os atendimentos de setor que respeitam os filtros aplicados
    const sectorServices = await prismaClient.sectorService.findMany({
      // Aplica o filtro dinâmico montado anteriormente
      where: sectorWhereClause,
      // Inclui os relacionamentos necessários para o cruzamento de dados
      include: {
        // Inclui dados da Ordem de Serviço pai, Equipamento e Operador
        workOrder: {
          include: {
            equipment: true,
            operator: true,
          },
        },
        // Inclui o histórico de pausas cadastradas no serviço
        pauses: true,
        // Seleciona apenas o nome e ID do técnico responsável
        tecnicoResponsavel: { select: { id: true, name: true } },
      },
      // Ordena os registros do mais antigo para o mais recente para linha do tempo
      orderBy: { dataCriacao: "asc" },
    });

    // Inicializa contador total de chamados encontrados no período
    const totalOrders = sectorServices.length;
    // Variável para acumular o tempo total de manutenção em minutos
    let totalDowntimeMinutes = 0;

    // Objeto para agrupar quantidade de ocorrências por tipo de causa (Gráfico de Rosca/Pizza)
    const causesBreakdown: Record<string, number> = {};
    // Objeto para agrupar ocorrências por equipamento (Ranking de Máquinas)
    const equipmentBreakdown: Record<string, { fleet: string; name: string; count: number; totalMinutes: number }> = {};
    // Objeto para agrupar solicitações por operador (Análise de Operadores)
    const operatorBreakdown: Record<string, { name: string; totalOS: number; causes: Record<string, number> }> = {};
    // Objeto para agrupar chamados por mês/ano (Gráfico de Linha do Tempo)
    const timelineBreakdown: Record<string, number> = {};

    // Percorre cada atendimento retornado para realizar as agregações
    for (const service of sectorServices) {
      // Soma o tempo de manutenção em minutos caso o serviço já tenha sido finalizado
      if (service.tempoManutencao) {
        totalDowntimeMinutes += service.tempoManutencao;
      }

      // Agrupa os dados pelo tipo de causa informada (ou "Não Classificado")
      const causeKey = service.tipoCausa || "NÃO_INFORMADO";
      // Incrementa o contador da causa correspondente
      causesBreakdown[causeKey] = (causesBreakdown[causeKey] || 0) + 1;

      // Processa o agrupamento por Equipamento/Máquina com garantia de tipo
      const eq = service.workOrder?.equipment;
      if (eq) {
        // Recupera o objeto atual ou inicializa caso ainda não exista no agrupador
        const currentEq = equipmentBreakdown[eq.id] ?? {
          fleet: eq.fleet,
          name: eq.name,
          count: 0,
          totalMinutes: 0,
        };

        // Incrementa o número de falhas registradas para a máquina
        currentEq.count += 1;
        // Acumula o tempo em minutos que a máquina ficou parada
        currentEq.totalMinutes += service.tempoManutencao || 0;

        // Salva as alterações de volta no mapa de agrupamentos
        equipmentBreakdown[eq.id] = currentEq;
      }

      // Processa o agrupamento e cruzamento por Operador com garantia de tipo
      const op = service.workOrder?.operator;
      if (op) {
        // Recupera o objeto atual ou inicializa caso ainda não exista no agrupador
        const currentOp = operatorBreakdown[op.id] ?? {
          name: op.name,
          totalOS: 0,
          causes: {},
        };

        // Incrementa o total de ordens solicitadas por este operador
        currentOp.totalOS += 1;
        // Agrupa as causas associadas especificamente às chamadas deste operador
        currentOp.causes[causeKey] = (currentOp.causes[causeKey] || 0) + 1;

        // Salva as alterações de volta no mapa de agrupamentos
        operatorBreakdown[op.id] = currentOp;
      }

      // Formata a data de criação no formato "YYYY-MM" para o gráfico temporal
      const monthYear = new Date(service.dataCriacao).toISOString().slice(0, 7);
      // Incrementa a quantidade de chamados registrados naquele mês
      timelineBreakdown[monthYear] = (timelineBreakdown[monthYear] || 0) + 1;
    }

    // Ordena o ranking de equipamentos com mais falhas (ordem decrescente)
    const topEquipments = Object.values(equipmentBreakdown)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Ordena o ranking de operadores que mais abriram ordens de serviço
    const topOperators = Object.values(operatorBreakdown)
      .sort((a, b) => b.totalOS - a.totalOS)
      .slice(0, 10);

    // Converte os dados da linha do tempo em um array de objetos ordenado
    const timeline = Object.entries(timelineBreakdown).map(([date, count]) => ({
      date,
      count,
    }));

    // Retorna a estrutura final consolidada para consumo do Frontend
    return {
      overview: {
        // Quantidade total de chamados no período
        totalWorkOrders: totalOrders,
        // Tempo total de máquina parada em minutos
        totalDowntimeMinutes,
        // Tempo total convertido em horas (arredondado em 2 casas decimais)
        totalDowntimeHours: Number((totalDowntimeMinutes / 60).toFixed(2)),
        // MTTR (Mean Time To Repair) - Tempo médio por conserto em minutos
        averageRepairTimeMinutes: totalOrders > 0 ? Math.round(totalDowntimeMinutes / totalOrders) : 0,
      },
      // Proporção de tipos de causa (Erro operacional vs Defeito)
      causesDistribution: causesBreakdown,
      // Ranking das máquinas mais problemáticas
      topProblematicEquipments: topEquipments,
      // Ranking de operadores e o motivo de suas chamadas
      topRequestingOperators: topOperators,
      // Dados para o gráfico de evolução temporal (linhas ou barras)
      timeline,
    };
  }
}