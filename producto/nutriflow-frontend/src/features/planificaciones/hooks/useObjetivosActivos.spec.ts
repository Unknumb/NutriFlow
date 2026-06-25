import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useObjetivosActivos } from './useObjetivosActivos';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { usePlanificaciones } from './usePlanificaciones';
import type { Planificacion } from '../api/planificacionesApi';
import type { PatientData } from '../../../shared/store/useClinicalStore';

vi.mock('../../../shared/store/useClinicalStore', () => ({
  useClinicalStore: vi.fn(),
}));

vi.mock('./usePlanificaciones', () => ({
  usePlanificaciones: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockPatient: PatientData = {
  id: 'paciente-1',
  nombre: 'Ana García',
  edad: 30,
  sexo: 'F',
  talla: 165,
  peso: 60,
};

const makePlan = (overrides: Partial<Planificacion> = {}): Planificacion => ({
  id: 'plan-default',
  paciente_id: 'paciente-1',
  nutricionista_id: 'nutri-1',
  activa: false,
  fecha_creacion: '2026-01-01T00:00:00.000Z',
  calorias_totales: 1800,
  distribucion_macros: { proteina: 20, carbohidratos: 55, grasa: 25 },
  ...overrides,
});

const mockStore = (activePatient: PatientData | null, activePlanificacionId: string | null) => {
  vi.mocked(useClinicalStore).mockImplementation((selector: any) =>
    selector({ activePatient, activePlanificacionId }),
  );
};

const mockPlans = (data: Planificacion[], isLoading = false) => {
  vi.mocked(usePlanificaciones).mockReturnValue({ data, isLoading } as any);
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------
describe('useObjetivosActivos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1. Manejo de Nulls (Fallbacks)
  // -------------------------------------------------------------------------
  describe('cuando no hay datos suficientes', () => {
    it('retorna planificacionActiva y objetivos null si activePatient es null', () => {
      mockStore(null, null);
      mockPlans([]);

      const { result } = renderHook(() => useObjetivosActivos());

      expect(result.current.planificacionActiva).toBeNull();
      expect(result.current.objetivos).toBeNull();
    });

    it('retorna null si el paciente activo no tiene planificaciones en la lista', () => {
      mockStore(mockPatient, null);
      // La lista sólo contiene planes de otro paciente
      mockPlans([makePlan({ id: 'plan-ajeno', paciente_id: 'paciente-otro' })]);

      const { result } = renderHook(() => useObjetivosActivos());

      expect(result.current.planificacionActiva).toBeNull();
      expect(result.current.objetivos).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // 2. Lógica de Prioridad
  // -------------------------------------------------------------------------
  describe('lógica de prioridad para seleccionar la planificación activa', () => {
    // Tres planes del mismo paciente con características distintas
    const planPrimero = makePlan({ id: 'plan-A', activa: false });  // primer elemento del arreglo
    const planConFlag = makePlan({ id: 'plan-B', activa: true });   // tiene flag activa en DB
    const planEnStore = makePlan({ id: 'plan-C', activa: false });  // coincide con el store

    it('prioridad 1 → elige el plan cuyo id coincide con activePlanificacionId del store', () => {
      mockStore(mockPatient, 'plan-C');
      mockPlans([planPrimero, planConFlag, planEnStore]);

      const { result } = renderHook(() => useObjetivosActivos());

      expect(result.current.planificacionActiva?.id).toBe('plan-C');
    });

    it('prioridad 2 → sin id en el store, elige el que tiene activa: true en DB', () => {
      mockStore(mockPatient, null);
      mockPlans([planPrimero, planConFlag, planEnStore]);

      const { result } = renderHook(() => useObjetivosActivos());

      expect(result.current.planificacionActiva?.id).toBe('plan-B');
    });

    it('prioridad 3 → sin id en el store ni flag activa, elige delPaciente[0] como fallback', () => {
      mockStore(mockPatient, null);
      // Ninguno tiene activa: true y el store no tiene id
      mockPlans([planPrimero, planEnStore]);

      const { result } = renderHook(() => useObjetivosActivos());

      expect(result.current.planificacionActiva?.id).toBe('plan-A');
    });
  });

  // -------------------------------------------------------------------------
  // 3. Cálculos Matemáticos de Macros
  // -------------------------------------------------------------------------
  describe('cálculos matemáticos de macronutrientes', () => {
    it('aplica Math.round((kcal * pct) / 100 / divisor) con 2000 kcal, 25 % prot, 50 % cho, 25 % fat', () => {
      const planConMacros = makePlan({
        id: 'plan-macros',
        activa: true,
        calorias_totales: 2000,
        distribucion_macros: { proteina: 25, carbohidratos: 50, grasa: 25 },
      });

      mockStore(mockPatient, null);
      mockPlans([planConMacros]);

      const { result } = renderHook(() => useObjetivosActivos());
      const { objetivos } = result.current;

      expect(objetivos).not.toBeNull();

      // prot_g: Math.round(2000 * 25 / 100 / 4) = Math.round(125.0) = 125
      expect(objetivos!.prot_g).toBe(125);

      // cho_g:  Math.round(2000 * 50 / 100 / 4) = Math.round(250.0) = 250
      expect(objetivos!.cho_g).toBe(250);

      // fat_g:  Math.round(2000 * 25 / 100 / 9) = Math.round(55.555…) = 56
      expect(objetivos!.fat_g).toBe(56);

      // Los porcentajes y kcal también pasan íntegros
      expect(objetivos!.kcal).toBe(2000);
      expect(objetivos!.prot_pct).toBe(25);
      expect(objetivos!.cho_pct).toBe(50);
      expect(objetivos!.fat_pct).toBe(25);
    });
  });
});
