import { create } from 'zustand';

export interface ClinicalState {
  pesoActivo: number;
  tmbPromedio: number;
  activePatient: { id: string; nombre: string } | null;

  setPesoActivo: (peso: number) => void;
  setTmbPromedio: (tmb: number) => void;
  setActivePatient: (paciente: { id: string; nombre: string } | null) => void;
}

export const useClinicalStore = create<ClinicalState>((set) => ({
  // ==========================================
  // 1. ESTADO INICIAL (Valores por defecto)
  // ==========================================
  pesoActivo: 67.4,
  tmbPromedio: 1766,
  activePatient: null, // 🚨 Faltaba inicializar esta variable

  // ==========================================
  // 2. ACCIONES (Mutadores del estado)
  // ==========================================
  setPesoActivo: (peso) => set({ pesoActivo: peso }),
  setTmbPromedio: (tmb) => set({ tmbPromedio: tmb }),
  setActivePatient: (paciente) => set({ activePatient: paciente }), // 🚨 Faltaba crear la función real
}));