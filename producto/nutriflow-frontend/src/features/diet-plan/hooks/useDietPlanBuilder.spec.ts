import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDietPlanBuilder } from './useDietPlanBuilder';
import { usePortionsStore } from '../../porciones/store/usePortionsStore';

// ---------------------------------------------------------------------------
// Snapshot del estado inicial del store para reset limpio entre tests
// ---------------------------------------------------------------------------
const initialStoreState = usePortionsStore.getState();

beforeEach(() => {
    usePortionsStore.setState(initialStoreState, true);
});

afterEach(() => {
    vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------
const makeTargets = (overrides: Partial<{
    pesoActivo: number; tmbPromedio: number;
    kcal: number; prot: number; cho: number; fat: number;
}> = {}) => ({
    pesoActivo: 70,
    tmbPromedio: 1600,
    kcal: 2000,
    prot: 80,
    cho: 250,
    fat: 70,
    ...overrides,
});

// ---------------------------------------------------------------------------
// Macros de referencia (FOOD_GROUPS):
//   cer:  kcal=140  p=3  c=30  g=1
//   veg:  kcal=30   p=2  c=5   g=0
//   fru:  kcal=65   p=1  c=15  g=0
//   lbg:  kcal=70   p=7  c=10  g=0
//   cbg:  kcal=65   p=11 c=1   g=2
//   ace:  kcal=180  p=0  c=0   g=20
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 1. currentTotals — Libre Consumo
// ---------------------------------------------------------------------------

describe('currentTotals — libre consumo', () => {
    it('excluye macros y calorías de un grupo presente en libreConsumoIds', () => {
        // Arrange
        // store.targets son las "porciones objetivo" que el hook expone como `portions`
        usePortionsStore.setState({
            targets: { cer: 2, veg: 3 },
            libreConsumoIds: ['veg'],
        });

        const { result } = renderHook(() => useDietPlanBuilder(makeTargets()));

        // Assert — solo cer (×2) debe contribuir al total
        // cer × 2 → kcal=280, prot=6, cho=60, fat=2
        // veg (×3) es libre consumo → excluido del cálculo
        expect(result.current.currentTotals.kcal).toBe(280);
        expect(result.current.currentTotals.prot).toBe(6);
        expect(result.current.currentTotals.cho).toBe(60);
        expect(result.current.currentTotals.fat).toBe(2);
    });

    it('excluye grupos marcados con isFree=true (alimento custom)', () => {
        // Arrange — un alimento con isFree:true no debe sumar, sea cual sea su cantidad
        usePortionsStore.setState({
            targets: { cer: 1, 'alimento-libre': 10 },
            customFoods: [{
                id: 'alimento-libre',
                title: 'Libre consumo',
                kcal: 999,
                macros: { p: 99, c: 99, g: 99 },
                theme: { bgMain: '', bgHeader: '', border: '', text: '' },
                emoji: '🌿',
                label: 'Libre',
                headerBg: '',
                targetBg: '',
                cellBg: '',
                textBtn: '',
                isFree: true,
            }],
        });

        const { result } = renderHook(() => useDietPlanBuilder(makeTargets()));

        // Assert — solo cer (×1) debe sumar; el alimento libre (×10) queda fuera
        // cer × 1 → kcal=140, prot=3, cho=30, fat=1
        expect(result.current.currentTotals.kcal).toBe(140);
        expect(result.current.currentTotals.prot).toBe(3);
        expect(result.current.currentTotals.cho).toBe(30);
        expect(result.current.currentTotals.fat).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// 2. suggestDistribution — guardia epsilon 0.1
//
// Con Math.random=0 el orden determinista es:
//   addPortion('veg', 2)   → veg=2  [p-4, c-10]
//   addPortion('fru', 2)   → fru=2  [p-2, c-30]
//   addPortion('lbg', 1)   → lbg=1  [p-7, c-10]
//   remainingProt/Cho/Fat = 0 → cbg, cer, ace bloqueados
//
// Con targets {prot:13, cho:50, fat:0} los tres macros se agotan exactamente
// en veg+fru+lbg y los siguientes grupos NO pueden agregar nada
// (su actualAmount se redondea a 0 después del epsilon).
// ---------------------------------------------------------------------------

describe('suggestDistribution — guardia epsilon 0.1', () => {
    it('no sobrepasa el objetivo restante por más del epsilon cuando los macros se agotan', () => {
        // Arrange
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const { result } = renderHook(() =>
            useDietPlanBuilder(makeTargets({ prot: 13, cho: 50, fat: 0 }))
        );

        // Act
        act(() => {
            result.current.actions.suggestDistribution();
        });

        // Assert — los totales no pueden superar el objetivo en más de EPSILON por macro
        const EPSILON = 0.1;
        expect(result.current.currentTotals.prot).toBeLessThanOrEqual(13 + EPSILON);
        expect(result.current.currentTotals.cho).toBeLessThanOrEqual(50 + EPSILON);
        expect(result.current.currentTotals.fat).toBeLessThanOrEqual(0 + EPSILON);
    });

    it('los grupos cbg/cer/ace quedan en 0 cuando el presupuesto de macros ya se agotó', () => {
        // Arrange — mismas condiciones, verificamos que el guard bloqueó efectivamente
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const { result } = renderHook(() =>
            useDietPlanBuilder(makeTargets({ prot: 13, cho: 50, fat: 0 }))
        );

        // Act
        act(() => {
            result.current.actions.suggestDistribution();
        });

        // Assert — cbg, cer y ace no deben aparecer en las porciones resultantes
        expect(result.current.portions['cbg']).toBeUndefined();
        expect(result.current.portions['cer']).toBeUndefined();
        expect(result.current.portions['ace']).toBeUndefined();

        // veg, fru, lbg sí deben estar
        expect(result.current.portions['veg']).toBe(2);
        expect(result.current.portions['fru']).toBe(2);
        expect(result.current.portions['lbg']).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// 3. suggestDistribution — redondeo a múltiplos de 0.5
//
// Con Math.random=0 y targets generosos (prot=100, cho=300, fat=80):
//   veg=2, fru=2, lbg=1, cbg=7.5, cer=1.5, ace=3
// Todos son múltiplos exactos de 0.5 (Math.floor(x*2)/2).
// ---------------------------------------------------------------------------

describe('suggestDistribution — redondeo a múltiplos de 0.5', () => {
    it('todas las porciones sugeridas son múltiplos exactos de 0.5', () => {
        // Arrange
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const { result } = renderHook(() =>
            useDietPlanBuilder(makeTargets({ prot: 100, cho: 300, fat: 80 }))
        );

        // Act
        act(() => {
            result.current.actions.suggestDistribution();
        });

        // Assert — para cada porción: val * 2 debe ser un entero exacto
        const portions = result.current.portions;
        const values = Object.values(portions);
        expect(values.length).toBeGreaterThan(0);

        values.forEach((val) => {
            // val*2 debe ser entero (sin parte decimal), lo que garantiza que val ∈ {0, 0.5, 1, 1.5, ...}
            expect(val * 2 % 1).toBe(0);
        });
    });

    it('los valores específicos calculados con random=0 son los esperados', () => {
        // Verify deterministic output against hand-calculated expected values:
        //   veg=2, fru=2, lbg=1, cbg=7.5, cer=1.5, ace=3
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const { result } = renderHook(() =>
            useDietPlanBuilder(makeTargets({ prot: 100, cho: 300, fat: 80 }))
        );

        act(() => {
            result.current.actions.suggestDistribution();
        });

        expect(result.current.portions['veg']).toBe(2);
        expect(result.current.portions['fru']).toBe(2);
        expect(result.current.portions['lbg']).toBe(1);
        expect(result.current.portions['cbg']).toBe(7.5);
        expect(result.current.portions['cer']).toBe(1.5);
        expect(result.current.portions['ace']).toBe(3);
    });
});

// ---------------------------------------------------------------------------
// 4. suggestDistribution — caso borde maxAllowed = Infinity
//
// ace tiene macros {p:0, c:0, g:20}.
// Cuando p=0 o c=0, la división da Infinity → maxAllowed queda determinado
// únicamente por el macro que SÍ tiene valor (fat en este caso).
// Con targets {prot:0, cho:0, fat:50} y Math.random=0:
//   - veg/fru/lbg bloqueados (sin presupuesto de prot/cho)
//   - ace: maxP=Inf, maxC=Inf, maxG=(50+0.1)/20=2.505 → actualAmount=2.5
// ---------------------------------------------------------------------------

describe('suggestDistribution — caso borde maxAllowed = Infinity', () => {
    it('no lanza excepción ni produce NaN/Infinity cuando un macro del grupo es 0', () => {
        // Arrange — solo hay presupuesto de fat; ace tiene p=0 y c=0
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const { result } = renderHook(() =>
            useDietPlanBuilder(makeTargets({ prot: 0, cho: 0, fat: 50 }))
        );

        // Act — no debe lanzar
        expect(() =>
            act(() => {
                result.current.actions.suggestDistribution();
            })
        ).not.toThrow();

        // Assert — ningún valor en portions debe ser NaN o Infinity
        const portions = result.current.portions;
        Object.values(portions).forEach((val) => {
            expect(Number.isFinite(val)).toBe(true);
            expect(Number.isNaN(val)).toBe(false);
        });

        // Los totales también deben ser números finitos
        const { kcal, prot, cho, fat } = result.current.currentTotals;
        [kcal, prot, cho, fat].forEach((v) => {
            expect(Number.isFinite(v)).toBe(true);
        });
    });

    it('ace recibe exactamente 2.5 porciones y los totales son coherentes', () => {
        // Arrange
        // ace: p=0, c=0, g=20
        // maxG = (50+0.1)/20 = 2.505 → actualAmount = floor(2.505*2)/2 = floor(5.01)/2 = 2.5
        vi.spyOn(Math, 'random').mockReturnValue(0);

        const { result } = renderHook(() =>
            useDietPlanBuilder(makeTargets({ prot: 0, cho: 0, fat: 50 }))
        );

        // Act
        act(() => {
            result.current.actions.suggestDistribution();
        });

        // Assert — ace=2.5, resto vacío
        expect(result.current.portions['ace']).toBe(2.5);
        expect(result.current.portions['veg']).toBeUndefined();
        expect(result.current.portions['fru']).toBeUndefined();

        // currentTotals: ace×2.5 → kcal=450, prot=0, cho=0, fat=50
        expect(result.current.currentTotals.kcal).toBe(450);
        expect(result.current.currentTotals.prot).toBe(0);
        expect(result.current.currentTotals.cho).toBe(0);
        expect(result.current.currentTotals.fat).toBe(50);
    });
});
