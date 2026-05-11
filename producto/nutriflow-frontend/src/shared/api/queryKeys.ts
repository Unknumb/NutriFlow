export const dashboardKeys = {
  all: ['dashboard'] as const,
  calculos: (pacienteId: string) => [...dashboardKeys.all, 'calculos', pacienteId] as const,
};