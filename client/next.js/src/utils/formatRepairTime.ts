// Formata um total de minutos num texto amigável de duração (dias, horas e minutos).
export function formatRepairTime(minutes?: number | null): string {
  // Retorna um traço caso o valor não esteja preenchido ou seja inválido
  if (minutes == null || Number.isNaN(minutes)) {
    return "-";
  }

  // Cálculos de conversão temporal (1440 minutos equivalem a 24 horas)
  
  // Calcula o número total de dias inteiros dividindo os minutos por 1440 (que é o total de minutos em 1 dia: 24 horas * 60 minutos)
  const days = Math.floor(minutes / 1440);

  // Pega o resto dos minutos que não formaram dias completos (% 1440) e divide por 60 para descobrir quantas horas inteiras restaram
  const hours = Math.floor((minutes % 1440) / 60);

  // Pega o resto final dos minutos após retirar os dias e as horas (% 60), resultando nos minutos restantes
  const mins = Math.floor(minutes % 60);

  // Formatação condicional conforme a grandeza do tempo decorrido

  // Se a constante days for maior que 0, mostrara dias, serão
  if (days > 0) {
    return `${days}d ${hours}h ${mins}min`;
  }

  // Se hours for maior que 0, mostra as horas
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }

  // Ou somente os minutos, dependendo do tempo.
  return `${mins}min`;
}