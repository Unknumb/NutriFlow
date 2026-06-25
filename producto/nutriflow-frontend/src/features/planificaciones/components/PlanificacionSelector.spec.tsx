import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlanificacionSelector } from './PlanificacionSelector';

// ── hoisted mocks ──────────────────────────────────────────────────────────
const mockMutate = vi.hoisted(() => vi.fn());
const mockSetActivePlanificacionId = vi.hoisted(() => vi.fn());
const mockUseClinicalStore = vi.hoisted(() => vi.fn());
const mockUsePlanificaciones = vi.hoisted(() => vi.fn());
const mockUseSetActivaPlanificacion = vi.hoisted(() => vi.fn());
const mockUseObjetivosActivos = vi.hoisted(() => vi.fn());

vi.mock('../../../shared/store/useClinicalStore', () => ({
  useClinicalStore: mockUseClinicalStore,
}));

vi.mock('../hooks/usePlanificaciones', () => ({
  usePlanificaciones: mockUsePlanificaciones,
  useSetActivaPlanificacion: mockUseSetActivaPlanificacion,
}));

vi.mock('../hooks/useObjetivosActivos', () => ({
  useObjetivosActivos: mockUseObjetivosActivos,
}));

vi.mock('lucide-react', () => ({
  Layers: () => <span data-testid="icon-layers" />,
  Loader2: () => <span data-testid="icon-loader" />,
}));

// ── datos de prueba ────────────────────────────────────────────────────────
const PLANES = [
  { id: 'plan-1', paciente_id: 'p-1', nombre: 'Plan A', calorias_totales: 2000 },
  { id: 'plan-2', paciente_id: 'p-1', nombre: 'Plan B', calorias_totales: 1800.5 },
];

const PACIENTE_ACTIVO = { id: 'p-1', nombre: 'Ana González' };

function setupMocks({
  activePatient = PACIENTE_ACTIVO as any,
  planes = PLANES as any[],
  isLoading = false,
  planActiva = { id: 'plan-2' } as any,
  isPending = false,
} = {}) {
  mockUseClinicalStore.mockImplementation((selector: any) =>
    selector({ activePatient, setActivePlanificacionId: mockSetActivePlanificacionId }),
  );
  mockUsePlanificaciones.mockReturnValue({ data: planes, isLoading });
  mockUseSetActivaPlanificacion.mockReturnValue({ mutate: mockMutate, isPending });
  mockUseObjetivosActivos.mockReturnValue({ planificacionActiva: planActiva });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PlanificacionSelector', () => {
  describe('sin paciente activo', () => {
    it('muestra el mensaje de selección de paciente', () => {
      setupMocks({ activePatient: null });
      render(<PlanificacionSelector />);
      expect(screen.getByText('Selecciona un paciente activo')).toBeInTheDocument();
    });

    it('no renderiza el select', () => {
      setupMocks({ activePatient: null });
      render(<PlanificacionSelector />);
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  describe('estado de carga', () => {
    it('muestra "Cargando planificaciones…" mientras isLoading=true', () => {
      setupMocks({ isLoading: true });
      render(<PlanificacionSelector />);
      expect(screen.getByText('Cargando planificaciones…')).toBeInTheDocument();
    });

    it('no renderiza el select mientras isLoading=true', () => {
      setupMocks({ isLoading: true });
      render(<PlanificacionSelector />);
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  describe('sin planificaciones para el paciente', () => {
    it('muestra el mensaje de "Sin planificación"', () => {
      setupMocks({ planes: [] });
      render(<PlanificacionSelector />);
      expect(screen.getByText(/Sin planificación/)).toBeInTheDocument();
    });
  });

  describe('con planificaciones', () => {
    it('renderiza el select con las planificaciones del paciente', () => {
      setupMocks();
      render(<PlanificacionSelector />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('formatea las opciones como "nombre · kcal kcal"', () => {
      setupMocks();
      render(<PlanificacionSelector />);
      expect(screen.getByRole('option', { name: 'Plan A · 2000 kcal' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Plan B · 1801 kcal' })).toBeInTheDocument();
    });

    it('usa "Planificación" como nombre de fallback cuando nombre es null', () => {
      setupMocks({
        planes: [{ id: 'plan-3', paciente_id: 'p-1', nombre: null, calorias_totales: 1500 }],
        planActiva: { id: 'plan-3' },
      });
      render(<PlanificacionSelector />);
      expect(screen.getByRole('option', { name: 'Planificación · 1500 kcal' })).toBeInTheDocument();
    });

    it('filtra planes de otros pacientes', () => {
      const planesConOtroPaciente = [
        ...PLANES,
        { id: 'plan-x', paciente_id: 'p-otro', nombre: 'Plan Ajeno', calorias_totales: 1200 },
      ];
      setupMocks({ planes: planesConOtroPaciente });
      render(<PlanificacionSelector />);
      expect(screen.queryByRole('option', { name: /Plan Ajeno/ })).not.toBeInTheDocument();
    });

    it('seleccionar una opción diferente llama a mutate y setActivePlanificacionId', () => {
      setupMocks({ planActiva: { id: 'plan-2' } });
      render(<PlanificacionSelector />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'plan-1' } });
      expect(mockSetActivePlanificacionId).toHaveBeenCalledWith('plan-1');
      expect(mockMutate).toHaveBeenCalledWith('plan-1');
    });

    it('seleccionar la misma opción activa NO llama a mutate', () => {
      setupMocks({ planActiva: { id: 'plan-1' } });
      render(<PlanificacionSelector />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'plan-1' } });
      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('el select está deshabilitado mientras isPending=true', () => {
      setupMocks({ isPending: true });
      render(<PlanificacionSelector />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('muestra el spinner mientras isPending=true', () => {
      setupMocks({ isPending: true });
      render(<PlanificacionSelector />);
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
    });
  });
});
