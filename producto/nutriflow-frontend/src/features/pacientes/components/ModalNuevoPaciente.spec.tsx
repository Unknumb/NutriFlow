import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModalNuevoPaciente } from './ModalNuevoPaciente';

// ── hoisted mocks ─────────────────────────────────────────────────────────────
const mockMutateAsync = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ id: 'nuevo-paciente-1' }),
);
const mockUseCreatePaciente = vi.hoisted(() => vi.fn());
const mockEsRutValido = vi.hoisted(() => vi.fn(() => true));
const mockFormatearRutInput = vi.hoisted(() => vi.fn((v: string) => v));

vi.mock('../hooks/usePacientes', () => ({
  useCreatePaciente: mockUseCreatePaciente,
}));

vi.mock('../utils/rut', () => ({
  esRutValido: mockEsRutValido,
  formatearRutInput: mockFormatearRutInput,
  normalizarRut: vi.fn((v: string) => v),
}));

vi.mock('../utils/apiError', () => ({
  obtenerMensajeErrorApi: vi.fn(() => 'No se pudo crear el paciente. Intenta nuevamente.'),
}));

vi.mock('./ChipsInput', () => ({
  ChipsInput: ({ label }: any) => <div data-testid={`chips-${label}`} />,
}));

vi.mock('lucide-react', () => ({
  UserPlus: () => <span />,
  X: () => <span data-testid="icon-x" />,
}));

// ── helpers ────────────────────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockUseCreatePaciente.mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  });
  mockEsRutValido.mockReturnValue(true);
  mockFormatearRutInput.mockImplementation((v: string) => v);
});

const renderModal = (props: Partial<Parameters<typeof ModalNuevoPaciente>[0]> = {}) =>
  render(
    <ModalNuevoPaciente isOpen={true} onClose={vi.fn()} {...props} />,
  );

/** Rellena los 5 campos obligatorios del modal.
 *  Usa document.body porque el modal renderiza via createPortal fuera del container de RTL. */
function rellenarObligatorios() {
  fireEvent.change(screen.getByPlaceholderText('Ej: Juan'), {
    target: { value: 'Juan' },
  });
  fireEvent.change(screen.getByPlaceholderText('Ej: Pérez'), {
    target: { value: 'Pérez' },
  });
  fireEvent.change(document.body.querySelector('input[type="date"]')!, {
    target: { value: '2000-01-01' },
  });
  fireEvent.change(screen.getByPlaceholderText('170'), {
    target: { value: '175' },
  });
  fireEvent.change(screen.getByPlaceholderText('70'), {
    target: { value: '70' },
  });
}

describe('ModalNuevoPaciente', () => {
  it('no renderiza nada cuando isOpen=false', () => {
    render(<ModalNuevoPaciente isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Nuevo Paciente')).not.toBeInTheDocument();
  });

  it('renderiza el modal cuando isOpen=true', () => {
    renderModal();
    expect(screen.getByText('Nuevo Paciente')).toBeInTheDocument();
  });

  describe('puedeGuardar — validación de campos obligatorios', () => {
    it('el botón "Guardar Paciente" está desactivado con todos los campos vacíos', () => {
      renderModal();
      expect(screen.getByRole('button', { name: 'Guardar Paciente' })).toBeDisabled();
    });

    it('el botón se activa al rellenar todos los campos obligatorios', () => {
      renderModal();
      rellenarObligatorios();
      expect(screen.getByRole('button', { name: 'Guardar Paciente' })).not.toBeDisabled();
    });

    it('el botón muestra "Guardando…" e isPending=true lo desactiva', () => {
      mockUseCreatePaciente.mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
      });
      renderModal();
      expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
    });
  });

  describe('validación de RUT', () => {
    it('RUT inválido muestra el mensaje de error bajo el campo', () => {
      mockEsRutValido.mockReturnValue(false);
      renderModal();
      fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), {
        target: { value: '12.345.678-0' },
      });
      expect(
        screen.getByText('RUT inválido: verifica el dígito verificador'),
      ).toBeInTheDocument();
    });

    it('RUT inválido desactiva el botón aunque los demás campos estén rellenos', () => {
      mockEsRutValido.mockReturnValue(false);
      renderModal();
      rellenarObligatorios();
      fireEvent.change(screen.getByPlaceholderText('12.345.678-9'), {
        target: { value: '12.345.678-0' },
      });
      expect(screen.getByRole('button', { name: 'Guardar Paciente' })).toBeDisabled();
    });

    it('RUT vacío no muestra error (campo opcional)', () => {
      renderModal();
      expect(
        screen.queryByText('RUT inválido: verifica el dígito verificador'),
      ).not.toBeInTheDocument();
    });
  });

  describe('handleGuardar', () => {
    it('llama a mutateAsync al guardar con campos válidos', async () => {
      const onCreated = vi.fn();
      renderModal({ onCreated });
      rellenarObligatorios();
      fireEvent.click(screen.getByRole('button', { name: 'Guardar Paciente' }));
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledTimes(1);
      });
    });

    it('llama a onCreated con el id del nuevo paciente', async () => {
      const onCreated = vi.fn();
      renderModal({ onCreated });
      rellenarObligatorios();
      fireEvent.click(screen.getByRole('button', { name: 'Guardar Paciente' }));
      await waitFor(() => {
        expect(onCreated).toHaveBeenCalledWith('nuevo-paciente-1');
      });
    });

    it('muestra error de API cuando mutateAsync lanza excepción', async () => {
      mockMutateAsync.mockRejectedValue(new Error('API error'));
      renderModal();
      rellenarObligatorios();
      fireEvent.click(screen.getByRole('button', { name: 'Guardar Paciente' }));
      await waitFor(() => {
        expect(
          screen.getByText('No se pudo crear el paciente. Intenta nuevamente.'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('handleClose y reset del formulario', () => {
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

    it('al reabrir el modal el formulario aparece limpio', () => {
      const Controlled = () => {
        const [open, setOpen] = vi.fn().mockReturnValue(true) as any;
        // Controlamos la apertura directamente: abrimos → escribimos → cerramos → reabrimos
        return null;
      };

      // Renderizamos, escribimos, simulamos cierre con re-render
      const onClose = vi.fn();
      const { rerender } = render(
        <ModalNuevoPaciente isOpen={true} onClose={onClose} />,
      );
      fireEvent.change(screen.getByPlaceholderText('Ej: Juan'), {
        target: { value: 'Nombre de prueba' },
      });
      expect(screen.getByPlaceholderText('Ej: Juan')).toHaveValue('Nombre de prueba');

      // Simular cierre (handleClose resetea el form antes de llamar a onClose)
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      // Re-abrir — React desmonta y vuelve a montar, el form empieza vacío
      rerender(<ModalNuevoPaciente isOpen={false} onClose={onClose} />);
      rerender(<ModalNuevoPaciente isOpen={true} onClose={onClose} />);
      expect(screen.getByPlaceholderText('Ej: Juan')).toHaveValue('');
    });
  });
});
