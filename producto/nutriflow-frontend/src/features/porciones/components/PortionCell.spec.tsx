import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PortionCell } from './PortionCell';

// useDraggable necesita DndContext en el árbol y hace llamadas nativas que no funcionan en jsdom
vi.mock('@dnd-kit/core', () => ({
  useDraggable: vi.fn(() => ({
    attributes: {},
    listeners: undefined,
    setNodeRef: () => {},
    isDragging: false,
  })),
}));

vi.mock('lucide-react', () => ({
  GripHorizontal: () => null,
}));

const BASE = {
  cellBg: 'bg-amber-100',
  textBtn: 'text-amber-900',
  mealId: 'desayuno',
  groupId: 'cer',
  onIncrement: vi.fn(),
  onDecrement: vi.fn(),
  onSetPortion: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('PortionCell — value = 0 (modo vacío)', () => {
  it('muestra el botón "+" con title "Agregar porción"', () => {
    render(<PortionCell {...BASE} value={0} />);
    expect(screen.getByTitle('Agregar porción')).toBeInTheDocument();
  });

  it('clicar el botón "+" invoca onIncrement', () => {
    render(<PortionCell {...BASE} value={0} />);
    fireEvent.click(screen.getByTitle('Agregar porción'));
    expect(BASE.onIncrement).toHaveBeenCalledTimes(1);
  });

  it('NO muestra los botones ▲ ni ▼', () => {
    render(<PortionCell {...BASE} value={0} />);
    expect(screen.queryByText('▲')).not.toBeInTheDocument();
    expect(screen.queryByText('▼')).not.toBeInTheDocument();
  });

  it('NO muestra el input numérico', () => {
    render(<PortionCell {...BASE} value={0} />);
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });
});

describe('PortionCell — value > 0 (modo lleno)', () => {
  it('muestra el valor actual en el input', () => {
    render(<PortionCell {...BASE} value={2} />);
    expect(screen.getByDisplayValue('2')).toBeInTheDocument();
  });

  it('muestra 1.5 correctamente en el input', () => {
    render(<PortionCell {...BASE} value={1.5} />);
    expect(screen.getByDisplayValue('1.5')).toBeInTheDocument();
  });

  it('clicar ▲ invoca onIncrement', () => {
    render(<PortionCell {...BASE} value={2} />);
    fireEvent.click(screen.getByText('▲'));
    expect(BASE.onIncrement).toHaveBeenCalledTimes(1);
  });

  it('clicar ▼ invoca onDecrement', () => {
    render(<PortionCell {...BASE} value={2} />);
    fireEvent.click(screen.getByText('▼'));
    expect(BASE.onDecrement).toHaveBeenCalledTimes(1);
  });

  it('cambiar el input invoca onSetPortion con el valor parseado', () => {
    render(<PortionCell {...BASE} value={2} />);
    fireEvent.change(screen.getByDisplayValue('2'), { target: { value: '3.5' } });
    expect(BASE.onSetPortion).toHaveBeenCalledWith(3.5);
  });

  it('input vacío llama onSetPortion con 0 (parseFloat fallback)', () => {
    render(<PortionCell {...BASE} value={2} />);
    fireEvent.change(screen.getByDisplayValue('2'), { target: { value: '' } });
    expect(BASE.onSetPortion).toHaveBeenCalledWith(0);
  });

  it('NO muestra el botón "+" (modo vacío)', () => {
    render(<PortionCell {...BASE} value={2} />);
    expect(screen.queryByTitle('Agregar porción')).not.toBeInTheDocument();
  });

  it('el input tiene step="0.5" para porciones en medios', () => {
    render(<PortionCell {...BASE} value={2} />);
    expect(screen.getByDisplayValue('2')).toHaveAttribute('step', '0.5');
  });
});
