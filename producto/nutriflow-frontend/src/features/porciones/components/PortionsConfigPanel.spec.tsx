import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PortionsConfigPanel } from './PortionsConfigPanel';

const mockToggleMeal = vi.hoisted(() => vi.fn());
const mockAddCustomMeal = vi.hoisted(() => vi.fn());
const mockRemoveCustomMeal = vi.hoisted(() => vi.fn());
const mockSetMealTime = vi.hoisted(() => vi.fn());
const mockUsePortions = vi.hoisted(() => vi.fn());

vi.mock('../hooks/usePortions', () => ({
  usePortions: mockUsePortions,
}));

vi.mock('../constants', () => ({
  MEALS: [
    { id: 'desayuno', name: 'Desayuno' },
    { id: 'almuerzo', name: 'Almuerzo' },
  ],
  resolverComida: (id: string, _: any[], mealTimes: Record<string, string>) => ({
    time: mealTimes[id] ?? '08:00',
  }),
}));

vi.mock('lucide-react', () => ({
  Settings: () => <span data-testid="icon-settings" />,
  X: () => <span data-testid="icon-x" />,
  Plus: () => <span data-testid="icon-plus" />,
  Trash2: () => <span data-testid="icon-trash" />,
}));

const STATE_BASE = {
  activeMeals: ['desayuno'],
  customMeals: [],
  mealTimes: { desayuno: '08:00', almuerzo: '12:00' },
};

const ACTIONS_BASE = {
  toggleMeal: mockToggleMeal,
  addCustomMeal: mockAddCustomMeal,
  removeCustomMeal: mockRemoveCustomMeal,
  setMealTime: mockSetMealTime,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUsePortions.mockReturnValue({ state: STATE_BASE, actions: ACTIONS_BASE });
});

const openPanel = () =>
  fireEvent.click(screen.getByRole('button', { name: /Personalizar Pizarra/i }));

const getPanel = () =>
  screen.getByRole('heading', { name: 'Personalizar Pizarra' })
    .closest('[class*="translate"]') as HTMLElement;

describe('PortionsConfigPanel', () => {
  describe('botón de apertura', () => {
    it('muestra el botón "Personalizar Pizarra"', () => {
      render(<PortionsConfigPanel />);
      expect(screen.getByRole('button', { name: /Personalizar Pizarra/i })).toBeInTheDocument();
    });

    it('el panel está oculto inicialmente (translate-x-full)', () => {
      render(<PortionsConfigPanel />);
      expect(getPanel()).toHaveClass('translate-x-full');
    });

    it('al hacer clic el panel se muestra (translate-x-0)', () => {
      render(<PortionsConfigPanel />);
      openPanel();
      expect(getPanel()).toHaveClass('translate-x-0');
    });
  });

  describe('contenido del panel', () => {
    it('muestra los tiempos de comida de MEALS', () => {
      render(<PortionsConfigPanel />);
      openPanel();
      expect(screen.getByText('Desayuno')).toBeInTheDocument();
      expect(screen.getByText('Almuerzo')).toBeInTheDocument();
    });

    it('el checkbox de Desayuno está marcado (activeMeals=[desayuno])', () => {
      render(<PortionsConfigPanel />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).toBeChecked();
    });

    it('el checkbox de Almuerzo está desmarcado', () => {
      render(<PortionsConfigPanel />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[1]).not.toBeChecked();
    });
  });

  describe('callbacks de toggle', () => {
    it('toggleMeal se llama al cambiar el checkbox de Desayuno', () => {
      render(<PortionsConfigPanel />);
      fireEvent.click(screen.getAllByRole('checkbox')[0]);
      expect(mockToggleMeal).toHaveBeenCalledWith('desayuno');
    });
  });

  describe('agregar comida personalizada', () => {
    it('el botón Agregar está desactivado con el nombre vacío', () => {
      render(<PortionsConfigPanel />);
      openPanel();
      expect(screen.getByRole('button', { name: /Agregar/i })).toBeDisabled();
    });

    it('el botón Agregar se activa al escribir un nombre', () => {
      render(<PortionsConfigPanel />);
      openPanel();
      fireEvent.change(screen.getByPlaceholderText('Nombre (ej: Colación tarde)'), {
        target: { value: 'Merienda' },
      });
      expect(screen.getByRole('button', { name: /Agregar/i })).not.toBeDisabled();
    });

    it('addCustomMeal se llama con nombre y horario vacío por defecto', () => {
      render(<PortionsConfigPanel />);
      openPanel();
      fireEvent.change(screen.getByPlaceholderText('Nombre (ej: Colación tarde)'), {
        target: { value: 'Merienda' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Agregar/i }));
      expect(mockAddCustomMeal).toHaveBeenCalledWith('Merienda', '');
    });

    it('el input de nombre se vacía tras hacer clic en Agregar', () => {
      render(<PortionsConfigPanel />);
      openPanel();
      const input = screen.getByPlaceholderText('Nombre (ej: Colación tarde)');
      fireEvent.change(input, { target: { value: 'Merienda' } });
      fireEvent.click(screen.getByRole('button', { name: /Agregar/i }));
      expect(input).toHaveValue('');
    });
  });

  describe('comidas personalizadas', () => {
    it('muestra el botón de eliminar (Trash2) para comidas personalizadas', () => {
      mockUsePortions.mockReturnValue({
        state: {
          ...STATE_BASE,
          customMeals: [{ id: 'custom-1', name: 'Colación tarde' }],
        },
        actions: ACTIONS_BASE,
      });
      render(<PortionsConfigPanel />);
      openPanel();
      expect(screen.getByTestId('icon-trash')).toBeInTheDocument();
    });

    it('removeCustomMeal se llama al clic en el botón de eliminar', () => {
      mockUsePortions.mockReturnValue({
        state: {
          ...STATE_BASE,
          customMeals: [{ id: 'custom-1', name: 'Colación tarde' }],
        },
        actions: ACTIONS_BASE,
      });
      render(<PortionsConfigPanel />);
      openPanel();
      fireEvent.click(screen.getByTestId('icon-trash').closest('button')!);
      expect(mockRemoveCustomMeal).toHaveBeenCalledWith('custom-1');
    });
  });

  describe('cerrar panel', () => {
    it('el botón X cierra el panel', () => {
      render(<PortionsConfigPanel />);
      openPanel();
      expect(getPanel()).toHaveClass('translate-x-0');
      fireEvent.click(screen.getByTestId('icon-x').closest('button')!);
      expect(getPanel()).toHaveClass('translate-x-full');
    });
  });
});
