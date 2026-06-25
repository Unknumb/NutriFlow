import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BibliotecaPreparaciones } from './BibliotecaPreparaciones';

const mockMutate = vi.hoisted(() => vi.fn());
const mockUsePreparaciones = vi.hoisted(() => vi.fn());
const mockUseEliminarPreparacion = vi.hoisted(() => vi.fn());

vi.mock('../hooks/usePreparaciones', () => ({
  usePreparaciones: mockUsePreparaciones,
  useEliminarPreparacion: mockUseEliminarPreparacion,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: any) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('./ModalNuevaPreparacion', () => ({
  ModalNuevaPreparacion: ({ isOpen }: any) =>
    isOpen ? <div data-testid="modal-preparacion">Modal</div> : null,
}));

vi.mock('../types/preparacion.types', () => ({
  TIPO_COMIDA_LABELS: {
    desayuno: 'Desayuno',
    almuerzo: 'Almuerzo',
    once: 'Once',
    cena: 'Cena',
  },
}));

vi.mock('lucide-react', () => ({
  ImageOff: () => <span data-testid="icon-image-off" />,
  Loader2: () => <span data-testid="icon-loader" />,
  Pencil: () => <span data-testid="icon-pencil" />,
  Plus: () => <span data-testid="icon-plus" />,
  Search: () => <span />,
  Sparkles: () => <span />,
  Trash2: () => <span data-testid="icon-trash" />,
}));

const PREP_BASE = {
  id: 'p-1',
  nombre: 'Avena con frutas',
  tipo_comida: 'desayuno',
  es_sistema: false,
  imagen_url: null as string | null,
  totales: { calorias: 350, proteinas: 12, carbohidratos: 55, grasas: 8 },
  ingredientes: [
    { id: 'i-1', nombre: 'Avena', cantidad_g: 80 },
    { id: 'i-2', nombre: 'Plátano', cantidad_g: 100 },
  ],
};

const PREP_SISTEMA = {
  ...PREP_BASE,
  id: 'p-sys',
  nombre: 'Pollo al horno',
  es_sistema: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUsePreparaciones.mockReturnValue({
    data: [PREP_BASE],
    isLoading: false,
    isError: false,
  });
  mockUseEliminarPreparacion.mockReturnValue({ mutate: mockMutate, isPending: false });
});

describe('BibliotecaPreparaciones', () => {
  describe('estados de carga y error', () => {
    it('muestra spinner cuando isLoading=true', () => {
      mockUsePreparaciones.mockReturnValue({ data: undefined, isLoading: true, isError: false });
      render(<BibliotecaPreparaciones />);
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
    });

    it('muestra mensaje de error cuando isError=true', () => {
      mockUsePreparaciones.mockReturnValue({ data: undefined, isLoading: false, isError: true });
      render(<BibliotecaPreparaciones />);
      expect(
        screen.getByText(/No se pudieron cargar las preparaciones/),
      ).toBeInTheDocument();
    });

    it('no muestra el grid mientras carga', () => {
      mockUsePreparaciones.mockReturnValue({ data: undefined, isLoading: true, isError: false });
      render(<BibliotecaPreparaciones />);
      expect(screen.queryByText('Avena con frutas')).not.toBeInTheDocument();
    });
  });

  describe('tarjetas de preparaciones', () => {
    it('muestra el nombre de la preparación', () => {
      render(<BibliotecaPreparaciones />);
      expect(screen.getByText('Avena con frutas')).toBeInTheDocument();
    });

    it('muestra las calorías redondeadas', () => {
      render(<BibliotecaPreparaciones />);
      expect(screen.getByText('350 kcal')).toBeInTheDocument();
    });

    it('muestra el tipo de comida usando TIPO_COMIDA_LABELS', () => {
      render(<BibliotecaPreparaciones />);
      expect(screen.getByText(/Desayuno/)).toBeInTheDocument();
    });

    it('muestra los ingredientes como tags', () => {
      render(<BibliotecaPreparaciones />);
      expect(screen.getByText('Avena')).toBeInTheDocument();
      expect(screen.getByText('Plátano')).toBeInTheDocument();
    });

    it('muestra el ícono ImageOff cuando no hay imagen_url', () => {
      render(<BibliotecaPreparaciones />);
      expect(screen.getByTestId('icon-image-off')).toBeInTheDocument();
    });

    it('muestra la imagen cuando existe imagen_url', () => {
      mockUsePreparaciones.mockReturnValue({
        data: [{ ...PREP_BASE, imagen_url: 'https://example.com/img.jpg' }],
        isLoading: false,
        isError: false,
      });
      render(<BibliotecaPreparaciones />);
      expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/img.jpg');
    });

    it('muestra el total de preparaciones disponibles en el subtítulo', () => {
      render(<BibliotecaPreparaciones />);
      expect(screen.getByText(/1 disponibles/)).toBeInTheDocument();
    });
  });

  describe('preparaciones del sistema', () => {
    it('no muestra botones de editar/eliminar para preparaciones del sistema', () => {
      mockUsePreparaciones.mockReturnValue({
        data: [PREP_SISTEMA],
        isLoading: false,
        isError: false,
      });
      render(<BibliotecaPreparaciones />);
      expect(screen.queryByTestId('icon-pencil')).not.toBeInTheDocument();
      expect(screen.queryByTestId('icon-trash')).not.toBeInTheDocument();
    });

    it('muestra el badge "Sistema" para preparaciones del sistema', () => {
      mockUsePreparaciones.mockReturnValue({
        data: [PREP_SISTEMA],
        isLoading: false,
        isError: false,
      });
      render(<BibliotecaPreparaciones />);
      expect(screen.getByText('Sistema')).toBeInTheDocument();
    });
  });

  describe('preparaciones propias', () => {
    it('muestra botones de editar y eliminar para preparaciones propias', () => {
      render(<BibliotecaPreparaciones />);
      expect(screen.getByTestId('icon-pencil')).toBeInTheDocument();
      expect(screen.getByTestId('icon-trash')).toBeInTheDocument();
    });
  });

  describe('búsqueda y filtrado (cliente)', () => {
    it('filtra preparaciones por nombre', () => {
      mockUsePreparaciones.mockReturnValue({
        data: [PREP_BASE, { ...PREP_BASE, id: 'p-2', nombre: 'Pollo salteado', ingredientes: [] }],
        isLoading: false,
        isError: false,
      });
      render(<BibliotecaPreparaciones />);
      fireEvent.change(
        screen.getByPlaceholderText('Buscar por nombre o ingrediente...'),
        { target: { value: 'Pollo' } },
      );
      expect(screen.queryByText('Avena con frutas')).not.toBeInTheDocument();
      expect(screen.getByText('Pollo salteado')).toBeInTheDocument();
    });

    it('filtra preparaciones por nombre de ingrediente', () => {
      render(<BibliotecaPreparaciones />);
      fireEvent.change(
        screen.getByPlaceholderText('Buscar por nombre o ingrediente...'),
        { target: { value: 'Plátano' } },
      );
      expect(screen.getByText('Avena con frutas')).toBeInTheDocument();
    });

    it('muestra "No se encontraron preparaciones" cuando ninguna coincide', () => {
      render(<BibliotecaPreparaciones />);
      fireEvent.change(
        screen.getByPlaceholderText('Buscar por nombre o ingrediente...'),
        { target: { value: 'xyz-no-existe' } },
      );
      expect(screen.getByText('No se encontraron preparaciones')).toBeInTheDocument();
    });
  });

  describe('modal de preparación', () => {
    it('al clic en "Nueva Preparación" abre el modal', () => {
      render(<BibliotecaPreparaciones />);
      fireEvent.click(screen.getByRole('button', { name: /Nueva Preparación/i }));
      expect(screen.getByTestId('modal-preparacion')).toBeInTheDocument();
    });

    it('al clic en editar abre el modal', () => {
      render(<BibliotecaPreparaciones />);
      fireEvent.click(screen.getByTestId('icon-pencil').closest('button')!);
      expect(screen.getByTestId('modal-preparacion')).toBeInTheDocument();
    });
  });

  describe('eliminar preparación', () => {
    it('llama a mutate con el id al confirmar la eliminación', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<BibliotecaPreparaciones />);
      fireEvent.click(screen.getByTestId('icon-trash').closest('button')!);
      expect(mockMutate).toHaveBeenCalledWith('p-1');
    });

    it('no llama a mutate si el usuario cancela la confirmación', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      render(<BibliotecaPreparaciones />);
      fireEvent.click(screen.getByTestId('icon-trash').closest('button')!);
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('link al generador', () => {
    it('muestra el link al generador de menús', () => {
      render(<BibliotecaPreparaciones />);
      expect(
        screen.getByRole('link', { name: /Ir al Generador de Menús/i }),
      ).toHaveAttribute('href', '/generador');
    });
  });
});
