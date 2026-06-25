import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FichasPacientes } from './FichasPacientes';

// ── hoisted mocks ─────────────────────────────────────────────────────────────
const mockUsePacientes = vi.hoisted(() => vi.fn());
const mockUseClinicalStore = vi.hoisted(() => vi.fn());
const mockUseAuthStore = vi.hoisted(() => vi.fn());
const mockUsePerfilNutricionista = vi.hoisted(() => vi.fn());
const mockUseEvaluaciones = vi.hoisted(() => vi.fn());
const mockUseCreateEvaluacion = vi.hoisted(() => vi.fn());
const mockUseDeleteEvaluacion = vi.hoisted(() => vi.fn());
const mockUseUpdateEvaluacion = vi.hoisted(() => vi.fn());
const mockUseDeletePauta = vi.hoisted(() => vi.fn());
const mockUsePlanificaciones = vi.hoisted(() => vi.fn());
const mockUseDeletePlanificacion = vi.hoisted(() => vi.fn());
const mockSetActivePatient = vi.hoisted(() => vi.fn());
const mockSetPesoActivo = vi.hoisted(() => vi.fn());
const mockSetTmbPromedio = vi.hoisted(() => vi.fn());

vi.mock('../hooks/usePacientes', () => ({
  usePacientes: mockUsePacientes,
}));

vi.mock('../../../shared/store/useClinicalStore', () => ({
  useClinicalStore: mockUseClinicalStore,
}));

vi.mock('../../../shared/store/useAuthStore', () => ({
  useAuthStore: mockUseAuthStore,
}));

vi.mock('../../perfil/hooks/usePerfil', () => ({
  usePerfilNutricionista: mockUsePerfilNutricionista,
}));

vi.mock('../../evaluaciones/hooks/useEvaluaciones', () => ({
  useEvaluacionesByPaciente: mockUseEvaluaciones,
  useCreateEvaluacion: mockUseCreateEvaluacion,
  useDeleteEvaluacion: mockUseDeleteEvaluacion,
  useUpdateEvaluacion: mockUseUpdateEvaluacion,
}));

vi.mock('../../pautas/hooks/usePautas', () => ({
  useDeletePauta: mockUseDeletePauta,
}));

vi.mock('../../planificaciones/hooks/usePlanificaciones', () => ({
  usePlanificaciones: mockUsePlanificaciones,
  useDeletePlanificacion: mockUseDeletePlanificacion,
}));

vi.mock('../../porciones/constants', () => ({
  NUTRITION_GROUPS: [
    { id: 'fru', label: 'Frutas', emoji: '🍎' },
  ],
  comidasOrdenadas: () => [],
}));

vi.mock('@react-pdf/renderer', () => ({
  PDFDownloadLink: ({ children }: any) => (
    <div data-testid="pdf-link">{children({ loading: false })}</div>
  ),
}));

vi.mock('../../porciones/components/PautaDocumentPDF', () => ({
  PautaDocumentPDF: () => null,
}));

vi.mock('../../../shared/utils/fechas', () => ({
  formatearFecha: (d: string) => d || '',
}));

vi.mock('./ModalNuevoPaciente', () => ({
  ModalNuevoPaciente: ({ isOpen }: any) =>
    isOpen ? <div data-testid="modal-nuevo-paciente">Modal</div> : null,
}));

vi.mock('./DatosPersonalesPaciente', () => ({
  DatosPersonalesPaciente: ({ paciente }: any) => (
    <div data-testid="datos-personales">{paciente.nombre}</div>
  ),
}));

vi.mock('lucide-react', () => ({
  Loader2: () => <span data-testid="icon-loader" />,
  Star: () => <span data-testid="icon-star" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Printer: () => <span data-testid="icon-printer" />,
  Plus: () => <span data-testid="icon-plus" />,
  Pencil: () => <span data-testid="icon-pencil" />,
  Check: () => <span data-testid="icon-check" />,
  X: () => <span data-testid="icon-x" />,
}));

// ── datos de prueba ───────────────────────────────────────────────────────────
const PACIENTE_1 = {
  id: 'p-1',
  nombre: 'Ana',
  apellido: 'García',
  fecha_nacimiento: '1990-06-15',
  sexo_biologico: 'F',
  fecha_creacion: '2024-01-10',
  rut: '12345678-9',
  email: 'ana@example.com',
  telefono: '+56912345678',
  alergias: [],
  preferencias_alimentarias: [],
  enfermedades: [],
};

const PACIENTE_2 = {
  ...PACIENTE_1,
  id: 'p-2',
  nombre: 'Luis',
  apellido: 'Torres',
  sexo_biologico: 'M',
};

const EVALUACION = {
  id: 'ev-1',
  paciente_id: 'p-1',
  fecha_evaluacion: '2024-02-01',
  peso_actual: 62,
  talla_cm: 165,
  nivel_actividad_fisica: 'moderado',
  objetivo: 'mantencion',
  tmb: 1400,
  gasto_energetico_total: 2100,
};

const PLANIFICACION = {
  id: 'plan-1',
  nombre: 'Plan Enero',
  activa: true,
  fecha_creacion: '2024-01-15',
  paciente_id: 'p-1',
  calorias_totales: 2000,
  distribucion_macros: { proteina: 30, carbohidratos: 45, grasa: 25 },
  pautas: [],
};

const setupDefaultMocks = () => {
  mockUseClinicalStore.mockReturnValue({
    activePatient: null,
    setActivePatient: mockSetActivePatient,
    setPesoActivo: mockSetPesoActivo,
    setTmbPromedio: mockSetTmbPromedio,
  });
  mockUseAuthStore.mockReturnValue({ user: { email: 'nutri@test.com', user_metadata: { nombre: 'Nutri' } } });
  mockUsePerfilNutricionista.mockReturnValue({ data: null });
  mockUseEvaluaciones.mockReturnValue({ data: [], isLoading: false });
  mockUseCreateEvaluacion.mockReturnValue({ mutate: vi.fn(), isPending: false });
  mockUseDeleteEvaluacion.mockReturnValue({ mutate: vi.fn(), isPending: false });
  mockUseUpdateEvaluacion.mockReturnValue({ mutate: vi.fn(), isPending: false });
  mockUseDeletePauta.mockReturnValue({ mutate: vi.fn(), isPending: false });
  mockUsePlanificaciones.mockReturnValue({ data: [], isLoading: false });
  mockUseDeletePlanificacion.mockReturnValue({ mutate: vi.fn(), isPending: false });
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUsePacientes.mockReturnValue({ data: [PACIENTE_1, PACIENTE_2], isLoading: false, error: null });
  setupDefaultMocks();
});

describe('FichasPacientes', () => {
  describe('encabezado', () => {
    it('muestra el título "Fichas de Pacientes"', () => {
      render(<FichasPacientes />);
      expect(screen.getByText('Fichas de Pacientes')).toBeInTheDocument();
    });

    it('muestra el subtítulo de gestión clínica', () => {
      render(<FichasPacientes />);
      expect(screen.getByText('Gestión y seguimiento clínico')).toBeInTheDocument();
    });
  });

  describe('panel de lista de pacientes', () => {
    it('muestra el encabezado "Pacientes Activos"', () => {
      render(<FichasPacientes />);
      expect(screen.getByText('Pacientes Activos')).toBeInTheDocument();
    });

    it('muestra el conteo de pacientes', () => {
      render(<FichasPacientes />);
      expect(screen.getByText('2 pacientes en seguimiento')).toBeInTheDocument();
    });

    it('muestra los nombres de los pacientes en la lista', () => {
      render(<FichasPacientes />);
      // Ana García aparece tanto en la lista como en el panel de detalle (auto-selección)
      expect(screen.getAllByText('Ana García').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Luis Torres').length).toBeGreaterThan(0);
    });

    it('muestra el spinner cuando isLoading=true', () => {
      mockUsePacientes.mockReturnValue({ data: undefined, isLoading: true, error: null });
      render(<FichasPacientes />);
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
    });

    it('muestra el error cuando existe', () => {
      mockUsePacientes.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Error de red'),
      });
      render(<FichasPacientes />);
      expect(screen.getByText('Error al cargar pacientes')).toBeInTheDocument();
    });

    it('muestra "No hay pacientes registrados" cuando la lista está vacía', () => {
      mockUsePacientes.mockReturnValue({ data: [], isLoading: false, error: null });
      render(<FichasPacientes />);
      expect(screen.getByText('No hay pacientes registrados')).toBeInTheDocument();
    });

    it('muestra "0 pacientes en seguimiento" cuando la lista está vacía', () => {
      mockUsePacientes.mockReturnValue({ data: [], isLoading: false, error: null });
      render(<FichasPacientes />);
      expect(screen.getByText('0 pacientes en seguimiento')).toBeInTheDocument();
    });
  });

  describe('panel de detalle (auto-selección del primer paciente)', () => {
    it('muestra el nombre completo del paciente auto-seleccionado', async () => {
      render(<FichasPacientes />);
      // useEffect selecciona el primer paciente → detalle de Ana García
      expect(await screen.findByText('Gestión y seguimiento clínico')).toBeInTheDocument();
      // El h2 en el panel derecho muestra el nombre completo
      const heading = await screen.findAllByText('Ana García');
      expect(heading.length).toBeGreaterThan(0);
    });

    it('muestra el botón "Establecer como Paciente Activo" cuando no es el activo', async () => {
      render(<FichasPacientes />);
      expect(
        await screen.findByRole('button', { name: /Establecer como Paciente Activo/i }),
      ).toBeInTheDocument();
    });

    it('muestra el badge "Paciente Activo en Sistema" cuando es el paciente activo', async () => {
      mockUseClinicalStore.mockReturnValue({
        activePatient: { id: 'p-1', nombre: 'Ana García', edad: 33, sexo: 'F', talla: 165, peso: 62 },
        setActivePatient: mockSetActivePatient,
        setPesoActivo: mockSetPesoActivo,
        setTmbPromedio: mockSetTmbPromedio,
      });
      render(<FichasPacientes />);
      expect(
        await screen.findByText('Paciente Activo en Sistema'),
      ).toBeInTheDocument();
    });

    it('al clic en "Establecer como Paciente Activo" llama a setActivePatient', async () => {
      render(<FichasPacientes />);
      const btn = await screen.findByRole('button', {
        name: /Establecer como Paciente Activo/i,
      });
      fireEvent.click(btn);
      expect(mockSetActivePatient).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'p-1' }),
      );
    });

    it('al clic en otro paciente de la lista cambia el detalle', async () => {
      render(<FichasPacientes />);
      await screen.findByRole('button', { name: /Establecer como Paciente Activo/i });
      fireEvent.click(screen.getByText('Luis Torres'));
      expect(await screen.findAllByText('Luis Torres')).not.toHaveLength(0);
    });
  });

  describe('pestañas del panel de detalle', () => {
    it('muestra la pestaña "Datos Clínicos"', async () => {
      render(<FichasPacientes />);
      expect(
        await screen.findByRole('button', { name: /Datos Clínicos/i }),
      ).toBeInTheDocument();
    });

    it('muestra la pestaña "Pautas Nutricionales"', async () => {
      render(<FichasPacientes />);
      expect(
        await screen.findByRole('button', { name: /Pautas Nutricionales/i }),
      ).toBeInTheDocument();
    });

    it('al clic en "Pautas Nutricionales" cambia al contenido de esa pestaña', async () => {
      render(<FichasPacientes />);
      const tabPautas = await screen.findByRole('button', { name: /Pautas Nutricionales/i });
      fireEvent.click(tabPautas);
      expect(
        await screen.findByText('Historial de pautas con distribución de porciones'),
      ).toBeInTheDocument();
    });
  });

  describe('tab de datos clínicos — evaluaciones', () => {
    it('muestra "No hay evaluaciones registradas" cuando la lista está vacía', async () => {
      render(<FichasPacientes />);
      expect(
        await screen.findByText('No hay evaluaciones registradas para este paciente.'),
      ).toBeInTheDocument();
    });

    it('muestra una evaluación cuando existen', async () => {
      mockUseEvaluaciones.mockReturnValue({ data: [EVALUACION], isLoading: false });
      render(<FichasPacientes />);
      expect(await screen.findByText('62 kg')).toBeInTheDocument();
      expect(screen.getByText('165 cm')).toBeInTheDocument();
    });

    it('muestra el botón "+ Nueva Evaluación"', async () => {
      render(<FichasPacientes />);
      expect(
        await screen.findByRole('button', { name: /\+ Nueva Evaluación/i }),
      ).toBeInTheDocument();
    });

    it('al clic en "+ Nueva Evaluación" muestra el formulario de nueva evaluación', async () => {
      render(<FichasPacientes />);
      fireEvent.click(
        await screen.findByRole('button', { name: /\+ Nueva Evaluación/i }),
      );
      expect(screen.getByText('Registrar Nueva Evaluación')).toBeInTheDocument();
    });
  });

  describe('tab de pautas nutricionales', () => {
    const goToPautasTab = async () => {
      render(<FichasPacientes />);
      fireEvent.click(
        await screen.findByRole('button', { name: /Pautas Nutricionales/i }),
      );
    };

    it('muestra "No hay planificaciones" cuando la lista está vacía', async () => {
      await goToPautasTab();
      expect(
        await screen.findByText(
          'No hay planificaciones ni pautas guardadas para este paciente.',
        ),
      ).toBeInTheDocument();
    });

    it('muestra el nombre de la planificación cuando existe', async () => {
      mockUsePlanificaciones.mockReturnValue({
        data: [PLANIFICACION],
        isLoading: false,
      });
      await goToPautasTab();
      expect(await screen.findByText('Plan Enero')).toBeInTheDocument();
    });

    it('muestra las calorías totales de la planificación', async () => {
      mockUsePlanificaciones.mockReturnValue({
        data: [PLANIFICACION],
        isLoading: false,
      });
      await goToPautasTab();
      expect(await screen.findByText('2000 kcal')).toBeInTheDocument();
    });

    it('muestra el botón de eliminación de planificación', async () => {
      mockUsePlanificaciones.mockReturnValue({
        data: [PLANIFICACION],
        isLoading: false,
      });
      await goToPautasTab();
      await screen.findByText('Plan Enero');
      expect(screen.getByTitle('Eliminar Planificación Completa')).toBeInTheDocument();
    });
  });

  describe('modal de nuevo paciente', () => {
    it('al clic en "Nuevo" abre el modal', () => {
      render(<FichasPacientes />);
      fireEvent.click(screen.getByRole('button', { name: /Nuevo/i }));
      expect(screen.getByTestId('modal-nuevo-paciente')).toBeInTheDocument();
    });
  });
});
