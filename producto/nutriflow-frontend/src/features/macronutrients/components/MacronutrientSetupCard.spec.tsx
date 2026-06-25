import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MacronutrientSetupCard } from './MacronutrientSetupCard';

vi.mock('lucide-react', () => ({
  AlertTriangle: () => <span data-testid="icon-alert" />,
  Wand2: () => <span data-testid="icon-wand" />,
}));

const CONTEXT = { tmbPromedio: 2000, pesoActivo: 70 };

const INPUTS = { protGkg: 2.0, choPct: 50, fatPct: 20, protPct: 30 } as any;

const TOTALS_BALANCED = {
  prot: { pct: 30, g: 150, kcal: 600 },
  cho: { pct: 50, g: 250, kcal: 1000 },
  fat: { pct: 20, g: 60, kcal: 540 },
  summary: { percent: 100 },
} as any;

// desviacion = |108 - 100| = 8 > 5 → critico
const TOTALS_CRITICO = { ...TOTALS_BALANCED, summary: { percent: 108 } } as any;

// desviacion = |103 - 100| = 3 ≤ 5 → no critico
const TOTALS_LEVE = { ...TOTALS_BALANCED, summary: { percent: 103 } } as any;

const ACTIONS = {
  setMacro: vi.fn(),
  updateFromGrams: vi.fn(),
  updateFromGramsPerKg: vi.fn(),
  setProtGkg: vi.fn(),
  setChoPct: vi.fn(),
  setFatPct: vi.fn(),
  autoBalance: vi.fn(),
};

beforeEach(() => vi.clearAllMocks());

const renderCard = (
  totals = TOTALS_BALANCED,
  isBalanced = true,
) =>
  render(
    <MacronutrientSetupCard
      context={CONTEXT}
      inputs={INPUTS}
      totals={totals}
      isBalanced={isBalanced}
      actions={ACTIONS}
    />,
  );

describe('MacronutrientSetupCard', () => {
  describe('tab switching', () => {
    it('renderiza los 3 tabs de entrada', () => {
      renderCard();
      const tablist = screen.getByRole('tablist');
      const tabs = within(tablist).getAllByRole('button');
      expect(tabs).toHaveLength(3);
    });

    it('el tab % está activo por defecto (tiene clase bg-white)', () => {
      renderCard();
      const tablist = screen.getByRole('tablist');
      const tabs = within(tablist).getAllByRole('button');
      expect(tabs[0]).toHaveClass('bg-white');
      expect(tabs[1]).not.toHaveClass('bg-white');
      expect(tabs[2]).not.toHaveClass('bg-white');
    });

    it('al hacer clic en (g) el tab cambia a gramos (max del slider de proteínas = 400)', () => {
      renderCard();
      const tablist = screen.getByRole('tablist');
      fireEvent.click(within(tablist).getAllByRole('button')[1]);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('max', '400');
    });

    it('en modo % el slider de proteínas tiene max=100', () => {
      renderCard();
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('max', '100');
    });

    it('al hacer clic en g/kg el slider de proteínas tiene max=4', () => {
      renderCard();
      const tablist = screen.getByRole('tablist');
      fireEvent.click(within(tablist).getAllByRole('button')[2]);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[0]).toHaveAttribute('max', '4');
    });

    it('en modo gramos el slider de carbohidratos tiene max=600', () => {
      renderCard();
      const tablist = screen.getByRole('tablist');
      fireEvent.click(within(tablist).getAllByRole('button')[1]);
      const sliders = screen.getAllByRole('slider');
      expect(sliders[1]).toHaveAttribute('max', '600');
    });
  });

  describe('alerta de desbalance', () => {
    it('no muestra alerta cuando isBalanced=true', () => {
      renderCard(TOTALS_BALANCED, true);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('muestra alerta cuando isBalanced=false', () => {
      renderCard(TOTALS_CRITICO, false);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('alerta critica (desviacion > 5) usa bg-clinical-red/10', () => {
      renderCard(TOTALS_CRITICO, false);
      expect(screen.getByRole('alert')).toHaveClass('bg-clinical-red/10');
    });

    it('alerta leve (desviacion ≤ 5) usa bg-apricot/15', () => {
      renderCard(TOTALS_LEVE, false);
      expect(screen.getByRole('alert')).toHaveClass('bg-apricot/15');
    });

    it('el botón "Cuadrar" en la alerta llama a actions.autoBalance', () => {
      const autoBalance = vi.fn();
      render(
        <MacronutrientSetupCard
          context={CONTEXT}
          inputs={INPUTS}
          totals={TOTALS_CRITICO}
          isBalanced={false}
          actions={{ ...ACTIONS, autoBalance }}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /Cuadrar/i }));
      expect(autoBalance).toHaveBeenCalledTimes(1);
    });

    it('muestra el porcentaje actual en el mensaje de alerta', () => {
      renderCard(TOTALS_CRITICO, false);
      expect(screen.getByText(/108%/)).toBeInTheDocument();
    });
  });

  describe('sliders de macronutrientes', () => {
    it('renderiza 3 sliders (uno por macro)', () => {
      renderCard();
      expect(screen.getAllByRole('slider')).toHaveLength(3);
    });

    it('los títulos de los 3 macros están visibles', () => {
      renderCard();
      expect(screen.getByText('Proteínas')).toBeInTheDocument();
      expect(screen.getByText('Carbohidratos')).toBeInTheDocument();
      expect(screen.getByText('Grasas')).toBeInTheDocument();
    });
  });
});
