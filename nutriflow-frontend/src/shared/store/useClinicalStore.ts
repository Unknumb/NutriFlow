import { create } from 'zustand';

interface ClinicalState {
    pesoActivo: number;
    tmbPromedio: number;
    setPesoActivo: (peso: number) => void;
    setTmbPromedio: (tmb: number) => void;
}

export const useClinicalStore = create<ClinicalState>((set) => ({
    // Valores iniciales por defecto (luego TanStack Query los llenará con datos reales)
    pesoActivo: 67.4,
    tmbPromedio: 1766,

    // Acciones para actualizar el estado desde cualquier parte de la app
    setPesoActivo: (peso) => set({ pesoActivo: peso }),
    setTmbPromedio: (tmb) => set({ tmbPromedio: tmb }),
}));