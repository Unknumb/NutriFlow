import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GestionAlimentos } from './GestionAlimentos';

const mockUseBuscarAlimentos = vi.hoisted(() => vi.fn());
const mockUseCategorias = vi.hoisted(() => vi.fn());
const mockMutateAsync = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockUseEliminarAlimento = vi.hoisted(() => vi.fn());
const mockIsAxiosError = vi.hoisted(() => vi.fn(() => false));

vi.mock('../hooks/useBuscarAlimentos', () => ({
  useBuscarAlimentos: mockUseBuscarAlimentos,
  useCategorias: mockUseCategorias,
  useEliminarAlimento: mockUseEliminarAlimento,
}));

vi.mock('../../../shared/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (v: string) => v,
}));

vi.mock('./ModalNuevoAlimento', () => ({
  ModalNuevoAlimento: ({ isOpen, onCreated, onUpdated }: any) =>
    isOpen ? (
      <div data-testid="modal-alimento">
        <button onClick={() => onCreated?.()}>crear</button>
        <button onClick={() => onUpdated?.({ nombre: 'Actualizado' })}>actualizar</button>
      </div>
    ) : null,
}));

vi.mock('../../../shared/ui/organisms/PageHeader', () => ({
  PageHeader: ({ title, actions }: any) => (
    <div>
      <h1>{title}</h1>
      {actions}
    </div>
  ),
}));

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, isAxiosError: mockIsAxiosError };
});

vi.mock('lucide-react', () => ({
  Search: () => <span />,
  Plus: () => <span />,
  Pencil: () => <span data-testid="icon-pencil" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Loader2: () => <span data-testid="icon-loader" />,
  Apple: () => <span data-testid="icon-apple" />,
}));

const ALIMENTOS = [
  {
    id: 'a-1',
    nombre: 'Avena',
    marca: '',
    categoria: 'Cereales',
    calorias_100g: 350,
  },
  {
    id: 'a-2',
    nombre: 'Pechuga de Pollo',
    marca: 'Agrosuper',
    categoria: 'Carnes',
    calorias_100g: 165,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockUseCategorias.mockReturnValue({ data: ['Cereales', 'Carnes'] });
  mockUseEliminarAlimento.mockReturnValue({ mutateAsync: mockMutateAsync });
  mockUseBuscarAlimentos.mockReturnValue({
    data: { items: ALIMENTOS, total: 2 },
    isLoading: false,
    isFetching: false,
  });
});

describe('GestionAlimentos', () => {
  describe('lista de alimentos', () => {
    it('muestra los nombres de los alimentos', () => {
      render(<GestionAlimentos />);
      expect(screen.getByText('Avena')).toBeInTheDocument();
      expect(screen.getByText('Pechuga de Pollo')).toBeInTheDocument();
    });

    it('muestra las kcal/100g redondeadas de cada alimento', () => {
      render(<GestionAlimentos />);
      expect(screen.getByText('350 kcal/100g')).toBeInTheDocument();
      expect(screen.getByText('165 kcal/100g')).toBeInTheDocument();
    });

    it('muestra el total de alimentos en el encabezado de lista', () => {
      render(<GestionAlimentos />);
      expect(screen.getByText('2 alimentos en total')).toBeInTheDocument();
    });

    it('muestra el ícono Apple cuando la lista está vacía', () => {
      mockUseBuscarAlimentos.mockReturnValue({
        data: { items: [], total: 0 },
        isLoading: false,
        isFetching: false,
      });
      render(<GestionAlimentos />);
      expect(screen.getByTestId('icon-apple')).toBeInTheDocument();
    });

    it('muestra mensaje cuando no se encuentran alimentos', () => {
      mockUseBuscarAlimentos.mockReturnValue({
        data: { items: [], total: 0 },
        isLoading: false,
        isFetching: false,
      });
      render(<GestionAlimentos />);
      expect(
        screen.getByText('No se encontraron alimentos con esos filtros.'),
      ).toBeInTheDocument();
    });
  });

  describe('estado de carga', () => {
    it('muestra spinner cuando isLoading=true', () => {
      mockUseBuscarAlimentos.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: false,
      });
      render(<GestionAlimentos />);
      expect(screen.getByTestId('icon-loader')).toBeInTheDocument();
    });

    it('no muestra la lista mientras carga', () => {
      mockUseBuscarAlimentos.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: false,
      });
      render(<GestionAlimentos />);
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  describe('filtros', () => {
    it('muestra el input de búsqueda', () => {
      render(<GestionAlimentos />);
      expect(screen.getByPlaceholderText('Buscar por nombre...')).toBeInTheDocument();
    });

    it('muestra el select de categorías con la opción por defecto', () => {
      render(<GestionAlimentos />);
      expect(screen.getByDisplayValue('Todas las categorías')).toBeInTheDocument();
    });

    it('muestra las categorías del servidor como opciones', () => {
      render(<GestionAlimentos />);
      expect(screen.getByRole('option', { name: 'Cereales' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Carnes' })).toBeInTheDocument();
    });

    it('al cambiar la categoría se actualiza el select', () => {
      render(<GestionAlimentos />);
      fireEvent.change(screen.getByDisplayValue('Todas las categorías'), {
        target: { value: 'Cereales' },
      });
      expect(screen.getByDisplayValue('Cereales')).toBeInTheDocument();
    });
  });

  describe('modal de alimento', () => {
    it('al clic en "Nuevo alimento" abre el modal', () => {
      render(<GestionAlimentos />);
      fireEvent.click(screen.getByRole('button', { name: /Nuevo alimento/i }));
      expect(screen.getByTestId('modal-alimento')).toBeInTheDocument();
    });

    it('al clic en el ícono de editar abre el modal', () => {
      render(<GestionAlimentos />);
      fireEvent.click(screen.getAllByTestId('icon-pencil')[0].closest('button')!);
      expect(screen.getByTestId('modal-alimento')).toBeInTheDocument();
    });

    it('muestra aviso de éxito cuando el modal llama a onCreated', () => {
      render(<GestionAlimentos />);
      fireEvent.click(screen.getByRole('button', { name: /Nuevo alimento/i }));
      fireEvent.click(screen.getByRole('button', { name: 'crear' }));
      expect(screen.getByRole('alert')).toHaveTextContent('Alimento creado en el catálogo.');
    });

    it('muestra aviso de éxito con el nombre cuando el modal llama a onUpdated', () => {
      render(<GestionAlimentos />);
      fireEvent.click(screen.getAllByTestId('icon-pencil')[0].closest('button')!);
      fireEvent.click(screen.getByRole('button', { name: 'actualizar' }));
      expect(screen.getByRole('alert')).toHaveTextContent('"Actualizado" se actualizó.');
    });
  });

  describe('eliminar alimento', () => {
    it('llama a mutateAsync con el id al confirmar la eliminación', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<GestionAlimentos />);
      fireEvent.click(screen.getAllByTestId('icon-trash')[0].closest('button')!);
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith('a-1');
      });
    });

    it('no llama a mutateAsync si el usuario cancela la confirmación', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      render(<GestionAlimentos />);
      fireEvent.click(screen.getAllByTestId('icon-trash')[0].closest('button')!);
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('muestra aviso de éxito con el nombre del alimento eliminado', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<GestionAlimentos />);
      fireEvent.click(screen.getAllByTestId('icon-trash')[0].closest('button')!);
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('"Avena" se eliminó del catálogo.');
      });
    });

    it('muestra aviso de error si la eliminación falla', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      mockMutateAsync.mockRejectedValue(new Error('Error de red'));
      render(<GestionAlimentos />);
      fireEvent.click(screen.getAllByTestId('icon-trash')[0].closest('button')!);
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'No se pudo completar la acción. Intenta nuevamente.',
        );
      });
    });
  });
});
