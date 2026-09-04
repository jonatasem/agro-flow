export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  equipmentId?: string;
  operatorId?: string;
  tecnicoId?: string;
  setor?: string;
  tipoCausa?: string;
}

export interface EquipmentMetric {
  fleet: string;
  name: string;
  count: number;
  totalMinutes: number;
}

export interface OperatorMetric {
  name: string;
  totalOS: number;
  causes?: Record<string, number>;
}

export interface DashboardMetrics {
  overview: {
    totalWorkOrders: number;
    totalDowntimeMinutes: number;
    totalDowntimeHours: number;
    averageRepairTimeMinutes: number;
  };
  causesDistribution: Record<string, number>;
  topProblematicEquipments: EquipmentMetric[];
  topRequestingOperators: OperatorMetric[];
  timeline: Array<{ date: string; count: number }>;
}