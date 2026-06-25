import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NutritionTargetsPanel } from './NutritionTargetsPanel';

vi.mock('lucide-react', () => ({
  Target: () => <span data-testid="icon-target" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
}));

const TARGETS = { kcal: 2000, prot: 150, cho: 250, fat: 60 };
const CURRENT = { kcal: 1000, prot: 75, cho: 125, fat: 30 };
// getPct para estos valores: kcal=50%, prot=50%, cho=50%, fat=50%

describe('NutritionTargetsPanel', () => {
  describe('valores de objetivos', () => {
    it('muestra el campo de calorías con el valor target', () => {
      render(<NutritionTargetsPanel targets={TARGETS} current={CURRENT} />);
      const inputs = screen.getAllByRole('spinbutton');
      // inputs: kcal, prot, cho, fat (en ese orden)
      expect(inputs[0]).toHaveValue(2000);
    });

    it('muestra todos los campos de macros con sus valores target', () => {
      render(<NutritionTargetsPanel targets={TARGETS} current={CURRENT} />);
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[1]).toHaveValue(150); // proteínas
      expect(inputs[2]).toHaveValue(250); // carbohidratos
      expect(inputs[3]).toHaveValue(60);  // grasas
    });

    it('los campos son de solo lectura', () => {
      render(<NutritionTargetsPanel targets={TARGETS} current={CURRENT} />);
      screen.getAllByRole('spinbutton').forEach((input) => {
        expect(input).toHaveAttribute('readonly');
      });
    });
  });

  describe('labels de progreso', () => {
    it('muestra las 4 etiquetas de macros', () => {
      render(<NutritionTargetsPanel targets={TARGETS} current={CURRENT} />);
      expect(screen.getByText('Calorías')).toBeInTheDocument();
      expect(screen.getByText('Proteínas')).toBeInTheDocument();
      expect(screen.getByText('Carbos')).toBeInTheDocument();
      expect(screen.getByText('Grasas')).toBeInTheDocument();
    });
  });

  describe('getPct — cálculo de porcentajes', () => {
    it('calcula el 50% correctamente (current=1000, target=2000)', () => {
      render(<NutritionTargetsPanel targets={TARGETS} current={CURRENT} />);
      // Se muestran 4 textos "50%" (uno por macro)
      const textos50 = screen.getAllByText('50%');
      expect(textos50).toHaveLength(4);
    });

    it('clampea a 100% cuando current supera el target', () => {
      render(
        <NutritionTargetsPanel
          targets={{ kcal: 200, prot: 100, cho: 100, fat: 50 }}
          current={{ kcal: 300, prot: 150, cho: 150, fat: 80 }}
        />,
      );
      const textos100 = screen.getAllByText('100%');
      expect(textos100).toHaveLength(4);
    });

    it('devuelve 0% cuando current y target son 0 (NaN guard)', () => {
      render(
        <NutritionTargetsPanel
          targets={{ kcal: 0, prot: 0, cho: 0, fat: 0 }}
          current={{ kcal: 0, prot: 0, cho: 0, fat: 0 }}
        />,
      );
      const textos0 = screen.getAllByText('0%');
      expect(textos0).toHaveLength(4);
    });

    it('el ancho de la barra de calorías refleja el porcentaje calculado', () => {
      const { container } = render(
        <NutritionTargetsPanel targets={TARGETS} current={CURRENT} />,
      );
      const barraKcal = container.querySelector('.bg-macro-kcal');
      expect(barraKcal).toHaveStyle({ width: '50%' });
    });

    it('la barra de calorías llega al 100% cuando current supera el target', () => {
      const { container } = render(
        <NutritionTargetsPanel
          targets={{ kcal: 200, prot: 100, cho: 100, fat: 50 }}
          current={{ kcal: 400, prot: 200, cho: 200, fat: 100 }}
        />,
      );
      const barraKcal = container.querySelector('.bg-macro-kcal');
      expect(barraKcal).toHaveStyle({ width: '100%' });
    });
  });

  describe('acciones', () => {
    it('clic en "Sugerir Distribución" llama a onSuggest', () => {
      const onSuggest = vi.fn();
      render(<NutritionTargetsPanel targets={TARGETS} current={CURRENT} onSuggest={onSuggest} />);
      fireEvent.click(screen.getByRole('button', { name: /Sugerir Distribución/i }));
      expect(onSuggest).toHaveBeenCalledTimes(1);
    });

    it('clic en "Resetear" llama a onReset', () => {
      const onReset = vi.fn();
      render(<NutritionTargetsPanel targets={TARGETS} current={CURRENT} onReset={onReset} />);
      fireEvent.click(screen.getByRole('button', { name: 'Resetear' }));
      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('no lanza error si onSuggest y onReset son undefined', () => {
      render(<NutritionTargetsPanel targets={TARGETS} current={CURRENT} />);
      expect(() => {
        fireEvent.click(screen.getByRole('button', { name: /Sugerir Distribución/i }));
        fireEvent.click(screen.getByRole('button', { name: 'Resetear' }));
      }).not.toThrow();
    });
  });
});
