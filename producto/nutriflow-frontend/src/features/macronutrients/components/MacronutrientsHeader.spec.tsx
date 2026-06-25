import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MacronutrientsHeader } from './MacronutrientsHeader';

vi.mock('lucide-react', () => ({
  LockOpen: () => <span data-testid="icon-lock-open" />,
  Check: () => <span data-testid="icon-check" />,
}));

const CONTEXT = { tmbPromedio: 2000, pesoActivo: 70 };

// prot.kcal=600 + cho.kcal=1000 + fat.kcal=540 = 2140
const TOTALS = {
  prot: { pct: 30, g: 150, kcal: 600 },
  cho: { pct: 50, g: 250, kcal: 1000 },
  fat: { pct: 20, g: 60, kcal: 540 },
} as any;

const ACTIONS = {
  onPesoChange: vi.fn(),
  onTmbChange: vi.fn(),
  onAutoBalance: vi.fn(),
};

beforeEach(() => vi.clearAllMocks());

const renderHeader = (overrides: Partial<Parameters<typeof MacronutrientsHeader>[0]> = {}) =>
  render(
    <MacronutrientsHeader
      context={CONTEXT}
      totals={TOTALS}
      isBalanced={true}
      {...ACTIONS}
      {...overrides}
    />,
  );

describe('MacronutrientsHeader', () => {
  describe('inputs de contexto', () => {
    it('muestra el tmbPromedio en el primer input numérico', () => {
      renderHeader();
      expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(2000);
    });

    it('muestra el pesoActivo en el segundo input numérico', () => {
      renderHeader();
      expect(screen.getAllByRole('spinbutton')[1]).toHaveValue(70);
    });

    it('llama a onTmbChange con el valor numérico al cambiar el input de calorías', () => {
      const onTmbChange = vi.fn();
      renderHeader({ onTmbChange });
      fireEvent.change(screen.getAllByRole('spinbutton')[0], { target: { value: '2200' } });
      expect(onTmbChange).toHaveBeenCalledWith(2200);
    });

    it('llama a onPesoChange con el valor numérico al cambiar el input de peso', () => {
      const onPesoChange = vi.fn();
      renderHeader({ onPesoChange });
      fireEvent.change(screen.getAllByRole('spinbutton')[1], { target: { value: '75' } });
      expect(onPesoChange).toHaveBeenCalledWith(75);
    });
  });

  describe('total calculado', () => {
    it('muestra la suma de kcal de los 3 macros (600+1000+540=2140)', () => {
      renderHeader();
      expect(screen.getByText('2140')).toBeInTheDocument();
    });

    it('el div de total tiene clase bg-pine-soft/5 cuando isBalanced=true', () => {
      renderHeader({ isBalanced: true });
      expect(screen.getByText('2140')).toHaveClass('bg-pine-soft/5');
    });

    it('el div de total tiene clase bg-apricot/10 cuando isBalanced=false', () => {
      renderHeader({ isBalanced: false });
      expect(screen.getByText('2140')).toHaveClass('bg-apricot/10');
    });
  });

  describe('botón de balance automático', () => {
    it('está desactivado cuando isBalanced=true', () => {
      renderHeader({ isBalanced: true });
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('muestra "Cuadrado" y el ícono Check cuando isBalanced=true', () => {
      renderHeader({ isBalanced: true });
      expect(screen.getByText('Cuadrado')).toBeInTheDocument();
      expect(screen.getByTestId('icon-check')).toBeInTheDocument();
    });

    it('está activo y muestra "Cuadrar a 100%" cuando isBalanced=false', () => {
      renderHeader({ isBalanced: false });
      expect(screen.getByRole('button')).not.toBeDisabled();
      expect(screen.getByText('Cuadrar a 100%')).toBeInTheDocument();
      expect(screen.getByTestId('icon-lock-open')).toBeInTheDocument();
    });

    it('llama a onAutoBalance al hacer clic cuando no está balanceado', () => {
      const onAutoBalance = vi.fn();
      renderHeader({ isBalanced: false, onAutoBalance });
      fireEvent.click(screen.getByRole('button'));
      expect(onAutoBalance).toHaveBeenCalledTimes(1);
    });
  });
});
