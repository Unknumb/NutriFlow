import { describe, it, expect, beforeEach } from 'vitest';
import { usePortionsStore, CustomFoodDef } from './usePortionsStore';

// Captura el estado inicial UNA sola vez para resetearlo de forma determinista
const initialState = usePortionsStore.getState();

beforeEach(() => {
    usePortionsStore.setState(initialState, true);
});

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const makeCustomFood = (id: string): CustomFoodDef => ({
    id,
    title: `Alimento ${id}`,
    kcal: 100,
    macros: { p: 5, c: 10, g: 3 },
    theme: { bgMain: 'bg-white', bgHeader: 'bg-gray-400', border: 'border-gray-400', text: '' },
    emoji: '🍎',
    label: `Label ${id}`,
    headerBg: 'bg-gray-400',
    targetBg: 'bg-gray-200',
    cellBg: 'bg-gray-100',
    textBtn: 'text-gray-800',
});

// ---------------------------------------------------------------------------
// 1. Aislamiento — baseline limpio
// ---------------------------------------------------------------------------

describe('estado inicial', () => {
    it('arranca con targets y distributions vacíos', () => {
        const { targets, distributions } = usePortionsStore.getState();
        expect(targets).toEqual({});
        expect(distributions).toEqual({});
    });

    it('arranca con las comidas por defecto en activeMeals', () => {
        const { activeMeals } = usePortionsStore.getState();
        expect(activeMeals).toEqual([
            'desayuno', 'colacion_am', 'almuerzo', 'colacion_pm', 'once', 'cena',
        ]);
    });

    it('arranca con libreConsumoIds vacío', () => {
        expect(usePortionsStore.getState().libreConsumoIds).toEqual([]);
    });
});

// ---------------------------------------------------------------------------
// 2. Seguridad matemática — porciones
// ---------------------------------------------------------------------------

describe('decrementPortion — seguridad matemática', () => {
    it('no decrementa cuando la porción ya es 0 (guard current <= 0)', () => {
        // Estado: sin distribuciones → current == 0
        usePortionsStore.getState().decrementPortion('desayuno', 'cer');

        const dist = usePortionsStore.getState().distributions;
        // La distribución no debe aparecer (o si aparece, no debe ser negativa)
        const valor = dist['desayuno']?.['cer'];
        expect(valor === undefined || valor >= 0).toBe(true);
    });

    it('no decrementa cuando la porción ya es explícitamente 0', () => {
        usePortionsStore.setState({
            distributions: { desayuno: { cer: 0 } },
        });
        usePortionsStore.getState().decrementPortion('desayuno', 'cer');
        expect(usePortionsStore.getState().distributions['desayuno']['cer']).toBe(0);
    });

    it('no produce valores negativos en secuencia de decrementos excesivos', () => {
        usePortionsStore.setState({ distributions: { desayuno: { cer: 0.5 } } });
        const { decrementPortion } = usePortionsStore.getState();
        decrementPortion('desayuno', 'cer'); // llega a 0
        decrementPortion('desayuno', 'cer'); // intento de pasar a negativo — debe bloquearse
        decrementPortion('desayuno', 'cer');

        const valor = usePortionsStore.getState().distributions['desayuno']['cer'];
        expect(valor).toBeGreaterThanOrEqual(0);
    });

    it('decrementa correctamente cuando hay valor positivo', () => {
        usePortionsStore.setState({ distributions: { desayuno: { cer: 2 } } });
        usePortionsStore.getState().decrementPortion('desayuno', 'cer');
        expect(usePortionsStore.getState().distributions['desayuno']['cer']).toBe(1.5);
    });
});

describe('setPortion — seguridad matemática', () => {
    it('aplica Math.max(0, value) para valores negativos', () => {
        usePortionsStore.getState().setPortion('desayuno', 'cer', -5);
        expect(usePortionsStore.getState().distributions['desayuno']['cer']).toBe(0);
    });

    it('acepta valores positivos sin alterar', () => {
        usePortionsStore.getState().setPortion('almuerzo', 'veg', 3.5);
        expect(usePortionsStore.getState().distributions['almuerzo']['veg']).toBe(3.5);
    });
});

// ---------------------------------------------------------------------------
// 3. Seguridad matemática — targets
// ---------------------------------------------------------------------------

describe('decrementTarget — seguridad matemática', () => {
    it('no decrementa cuando el target es 0', () => {
        usePortionsStore.setState({ targets: { cer: 0 } });
        usePortionsStore.getState().decrementTarget('cer');
        expect(usePortionsStore.getState().targets['cer']).toBe(0);
    });

    it('no decrementa cuando el target no existe (current === 0 por defecto)', () => {
        usePortionsStore.getState().decrementTarget('grupo_que_no_existe');
        // El grupo no debe aparecer con un valor negativo
        const val = usePortionsStore.getState().targets['grupo_que_no_existe'];
        expect(val === undefined || val >= 0).toBe(true);
    });

    it('decrementa en 0.5 cuando hay valor positivo', () => {
        usePortionsStore.setState({ targets: { cer: 3 } });
        usePortionsStore.getState().decrementTarget('cer');
        expect(usePortionsStore.getState().targets['cer']).toBe(2.5);
    });

    it('no pasa de 0.5 a negativo', () => {
        usePortionsStore.setState({ targets: { cer: 0.5 } });
        const { decrementTarget } = usePortionsStore.getState();
        decrementTarget('cer'); // llega a 0
        decrementTarget('cer'); // debe bloquearse
        expect(usePortionsStore.getState().targets['cer']).toBe(0);
    });
});

// ---------------------------------------------------------------------------
// 4. Limpieza en cascada — removeCustomMeal
// ---------------------------------------------------------------------------

describe('removeCustomMeal — limpieza en cascada', () => {
    beforeEach(() => {
        // Configuramos un estado con una comida personalizada ya añadida
        usePortionsStore.setState({
            customMeals: [{ id: 'meal-1', name: 'Merienda', time: '17:00' }],
            activeMeals: ['desayuno', 'meal-1'],
            distributions: {
                desayuno: { cer: 2 },
                'meal-1': { fru: 1, ace: 3 },
            },
            mealTimes: { desayuno: '08:00', 'meal-1': '17:00' },
        });
    });

    it('elimina la comida de customMeals', () => {
        usePortionsStore.getState().removeCustomMeal('meal-1');
        const { customMeals } = usePortionsStore.getState();
        expect(customMeals.find(m => m.id === 'meal-1')).toBeUndefined();
        expect(customMeals).toHaveLength(0);
    });

    it('elimina la comida de activeMeals', () => {
        usePortionsStore.getState().removeCustomMeal('meal-1');
        expect(usePortionsStore.getState().activeMeals).not.toContain('meal-1');
        expect(usePortionsStore.getState().activeMeals).toContain('desayuno');
    });

    it('elimina las distribuciones asociadas a la comida', () => {
        usePortionsStore.getState().removeCustomMeal('meal-1');
        expect(usePortionsStore.getState().distributions).not.toHaveProperty('meal-1');
    });

    it('conserva las distribuciones de otras comidas intactas', () => {
        usePortionsStore.getState().removeCustomMeal('meal-1');
        expect(usePortionsStore.getState().distributions['desayuno']).toEqual({ cer: 2 });
    });

    it('elimina el mealTime asociado a la comida', () => {
        usePortionsStore.getState().removeCustomMeal('meal-1');
        expect(usePortionsStore.getState().mealTimes).not.toHaveProperty('meal-1');
    });

    it('conserva los mealTimes de otras comidas', () => {
        usePortionsStore.getState().removeCustomMeal('meal-1');
        expect(usePortionsStore.getState().mealTimes['desayuno']).toBe('08:00');
    });
});

// ---------------------------------------------------------------------------
// 5. Limpieza en cascada — removeCustomFood
// ---------------------------------------------------------------------------

describe('removeCustomFood — limpieza en cascada', () => {
    beforeEach(() => {
        usePortionsStore.setState({
            customFoods: [makeCustomFood('alimento-x'), makeCustomFood('alimento-y')],
            targets: { cer: 3, 'alimento-x': 5, 'alimento-y': 2 },
            distributions: {
                desayuno: { cer: 1, 'alimento-x': 2 },
                almuerzo: { cer: 2, 'alimento-x': 1, 'alimento-y': 1 },
            },
        });
    });

    it('elimina el alimento de customFoods', () => {
        usePortionsStore.getState().removeCustomFood('alimento-x');
        const foods = usePortionsStore.getState().customFoods;
        expect(foods.find(f => f.id === 'alimento-x')).toBeUndefined();
        expect(foods.find(f => f.id === 'alimento-y')).toBeDefined();
    });

    it('elimina el target del alimento borrado', () => {
        usePortionsStore.getState().removeCustomFood('alimento-x');
        expect(usePortionsStore.getState().targets).not.toHaveProperty('alimento-x');
    });

    it('conserva targets de otros grupos intactos', () => {
        usePortionsStore.getState().removeCustomFood('alimento-x');
        const { targets } = usePortionsStore.getState();
        expect(targets['cer']).toBe(3);
        expect(targets['alimento-y']).toBe(2);
    });

    it('elimina las distribuciones del alimento en todas las comidas', () => {
        usePortionsStore.getState().removeCustomFood('alimento-x');
        const { distributions } = usePortionsStore.getState();
        expect(distributions['desayuno']).not.toHaveProperty('alimento-x');
        expect(distributions['almuerzo']).not.toHaveProperty('alimento-x');
    });

    it('conserva distribuciones de otros alimentos intactas', () => {
        usePortionsStore.getState().removeCustomFood('alimento-x');
        const { distributions } = usePortionsStore.getState();
        expect(distributions['desayuno']['cer']).toBe(1);
        expect(distributions['almuerzo']['cer']).toBe(2);
        expect(distributions['almuerzo']['alimento-y']).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// 6. Restauración y fallbacks — setInitialPortions
// ---------------------------------------------------------------------------

describe('setInitialPortions — restauración y fallbacks', () => {
    it('restaura targets, distributions, activeMeals y activeGroups correctamente', () => {
        usePortionsStore.getState().setInitialPortions({
            targets: { cer: 6, veg: 3 },
            distributions: { desayuno: { cer: 2 } },
            activeMeals: ['desayuno', 'almuerzo'],
            activeGroups: ['cer', 'veg'],
            libreConsumoIds: ['veg'],
        });

        const state = usePortionsStore.getState();
        expect(state.targets).toEqual({ cer: 6, veg: 3 });
        expect(state.distributions).toEqual({ desayuno: { cer: 2 } });
        expect(state.activeMeals).toEqual(['desayuno', 'almuerzo']);
        expect(state.activeGroups).toEqual(['cer', 'veg']);
        expect(state.libreConsumoIds).toEqual(['veg']);
    });

    it('fallback: libreConsumoIds queda [] cuando el payload no lo incluye (pauta antigua)', () => {
        // Simulamos una pauta antigua que no tiene libreConsumoIds en el payload
        usePortionsStore.getState().setInitialPortions({
            targets: { cer: 4 },
            distributions: {},
            activeMeals: ['desayuno'],
            activeGroups: ['cer'],
            // libreConsumoIds deliberadamente ausente
        });

        expect(usePortionsStore.getState().libreConsumoIds).toEqual([]);
        expect(usePortionsStore.getState().libreConsumoIds).not.toBeUndefined();
    });

    it('fallback: customMeals queda [] cuando el payload no lo incluye', () => {
        usePortionsStore.getState().setInitialPortions({
            targets: {},
            distributions: {},
            activeMeals: [],
            activeGroups: [],
        });
        expect(usePortionsStore.getState().customMeals).toEqual([]);
    });

    it('fallback: mealTimes queda {} cuando el payload no lo incluye', () => {
        usePortionsStore.getState().setInitialPortions({
            targets: {},
            distributions: {},
            activeMeals: [],
            activeGroups: [],
        });
        expect(usePortionsStore.getState().mealTimes).toEqual({});
    });

    it('restaura customMeals y mealTimes cuando el payload los incluye', () => {
        const customMeals = [{ id: 'meal-99', name: 'Snack noche', time: '21:00' }];
        const mealTimes = { desayuno: '07:30', 'meal-99': '21:00' };

        usePortionsStore.getState().setInitialPortions({
            targets: {},
            distributions: {},
            activeMeals: ['desayuno', 'meal-99'],
            activeGroups: [],
            customMeals,
            mealTimes,
        });

        expect(usePortionsStore.getState().customMeals).toEqual(customMeals);
        expect(usePortionsStore.getState().mealTimes).toEqual(mealTimes);
    });
});

// ---------------------------------------------------------------------------
// 7. Flujos complementarios — addCustomMeal, toggleLibreConsumo, incrementPortion
// ---------------------------------------------------------------------------

describe('addCustomMeal', () => {
    it('añade la comida a customMeals y activeMeals con id único', () => {
        usePortionsStore.getState().addCustomMeal('Merienda', '17:00');
        const { customMeals, activeMeals } = usePortionsStore.getState();
        expect(customMeals).toHaveLength(1);
        expect(customMeals[0].name).toBe('Merienda');
        expect(customMeals[0].time).toBe('17:00');
        expect(activeMeals).toContain(customMeals[0].id);
    });

    it('hace trim al nombre y al horario', () => {
        usePortionsStore.getState().addCustomMeal('  Colación  ', ' 10:30 ');
        const { customMeals } = usePortionsStore.getState();
        expect(customMeals[0].name).toBe('Colación');
        expect(customMeals[0].time).toBe('10:30');
    });
});

describe('toggleLibreConsumo', () => {
    it('agrega el groupId si no estaba marcado', () => {
        usePortionsStore.getState().toggleLibreConsumo('veg');
        expect(usePortionsStore.getState().libreConsumoIds).toContain('veg');
    });

    it('quita el groupId si ya estaba marcado (toggle off)', () => {
        usePortionsStore.setState({ libreConsumoIds: ['veg'] });
        usePortionsStore.getState().toggleLibreConsumo('veg');
        expect(usePortionsStore.getState().libreConsumoIds).not.toContain('veg');
    });
});

describe('dirty — protección de cambios sin guardar', () => {
    it('arranca limpio (dirty=false)', () => {
        expect(usePortionsStore.getState().dirty).toBe(false);
    });

    it('las mutaciones del plan marcan dirty=true', () => {
        usePortionsStore.getState().incrementTarget('cer');
        expect(usePortionsStore.getState().dirty).toBe(true);
    });

    it('setPortion y setTargets marcan dirty=true', () => {
        usePortionsStore.getState().setPortion('desayuno', 'cer', 2);
        expect(usePortionsStore.getState().dirty).toBe(true);

        usePortionsStore.setState({ dirty: false });
        usePortionsStore.getState().setTargets({ veg: 3 });
        expect(usePortionsStore.getState().dirty).toBe(true);
    });

    it('setInitialPortions (cargar pauta guardada) deja el estado limpio', () => {
        usePortionsStore.getState().incrementTarget('cer');
        usePortionsStore.getState().setInitialPortions({
            targets: { cer: 4 },
            distributions: {},
            activeMeals: ['desayuno'],
            activeGroups: ['cer'],
        });
        expect(usePortionsStore.getState().dirty).toBe(false);
    });

    it('seleccionarPauta descarta dirty y fuerza recarga (loadedPautaId=null)', () => {
        usePortionsStore.setState({ dirty: true, loadedPautaId: 'pauta-vieja' });
        usePortionsStore.getState().seleccionarPauta('pauta-9');
        const s = usePortionsStore.getState();
        expect(s.selectedPautaId).toBe('pauta-9');
        expect(s.loadedPautaId).toBeNull();
        expect(s.dirty).toBe(false);
    });

    it('marcarPautaGuardada deja la pauta como seleccionada/cargada y limpia', () => {
        usePortionsStore.setState({ dirty: true });
        usePortionsStore.getState().marcarPautaGuardada('pauta-7');
        const s = usePortionsStore.getState();
        expect(s.selectedPautaId).toBe('pauta-7');
        expect(s.loadedPautaId).toBe('pauta-7');
        expect(s.dirty).toBe(false);
    });
});

describe('switchPatient — barrera entre pacientes', () => {
    it('descarta el plan en construcción al cambiar de paciente', () => {
        usePortionsStore.setState({
            loadedPatientId: 'paciente-a',
            targets: { azu: 2 },
            distributions: { desayuno: { azu: 1 } },
            dirty: true,
        });
        usePortionsStore.getState().switchPatient('paciente-b');
        const s = usePortionsStore.getState();
        expect(s.targets).toEqual({});
        expect(s.distributions).toEqual({});
        expect(s.dirty).toBe(false);
        expect(s.loadedPatientId).toBe('paciente-b');
    });

    it('es idempotente para el mismo paciente (no pierde el trabajo)', () => {
        usePortionsStore.setState({
            loadedPatientId: 'paciente-a',
            targets: { azu: 2 },
            dirty: true,
        });
        usePortionsStore.getState().switchPatient('paciente-a');
        const s = usePortionsStore.getState();
        expect(s.targets).toEqual({ azu: 2 });
        expect(s.dirty).toBe(true);
    });
});

describe('incrementPortion', () => {
    it('incrementa en 0.5 desde cero', () => {
        usePortionsStore.getState().incrementPortion('desayuno', 'cer');
        expect(usePortionsStore.getState().distributions['desayuno']['cer']).toBe(0.5);
    });

    it('acumula correctamente sobre un valor existente', () => {
        usePortionsStore.setState({ distributions: { desayuno: { cer: 2 } } });
        usePortionsStore.getState().incrementPortion('desayuno', 'cer');
        expect(usePortionsStore.getState().distributions['desayuno']['cer']).toBe(2.5);
    });
});
