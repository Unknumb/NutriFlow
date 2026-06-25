import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PortionsTable } from './PortionsTable';

// ── dnd-kit: mock completo para que no explote en jsdom ──────────────────────
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <>{children}</>,
  DragOverlay: () => null,
  useSensor: () => ({}),
  useSensors: (...args: any[]) => args,
  MouseSensor: class {},
  TouchSensor: class {},
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}));

// ── subcomponentes con DnD interno ───────────────────────────────────────────
vi.mock('./DraggableGroupHeader', () => ({
  DraggableGroupHeader: ({ group }: any) => (
    <th data-testid={`group-header-${group.id}`}>{group.label}</th>
  ),
}));

vi.mock('./DroppableMealRow', () => ({
  DroppableMealRow: ({ children }: any) => <tr>{children}</tr>,
}));

vi.mock('./PortionCell', () => ({
  PortionCell: ({ value }: any) => (
    <div data-testid="portion-cell">{value}</div>
  ),
}));

// ── hooks y constantes ────────────────────────────────────────────────────────
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
      headerBg: 'bg-red-400',
      targetBg: 'bg-red-500',
      cellBg: 'bg-red-100',
      textBtn: 'text-red-700',
    },
    {
      id: 'cer',
      label: 'Cereales',
      emoji: '🌾',
      headerBg: 'bg-yellow-400',
      targetBg: 'bg-yellow-500',
      cellBg: 'bg-yellow-100',
      textBtn: 'text-yellow-700',
    },
  ],
  comidasOrdenadas: mockComidasOrdenadas,
}));

vi.mock('lucide-react', () => ({
  Info: () => <span data-testid="icon-info" />,
  CheckCircle: () => <span data-testid="icon-check" />,
}));

const MEALS = [
  { id: 'desayuno', name: 'Desayuno', time: '07:00' },
  { id: 'almuerzo', name: 'Almuerzo', time: '13:00' },
];

const buildState = (overrides: Partial<any> = {}) => ({
  targets: { fru: 3, cer: 2 },
  distributions: {
    desayuno: { fru: 2, cer: 1 },
    almuerzo: { fru: 1, cer: 1 },
  },
  activeMeals: ['desayuno', 'almuerzo'],
  customFoods: [],
  customMeals: [],
  mealTimes: {},
  ...overrides,
});

const buildComputed = (overrides: Partial<any> = {}) => ({
  getGroupTotal: (id: string) => (id === 'fru' ? 3 : 2),
  getGroupBalance: (id: string) => (id === 'fru' ? 'exact' : 'under'),
  ...overrides,
});

const buildActions = () => ({
  incrementPortion: vi.fn(),
  decrementPortion: vi.fn(),
  setPortion: vi.fn(),
});

beforeEach(() => {
  vi.clearAllMocks();
  mockComidasOrdenadas.mockReturnValue(MEALS);
  mockUsePortions.mockReturnValue({
    state: buildState(),
    actions: buildActions(),
    computed: buildComputed(),
  });
});

describe('PortionsTable', () => {
  describe('estado vacío', () => {
    it('muestra el aviso cuando no hay grupos visibles (targets vacíos)', () => {
      mockUsePortions.mockReturnValue({
        state: buildState({ targets: {} }),
        actions: buildActions(),
        computed: buildComputed(),
      });
      render(<PortionsTable />);
      expect(
        screen.getByText('Aún no has asignado porciones en el Armador de Pautas.'),
      ).toBeInTheDocument();
    });
  });

  describe('encabezado de instrucciones', () => {
    it('muestra el icono de información', () => {
      render(<PortionsTable />);
      expect(screen.getByTestId('icon-info')).toBeInTheDocument();
    });

    it('muestra el texto "¿Cómo asignar porciones?"', () => {
      render(<PortionsTable />);
      expect(screen.getByText(/¿Cómo asignar porciones\?/i)).toBeInTheDocument();
    });
  });

  describe('encabezados de grupos', () => {
    it('muestra el DraggableGroupHeader para cada grupo visible', () => {
      render(<PortionsTable />);
      expect(screen.getByTestId('group-header-fru')).toBeInTheDocument();
      expect(screen.getByTestId('group-header-cer')).toBeInTheDocument();
    });

    it('muestra el label del grupo en el encabezado', () => {
      render(<PortionsTable />);
      expect(screen.getByText('Frutas')).toBeInTheDocument();
      expect(screen.getByText('Cereales')).toBeInTheDocument();
    });
  });

  describe('filas de comidas', () => {
    it('muestra el nombre de cada comida activa', () => {
      render(<PortionsTable />);
      expect(screen.getByText('Desayuno')).toBeInTheDocument();
      expect(screen.getByText('Almuerzo')).toBeInTheDocument();
    });

    it('renderiza celdas de porción para cada comida+grupo', () => {
      render(<PortionsTable />);
      const cells = screen.getAllByTestId('portion-cell');
      // 2 comidas × 2 grupos = 4 celdas
      expect(cells.length).toBe(4);
    });
  });

  describe('fila de totales', () => {
    it('muestra la etiqueta "Total"', () => {
      render(<PortionsTable />);
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('muestra el total de porciones de cada grupo (getGroupTotal)', () => {
      render(<PortionsTable />);
      // fru total = 3, cer total = 2 — pueden haber múltiples "3" y "2" (meta + total)
      expect(screen.getAllByText('3').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });
  });

  describe('fila de balance', () => {
    it('muestra la etiqueta "Balance"', () => {
      render(<PortionsTable />);
      expect(screen.getByText('Balance')).toBeInTheDocument();
    });

    it('muestra el ícono de check cuando balance=exact', () => {
      // fru → exact (también aparece en la leyenda inferior)
      render(<PortionsTable />);
      expect(screen.getAllByTestId('icon-check').length).toBeGreaterThan(0);
    });

    it('muestra "-" cuando balance=under', () => {
      // cer → under
      render(<PortionsTable />);
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('muestra "+" cuando balance=over', () => {
      mockUsePortions.mockReturnValue({
        state: buildState(),
        actions: buildActions(),
        computed: buildComputed({ getGroupBalance: () => 'over' }),
      });
      render(<PortionsTable />);
      expect(screen.getAllByText('+').length).toBeGreaterThan(0);
    });
  });

  describe('leyenda inferior', () => {
    it('muestra el texto "Balance exacto"', () => {
      render(<PortionsTable />);
      expect(screen.getByText('Balance exacto')).toBeInTheDocument();
    });

    it('muestra el texto "Sin asignar"', () => {
      render(<PortionsTable />);
      expect(screen.getByText('Sin asignar')).toBeInTheDocument();
    });

    it('muestra el texto "Excede meta"', () => {
      render(<PortionsTable />);
      expect(screen.getByText('Excede meta')).toBeInTheDocument();
    });
  });
});
