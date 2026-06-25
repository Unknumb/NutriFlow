import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PatientInfoCard } from './PatientInfoCard';

// ── hoisted mocks ────────────────────────────────────────────────────────────
const mockSetActivePatient = vi.hoisted(() => vi.fn());
const mockUseClinicalStore = vi.hoisted(() => vi.fn());
const mockUsePacientes = vi.hoisted(() => vi.fn());
const mockMutateAsync = vi.hoisted(() => vi.fn());
const mockUseCreatePaciente = vi.hoisted(() => vi.fn());

vi.mock('../../../shared/store/useClinicalStore', () => ({
  useClinicalStore: mockUseClinicalStore,
}));

vi.mock('../../pacientes/hooks/usePacientes', () => ({
  usePacientes: mockUsePacientes,
  useCreatePaciente: mockUseCreatePaciente,
}));

vi.mock('../../../shared/ui/atoms/Card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ title }: any) => <div>{title}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  UserCircle: () => <span />,
  Plus: () => <span data-testid="icon-plus" />,
  X: () => <span data-testid="icon-x" />,
  Save: () => <span data-testid="icon-save" />,
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
  mockUseCreatePaciente.mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });
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

  describe('formulario de creación de paciente', () => {
    it('al clic en + se muestra el formulario de creación', () => {
      render(<PatientInfoCard />);
      fireEvent.click(screen.getByTestId('icon-plus').closest('button')!);
      expect(screen.getByText('Crear nuevo paciente')).toBeInTheDocument();
    });

    it('el botón Guardar del formulario está desactivado con campos vacíos', () => {
      render(<PatientInfoCard />);
      fireEvent.click(screen.getByTestId('icon-plus').closest('button')!);
      expect(screen.getByTitle('Guardar Paciente')).toBeDisabled();
    });

    it('al clic en X se cierra el formulario de creación', () => {
      render(<PatientInfoCard />);
      fireEvent.click(screen.getByTestId('icon-plus').closest('button')!);
      expect(screen.getByText('Crear nuevo paciente')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('icon-x').closest('button')!);
      expect(screen.queryByText('Crear nuevo paciente')).not.toBeInTheDocument();
    });

    it('llama a mutateAsync al guardar un nuevo paciente con todos los campos', async () => {
      mockMutateAsync.mockResolvedValue({
        id: 'p-nuevo',
        nombre: 'Pedro',
        apellido: 'Soto',
        fecha_nacimiento: '2000-01-01T00:00:00Z',
        sexo_biologico: 'M',
        Evaluacion: [],
      });
      render(<PatientInfoCard />);
      fireEvent.click(screen.getByTestId('icon-plus').closest('button')!);

      fireEvent.change(screen.getByPlaceholderText('Ej. Juan'), { target: { value: 'Pedro' } });
      fireEvent.change(screen.getByPlaceholderText('Ej. Pérez'), { target: { value: 'Soto' } });
      fireEvent.change(document.body.querySelector('input[type="date"]')!, {
        target: { value: '2000-01-01' },
      });
      fireEvent.change(screen.getByDisplayValue('Seleccionar...'), {
        target: { value: 'M' },
      });
      fireEvent.change(screen.getByPlaceholderText('170'), { target: { value: '175' } });
      fireEvent.change(screen.getByPlaceholderText('70'), { target: { value: '72' } });

      fireEvent.click(screen.getByTitle('Guardar Paciente'));
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({ nombre: 'Pedro', apellido: 'Soto' }),
        );
      });
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
