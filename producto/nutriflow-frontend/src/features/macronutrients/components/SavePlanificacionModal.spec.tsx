import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SavePlanificacionModal } from './SavePlanificacionModal';

vi.mock('lucide-react', () => ({
  X: () => <span data-testid="icon-x" />,
  Save: () => <span data-testid="icon-save" />,
}));

const PLANIFICACIONES = [
  { id: 'plan-1', nombre: 'Planificación 1', calorias_totales: 1800, activa: false },
  { id: 'plan-2', nombre: 'Planificación 2', calorias_totales: 2000, activa: true },
];

const BASE_PROPS = {
  open: true,
  suggestedName: 'Planificación 1',
  planificaciones: [],
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

  describe('confirmación — crear nueva', () => {
    it('clic en Guardar llama a onConfirm con mode create y el nombre escrito', () => {
      const onConfirm = vi.fn();
      render(<SavePlanificacionModal {...BASE_PROPS} onConfirm={onConfirm} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Plan de entrenamiento' } });
      fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
      expect(onConfirm).toHaveBeenCalledWith({ mode: 'create', nombre: 'Plan de entrenamiento' });
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
      expect(onConfirm).toHaveBeenCalledWith({ mode: 'create', nombre: 'Planificación 1' });
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
      expect(onConfirm).toHaveBeenCalledWith({ mode: 'create', nombre: 'Planificación 1' });
    });
  });

  describe('confirmación — sobrescribir existente', () => {
    it('la opción de sobrescribir está deshabilitada sin planificaciones previas', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} planificaciones={[]} />);
      const radios = screen.getAllByRole('radio');
      expect(radios[1]).toBeDisabled();
      expect(screen.getByText('El paciente aún no tiene planificaciones guardadas.')).toBeInTheDocument();
    });

    it('preselecciona la planificación activa del paciente en el selector', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} planificaciones={PLANIFICACIONES} />);
      const select = screen.getByRole('combobox', { name: 'Planificación a sobrescribir' });
      expect(select).toHaveValue('plan-2'); // plan-2 es la activa
    });

    it('al elegir sobrescribir, confirma con mode overwrite y el id seleccionado', () => {
      const onConfirm = vi.fn();
      render(
        <SavePlanificacionModal
          {...BASE_PROPS}
          planificaciones={PLANIFICACIONES}
          onConfirm={onConfirm}
        />,
      );
      fireEvent.click(screen.getAllByRole('radio')[1]);
      const select = screen.getByRole('combobox', { name: 'Planificación a sobrescribir' });
      fireEvent.change(select, { target: { value: 'plan-1' } });
      fireEvent.click(screen.getByRole('button', { name: 'Sobrescribir' }));
      expect(onConfirm).toHaveBeenCalledWith({ mode: 'overwrite', planificacionId: 'plan-1' });
    });

    it('en modo sobrescribir el botón cambia su etiqueta a "Sobrescribir"', () => {
      render(<SavePlanificacionModal {...BASE_PROPS} planificaciones={PLANIFICACIONES} />);
      fireEvent.click(screen.getAllByRole('radio')[1]);
      expect(screen.getByRole('button', { name: 'Sobrescribir' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument();
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
