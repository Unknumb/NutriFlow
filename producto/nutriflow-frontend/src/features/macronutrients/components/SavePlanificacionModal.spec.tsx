import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SavePlanificacionModal } from './SavePlanificacionModal';

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x" />,
  Save: () => <span data-testid="icon-save" />,
}));

const BASE_PROPS = {
  open: true,
  suggestedName: 'Planificación 1',
  isSaving: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SavePlanificacionModal', () => {
  describe('visibilidad', () => {
    it('no renderiza nada cuando open=false', () => {
      const { container } = render(<SavePlanificacionModal {...BASE_PROPS} open={false} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renderiza el dialog cuando open=true', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('título y texto', () => {
    it('muestra el título "Guardar planificación"', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} />);
      expect(screen.getByText('Guardar planificación')).toBeInTheDocument();
    });

    it('muestra el nombre sugerido en el texto de ayuda', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} suggestedName="Plan Verano" />);
      expect(screen.getByText('Plan Verano')).toBeInTheDocument();
    });
  });

  describe('input', () => {
    it('viene prerellenado con suggestedName', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} suggestedName="Planificación 2" />);
      expect(screen.getByRole('textbox')).toHaveValue('Planificación 2');
    });

    it('tiene maxLength de 60 caracteres', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '60');
    });

    it('tiene placeholder igual a suggestedName', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} suggestedName="Planificación 1" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Planificación 1');
    });
  });

  describe('cierre del modal', () => {
    it('clic en el botón X llama a onClose', () => {
      const onClose = vi.fn();
      render(<SavePlanificacionModal {...BASE_PROPS} onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clic en Cancelar llama a onClose', () => {
      const onClose = vi.fn();
      render(<SavePlanificacionModal {...BASE_PROPS} onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clic en el backdrop llama a onClose', () => {
      const onClose = vi.fn();
      render(<SavePlanificacionModal {...BASE_PROPS} onClose={onClose} />);
      fireEvent.click(screen.getByRole('dialog'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clic dentro del panel NO llama a onClose (stopPropagation)', () => {
      const onClose = vi.fn();
      render(<SavePlanificacionModal {...BASE_PROPS} onClose={onClose} />);
      fireEvent.click(screen.getByRole('textbox'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('confirmación', () => {
    it('clic en Guardar llama a onConfirm con el nombre escrito', () => {
      const onConfirm = vi.fn();
      render(<SavePlanificacionModal {...BASE_PROPS} onConfirm={onConfirm} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Plan de entrenamiento' } });
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
      expect(onConfirm).toHaveBeenCalledWith('Plan de entrenamiento');
    });

    it('usa suggestedName como fallback cuando el input queda en blanco', () => {
      const onConfirm = vi.fn();
      render(
        <SavePlanificacionModal
          {...BASE_PROPS}
          suggestedName="Planificación 1"
          onConfirm={onConfirm}
        />,
      );
      fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
      expect(onConfirm).toHaveBeenCalledWith('Planificación 1');
    });

    it('Enter en el input llama a onConfirm', () => {
      const onConfirm = vi.fn();
      render(
        <SavePlanificacionModal
          {...BASE_PROPS}
          suggestedName="Planificación 1"
          onConfirm={onConfirm}
        />,
      );
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
      expect(onConfirm).toHaveBeenCalledWith('Planificación 1');
    });
  });

  describe('estado isSaving', () => {
    it('el botón de guardar muestra "Guardando..." cuando isSaving=true', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} isSaving={true} />);
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });

    it('el botón de guardar está deshabilitado cuando isSaving=true', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} isSaving={true} />);
      expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
    });

    it('el botón de guardar está habilitado cuando isSaving=false', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} isSaving={false} />);
      expect(screen.getByRole('button', { name: 'Guardar' })).not.toBeDisabled();
    });
  });
});
