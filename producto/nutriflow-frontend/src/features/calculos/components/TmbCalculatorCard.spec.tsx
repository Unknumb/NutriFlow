import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TmbCalculatorCard } from './TmbCalculatorCard';

const mockSetTmbPromedio = vi.hoisted(() => vi.fn());

vi.mock('lucide-react', () => ({
  Calculator: () => <span data-testid="icon-calculator" />,
}));

vi.mock('../../../shared/store/useClinicalStore', () => ({
  useClinicalStore: () => ({ setTmbPromedio: mockSetTmbPromedio }),
}));

// Harris-Benedict: 1600, Mifflin-St Jeor: 1800
// Promedio (2 fórmulas): Math.round((1600 + 1800) / 2) = 1700
const TMB_DATA = {
  resultados_individuales: {
    'Harris-Benedict': 1600,
    'Mifflin-St Jeor': 1800,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TmbCalculatorCard', () => {
  describe('sin datos', () => {
    it('muestra "Esperando datos..." cuando data es undefined', () => {
      render(<TmbCalculatorCard />);
      expect(screen.getByText('Esperando datos...')).toBeInTheDocument();
    });

    it('no renderiza botones de fórmula cuando no hay datos', () => {
      render(<TmbCalculatorCard />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('con datos', () => {
    it('renderiza un botón por cada fórmula', () => {
      render(<TmbCalculatorCard data={TMB_DATA} />);
      expect(screen.getByRole('button', { name: 'Harris-Benedict' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Mifflin-St Jeor' })).toBeInTheDocument();
    });

    it('todas las fórmulas están seleccionadas al montar', () => {
      render(<TmbCalculatorCard data={TMB_DATA} />);
      expect(screen.getByRole('button', { name: 'Harris-Benedict' })).toHaveClass('bg-pine');
      expect(screen.getByRole('button', { name: 'Mifflin-St Jeor' })).toHaveClass('bg-pine');
    });

    it('muestra el promedio de todas las fórmulas activas', () => {
      render(<TmbCalculatorCard data={TMB_DATA} />);
      expect(screen.getByText('1700 kcal/día')).toBeInTheDocument();
    });

    it('muestra los valores individuales en la tabla', () => {
      render(<TmbCalculatorCard data={TMB_DATA} />);
      expect(screen.getByText('1600.0')).toBeInTheDocument();
      expect(screen.getByText('1800.0')).toBeInTheDocument();
    });

    it('llama a setTmbPromedio con el promedio calculado al montar', () => {
      render(<TmbCalculatorCard data={TMB_DATA} />);
      expect(mockSetTmbPromedio).toHaveBeenLastCalledWith(1700);
    });
  });

  describe('toggleFormula', () => {
    it('desmarcar una fórmula recalcula el promedio con las restantes', () => {
      render(<TmbCalculatorCard data={TMB_DATA} />);
      fireEvent.click(screen.getByRole('button', { name: 'Harris-Benedict' }));
      // Solo queda Mifflin-St Jeor (1800) → promedio = 1800
      expect(screen.getByText('1800 kcal/día')).toBeInTheDocument();
    });

    it('el botón desmarcado pierde la clase activa bg-pine', () => {
      render(<TmbCalculatorCard data={TMB_DATA} />);
      fireEvent.click(screen.getByRole('button', { name: 'Harris-Benedict' }));
      expect(screen.getByRole('button', { name: 'Harris-Benedict' })).not.toHaveClass('bg-pine');
    });

    it('volver a marcar la fórmula restaura el promedio original', () => {
      render(<TmbCalculatorCard data={TMB_DATA} />);
      fireEvent.click(screen.getByRole('button', { name: 'Harris-Benedict' })); // deselect
      fireEvent.click(screen.getByRole('button', { name: 'Harris-Benedict' })); // re-select
      expect(screen.getByText('1700 kcal/día')).toBeInTheDocument();
    });

    it('con todas deseleccionadas muestra el mensaje de aviso', () => {
      render(<TmbCalculatorCard data={TMB_DATA} />);
      fireEvent.click(screen.getByRole('button', { name: 'Harris-Benedict' }));
      fireEvent.click(screen.getByRole('button', { name: 'Mifflin-St Jeor' }));
      expect(screen.getByText('Seleccione al menos una fórmula')).toBeInTheDocument();
    });

    it('llama a setTmbPromedio(0) cuando no hay fórmulas seleccionadas', () => {
      render(<TmbCalculatorCard data={TMB_DATA} />);
      fireEvent.click(screen.getByRole('button', { name: 'Harris-Benedict' }));
      fireEvent.click(screen.getByRole('button', { name: 'Mifflin-St Jeor' }));
      expect(mockSetTmbPromedio).toHaveBeenLastCalledWith(0);
    });

    it('actualiza setTmbPromedio al desmarcar una fórmula', () => {
      render(<TmbCalculatorCard data={TMB_DATA} />);
      fireEvent.click(screen.getByRole('button', { name: 'Harris-Benedict' }));
      expect(mockSetTmbPromedio).toHaveBeenLastCalledWith(1800);
    });
  });

  describe('cálculo del promedio', () => {
    it('redondea el promedio al entero más cercano', () => {
      const data = {
        resultados_individuales: {
          'F1': 1001,
          'F2': 1002,
        },
      };
      // (1001 + 1002) / 2 = 1001.5 → Math.round = 1002
      render(<TmbCalculatorCard data={data} />);
      expect(screen.getByText('1002 kcal/día')).toBeInTheDocument();
    });

    it('maneja una única fórmula correctamente', () => {
      const data = { resultados_individuales: { 'Harris-Benedict': 1650.6 } };
      // Math.round(1650.6) = 1651
      render(<TmbCalculatorCard data={data} />);
      expect(screen.getByText('1651 kcal/día')).toBeInTheDocument();
    });
  });
});
