import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MacrosCard } from './MacrosCard';

const mockUseMacronutrientsSetup = vi.hoisted(() => vi.fn());

vi.mock('../../macronutrients/hooks/useMacronutrientsSetup', () => ({
  useMacronutrientsSetup: mockUseMacronutrientsSetup,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: any) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('../../../shared/ui/atoms/Card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ title }: any) => <div>{title}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../../../shared/ui/macroColors', () => ({
  MACRO_COLORS: { proteinas: '#4caf50', carbohidratos: '#ff9800', grasas: '#2196f3' },
}));

const TOTALS_BASE = {
  prot: { pct: 30, g: 150, kcal: 600 },
  cho: { pct: 50, g: 250, kcal: 1000 },
  fat: { pct: 20, g: 60, kcal: 540 },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MacrosCard', () => {
  describe('sin datos (TMB o peso = 0)', () => {
    it('muestra el mensaje cuando tmbPromedio=0', () => {
      mockUseMacronutrientsSetup.mockReturnValue({
        totals: TOTALS_BASE,
        context: { tmbPromedio: 0, pesoActivo: 70 },
      });
      render(<MacrosCard />);
      expect(screen.getByText(/Selecciona las fórmulas de TMB/i)).toBeInTheDocument();
    });

    it('muestra el mensaje cuando pesoActivo=0', () => {
      mockUseMacronutrientsSetup.mockReturnValue({
        totals: TOTALS_BASE,
        context: { tmbPromedio: 2000, pesoActivo: 0 },
      });
      render(<MacrosCard />);
      expect(screen.getByText(/Selecciona las fórmulas de TMB/i)).toBeInTheDocument();
    });

    it('no muestra los macros cuando no hay datos', () => {
      mockUseMacronutrientsSetup.mockReturnValue({
        totals: TOTALS_BASE,
        context: { tmbPromedio: 0, pesoActivo: 0 },
      });
      render(<MacrosCard />);
      expect(screen.queryByText('Proteínas')).not.toBeInTheDocument();
    });
  });

  describe('con datos válidos', () => {
    beforeEach(() => {
      mockUseMacronutrientsSetup.mockReturnValue({
        totals: TOTALS_BASE,
        context: { tmbPromedio: 2000, pesoActivo: 70 },
      });
    });

    it('muestra los 3 labels de macronutrientes', () => {
      render(<MacrosCard />);
      expect(screen.getByText('Proteínas')).toBeInTheDocument();
      expect(screen.getByText('Carbohidratos')).toBeInTheDocument();
      expect(screen.getByText('Grasas')).toBeInTheDocument();
    });

    it('muestra los gramos de proteínas', () => {
      render(<MacrosCard />);
      expect(screen.getByText('150 g')).toBeInTheDocument();
    });

    it('muestra los gramos de carbohidratos', () => {
      render(<MacrosCard />);
      expect(screen.getByText('250 g')).toBeInTheDocument();
    });

    it('muestra los gramos de grasas', () => {
      render(<MacrosCard />);
      expect(screen.getByText('60 g')).toBeInTheDocument();
    });

    it('muestra el total de kcal (600+1000+540=2140 kcal)', () => {
      render(<MacrosCard />);
      expect(screen.getByText('2140 kcal')).toBeInTheDocument();
    });

    it('muestra el link a /macronutrientes', () => {
      render(<MacrosCard />);
      const link = screen.getByRole('link', { name: /Ajustar en Macronutrientes/i });
      expect(link).toHaveAttribute('href', '/macronutrientes');
    });

    it('no muestra el mensaje de sin datos', () => {
      render(<MacrosCard />);
      expect(screen.queryByText(/Selecciona las fórmulas de TMB/i)).not.toBeInTheDocument();
    });
  });
});
