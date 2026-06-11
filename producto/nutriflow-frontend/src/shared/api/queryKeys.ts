export const dashboardKeys = {
  all: ['dashboard'] as const,
  calculos: (pacienteId: string) => [...dashboardKeys.all, 'calculos', pacienteId] as const,
};

export const pacientesKeys = {
  all: ['pacientes'] as const,
  detail: (id: string) => [...pacientesKeys.all, id] as const,
  evaluaciones: (id: string) => [...pacientesKeys.detail(id), 'evaluaciones'] as const,
  pautas: (id: string) => [...pacientesKeys.detail(id), 'pautas'] as const,
};

export const evaluacionesKeys = {
  all: ['evaluaciones'] as const,
  detail: (id: string) => [...evaluacionesKeys.all, id] as const,
};

export const pautasKeys = {
  all: ['pautas'] as const,
  detail: (id: string) => [...pautasKeys.all, id] as const,
};

export const menusKeys = {
  all: ['menus'] as const,
};