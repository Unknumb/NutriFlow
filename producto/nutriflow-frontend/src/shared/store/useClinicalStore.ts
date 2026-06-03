import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PatientData {
  id: string;
  nombre: string;
  edad: number;
  sexo: string;
  talla: number;
  peso: number;
}

export interface ClinicalState {
  pesoActivo: number;
  tmbPromedio: number;
  activePatient: PatientData | null;
  activePlanificacionId: string | null;

  setPesoActivo: (peso: number) => void;
  setTmbPromedio: (tmb: number) => void;
  setActivePatient: (paciente: PatientData | null) => void;
  setActivePlanificacionId: (id: string | null) => void;
}

export const useClinicalStore = create<ClinicalState>()(
  persist(
    (set) => ({
      // ==========================================
      // 1. ESTADO INICIAL (Valores por defecto)
      // ==========================================
      pesoActivo: 67.4,
      tmbPromedio: 1766,
      activePatient: null, 
      activePlanificacionId: null,

      // ==========================================
      // 2. ACCIONES (Mutadores del estado)
      // ==========================================
      setPesoActivo: (peso) => set({ pesoActivo: peso }),
      setTmbPromedio: (tmb) => set({ tmbPromedio: tmb }),
      setActivePatient: (paciente) => set({ activePatient: paciente, pesoActivo: paciente?.peso || 67.4 }),
      setActivePlanificacionId: (id) => set({ activePlanificacionId: id }),
    }),
    {
      name: 'clinical-storage', // nombre en localStorage
    }
  )
);