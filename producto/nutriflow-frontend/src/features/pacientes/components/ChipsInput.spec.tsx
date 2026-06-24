import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChipsInput } from './ChipsInput';

vi.mock('lucide-react', () => ({
  X: ({ className }: { className?: string }) => <span data-testid="icon-x" className={className} />,
}));

const defaultProps = {
  label: 'Alergias',
  values: [] as string[],
  onChange: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ChipsInput — renderizado', () => {
  it('muestra el label', () => {
    render(<ChipsInput {...defaultProps} />);
    expect(screen.getByText('Alergias')).toBeInTheDocument();
  });

  it('muestra los chips existentes', () => {
    render(<ChipsInput {...defaultProps} values={['Mariscos', 'Nueces']} />);
    expect(screen.getByText('Mariscos')).toBeInTheDocument();
    expect(screen.getByText('Nueces')).toBeInTheDocument();
  });

  it('muestra el placeholder cuando no hay chips', () => {
    render(<ChipsInput {...defaultProps} values={[]} placeholder="Escribe y presiona Enter" />);
    expect(screen.getByPlaceholderText('Escribe y presiona Enter')).toBeInTheDocument();
  });

  it('oculta el placeholder cuando ya hay chips', () => {
    render(<ChipsInput {...defaultProps} values={['Gluten']} placeholder="Escribe y presiona Enter" />);
    expect(screen.queryByPlaceholderText('Escribe y presiona Enter')).not.toBeInTheDocument();
  });

  it('cada chip tiene un botón X con aria-label "Quitar [chip]"', () => {
    render(<ChipsInput {...defaultProps} values={['Soja']} />);
    expect(screen.getByRole('button', { name: 'Quitar Soja' })).toBeInTheDocument();
  });
});

describe('ChipsInput — añadir chips', () => {
  it('añade un chip al presionar Enter', () => {
    render(<ChipsInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Gluten' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onChange).toHaveBeenCalledWith(['Gluten']);
  });

  it('no añade nada si el input está vacío al presionar Enter', () => {
    render(<ChipsInput {...defaultProps} />);
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('ignora espacios al inicio y al final (trim) antes de añadir', () => {
    render(<ChipsInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '  Lactosa  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onChange).toHaveBeenCalledWith(['Lactosa']);
  });

  it('no añade duplicados (case-insensitive)', () => {
    render(<ChipsInput {...defaultProps} values={['Gluten']} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'gluten' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('añade el chip al hacer blur si hay texto en el input', () => {
    render(<ChipsInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Soja' } });
    fireEvent.blur(input);
    expect(defaultProps.onChange).toHaveBeenCalledWith(['Soja']);
  });

  it('no añade nada al hacer blur con input vacío', () => {
    render(<ChipsInput {...defaultProps} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });
});

describe('ChipsInput — eliminar chips', () => {
  it('clicar el botón X quita el chip correspondiente', () => {
    render(<ChipsInput {...defaultProps} values={['Mariscos', 'Nueces']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Mariscos' }));
    expect(defaultProps.onChange).toHaveBeenCalledWith(['Nueces']);
  });

  it('clicar X en el segundo chip lo quita preservando el primero', () => {
    render(<ChipsInput {...defaultProps} values={['Mariscos', 'Nueces']} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quitar Nueces' }));
    expect(defaultProps.onChange).toHaveBeenCalledWith(['Mariscos']);
  });

  it('Backspace con input vacío quita el último chip', () => {
    render(<ChipsInput {...defaultProps} values={['Mariscos', 'Nueces']} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(defaultProps.onChange).toHaveBeenCalledWith(['Mariscos']);
  });

  it('Backspace con input vacío y sin chips no llama onChange', () => {
    render(<ChipsInput {...defaultProps} values={[]} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });

  it('Backspace con texto en el input no quita chips (borra el texto)', () => {
    render(<ChipsInput {...defaultProps} values={['Mariscos']} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'N' } });
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(defaultProps.onChange).not.toHaveBeenCalled();
  });
});
