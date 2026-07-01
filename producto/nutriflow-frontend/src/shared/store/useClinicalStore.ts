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
      // IMPORTANTE: arrancan en 0 (sin datos), nunca en valores clínicos
      // fabricados. La TMB se calcula por paciente vía el motor matemático
      // (useSyncActivePatientTmb); un default distinto de 0 haría que
      // Macronutrientes/Armador planifiquen sobre una TMB inventada.
      pesoActivo: 0,
      tmbPromedio: 0,
      activePatient: null,
      activePlanificacionId: null,

      // ==========================================
      // 2. ACCIONES (Mutadores del estado)
      // ==========================================
      setPesoActivo: (peso) => set({ pesoActivo: peso }),
      setTmbPromedio: (tmb) => set({ tmbPromedio: tmb }),
      // Al activar un paciente se toma su peso real y se RESETEA la TMB a 0
      // para forzar el recálculo del paciente nuevo (evita arrastrar la TMB
      // del paciente anterior o un default).
      setActivePatient: (paciente) =>
        set({
          activePatient: paciente,
          pesoActivo: paciente?.peso || 0,
          tmbPromedio: 0,
        }),
      setActivePlanificacionId: (id) => set({ activePlanificacionId: id }),
    }),
    {
      name: 'clinical-storage', // nombre en localStorage
      // Solo se persiste a quién/qué planificación se está atendiendo. El peso
      // y la TMB son valores derivados del paciente: no se persisten para que
      // nunca se sirva una TMB stale entre sesiones.
      partialize: (state) => ({
        activePatient: state.activePatient,
        activePlanificacionId: state.activePlanificacionId,
      }),
      // Al rehidratar, derivar el peso del paciente persistido y forzar el
      // recálculo de la TMB (queda en 0 hasta que el motor matemático responda).
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.pesoActivo = state.activePatient?.peso ?? 0;
          state.tmbPromedio = 0;
        }
      },
    }
  )
);