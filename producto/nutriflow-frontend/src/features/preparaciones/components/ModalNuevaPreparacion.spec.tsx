import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModalNuevaPreparacion } from './ModalNuevaPreparacion';

// ── hoisted mocks ─────────────────────────────────────────────────────────────
const mockCrearPreparacion = vi.hoisted(() => vi.fn());
const mockActualizarPreparacion = vi.hoisted(() => vi.fn());
const mockUseAuthStore = vi.hoisted(() => vi.fn());
const mockUseBuscarAlimentos = vi.hoisted(() => vi.fn());
const mockUseCategorias = vi.hoisted(() => vi.fn());

vi.mock('../../../shared/store/useAuthStore', () => ({
  useAuthStore: mockUseAuthStore,
}));

vi.mock('../../../shared/hooks/useDebouncedValue', () => ({
  useDebouncedValue: (v: string) => v,
}));

vi.mock('../hooks/usePreparaciones', () => ({
  useCrearPreparacion: () => ({
    mutateAsync: mockCrearPreparacion,
    isPending: false,
  }),
  useActualizarPreparacion: () => ({
    mutateAsync: mockActualizarPreparacion,
    isPending: false,
  }),
}));

vi.mock('../../alimentos/hooks/useBuscarAlimentos', () => ({
  useBuscarAlimentos: mockUseBuscarAlimentos,
  useCategorias: mockUseCategorias,
}));

vi.mock('../../alimentos/components/ModalNuevoAlimento', () => ({
  ModalNuevoAlimento: ({ isOpen }: any) =>
    isOpen ? <div data-testid="modal-alimento-nested">ModalAlimento</div> : null,
}));

vi.mock('../services/imagenesPreparaciones', () => ({
  subirImagenPreparacion: vi.fn(),
  eliminarImagenPreparacion: vi.fn(),
  validarImagenPreparacion: vi.fn(() => null),
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
  ImagePlus: () => <span />,
  Loader2: () => <span data-testid="icon-loader" />,
  Plus: () => <span data-testid="icon-plus" />,
  Save: () => <span />,
  Search: () => <span />,
  Utensils: () => <span />,
  X: () => <span data-testid="icon-x" />,
}));

// ── datos de prueba ───────────────────────────────────────────────────────────
const ALIMENTO_AVENA = {
  id: 'a-1',
  nombre: 'Avena',
  marca: null,
  categoria: 'Cereales',
  calorias_100g: 360,
};

const PREPARACION_EDIT = {
  id: 'prep-1',
  nombre: 'Pollo al horno',
  tipo_comida: 'almuerzo' as const,
  imagen_url: null,
  es_sistema: false,
  totales: { calorias: 300, proteinas: 30, carbohidratos: 5, grasas: 10 },
  ingredientes: [
    {
      id: 'ing-1',
      alimento_id: 'a-2',
      nombre: 'Pechuga',
      marca: null,
      calorias: 165,
      cantidad_g: 150,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseAuthStore.mockReturnValue({ id: 'user-1', email: 'test@test.com' });
  mockUseCategorias.mockReturnValue({ data: ['Cereales', 'Carnes'] });
  mockUseBuscarAlimentos.mockReturnValue({
    data: { items: [], total: 0 },
    isFetching: false,
    isError: false,
  });
});

describe('ModalNuevaPreparacion', () => {
  describe('visibilidad', () => {
    it('no renderiza nada cuando isOpen=false', () => {
      render(<ModalNuevaPreparacion isOpen={false} onClose={vi.fn()} />);
      expect(document.body.querySelector('[class*="fixed"]')).toBeNull();
    });

    it('renderiza el modal en el body cuando isOpen=true', () => {
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('Nueva Preparación')).toBeInTheDocument();
    });
  });

  describe('modo creación', () => {
    it('muestra el título "Nueva Preparación"', () => {
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('Nueva Preparación')).toBeInTheDocument();
    });

    it('muestra el campo "Nombre de la Preparación"', () => {
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByPlaceholderText('Ej: Avena con plátano')).toBeInTheDocument();
    });

    it('muestra el select de "Tipo de Comida" con las opciones', () => {
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByRole('option', { name: 'Desayuno' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Almuerzo' })).toBeInTheDocument();
    });

    it('muestra "No has agregado ingredientes" en el estado vacío', () => {
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('No has agregado ingredientes')).toBeInTheDocument();
    });

    it('muestra el contador de ingredientes en 0', () => {
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      // El badge "0" y la cifra de kcal pueden ser múltiples
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });

    it('muestra el total de calorías en 0 kcal', () => {
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      expect(screen.getByText('kcal')).toBeInTheDocument();
    });

    it('el botón guardar está deshabilitado sin nombre ni ingredientes', () => {
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      expect(
        screen.getByRole('button', { name: /Guardar Preparación/i }),
      ).toBeDisabled();
    });

    it('el botón guardar sigue deshabilitado si solo se escribe el nombre', () => {
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      fireEvent.change(screen.getByPlaceholderText('Ej: Avena con plátano'), {
        target: { value: 'Mi preparación' },
      });
      expect(
        screen.getByRole('button', { name: /Guardar Preparación/i }),
      ).toBeDisabled();
    });
  });

  describe('modo edición', () => {
    it('muestra el título "Editar Preparación"', () => {
      render(
        <ModalNuevaPreparacion
          isOpen={true}
          onClose={vi.fn()}
          preparacion={PREPARACION_EDIT}
        />,
      );
      expect(screen.getByText('Editar Preparación')).toBeInTheDocument();
    });

    it('pre-rellena el nombre con el de la preparación', () => {
      render(
        <ModalNuevaPreparacion
          isOpen={true}
          onClose={vi.fn()}
          preparacion={PREPARACION_EDIT}
        />,
      );
      expect(screen.getByDisplayValue('Pollo al horno')).toBeInTheDocument();
    });

    it('muestra el ingrediente existente en la columna de seleccionados', () => {
      render(
        <ModalNuevaPreparacion
          isOpen={true}
          onClose={vi.fn()}
          preparacion={PREPARACION_EDIT}
        />,
      );
      expect(screen.getByText('Pechuga')).toBeInTheDocument();
    });

    it('el botón muestra "Guardar Cambios" en modo edición', () => {
      render(
        <ModalNuevaPreparacion
          isOpen={true}
          onClose={vi.fn()}
          preparacion={PREPARACION_EDIT}
        />,
      );
      expect(screen.getByRole('button', { name: /Guardar Cambios/i })).toBeInTheDocument();
    });

    it('el botón guardar está habilitado cuando ya hay ingrediente y nombre', () => {
      render(
        <ModalNuevaPreparacion
          isOpen={true}
          onClose={vi.fn()}
          preparacion={PREPARACION_EDIT}
        />,
      );
      expect(
        screen.getByRole('button', { name: /Guardar Cambios/i }),
      ).not.toBeDisabled();
    });
  });

  describe('búsqueda de alimentos', () => {
    it('muestra el aviso inicial antes de buscar', () => {
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      expect(
        screen.getByText('Escribe un nombre o elige una categoría para buscar'),
      ).toBeInTheDocument();
    });

    it('muestra resultados cuando hay filtro activo y useBuscarAlimentos devuelve items', () => {
      mockUseBuscarAlimentos.mockReturnValue({
        data: { items: [ALIMENTO_AVENA], total: 1 },
        isFetching: false,
        isError: false,
      });
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      fireEvent.change(screen.getByPlaceholderText('Buscar en la base de datos...'), {
        target: { value: 'avena' },
      });
      expect(screen.getByText('Avena')).toBeInTheDocument();
    });

    it('al clic en "+" agrega el alimento a los ingredientes seleccionados', () => {
      mockUseBuscarAlimentos.mockReturnValue({
        data: { items: [ALIMENTO_AVENA], total: 1 },
        isFetching: false,
        isError: false,
      });
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      fireEvent.change(screen.getByPlaceholderText('Buscar en la base de datos...'), {
        target: { value: 'avena' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Agregar Avena' }));
      // El badge de ingredientes pasa a 1
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('con nombre e ingrediente añadido el botón guardar se habilita', () => {
      mockUseBuscarAlimentos.mockReturnValue({
        data: { items: [ALIMENTO_AVENA], total: 1 },
        isFetching: false,
        isError: false,
      });
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      fireEvent.change(screen.getByPlaceholderText('Ej: Avena con plátano'), {
        target: { value: 'Mi receta' },
      });
      fireEvent.change(screen.getByPlaceholderText('Buscar en la base de datos...'), {
        target: { value: 'avena' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Agregar Avena' }));
      expect(
        screen.getByRole('button', { name: /Guardar Preparación/i }),
      ).not.toBeDisabled();
    });

    it('muestra mensaje "No se encontraron alimentos" cuando la búsqueda no arroja resultados', () => {
      mockUseBuscarAlimentos.mockReturnValue({
        data: { items: [], total: 0 },
        isFetching: false,
        isError: false,
      });
      render(<ModalNuevaPreparacion isOpen={true} onClose={vi.fn()} />);
      fireEvent.change(screen.getByPlaceholderText('Buscar en la base de datos...'), {
        target: { value: 'xyznoexiste' },
      });
      expect(
        screen.getByText('No se encontraron alimentos para tu búsqueda'),
      ).toBeInTheDocument();
    });
  });

  describe('botón cerrar', () => {
    it('llama a onClose al pulsar el botón X del encabezado', () => {
      const onClose = vi.fn();
      render(<ModalNuevaPreparacion isOpen={true} onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
