import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientInfoCard } from './PatientInfoCard';

// ── hoisted mocks ────────────────────────────────────────────────────────────
const mockSetActivePatient = vi.hoisted(() => vi.fn());
const mockUseClinicalStore = vi.hoisted(() => vi.fn());
const mockUsePacientes = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}));

vi.mock('../../../shared/store/useClinicalStore', () => ({
  useClinicalStore: mockUseClinicalStore,
}));

vi.mock('../../pacientes/hooks/usePacientes', () => ({
  usePacientes: mockUsePacientes,
}));

vi.mock('../../../shared/ui/atoms/Card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ title }: any) => <div>{title}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  UserCircle: () => <span />,
  Plus: () => <span data-testid="icon-plus" />,
}));

// ── datos de prueba ──────────────────────────────────────────────────────────
const PACIENTES = [
  {
    id: 'p-1',
    nombre: 'Ana',
    apellido: 'García',
    fecha_nacimiento: '1990-06-15T00:00:00Z',
    sexo_biologico: 'F',
    Evaluacion: [{ talla_cm: 162, peso_actual: 58 }],
  },
  {
    id: 'p-2',
    nombre: 'Luis',
    apellido: 'Torres',
    fecha_nacimiento: '1985-03-10T00:00:00Z',
    sexo_biologico: 'M',
    Evaluacion: [],
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockUseClinicalStore.mockReturnValue({
    activePatient: null,
    setActivePatient: mockSetActivePatient,
  });
  mockUsePacientes.mockReturnValue({ data: PACIENTES, isLoading: false });
});

describe('PatientInfoCard (calculos)', () => {
  describe('vista de selección de paciente', () => {
    it('muestra el título "Información del Paciente"', () => {
      render(<PatientInfoCard />);
      expect(screen.getByText('Información del Paciente')).toBeInTheDocument();
    });

    it('muestra el select con los nombres de los pacientes', () => {
      render(<PatientInfoCard />);
      expect(screen.getByRole('option', { name: 'Ana García' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Luis Torres' })).toBeInTheDocument();
    });

    it('muestra "Cargando pacientes..." mientras isLoading=true', () => {
      mockUsePacientes.mockReturnValue({ data: undefined, isLoading: true });
      render(<PatientInfoCard />);
      expect(screen.getByRole('option', { name: 'Cargando pacientes...' })).toBeInTheDocument();
    });

    it('el botón "Establecer como paciente activo" está desactivado sin paciente seleccionado', () => {
      render(<PatientInfoCard />);
      expect(
        screen.getByRole('button', { name: /Establecer como paciente activo/i }),
      ).toBeDisabled();
    });

    it('al seleccionar un paciente los campos Talla y Peso se rellenan desde su evaluación', () => {
      render(<PatientInfoCard />);
      fireEvent.change(screen.getByDisplayValue(/Seleccione un paciente/i), {
        target: { value: 'p-1' },
      });
      expect(screen.getByDisplayValue('162')).toBeInTheDocument();
      expect(screen.getByDisplayValue('58')).toBeInTheDocument();
    });

    it('al seleccionar una paciente el campo Sexo muestra "Femenino"', () => {
      render(<PatientInfoCard />);
      fireEvent.change(screen.getByDisplayValue(/Seleccione un paciente/i), {
        target: { value: 'p-1' },
      });
      expect(screen.getByDisplayValue('Femenino')).toBeInTheDocument();
    });

    it('al seleccionar paciente sin evaluación la Talla queda vacía', () => {
      render(<PatientInfoCard />);
      fireEvent.change(screen.getByDisplayValue(/Seleccione un paciente/i), {
        target: { value: 'p-2' },
      });
      const tallaInput = screen.getAllByRole('spinbutton').find(
        (el) => (el as HTMLInputElement).value === '',
      );
      expect(tallaInput).toBeDefined();
    });
  });

  describe('handleSave — establecer paciente activo', () => {
    it('llama a setActivePatient con los datos del paciente seleccionado', () => {
      render(<PatientInfoCard />);
      fireEvent.change(screen.getByDisplayValue(/Seleccione un paciente/i), {
        target: { value: 'p-1' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Establecer como paciente activo/i }));
      expect(mockSetActivePatient).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'p-1' }),
      );
    });
  });

  describe('botón crear paciente → navega a Fichas de Pacientes', () => {
    it('al clic en + navega a /pacientes (no abre un formulario inline)', () => {
      render(<PatientInfoCard />);
      fireEvent.click(screen.getByTestId('icon-plus').closest('button')!);
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/pacientes' });
    });

    it('NO renderiza un formulario de creación inline en el dashboard', () => {
      render(<PatientInfoCard />);
      fireEvent.click(screen.getByTestId('icon-plus').closest('button')!);
      expect(screen.queryByText('Crear nuevo paciente')).not.toBeInTheDocument();
    });
  });

  describe('paciente activo preseleccionado', () => {
    it('preselecciona el paciente activo en el select cuando existe', () => {
      mockUseClinicalStore.mockReturnValue({
        activePatient: { id: 'p-1', nombre: 'Ana García', edad: 34, sexo: 'F', talla: 162, peso: 58 },
        setActivePatient: mockSetActivePatient,
      });
      render(<PatientInfoCard />);
      expect(screen.getByDisplayValue('Ana García')).toBeInTheDocument();
    });
  });
});
