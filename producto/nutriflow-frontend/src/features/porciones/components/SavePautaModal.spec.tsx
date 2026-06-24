import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SavePautaModal } from './SavePautaModal';

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x" />,
  Save: () => <span data-testid="icon-save" />,
}));

const BASE_PROPS = {
  open: true,
  defaultName: 'Pauta inicial',
  isEditing: false,
  isSaving: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SavePautaModal', () => {
  describe('visibilidad', () => {
    it('no renderiza nada cuando open=false', () => {
      const { container } = render(<SavePautaModal {...BASE_PROPS} open={false} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('renderiza el dialog cuando open=true', () => {
      render(<SavePautaModal {...BASE_PROPS} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('título', () => {
    it('muestra "Guardar pauta nueva" cuando isEditing=false', () => {
      render(<SavePautaModal {...BASE_PROPS} isEditing={false} />);
      expect(screen.getByText('Guardar pauta nueva')).toBeInTheDocument();
    });

    it('muestra "Guardar cambios de la pauta" cuando isEditing=true', () => {
      render(<SavePautaModal {...BASE_PROPS} isEditing={true} />);
      expect(screen.getByText('Guardar cambios de la pauta')).toBeInTheDocument();
    });
  });

  describe('input', () => {
    it('tiene el valor de defaultName al abrir', () => {
      render(<SavePautaModal {...BASE_PROPS} defaultName="Mi pauta" />);
      expect(screen.getByRole('textbox')).toHaveValue('Mi pauta');
    });

    it('tiene maxLength de 60 caracteres', () => {
      render(<SavePautaModal {...BASE_PROPS} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '60');
    });

    it('tiene placeholder igual a defaultName', () => {
      render(<SavePautaModal {...BASE_PROPS} defaultName="Pauta inicial" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'Pauta inicial');
    });
  });

  describe('cierre del modal', () => {
    it('clic en el botón X llama a onClose', () => {
      const onClose = vi.fn();
      render(<SavePautaModal {...BASE_PROPS} onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clic en Cancelar llama a onClose', () => {
      const onClose = vi.fn();
      render(<SavePautaModal {...BASE_PROPS} onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clic en el backdrop (fuera del panel) llama a onClose', () => {
      const onClose = vi.fn();
      render(<SavePautaModal {...BASE_PROPS} onClose={onClose} />);
      fireEvent.click(screen.getByRole('dialog'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('clic dentro del panel NO llama a onClose (stopPropagation)', () => {
      const onClose = vi.fn();
      render(<SavePautaModal {...BASE_PROPS} onClose={onClose} />);
      fireEvent.click(screen.getByRole('textbox'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('confirmación', () => {
    it('clic en Guardar llama a onConfirm con el nombre escrito', () => {
      const onConfirm = vi.fn();
      render(<SavePautaModal {...BASE_PROPS} onConfirm={onConfirm} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Pauta verano' } });
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
      expect(onConfirm).toHaveBeenCalledWith('Pauta verano');
    });

    it('usa defaultName como fallback cuando el input queda vacío', () => {
      const onConfirm = vi.fn();
      render(<SavePautaModal {...BASE_PROPS} defaultName="Pauta inicial" onConfirm={onConfirm} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
      expect(onConfirm).toHaveBeenCalledWith('Pauta inicial');
    });

    it('Enter en el input llama a onConfirm', () => {
      const onConfirm = vi.fn();
      render(<SavePautaModal {...BASE_PROPS} defaultName="Pauta inicial" onConfirm={onConfirm} />);
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
      expect(onConfirm).toHaveBeenCalledWith('Pauta inicial');
    });
  });

  describe('estado isSaving', () => {
    it('el botón de guardar muestra "Guardando..." cuando isSaving=true', () => {
      render(<SavePautaModal {...BASE_PROPS} isSaving={true} />);
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });

    it('el botón de guardar está deshabilitado cuando isSaving=true', () => {
      render(<SavePautaModal {...BASE_PROPS} isSaving={true} />);
      expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
    });

    it('el botón de guardar muestra "Guardar" cuando isSaving=false', () => {
      render(<SavePautaModal {...BASE_PROPS} isSaving={false} />);
      expect(screen.getByRole('button', { name: 'Guardar' })).not.toBeDisabled();
    });
  });
});
