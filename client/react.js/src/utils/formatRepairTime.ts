// Formata um total de minutos em um texto amigável de duração (dias, horas e minutos)
export function formatRepairTime(minutes?: number | null): string {
  // Retorna um traço caso o valor não seja informado ou seja inválido
  if (minutes == null || Number.isNaN(minutes)) {
    return "-";
  }

  // Cálculos de conversão de tempo (1440 min = 24h)
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.floor(minutes % 60);

  // Formatação conforme o tamanho do tempo decorrido
  if (days > 0) {
    return `${days}d ${hours}h ${mins}min`;
  }

  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }

  return `${mins}min`;
}