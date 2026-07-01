import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMacronutrientsSetup } from './useMacronutrientsSetup';

// ── hoisted mocks ──────────────────────────────────────────────────────────
const mockMutate = vi.hoisted(() => vi.fn());
const mockSetActivePlanificacionId = vi.hoisted(() => vi.fn());

// Objeto mutable: sus propiedades se leen en cada render del hook.
const mockState = vi.hoisted(() => ({
  activePatient: { id: 'patient-1', nombre: 'Ana González' } as any,
  pesoActivo: 70,
  tmbPromedio: 2000,
  setActivePlanificacionId: mockSetActivePlanificacionId,
}));

vi.mock('../../../shared/store/useClinicalStore', () => ({
  useClinicalStore: (selector: any) => selector(mockState),
}));

vi.mock('../../planificaciones/hooks/usePlanificaciones', () => ({
  useCreatePlanificacion: () => ({ mutate: mockMutate, isPending: false }),
}));

// ── helpers ────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  // Restaurar estado de referencia antes de cada test
  mockState.activePatient = { id: 'patient-1', nombre: 'Ana González' };
  mockState.pesoActivo = 70;
  mockState.tmbPromedio = 2000;
});

// Con DEFAULTS: protGkg=2.0, choPct=45, fatPct=27; pesoActivo=70, tmbPromedio=2000
// protKcal = 2.0*70*4 = 560  → prot% = round(560/2000*100) = 28
// cho%  = round(45) = 45
// fat%  = round(27) = 27
// totals.prot = { g:140, kcal:560, pct:28 }
// totals.cho  = { g:225, kcal:900, pct:45 }
// totals.fat  = { g:60,  kcal:540, pct:27 }
// summary     = { grams:425, percent:100 }

describe('useMacronutrientsSetup', () => {
  describe('context', () => {
    it('expone pesoActivo y tmbPromedio del estado clínico', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.context).toEqual({ pesoActivo: 70, tmbPromedio: 2000 });
    });
  });

  describe('macrosPct — conversión g/kg → %', () => {
    it('calcula prot% correctamente (2.0 g/kg, 70 kg, 2000 kcal → 28%)', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.inputs.protPct).toBe(28);
    });

    it('preserva choPct y fatPct como enteros redondeados', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.inputs.choPct).toBe(45);
      expect(result.current.inputs.fatPct).toBe(27);
    });

    it('devuelve prot%=0 cuando tmbPromedio es 0', () => {
      mockState.tmbPromedio = 0;
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.inputs.protPct).toBe(0);
    });
  });

  describe('totals — motor de cálculo', () => {
    it('calcula proteína: 28% de 2000 kcal → 140 g, 560 kcal', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.totals.prot).toEqual({ g: 140, kcal: 560, pct: 28 });
    });

    it('calcula carbohidratos: 45% de 2000 kcal → 225 g, 900 kcal', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.totals.cho).toEqual({ g: 225, kcal: 900, pct: 45 });
    });

    it('calcula grasa: 27% de 2000 kcal → 60 g, 540 kcal', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.totals.fat).toEqual({ g: 60, kcal: 540, pct: 27 });
    });

    it('summary totaliza gramos y porcentaje', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.totals.summary).toEqual({ grams: 425, percent: 100 });
    });
  });

  describe('isBalanced', () => {
    it('devuelve true cuando la suma es exactamente 100%', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.isBalanced).toBe(true);
    });

    it('devuelve true dentro de la tolerancia ±1 (handleReset → sum=101)', () => {
      // handleReset: protGkg=1.5, choPct=50, fatPct=30
      // prot% = round(1.5*70*4/2000*100) = round(21) = 21 → sum=21+50+30=101
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.handleReset(); });
      expect(result.current.isBalanced).toBe(true);
    });
  });

  describe('handleReset', () => {
    it('restablece protGkg=1.5, choPct=50 y fatPct=30', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.handleReset(); });
      expect(result.current.inputs.protGkg).toBe(1.5);
      expect(result.current.inputs.choPct).toBe(50);
      expect(result.current.inputs.fatPct).toBe(30);
    });
  });

  describe('setMacro — ajuste manual (sin auto-balance)', () => {
    it('al cambiar prot no toca cho ni fat', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.setMacro('prot', 30); });
      expect(result.current.inputs.protPct).toBe(30);
      expect(result.current.inputs.choPct).toBe(45);
      expect(result.current.inputs.fatPct).toBe(27);
    });

    it('al cambiar cho no toca prot ni fat', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.setMacro('cho', 50); });
      expect(result.current.inputs.choPct).toBe(50);
      expect(result.current.inputs.protPct).toBe(28);
      expect(result.current.inputs.fatPct).toBe(27);
    });

    it('al cambiar fat no toca prot ni cho', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.setMacro('fat', 35); });
      expect(result.current.inputs.fatPct).toBe(35);
      expect(result.current.inputs.choPct).toBe(45);
      expect(result.current.inputs.protPct).toBe(28);
    });

    it('la suma puede quedar distinta de 100% (lo resuelve el balance)', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.setMacro('cho', 60); });
      // prot 28 + cho 60 + fat 27 = 115
      expect(result.current.totals.summary.percent).toBe(115);
      expect(result.current.isBalanced).toBe(false);
    });
  });

  describe('autoBalance — reparte proporcionalmente a 100%', () => {
    it('escala los 3 macros para sumar exactamente 100%', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.setMacro('cho', 60); }); // sum 115
      expect(result.current.totals.summary.percent).toBe(115);
      act(() => { result.current.actions.autoBalance(); });
      expect(result.current.totals.summary.percent).toBe(100);
    });

    it('conserva el orden de proporciones (el mayor sigue siendo el mayor)', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.setMacro('cho', 60); });
      act(() => { result.current.actions.autoBalance(); });
      expect(result.current.inputs.choPct).toBeGreaterThan(result.current.inputs.fatPct);
    });

    it('aplica un reparto por defecto (30/40/30) cuando todo está en 0', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => {
        result.current.actions.setMacro('prot', 0);
        result.current.actions.setMacro('cho', 0);
        result.current.actions.setMacro('fat', 0);
      });
      expect(result.current.totals.summary.percent).toBe(0);
      act(() => { result.current.actions.autoBalance(); });
      expect(result.current.inputs.protPct).toBe(30);
      expect(result.current.inputs.choPct).toBe(40);
      expect(result.current.inputs.fatPct).toBe(30);
    });

    it('reparte en los 3 grupos cuando solo un macro tiene valor (prot=100)', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => {
        result.current.actions.setMacro('cho', 0);
        result.current.actions.setMacro('fat', 0);
        result.current.actions.setMacro('prot', 100);
      });
      act(() => { result.current.actions.autoBalance(); });
      expect(result.current.inputs.protPct).toBe(30);
      expect(result.current.inputs.choPct).toBe(40);
      expect(result.current.inputs.fatPct).toBe(30);
    });
  });

  describe('localStorage — persistencia por paciente', () => {
    it('guarda los macros automáticamente después de cada cambio de estado', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.setChoPct(55); });
      expect(localStorage.getItem('nutriflow_macros_patient-1_choPct')).toBe('55');
    });

    it('carga los macros guardados del paciente al montar', () => {
      localStorage.setItem('nutriflow_macros_patient-1_choPct', '55');
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.inputs.choPct).toBe(55);
    });

    it('usa la clave "anon" cuando no hay paciente activo', () => {
      mockState.activePatient = null;
      localStorage.setItem('nutriflow_macros_anon_choPct', '40');
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.inputs.choPct).toBe(40);
    });

    it('usa los DEFAULTS cuando no hay nada guardado en localStorage', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.inputs.protGkg).toBe(2.0);
      expect(result.current.inputs.choPct).toBe(45);
      expect(result.current.inputs.fatPct).toBe(27);
    });
  });

  describe('handleSave', () => {
    it('llama a createPlanificacion.mutate con el payload correcto', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.handleSave('Plan verano'); });
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          paciente_id: 'patient-1',
          nombre: 'Plan verano',
          calorias_totales: 2000,
          distribucion_macros: { proteina: 28, grasa: 27, carbohidratos: 45 },
        }),
        expect.any(Object),
      );
    });

    it('omite la propiedad "nombre" cuando se pasa string vacío', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.handleSave(''); });
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: undefined }),
        expect.any(Object),
      );
    });

    it('llama a alert y no a mutate cuando no hay paciente activo', () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      mockState.activePatient = null;
      const { result } = renderHook(() => useMacronutrientsSetup());
      act(() => { result.current.actions.handleSave(); });
      expect(alertSpy).toHaveBeenCalled();
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('isSaving', () => {
    it('refleja el estado isPending de useCreatePlanificacion', () => {
      const { result } = renderHook(() => useMacronutrientsSetup());
      expect(result.current.isSaving).toBe(false);
    });
  });
});
