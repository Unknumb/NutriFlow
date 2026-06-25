import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FoodGroupCard } from './FoodGroupCard';

vi.mock('lucide-react', () => ({
  Minus: () => <span data-testid="icon-minus" />,
  Plus: () => <span data-testid="icon-plus" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Infinity: () => <span data-testid="icon-infinity" />,
}));

const GROUP = {
  id: 'cer',
  title: 'Cereales',
  kcal: 140,
  macros: { p: 3, c: 30, g: 1 },
  theme: { bgMain: 'bg-white', bgHeader: 'bg-amber-500', border: 'border-amber-400', text: '' },
};

const BASE = {
  group: GROUP as any,
  portions: 3,
  onIncrement: vi.fn(),
  onDecrement: vi.fn(),
  onToggleLibre: vi.fn(),
  esLibre: false,
};

beforeEach(() => vi.clearAllMocks());

describe('FoodGroupCard', () => {
  describe('encabezado', () => {
    it('muestra el título del grupo', () => {
      render(<FoodGroupCard {...BASE} />);
      expect(screen.getByText('Cereales')).toBeInTheDocument();
    });

    it('muestra las kcal y macros de referencia', () => {
      render(<FoodGroupCard {...BASE} />);
      expect(screen.getByText('140kcal')).toBeInTheDocument();
      expect(screen.getByText(/P:3g/)).toBeInTheDocument();
      expect(screen.getByText(/C:30g/)).toBeInTheDocument();
      expect(screen.getByText(/G:1g/)).toBeInTheDocument();
    });

    it('muestra el botón de eliminar cuando se proporciona onDelete', () => {
      render(<FoodGroupCard {...BASE} onDelete={vi.fn()} />);
      expect(screen.getByTitle('Eliminar grupo')).toBeInTheDocument();
    });

    it('no muestra el botón de eliminar cuando onDelete es undefined', () => {
      render(<FoodGroupCard {...BASE} />);
      expect(screen.queryByTitle('Eliminar grupo')).not.toBeInTheDocument();
    });

    it('clic en eliminar llama a onDelete', () => {
      const onDelete = vi.fn();
      render(<FoodGroupCard {...BASE} onDelete={onDelete} />);
      fireEvent.click(screen.getByTitle('Eliminar grupo'));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });

  describe('contador de porciones (esLibre=false)', () => {
    it('muestra el número de porciones en el input', () => {
      render(<FoodGroupCard {...BASE} portions={3} />);
      expect(screen.getByRole('spinbutton')).toHaveValue(3);
    });

    it('clic en + llama a onIncrement', () => {
      const onIncrement = vi.fn();
      render(<FoodGroupCard {...BASE} onIncrement={onIncrement} />);
      fireEvent.click(screen.getByTestId('icon-plus').closest('button')!);
      expect(onIncrement).toHaveBeenCalledTimes(1);
    });

    it('clic en - llama a onDecrement', () => {
      const onDecrement = vi.fn();
      render(<FoodGroupCard {...BASE} onDecrement={onDecrement} />);
      fireEvent.click(screen.getByTestId('icon-minus').closest('button')!);
      expect(onDecrement).toHaveBeenCalledTimes(1);
    });

    it('el botón de decrement está desactivado cuando portions=0', () => {
      render(<FoodGroupCard {...BASE} portions={0} />);
      expect(screen.getByTestId('icon-minus').closest('button')).toBeDisabled();
    });

    it('el botón de decrement está activo cuando portions > 0', () => {
      render(<FoodGroupCard {...BASE} portions={1} />);
      expect(screen.getByTestId('icon-minus').closest('button')).not.toBeDisabled();
    });
  });

  describe('modo libre consumo (esLibre=true)', () => {
    it('muestra el ícono de infinito en lugar del contador', () => {
      render(<FoodGroupCard {...BASE} esLibre={true} />);
      expect(screen.getByTestId('icon-infinity')).toBeInTheDocument();
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    });

    it('no muestra los botones + y - cuando esLibre=true', () => {
      render(<FoodGroupCard {...BASE} esLibre={true} />);
      expect(screen.queryByTestId('icon-plus')).not.toBeInTheDocument();
      expect(screen.queryByTestId('icon-minus')).not.toBeInTheDocument();
    });
  });

  describe('toggle de libre consumo', () => {
    it('clic en el toggle llama a onToggleLibre', () => {
      const onToggleLibre = vi.fn();
      render(<FoodGroupCard {...BASE} onToggleLibre={onToggleLibre} />);
      fireEvent.click(screen.getByTitle('Marcar este grupo como libre consumo (ad libitum)'));
      expect(onToggleLibre).toHaveBeenCalledTimes(1);
    });

    it('el botón toggle tiene clase bg-pine-soft/10 cuando esLibre=true', () => {
      render(<FoodGroupCard {...BASE} esLibre={true} />);
      expect(
        screen.getByTitle('Marcar este grupo como libre consumo (ad libitum)'),
      ).toHaveClass('bg-pine-soft/10');
    });

    it('el botón toggle tiene clase bg-white/60 cuando esLibre=false', () => {
      render(<FoodGroupCard {...BASE} esLibre={false} />);
      expect(
        screen.getByTitle('Marcar este grupo como libre consumo (ad libitum)'),
      ).toHaveClass('bg-white/60');
    });
  });
});
