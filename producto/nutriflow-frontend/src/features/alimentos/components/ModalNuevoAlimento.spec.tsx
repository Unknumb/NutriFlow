import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModalNuevoAlimento } from './ModalNuevoAlimento';

// ── hoisted mocks ─────────────────────────────────────────────────────────────
const mockUseCategorias = vi.hoisted(() => vi.fn());
const mockMutateAsyncCrear = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ id: 'alimento-1', nombre: 'Pollo' }),
);
const mockMutateAsyncActualizar = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ id: 'alimento-1', nombre: 'Pollo actualizado' }),
);
const mockIsAxiosError = vi.hoisted(() => vi.fn(() => false));

vi.mock('../hooks/useBuscarAlimentos', () => ({
  useCategorias: mockUseCategorias,
  useCrearAlimento: () => ({ mutateAsync: mockMutateAsyncCrear, isPending: false }),
  useActualizarAlimento: () => ({
    mutateAsync: mockMutateAsyncActualizar,
    isPending: false,
  }),
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, isAxiosError: mockIsAxiosError };
});

vi.mock('../../pacientes/components/ChipsInput', () => ({
  ChipsInput: ({ label }: any) => <div data-testid={`chips-${label}`} />,
}));

vi.mock('lucide-react', () => ({
  Apple: () => <span />,
  Loader2: () => <span data-testid="icon-loader" />,
  Save: () => <span data-testid="icon-save" />,
  X: () => <span data-testid="icon-x" />,
}));

// ── helpers ────────────────────────────────────────────────────────────────────
const ALIMENTO_EXISTENTE = {
  id: 'a-1',
  nombre: 'Pollo cocido',
  marca: '',
  categoria: 'Carnes Bajas en Grasa',
  calorias_100g: 165,
  proteinas_100g: 31,
  carbohidratos_100g: 0,
  grasas_100g: 3.6,
  restricciones: [],
} as any;

beforeEach(() => {
  vi.clearAllMocks();
  mockUseCategorias.mockReturnValue({ data: ['Cereales', 'Verduras', 'Carnes Bajas en Grasa'], isLoading: false });
  mockIsAxiosError.mockReturnValue(false);
});

const renderModal = (props: Partial<Parameters<typeof ModalNuevoAlimento>[0]> = {}) =>
  render(<ModalNuevoAlimento isOpen={true} onClose={vi.fn()} {...props} />);

/** Rellena todos los campos obligatorios del formulario de creación. */
function rellenarCampos() {
  fireEvent.change(screen.getByPlaceholderText('Ej: Quinoa cocida'), {
    target: { value: 'Atún al natural' },
  });
  fireEvent.change(screen.getByDisplayValue('Selecciona una categoría'), {
    target: { value: 'Cereales' },
  });
  const numInputs = screen.getAllByPlaceholderText('0');
  fireEvent.change(numInputs[0], { target: { value: '120' } });
  fireEvent.change(numInputs[1], { target: { value: '25' } });
  fireEvent.change(numInputs[2], { target: { value: '0' } });
  fireEvent.change(numInputs[3], { target: { value: '3' } });
}

describe('ModalNuevoAlimento', () => {
  it('no renderiza nada cuando isOpen=false', () => {
    render(<ModalNuevoAlimento isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Nuevo Alimento')).not.toBeInTheDocument();
  });

  describe('modo creación', () => {
    it('muestra el título "Nuevo Alimento"', () => {
      renderModal();
      expect(screen.getByText('Nuevo Alimento')).toBeInTheDocument();
    });

    it('muestra el botón "Crear Alimento"', () => {
      renderModal();
      expect(screen.getByRole('button', { name: /Crear Alimento/i })).toBeInTheDocument();
    });

    it('pre-rellena el nombre con nombreInicial cuando se proporciona', () => {
      renderModal({ nombreInicial: 'Quinoa' });
      expect(screen.getByPlaceholderText('Ej: Quinoa cocida')).toHaveValue('Quinoa');
    });
  });

  describe('modo edición (alimentoExistente)', () => {
    it('muestra el título "Editar Alimento"', () => {
      renderModal({ alimentoExistente: ALIMENTO_EXISTENTE });
      expect(screen.getByText('Editar Alimento')).toBeInTheDocument();
    });

    it('muestra el botón "Guardar Cambios"', () => {
      renderModal({ alimentoExistente: ALIMENTO_EXISTENTE });
      expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument();
    });

    it('pre-rellena el nombre con el del alimento existente', () => {
      renderModal({ alimentoExistente: ALIMENTO_EXISTENTE });
      expect(screen.getByPlaceholderText('Ej: Quinoa cocida')).toHaveValue('Pollo cocido');
    });
  });

  describe('handleGuardar — validaciones', () => {
    it('nombre vacío muestra error "El nombre del alimento es obligatorio"', () => {
      renderModal();
      fireEvent.click(screen.getByRole('button', { name: /Crear Alimento/i }));
      expect(
        screen.getByText('El nombre del alimento es obligatorio'),
      ).toBeInTheDocument();
    });

    it('sin categoría muestra error "Selecciona una categoría"', () => {
      renderModal();
      fireEvent.change(screen.getByPlaceholderText('Ej: Quinoa cocida'), {
        target: { value: 'Atún' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Crear Alimento/i }));
      // El texto también está en el <option> del select; buscamos el <p role="alert">
      expect(screen.getByRole('alert')).toHaveTextContent('Selecciona una categoría');
    });

    it('campo nutricional vacío muestra error con el nombre del campo', () => {
      renderModal();
      fireEvent.change(screen.getByPlaceholderText('Ej: Quinoa cocida'), {
        target: { value: 'Atún' },
      });
      fireEvent.change(screen.getByDisplayValue('Selecciona una categoría'), {
        target: { value: 'Cereales' },
      });
      // dejar calorias_100g vacío
      fireEvent.click(screen.getByRole('button', { name: /Crear Alimento/i }));
      expect(screen.getByRole('alert')).toHaveTextContent(/Calorías \(kcal\)/);
    });

    it('llama a mutateAsync al guardar con todos los campos válidos', async () => {
      renderModal();
      rellenarCampos();
      fireEvent.click(screen.getByRole('button', { name: /Crear Alimento/i }));
      await waitFor(() => {
        expect(mockMutateAsyncCrear).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('mensajeDeErrorApi', () => {
    it('error 409 muestra "Ya existe un alimento con ese nombre y marca."', async () => {
      mockIsAxiosError.mockReturnValue(true);
      mockMutateAsyncCrear.mockRejectedValue({ response: { status: 409 } });
      renderModal();
      rellenarCampos();
      fireEvent.click(screen.getByRole('button', { name: /Crear Alimento/i }));
      await waitFor(() => {
        expect(
          screen.getByText('Ya existe un alimento con ese nombre y marca.'),
        ).toBeInTheDocument();
      });
    });

    it('error con mensaje string muestra ese mensaje', async () => {
      mockIsAxiosError.mockReturnValue(true);
      mockMutateAsyncCrear.mockRejectedValue({
        response: { status: 400, data: { message: 'Nombre demasiado largo' } },
      });
      renderModal();
      rellenarCampos();
      fireEvent.click(screen.getByRole('button', { name: /Crear Alimento/i }));
      await waitFor(() => {
        expect(screen.getByText('Nombre demasiado largo')).toBeInTheDocument();
      });
    });

    it('error con mensaje array une los mensajes con ". "', async () => {
      mockIsAxiosError.mockReturnValue(true);
      mockMutateAsyncCrear.mockRejectedValue({
        response: { status: 422, data: { message: ['Campo A requerido', 'Campo B inválido'] } },
      });
      renderModal();
      rellenarCampos();
      fireEvent.click(screen.getByRole('button', { name: /Crear Alimento/i }));
      await waitFor(() => {
        expect(screen.getByText('Campo A requerido. Campo B inválido')).toBeInTheDocument();
      });
    });
  });

  describe('cierre del modal', () => {
    it('clic en Cancelar llama a onClose', () => {
      const onClose = vi.fn();
      renderModal({ onClose });
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clic en el ícono X llama a onClose', () => {
      const onClose = vi.fn();
      renderModal({ onClose });
      fireEvent.click(screen.getByTestId('icon-x').closest('button')!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
