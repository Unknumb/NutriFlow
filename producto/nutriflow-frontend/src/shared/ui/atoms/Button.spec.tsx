import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Button — renderizado', () => {
  it('muestra el texto de los children', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('aplica la variante primary por defecto (clase bg-pine)', () => {
    render(<Button>Acción</Button>);
    expect(screen.getByRole('button').className).toContain('bg-pine');
  });

  it('aplica la variante secondary (clase bg-white)', () => {
    render(<Button variant="secondary">Cancelar</Button>);
    expect(screen.getByRole('button').className).toContain('bg-white');
  });

  it('aplica la variante ghost (clase bg-transparent)', () => {
    render(<Button variant="ghost">Ver más</Button>);
    expect(screen.getByRole('button').className).toContain('bg-transparent');
  });

  it('aplica la variante danger (clase bg-clinical-red)', () => {
    render(<Button variant="danger">Eliminar</Button>);
    expect(screen.getByRole('button').className).toContain('bg-clinical-red');
  });

  it('fusiona className extra con las clases base', () => {
    render(<Button className="mi-clase">Acción</Button>);
    expect(screen.getByRole('button').className).toContain('mi-clase');
  });

  it('reenvía atributos HTML adicionales (type, aria-label)', () => {
    render(<Button type="submit" aria-label="Enviar formulario">Enviar</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('type', 'submit');
    expect(btn).toHaveAttribute('aria-label', 'Enviar formulario');
  });
});

describe('Button — interacción', () => {
  it('invoca onClick al hacer clic', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('no invoca onClick cuando está deshabilitado', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Guardar</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('el botón tiene el atributo disabled cuando se pasa el prop', () => {
    render(<Button disabled>Guardar</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('tiene clase disabled:opacity-50 para indicar estado visual', () => {
    render(<Button disabled>Guardar</Button>);
    expect(screen.getByRole('button').className).toContain('disabled:opacity-50');
  });
});
