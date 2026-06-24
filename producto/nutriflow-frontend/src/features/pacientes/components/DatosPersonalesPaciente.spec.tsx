import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DatosPersonalesPaciente } from './DatosPersonalesPaciente';

// ── hoisted mocks ─────────────────────────────────────────────────────────────
const mockMutate = vi.hoisted(() => vi.fn());
const mockUseUpdatePaciente = vi.hoisted(() => vi.fn());
const mockUseClinicalStore = vi.hoisted(() => vi.fn());
const mockEsRutValido = vi.hoisted(() => vi.fn(() => true));
const mockFormatearRutInput = vi.hoisted(() => vi.fn((v: string) => v));

vi.mock('../hooks/usePacientes', () => ({
  useUpdatePaciente: mockUseUpdatePaciente,
}));

vi.mock('../../../shared/store/useClinicalStore', () => ({
  useClinicalStore: mockUseClinicalStore,
}));

vi.mock('../utils/rut', () => ({
  esRutValido: mockEsRutValido,
  formatearRutInput: mockFormatearRutInput,
  normalizarRut: vi.fn((v: string) => v),
}));

vi.mock('../utils/apiError', () => ({
  obtenerMensajeErrorApi: vi.fn(() => 'No se pudieron guardar los cambios.'),
}));

vi.mock('./ChipsInput', () => ({
  ChipsInput: ({ label }: any) => <div data-testid={`chips-${label}`} />,
}));

vi.mock('lucide-react', () => ({
  Pencil: () => <span data-testid="icon-pencil" />,
  X: () => <span data-testid="icon-x" />,
}));

// ── datos de prueba ────────────────────────────────────────────────────────────
const PACIENTE = {
  id: 'p-1',
  nombre: 'Juan',
  apellido: 'Pérez',
  fecha_nacimiento: '1985-03-15T00:00:00Z',
  sexo_biologico: 'M',
  rut: null,
  email: 'juan@example.com',
  telefono: null,
  ocupacion: 'Profesor',
  direccion: null,
  enfermedades: [],
  alergias: ['Gluten', 'Maní'],
  preferencias_alimentarias: [],
  notas_preferencias: null,
  Evaluacion: [{ talla_cm: 175, peso_actual: 80 }],
} as any;

beforeEach(() => {
  vi.clearAllMocks();
  mockUseUpdatePaciente.mockReturnValue({ mutate: mockMutate, isPending: false });
  mockUseClinicalStore.mockReturnValue({ activePatient: null, setActivePatient: vi.fn() });
  mockEsRutValido.mockReturnValue(true);
  mockFormatearRutInput.mockImplementation((v: string) => v);
});

describe('DatosPersonalesPaciente', () => {
  describe('modo lectura (por defecto)', () => {
    it('muestra la fecha de nacimiento formateada como DD-MM-YYYY', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      expect(screen.getByText('15-03-1985')).toBeInTheDocument();
    });

    it('muestra "Masculino" cuando sexo_biologico="M"', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      expect(screen.getByText('Masculino')).toBeInTheDocument();
    });

    it('muestra "Femenino" cuando sexo_biologico="F"', () => {
      render(<DatosPersonalesPaciente paciente={{ ...PACIENTE, sexo_biologico: 'F' }} />);
      expect(screen.getByText('Femenino')).toBeInTheDocument();
    });

    it('muestra la talla en cm', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      expect(screen.getByText('175 cm')).toBeInTheDocument();
    });

    it('muestra el peso actual en kg', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      expect(screen.getByText('80 kg')).toBeInTheDocument();
    });

    it('muestra las alergias del paciente', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      expect(screen.getByText('Gluten')).toBeInTheDocument();
      expect(screen.getByText('Maní')).toBeInTheDocument();
    });

    it('muestra "Sin registros" para listas vacías', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      // enfermedades y preferencias_alimentarias están vacías
      const sinRegistros = screen.getAllByText('Sin registros');
      expect(sinRegistros.length).toBeGreaterThanOrEqual(1);
    });

    it('muestra "No registrado" para campos null', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      const noRegistrado = screen.getAllByText('No registrado');
      expect(noRegistrado.length).toBeGreaterThanOrEqual(1);
    });

    it('muestra el botón "Editar" en modo lectura', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument();
    });
  });

  describe('toggle de modo edición', () => {
    it('clic en "Editar" muestra el botón "Cancelar"', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
    });

    it('clic en "Editar" muestra el botón "Guardar Cambios"', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
      expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument();
    });

    it('clic en "Cancelar" vuelve al modo lectura', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
      fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
      expect(screen.getByRole('button', { name: /Editar/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Guardar Cambios/i })).not.toBeInTheDocument();
    });
  });

  describe('validación de RUT en modo edición', () => {
    it('RUT inválido muestra el mensaje de error', () => {
      mockEsRutValido.mockReturnValue(false);
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
      fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), {
        target: { value: '12.345.678-0' },
      });
      expect(
        screen.getByText('RUT inválido: verifica el dígito verificador'),
      ).toBeInTheDocument();
    });

    it('RUT inválido desactiva el botón "Guardar Cambios"', () => {
      mockEsRutValido.mockReturnValue(false);
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
      fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), {
        target: { value: '12.345.678-0' },
      });
      expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeDisabled();
    });
  });

  describe('handleGuardar', () => {
    it('llama a updatePaciente.mutate al hacer clic en "Guardar Cambios"', () => {
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
      fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));
      expect(mockMutate).toHaveBeenCalledTimes(1);
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'p-1' }),
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
      );
    });

    it('muestra "Guardando…" e isPending=true desactiva el botón', () => {
      mockUseUpdatePaciente.mockReturnValue({ mutate: mockMutate, isPending: true });
      render(<DatosPersonalesPaciente paciente={PACIENTE} />);
      fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
      expect(screen.getByRole('button', { name: /Guardando/i })).toBeDisabled();
    });
  });
});
