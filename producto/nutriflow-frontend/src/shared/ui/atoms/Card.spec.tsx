import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardContent } from './Card';

describe('Card', () => {
  it('renderiza sus hijos', () => {
    render(<Card>Contenido</Card>);
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('aplica las clases base de diseño', () => {
    const { container } = render(<Card>x</Card>);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-white', 'rounded-card', 'border', 'shadow-card');
  });

  it('concatena className adicional al div raíz', () => {
    const { container } = render(<Card className="p-8">x</Card>);
    expect(container.firstChild).toHaveClass('p-8', 'bg-white');
  });

  it('usa className vacío por defecto sin romper las clases base', () => {
    const { container } = render(<Card>x</Card>);
    expect(container.firstChild).toHaveClass('bg-white');
  });
});

describe('CardHeader', () => {
  it('renderiza el título', () => {
    render(<CardHeader title="Mi sección" />);
    expect(screen.getByText('Mi sección')).toBeInTheDocument();
  });

  it('el título está dentro de un h4', () => {
    render(<CardHeader title="Encabezado" />);
    expect(screen.getByRole('heading', { level: 4, name: 'Encabezado' })).toBeInTheDocument();
  });

  it('renderiza el ícono cuando se proporciona', () => {
    const FakeIcon = ({ className }: { className?: string }) => (
      <svg data-testid="card-icon" className={className} />
    );
    render(<CardHeader title="Con ícono" icon={FakeIcon} />);
    expect(screen.getByTestId('card-icon')).toBeInTheDocument();
  });

  it('aplica las clases de color al ícono', () => {
    const FakeIcon = ({ className }: { className?: string }) => (
      <svg data-testid="card-icon" className={className} />
    );
    render(<CardHeader title="Con ícono" icon={FakeIcon} />);
    expect(screen.getByTestId('card-icon')).toHaveClass('text-pine-soft');
  });

  it('no renderiza ningún ícono cuando icon no se proporciona', () => {
    render(<CardHeader title="Sin ícono" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('CardContent', () => {
  it('renderiza sus hijos', () => {
    render(<CardContent>Cuerpo del card</CardContent>);
    expect(screen.getByText('Cuerpo del card')).toBeInTheDocument();
  });

  it('aplica padding horizontal y vertical', () => {
    const { container } = render(<CardContent>x</CardContent>);
    expect(container.firstChild).toHaveClass('px-4', 'sm:px-6', 'pb-5', 'sm:pb-6');
  });

  it('puede renderizar múltiples hijos', () => {
    render(
      <CardContent>
        <span>Primero</span>
        <span>Segundo</span>
      </CardContent>,
    );
    expect(screen.getByText('Primero')).toBeInTheDocument();
    expect(screen.getByText('Segundo')).toBeInTheDocument();
  });
});
