import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePortions } from './usePortions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/apiClient';
import { usePortionsStore } from '../store/usePortionsStore';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { useObjetivosActivos } from '../../planificaciones/hooks/useObjetivosActivos';

// ---------------------------------------------------------------------------
// Mocks — hoisted por Vitest antes de las importaciones
// ---------------------------------------------------------------------------

vi.mock('@tanstack/react-query', () => ({
    useQuery: vi.fn(),
    useQueryClient: vi.fn(),
}));

vi.mock('../../../shared/api/apiClient', () => ({
    apiClient: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

vi.mock('../store/usePortionsStore', () => ({
    usePortionsStore: vi.fn(),
}));

vi.mock('../../../shared/store/useClinicalStore', () => ({
    useClinicalStore: vi.fn(),
}));

// usePaciente sólo hace lectura; no nos interesa su retorno en este test.
vi.mock('../../pacientes/hooks/usePacientes', () => ({
    usePaciente: vi.fn(() => ({ data: null })),
}));

vi.mock('../../planificaciones/hooks/useObjetivosActivos', () => ({
    useObjetivosActivos: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PACIENTE = {
    id: 'paciente-1',
    nombre: 'Valentina López',
    edad: 28,
    sexo: 'F',
    talla: 162,
    peso: 58,
};

const PLANIFICACION = {
    id: 'plan-1',
    paciente_id: 'paciente-1',
    nutricionista_id: 'nutri-1',
    activa: true,
    fecha_creacion: '2026-01-01T00:00:00.000Z',
    calorias_totales: 2000,
    distribucion_macros: { proteina: 25, carbohidratos: 50, grasa: 25 },
};

const PAUTAS = [
    { id: 'pauta-1', nombre: 'Pauta A', planificacion_id: 'plan-1', fecha_creacion: '2026-01-01' },
    { id: 'pauta-2', nombre: 'Pauta B', planificacion_id: 'plan-2', fecha_creacion: '2026-01-02' },
    { id: 'pauta-3', nombre: 'Pauta C', planificacion_id: 'plan-1', fecha_creacion: '2026-01-03' },
];

// ---------------------------------------------------------------------------
// Helper: construye el valor de retorno del store con overrides
// ---------------------------------------------------------------------------

const makeStoreReturnValue = (
    overrides: {
        targets?: Record<string, number>;
        distributions?: Record<string, Record<string, number>>;
        dirty?: boolean;
        selectedPautaId?: string | null;
        loadedPautaId?: string | null;
        autoSelectedPlanifId?: string | null;
    } = {},
) => ({
    targets: { cer: 2 },
    distributions: {},
    activeMeals: ['desayuno', 'almuerzo', 'cena'],
    activeGroups: ['cer', 'veg', 'fru'],
    customFoods: [],
    libreConsumoIds: [],
    customMeals: [],
    mealTimes: {},
    sugerenciasComida: {},
    dirty: false,
    selectedPautaId: null,
    loadedPautaId: null,
    autoSelectedPlanifId: null,
    addCustomMeal: vi.fn(),
    removeCustomMeal: vi.fn(),
    setMealTime: vi.fn(),
    incrementPortion: vi.fn(),
    decrementPortion: vi.fn(),
    setPortion: vi.fn(),
    removeTargetGroup: vi.fn(),
    setInitialPortions: vi.fn(),
    toggleMeal: vi.fn(),
    toggleGroup: vi.fn(),
    resetDistributions: vi.fn(),
    removeSugerenciaComida: vi.fn(),
    seleccionarPauta: vi.fn(),
    marcarPautaGuardada: vi.fn(),
    setLoadedPautaId: vi.fn(),
    setAutoSelectedPlanifId: vi.fn(),
    switchPatient: vi.fn(),
    ...overrides,
});

// ---------------------------------------------------------------------------
// Helper: configura todos los mocks para un escenario dado
// ---------------------------------------------------------------------------

interface SetupOptions {
    activePatient?: typeof PACIENTE | null;
    planificacionActiva?: typeof PLANIFICACION | null;
    targets?: Record<string, number>;
    distributions?: Record<string, Record<string, number>>;
    pautas?: typeof PAUTAS;
    dirty?: boolean;
    selectedPautaId?: string | null;
    loadedPautaId?: string | null;
    pautaDetalle?: any;
}

const setupMocks = ({
    activePatient = PACIENTE,
    planificacionActiva = PLANIFICACION,
    targets = { cer: 2 },
    distributions = {},
    pautas = PAUTAS,
    dirty = false,
    selectedPautaId = null,
    loadedPautaId = null,
    pautaDetalle = undefined,
}: SetupOptions = {}) => {
    // useClinicalStore() — llamado sin selector en el hook
    vi.mocked(useClinicalStore).mockReturnValue({ activePatient } as any);

    // useObjetivosActivos() — mock directo del hook compuesto
    vi.mocked(useObjetivosActivos).mockReturnValue({
        planificacionActiva,
        objetivos: null,
        isLoading: false,
    } as any);

    // usePortionsStore() — devuelve estado controlado (se retorna para asserts)
    const store = makeStoreReturnValue({ targets, distributions, dirty, selectedPautaId, loadedPautaId });
    vi.mocked(usePortionsStore).mockReturnValue(store as any);

    // useQuery — diferencia las dos llamadas por la primera clave
    vi.mocked(useQuery).mockImplementation(({ queryKey }: any) => {
        if (queryKey[0] === 'pautas-lista') return { data: pautas } as any;
        if (queryKey[0] === 'pauta-detalle') return { data: pautaDetalle } as any;
        return { data: undefined } as any;
    });

    // useQueryClient — sólo necesitamos invalidateQueries en guardarPauta
    vi.mocked(useQueryClient).mockReturnValue({
        invalidateQueries: vi.fn(),
    } as any);

    return store;
};

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('usePortions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    // 1. Guards de guardarPauta
    // -------------------------------------------------------------------------

    describe('guardarPauta — guards de validación', () => {
        it('retorna { ok: false } sin llamar al API si activePatient es null', async () => {
            setupMocks({ activePatient: null });

            const { result } = renderHook(() => usePortions());
            let respuesta!: { ok: boolean; message: string };

            await act(async () => {
                respuesta = await result.current.actions.guardarPauta();
            });

            expect(respuesta.ok).toBe(false);
            expect(respuesta.message).toMatch(/paciente/i);
            expect(apiClient.post).not.toHaveBeenCalled();
        });

        it('retorna { ok: false } sin llamar al API si planificacionActiva es null', async () => {
            // distributions con porciones positivas para no activar el guard 3
            setupMocks({
                planificacionActiva: null,
                distributions: { desayuno: { cer: 2 } },
            });

            const { result } = renderHook(() => usePortions());
            let respuesta!: { ok: boolean; message: string };

            await act(async () => {
                respuesta = await result.current.actions.guardarPauta();
            });

            expect(respuesta.ok).toBe(false);
            expect(respuesta.message).toMatch(/planificaci[oó]n/i);
            expect(apiClient.post).not.toHaveBeenCalled();
        });

        it('retorna { ok: false } sin llamar al API si distributions está vacío {}', async () => {
            setupMocks({ distributions: {} });

            const { result } = renderHook(() => usePortions());
            let respuesta!: { ok: boolean; message: string };

            await act(async () => {
                respuesta = await result.current.actions.guardarPauta();
            });

            expect(respuesta.ok).toBe(false);
            expect(respuesta.message).toMatch(/porciones/i);
            expect(apiClient.post).not.toHaveBeenCalled();
        });

        it('retorna { ok: false } sin llamar al API si todas las porciones son 0', async () => {
            setupMocks({
                distributions: {
                    desayuno: { cer: 0, veg: 0 },
                    almuerzo: { cer: 0 },
                },
            });

            const { result } = renderHook(() => usePortions());
            let respuesta!: { ok: boolean; message: string };

            await act(async () => {
                respuesta = await result.current.actions.guardarPauta();
            });

            expect(respuesta.ok).toBe(false);
            expect(apiClient.post).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // 2. Cálculos computados — getGroupTotal y getGroupBalance
    // -------------------------------------------------------------------------

    describe('computed: getGroupTotal y getGroupBalance (target de "cer" = 2)', () => {
        it('retorna "exact" cuando la suma de distribuciones iguala el target', () => {
            setupMocks({
                targets: { cer: 2 },
                distributions: { desayuno: { cer: 1 }, almuerzo: { cer: 1 } },
            });

            const { result } = renderHook(() => usePortions());

            expect(result.current.computed.getGroupTotal('cer')).toBe(2);
            expect(result.current.computed.getGroupBalance('cer')).toBe('exact');
        });

        it('retorna "over" cuando la suma de distribuciones supera el target', () => {
            setupMocks({
                targets: { cer: 2 },
                distributions: { desayuno: { cer: 2 }, almuerzo: { cer: 1 } },
            });

            const { result } = renderHook(() => usePortions());

            expect(result.current.computed.getGroupTotal('cer')).toBe(3);
            expect(result.current.computed.getGroupBalance('cer')).toBe('over');
        });

        it('retorna "under" cuando la suma de distribuciones no alcanza el target', () => {
            setupMocks({
                targets: { cer: 2 },
                distributions: { desayuno: { cer: 1 } },
            });

            const { result } = renderHook(() => usePortions());

            expect(result.current.computed.getGroupTotal('cer')).toBe(1);
            expect(result.current.computed.getGroupBalance('cer')).toBe('under');
        });

        it('no lanza error y retorna "under" cuando el target del grupo es undefined', () => {
            // targets vacío → targets['cer'] === undefined
            setupMocks({
                targets: {},
                distributions: { desayuno: { cer: 1 } },
            });

            const { result } = renderHook(() => usePortions());

            // La comparación `total > undefined` produce NaN → falsy → rama 'under'
            expect(() => result.current.computed.getGroupBalance('cer')).not.toThrow();
            expect(result.current.computed.getGroupBalance('cer')).toBe('under');
        });
    });

    // -------------------------------------------------------------------------
    // 3. Filtrado de state.pautas (pautasDeActiva)
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // 3. Protección de cambios locales (dirty) — bug "azúcar vuelve a 0"
    // -------------------------------------------------------------------------

    describe('protección de cambios sin guardar (dirty)', () => {
        const GRID_GUARDADO = {
            estructura_grid_json: {
                targets: { cer: 4 },
                distributions: { desayuno: { cer: 1 } },
                activeMeals: ['desayuno'],
                activeGroups: ['cer'],
            },
        };

        it('auto-selecciona la pauta más reciente de la planificación cuando el estado está limpio', () => {
            const store = setupMocks({ dirty: false });
            renderHook(() => usePortions());

            expect(store.setAutoSelectedPlanifId).toHaveBeenCalledWith('plan-1');
            // pauta-1 es la primera de la lista filtrada por plan-1
            expect(store.seleccionarPauta).toHaveBeenCalledWith('pauta-1');
        });

        it('NO auto-selecciona pauta cuando hay cambios sin guardar (dirty=true)', () => {
            const store = setupMocks({ dirty: true });
            renderHook(() => usePortions());

            expect(store.seleccionarPauta).not.toHaveBeenCalled();
        });

        it('carga el detalle de la pauta seleccionada al store cuando está limpio', () => {
            const store = setupMocks({
                dirty: false,
                selectedPautaId: 'pauta-1',
                loadedPautaId: null,
                pautaDetalle: GRID_GUARDADO,
            });
            renderHook(() => usePortions());

            expect(store.setInitialPortions).toHaveBeenCalledWith(
                expect.objectContaining({ targets: { cer: 4 } }),
            );
            expect(store.setLoadedPautaId).toHaveBeenCalledWith('pauta-1');
        });

        it('NO pisa el store con la pauta guardada cuando dirty=true', () => {
            const store = setupMocks({
                dirty: true,
                selectedPautaId: 'pauta-1',
                loadedPautaId: null,
                pautaDetalle: GRID_GUARDADO,
            });
            renderHook(() => usePortions());

            expect(store.setInitialPortions).not.toHaveBeenCalled();
        });

        it('NO recarga una pauta que ya está cargada (loadedPautaId === selectedPautaId)', () => {
            const store = setupMocks({
                dirty: false,
                selectedPautaId: 'pauta-1',
                loadedPautaId: 'pauta-1',
                pautaDetalle: GRID_GUARDADO,
            });
            renderHook(() => usePortions());

            expect(store.setInitialPortions).not.toHaveBeenCalled();
        });

        it('registra el paciente activo en el store (switchPatient) al montar', () => {
            const store = setupMocks();
            renderHook(() => usePortions());

            expect(store.switchPatient).toHaveBeenCalledWith('paciente-1');
        });
    });

    describe('state.pautas — filtrado por planificación activa', () => {
        it('retorna TODAS las pautas cuando planificacionActiva es null', () => {
            setupMocks({ planificacionActiva: null, pautas: PAUTAS });

            const { result } = renderHook(() => usePortions());

            // !planificacionActiva === true → el filtro deja pasar todas
            expect(result.current.state.pautas).toHaveLength(PAUTAS.length);
            expect(result.current.state.pautas).toEqual(PAUTAS);
        });

        it('retorna SOLO las pautas con planificacion_id === plan-1 cuando hay planificación activa', () => {
            setupMocks({ planificacionActiva: PLANIFICACION, pautas: PAUTAS }); // id: 'plan-1'

            const { result } = renderHook(() => usePortions());

            const filtradas = result.current.state.pautas;
            expect(filtradas.every((p) => p.planificacion_id === 'plan-1')).toBe(true);
            // pauta-1 y pauta-3 pertenecen a plan-1; pauta-2 pertenece a plan-2
            expect(filtradas).toHaveLength(2);
            expect(filtradas.map((p) => p.id)).toEqual(['pauta-1', 'pauta-3']);
        });
    });
});
