export function formatRepairTime(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || isNaN(minutes)) return "-";

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = Math.floor(minutes % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${mins}min`;
  }
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  return `${mins} min`;
}