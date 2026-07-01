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
  /** ID del usuario (nutricionista) dueño del estado persistido. Sirve de
   *  barrera de seguridad: si cambia el usuario, el estado se descarta para
   *  no filtrar el paciente activo de una cuenta a otra. */
  ownerId: string | null;

  setPesoActivo: (peso: number) => void;
  setTmbPromedio: (tmb: number) => void;
  setActivePatient: (paciente: PatientData | null) => void;
  setActivePlanificacionId: (id: string | null) => void;
  /** Registra al usuario dueño del estado. Si el nuevo usuario difiere del
   *  dueño previo, descarta el estado clínico (barrera anti-fuga entre
   *  cuentas) antes de registrar al nuevo. Idempotente para el mismo usuario. */
  switchOwner: (userId: string) => void;
  /** Limpia todo el estado clínico (al cerrar sesión). */
  reset: () => void;
}

const ESTADO_INICIAL = {
  pesoActivo: 0,
  tmbPromedio: 0,
  activePatient: null,
  activePlanificacionId: null,
  ownerId: null,
} as const;

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
      ...ESTADO_INICIAL,

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
      switchOwner: (userId) =>
        set((state) =>
          state.ownerId === userId
            ? state
            : { ...ESTADO_INICIAL, ownerId: userId }
        ),
      reset: () => set({ ...ESTADO_INICIAL }),
    }),
    {
      name: 'clinical-storage', // nombre en localStorage
      // Solo se persiste a quién/qué planificación se está atendiendo (y el
      // dueño del estado). El peso y la TMB son valores derivados del paciente:
      // no se persisten para que nunca se sirva una TMB stale entre sesiones.
      partialize: (state) => ({
        activePatient: state.activePatient,
        activePlanificacionId: state.activePlanificacionId,
        ownerId: state.ownerId,
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