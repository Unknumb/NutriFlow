import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Input — renderizado', () => {
  it('muestra el texto del label', () => {
    render(<Input label="Nombre" id="nombre" />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
  });

  it('asocia el label con el input mediante htmlFor/id', () => {
    render(<Input label="Nombre" id="nombre" />);
    expect(screen.getByText('Nombre')).toHaveAttribute('for', 'nombre');
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'nombre');
  });

  it('muestra el placeholder cuando se pasa', () => {
    render(<Input label="Email" id="email" placeholder="tu@email.com" />);
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
  });

  it('muestra el valor cuando se pasa el prop value', () => {
    render(<Input label="Nombre" id="nombre" value="Ana González" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('Ana González');
  });

  it('queda deshabilitado cuando se pasa disabled', () => {
    render(<Input label="Nombre" id="nombre" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('reenvía atributos HTML adicionales (type, maxLength)', () => {
    render(<Input label="RUT" id="rut" type="text" maxLength={12} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('maxlength', '12');
  });
});

describe('Input — interacción', () => {
  it('invoca onChange cuando el usuario escribe', () => {
    const onChange = vi.fn();
    render(<Input label="Nombre" id="nombre" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'María' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('el clic en el label activa el input (asociación accesible)', () => {
    render(<Input label="Nombre" id="nombre" />);
    // jsdom no simula el foco automático al clicar el label,
    // pero podemos verificar que el label apunta al id correcto
    const label = screen.getByText('Nombre');
    const input = screen.getByRole('textbox');
    expect(label.htmlFor ?? label.getAttribute('for')).toBe(input.id);
  });
});
