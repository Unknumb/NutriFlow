import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VistaPauta } from './VistaPauta';

const mockUsePortions = vi.hoisted(() => vi.fn());
const mockComidasOrdenadas = vi.hoisted(() => vi.fn());

vi.mock('../hooks/usePortions', () => ({
  usePortions: mockUsePortions,
}));

vi.mock('../constants', () => ({
  NUTRITION_GROUPS: [
    {
      id: 'fru',
      label: 'Frutas',
      emoji: '🍎',
      cellBg: 'bg-red-100',
      textBtn: 'text-red-700',
    },
    {
      id: 'cer',
      label: 'Cereales',
      emoji: '🌾',
      cellBg: 'bg-yellow-100',
      textBtn: 'text-yellow-700',
    },
  ],
  comidasOrdenadas: mockComidasOrdenadas,
}));

const MEALS = [
  { id: 'desayuno', name: 'Desayuno', time: '07:00 - 08:00' },
  { id: 'almuerzo', name: 'Almuerzo', time: '13:00' },
];

const BASE_STATE = {
  patientContext: { name: 'Ana García' },
  distributions: {
    desayuno: { fru: 2, cer: 1 },
    almuerzo: {},
  },
  targets: { fru: 3, cer: 4 },
  activeMeals: ['desayuno', 'almuerzo'],
  customFoods: [],
  customMeals: [],
  mealTimes: {},
  sugerenciasComida: {},
};

const BASE_COMPUTED = {
  getGroupTotal: (id: string) => (id === 'fru' ? 2 : 1),
};

const BASE_ACTIONS = {
  removeSugerenciaComida: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockComidasOrdenadas.mockReturnValue(MEALS);
  mockUsePortions.mockReturnValue({ state: BASE_STATE, computed: BASE_COMPUTED, actions: BASE_ACTIONS });
});

describe('VistaPauta', () => {
  describe('encabezado', () => {
    it('muestra el título "Pauta de Alimentación"', () => {
      render(<VistaPauta />);
      expect(screen.getByText('Pauta de Alimentación')).toBeInTheDocument();
    });

    it('muestra el nombre del paciente', () => {
      render(<VistaPauta />);
      expect(screen.getByText('Ana García')).toBeInTheDocument();
    });
  });

  describe('encabezados de tabla', () => {
    it('muestra el encabezado HORA', () => {
      render(<VistaPauta />);
      expect(screen.getByText('HORA')).toBeInTheDocument();
    });

    it('muestra el encabezado COMIDA', () => {
      render(<VistaPauta />);
      expect(screen.getByText('COMIDA')).toBeInTheDocument();
    });

    it('muestra el encabezado PORCIÓN', () => {
      render(<VistaPauta />);
      expect(screen.getByText('PORCIÓN')).toBeInTheDocument();
    });
  });

  describe('filas de comidas', () => {
    it('muestra el nombre de cada comida', () => {
      render(<VistaPauta />);
      expect(screen.getAllByText('Desayuno')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Almuerzo')[0]).toBeInTheDocument();
    });

    it('muestra "Sin porciones asignadas" cuando la comida no tiene distribuciones activas', () => {
      render(<VistaPauta />);
      expect(screen.getAllByText('Sin porciones asignadas')[0]).toBeInTheDocument();
    });

    it('muestra el label del grupo en la celda de porción (Desayuno tiene Frutas)', () => {
      render(<VistaPauta />);
      expect(screen.getAllByText('Frutas').length).toBeGreaterThan(0);
    });

    it('muestra la cantidad asignada (desayuno.fru = 2)', () => {
      render(<VistaPauta />);
      const spans = screen.getAllByText('2');
      expect(spans.length).toBeGreaterThan(0);
    });
  });

  describe('resumen diario', () => {
    it('muestra la sección "Resumen porciones diarias"', () => {
      render(<VistaPauta />);
      expect(screen.getByText(/Resumen porciones diarias/i)).toBeInTheDocument();
    });

    it('muestra el emoji del grupo en el resumen', () => {
      render(<VistaPauta />);
      expect(screen.getByText('🍎')).toBeInTheDocument();
    });

    it('muestra la relación total/meta en el resumen (getGroupTotal(fru)=2 con target=3 → "2/3")', () => {
      render(<VistaPauta />);
      expect(screen.getByText('2/3')).toBeInTheDocument();
    });
  });

  describe('sugerencias del generador', () => {
    const conSugerencias = {
      ...BASE_STATE,
      sugerenciasComida: {
        desayuno: [{ id: 's-1', nombre: 'Avena con frutas', ingredientes: 'Avena (80g)' }],
      },
    };

    it('muestra los ejemplos de preparación de la comida', () => {
      mockUsePortions.mockReturnValue({ state: conSugerencias, computed: BASE_COMPUTED, actions: BASE_ACTIONS });
      render(<VistaPauta />);
      expect(screen.getAllByText('Ejemplos de preparación')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Avena con frutas')[0]).toBeInTheDocument();
    });

    it('permite quitar una sugerencia de la pauta', () => {
      mockUsePortions.mockReturnValue({ state: conSugerencias, computed: BASE_COMPUTED, actions: BASE_ACTIONS });
      render(<VistaPauta />);
      fireEvent.click(screen.getAllByRole('button', { name: 'Quitar sugerencia Avena con frutas' })[0]);
      expect(BASE_ACTIONS.removeSugerenciaComida).toHaveBeenCalledWith('desayuno', 's-1');
    });

    it('no muestra la sección cuando no hay sugerencias', () => {
      render(<VistaPauta />);
      expect(screen.queryByText('Ejemplos de preparación')).not.toBeInTheDocument();
    });
  });
});
