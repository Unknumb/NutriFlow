import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NutritionalSummaryCard } from './NutritionalSummaryCard';
import { MACRO_COLORS } from '../../../shared/ui/macroColors';

vi.mock('lucide-react', () => ({
  Zap: () => null,
}));

const TOTALS = {
  prot: { g: 120 },
  cho: { g: 250 },
  fat: { g: 70 },
};

describe('NutritionalSummaryCard', () => {
  it('muestra el heading "Resumen Nutricional"', () => {
    render(<NutritionalSummaryCard totals={TOTALS} tmbPromedio={2000} />);
    expect(screen.getByText('Resumen Nutricional')).toBeInTheDocument();
  });

  it('muestra el total de calorías con la unidad kcal', () => {
    render(<NutritionalSummaryCard totals={TOTALS} tmbPromedio={2000} />);
    expect(screen.getByText('2000 kcal')).toBeInTheDocument();
  });

  it('actualiza las calorías si cambia tmbPromedio', () => {
    const { rerender } = render(<NutritionalSummaryCard totals={TOTALS} tmbPromedio={1800} />);
    expect(screen.getByText('1800 kcal')).toBeInTheDocument();
    rerender(<NutritionalSummaryCard totals={TOTALS} tmbPromedio={2200} />);
    expect(screen.getByText('2200 kcal')).toBeInTheDocument();
  });

  it('muestra los gramos de proteínas', () => {
    render(<NutritionalSummaryCard totals={TOTALS} tmbPromedio={2000} />);
    expect(screen.getByText('120g')).toBeInTheDocument();
  });

  it('muestra los gramos de carbohidratos', () => {
    render(<NutritionalSummaryCard totals={TOTALS} tmbPromedio={2000} />);
    expect(screen.getByText('250g')).toBeInTheDocument();
  });

  it('muestra los gramos de grasas', () => {
    render(<NutritionalSummaryCard totals={TOTALS} tmbPromedio={2000} />);
    expect(screen.getByText('70g')).toBeInTheDocument();
  });

  it('muestra los tres labels de macronutrientes', () => {
    render(<NutritionalSummaryCard totals={TOTALS} tmbPromedio={2000} />);
    expect(screen.getByText('Proteínas')).toBeInTheDocument();
    expect(screen.getByText('Carbohidratos')).toBeInTheDocument();
    expect(screen.getByText('Grasas')).toBeInTheDocument();
  });

  it('aplica el color de proteínas de MACRO_COLORS al valor en gramos', () => {
    render(<NutritionalSummaryCard totals={TOTALS} tmbPromedio={2000} />);
    expect(screen.getByText('120g')).toHaveStyle({ color: MACRO_COLORS.proteinas });
  });

  it('aplica el color de carbohidratos de MACRO_COLORS al valor en gramos', () => {
    render(<NutritionalSummaryCard totals={TOTALS} tmbPromedio={2000} />);
    expect(screen.getByText('250g')).toHaveStyle({ color: MACRO_COLORS.carbohidratos });
  });

  it('aplica el color de grasas de MACRO_COLORS al valor en gramos', () => {
    render(<NutritionalSummaryCard totals={TOTALS} tmbPromedio={2000} />);
    expect(screen.getByText('70g')).toHaveStyle({ color: MACRO_COLORS.grasas });
  });

  it('muestra 0g cuando los valores de macros son cero', () => {
    const totalsVacios = { prot: { g: 0 }, cho: { g: 0 }, fat: { g: 0 } };
    render(<NutritionalSummaryCard totals={totalsVacios} tmbPromedio={0} />);
    expect(screen.getByText('0 kcal')).toBeInTheDocument();
    expect(screen.getAllByText('0g')).toHaveLength(3);
  });
});
