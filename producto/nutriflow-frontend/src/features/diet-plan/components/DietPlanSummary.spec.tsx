import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DietPlanSummary } from './DietPlanSummary';

vi.mock('lucide-react', () => ({
  FileText: () => <span data-testid="icon-file" />,
  Save: () => <span data-testid="icon-save" />,
  PieChart: () => <span data-testid="icon-pie" />,
}));

// kcalPercentage = Math.min((kcal / tmbPromedio) * 100, 100)
// Con kcal=1000, tmbPromedio=2000 → kcalPercentage = 50

const TOTALS = { kcal: 1000, prot: 150, cho: 200, fat: 50 };
const CONTEXT = { tmbPromedio: 2000, pesoActivo: 70 };

describe('DietPlanSummary', () => {
  describe('muestra de datos', () => {
    it('muestra el ratio "kcal / tmbPromedio"', () => {
      render(<DietPlanSummary currentTotals={TOTALS} targetContext={CONTEXT} />);
      expect(screen.getByText('1000 / 2000')).toBeInTheDocument();
    });

    it('muestra los gramos de proteína', () => {
      render(<DietPlanSummary currentTotals={TOTALS} targetContext={CONTEXT} />);
      expect(screen.getByText('150g')).toBeInTheDocument();
    });

    it('muestra los gramos de carbohidratos', () => {
      render(<DietPlanSummary currentTotals={TOTALS} targetContext={CONTEXT} />);
      expect(screen.getByText('200g')).toBeInTheDocument();
    });

    it('muestra los gramos de grasa', () => {
      render(<DietPlanSummary currentTotals={TOTALS} targetContext={CONTEXT} />);
      expect(screen.getByText('50g')).toBeInTheDocument();
    });

    it('muestra las etiquetas de cada macro', () => {
      render(<DietPlanSummary currentTotals={TOTALS} targetContext={CONTEXT} />);
      expect(screen.getByText('Proteínas')).toBeInTheDocument();
      expect(screen.getByText('Carbohidratos')).toBeInTheDocument();
      expect(screen.getByText('Grasas')).toBeInTheDocument();
    });
  });

  describe('kcalPercentage — barra de progreso', () => {
    it('aplica el 50% de ancho cuando kcal = 50% del objetivo', () => {
      const { container } = render(
        <DietPlanSummary currentTotals={TOTALS} targetContext={CONTEXT} />,
      );
      const barra = container.querySelector('.bg-pine-soft');
      expect(barra).toHaveStyle({ width: '50%' });
    });

    it('clampea el ancho al 100% cuando kcal supera el objetivo', () => {
      const { container } = render(
        <DietPlanSummary
          currentTotals={{ ...TOTALS, kcal: 3000 }}
          targetContext={CONTEXT}
        />,
      );
      const barra = container.querySelector('.bg-pine-soft');
      expect(barra).toHaveStyle({ width: '100%' });
    });

    it('muestra barra al 0% cuando kcal es 0', () => {
      const { container } = render(
        <DietPlanSummary
          currentTotals={{ ...TOTALS, kcal: 0 }}
          targetContext={CONTEXT}
        />,
      );
      const barra = container.querySelector('.bg-pine-soft');
      expect(barra).toHaveStyle({ width: '0%' });
    });

    it('la barra usa bg-pine-soft (kcalPercentage siempre ≤ 100 por el Math.min)', () => {
      const { container } = render(
        <DietPlanSummary
          currentTotals={{ ...TOTALS, kcal: 5000 }}
          targetContext={CONTEXT}
        />,
      );
      // kcalPercentage = Math.min(250, 100) = 100 → nunca > 100 → siempre bg-pine-soft
      expect(container.querySelector('.bg-pine-soft')).toBeInTheDocument();
      expect(container.querySelector('.bg-clinical-red')).not.toBeInTheDocument();
    });

    it('el ancho es exactamente 100% cuando kcal iguala tmbPromedio', () => {
      const { container } = render(
        <DietPlanSummary
          currentTotals={{ ...TOTALS, kcal: 2000 }}
          targetContext={CONTEXT}
        />,
      );
      const barra = container.querySelector('.bg-pine-soft');
      expect(barra).toHaveStyle({ width: '100%' });
    });
  });

  describe('acciones', () => {
    it('renderiza el botón "Generar PDF"', () => {
      render(<DietPlanSummary currentTotals={TOTALS} targetContext={CONTEXT} />);
      expect(screen.getByRole('button', { name: /Generar PDF/i })).toBeInTheDocument();
    });

    it('renderiza el botón "Guardar Pauta"', () => {
      render(<DietPlanSummary currentTotals={TOTALS} targetContext={CONTEXT} />);
      expect(screen.getByRole('button', { name: /Guardar Pauta/i })).toBeInTheDocument();
    });
  });
});
