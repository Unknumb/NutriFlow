import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FlowStepper } from './FlowStepper';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, className }: any) => (
    <a href={to} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('lucide-react', () => ({
  Check: () => <span data-testid="icon-check" />,
}));

describe('FlowStepper', () => {
  it('tiene aria-label de navegación del flujo', () => {
    render(<FlowStepper current={1} />);
    expect(screen.getByRole('navigation', { name: 'Flujo de planificación' })).toBeInTheDocument();
  });

  it('muestra los 3 labels de los pasos', () => {
    render(<FlowStepper current={1} />);
    expect(screen.getByText('Macronutrientes')).toBeInTheDocument();
    expect(screen.getByText('Armador de Pautas')).toBeInTheDocument();
    expect(screen.getByText('Distribución de Porciones')).toBeInTheDocument();
  });

  it('los links apuntan a las rutas correctas', () => {
    render(<FlowStepper current={1} />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/macronutrientes');
    expect(links[1]).toHaveAttribute('href', '/pautas');
    expect(links[2]).toHaveAttribute('href', '/porciones');
  });

  describe('current=1', () => {
    it('el paso 1 tiene la clase activa (bg-pine)', () => {
      render(<FlowStepper current={1} />);
      const links = screen.getAllByRole('link');
      expect(links[0]).toHaveClass('bg-pine');
    });

    it('los pasos 2 y 3 no tienen clase activa', () => {
      render(<FlowStepper current={1} />);
      const links = screen.getAllByRole('link');
      expect(links[1]).not.toHaveClass('bg-pine');
      expect(links[2]).not.toHaveClass('bg-pine');
    });

    it('no hay ningún ícono de Check (ningún paso completado)', () => {
      render(<FlowStepper current={1} />);
      expect(screen.queryAllByTestId('icon-check')).toHaveLength(0);
    });

    it('los pasos 2 y 3 muestran su número', () => {
      render(<FlowStepper current={1} />);
      const links = screen.getAllByRole('link');
      expect(links[1]).toHaveTextContent('2');
      expect(links[2]).toHaveTextContent('3');
    });
  });

  describe('current=2', () => {
    it('el paso 1 muestra el ícono Check (completado)', () => {
      render(<FlowStepper current={2} />);
      expect(screen.getAllByTestId('icon-check')).toHaveLength(1);
    });

    it('el paso 2 tiene la clase activa (bg-pine)', () => {
      render(<FlowStepper current={2} />);
      const links = screen.getAllByRole('link');
      expect(links[0]).not.toHaveClass('bg-pine');
      expect(links[1]).toHaveClass('bg-pine');
      expect(links[2]).not.toHaveClass('bg-pine');
    });

    it('el paso 3 muestra el número 3', () => {
      render(<FlowStepper current={2} />);
      const links = screen.getAllByRole('link');
      expect(links[2]).toHaveTextContent('3');
    });
  });

  describe('current=3', () => {
    it('los pasos 1 y 2 muestran el ícono Check (completados)', () => {
      render(<FlowStepper current={3} />);
      expect(screen.getAllByTestId('icon-check')).toHaveLength(2);
    });

    it('el paso 3 tiene la clase activa (bg-pine)', () => {
      render(<FlowStepper current={3} />);
      const links = screen.getAllByRole('link');
      expect(links[0]).not.toHaveClass('bg-pine');
      expect(links[1]).not.toHaveClass('bg-pine');
      expect(links[2]).toHaveClass('bg-pine');
    });
  });
});
