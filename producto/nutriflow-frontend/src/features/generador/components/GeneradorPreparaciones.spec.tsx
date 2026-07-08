import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GeneradorPreparaciones } from './GeneradorPreparaciones';

// ── hoisted mocks ─────────────────────────────────────────────────────────────
const mockMutate = vi.hoisted(() => vi.fn());
const mockUseGenerarMenu = vi.hoisted(() => vi.fn());
const mockUsePortionsStore = vi.hoisted(() => vi.fn());
const mockUsePreparaciones = vi.hoisted(() => vi.fn());
const mockUsePacientes = vi.hoisted(() => vi.fn());
const mockUseBuscarAlimentos = vi.hoisted(() => vi.fn());
const mockAddSugerenciaComida = vi.hoisted(() => vi.fn());
const mockTraducirPorciones = vi.hoisted(() => vi.fn(() => ({})));

vi.mock('../../menus/hooks/useMenus', () => ({
  useGenerarMenu: mockUseGenerarMenu,
}));

vi.mock('../../porciones/store/usePortionsStore', () => ({
  usePortionsStore: mockUsePortionsStore,
}));

vi.mock('../../preparaciones/hooks/usePreparaciones', () => ({
  usePreparaciones: mockUsePreparaciones,
}));

vi.mock('../../pacientes/hooks/usePacientes', () => ({
  usePacientes: mockUsePacientes,
}));

vi.mock('../../alimentos/hooks/useBuscarAlimentos', () => ({
  useBuscarAlimentos: mockUseBuscarAlimentos,
}));

vi.mock('../../porciones/gruposMath', () => ({
  traducirPorcionesParaMath: mockTraducirPorciones,
  GRUPO_A_MATH: { fru: 'frutas' },
}));

vi.mock('../../preparaciones/types/preparacion.types', () => ({
  TIPO_COMIDA_LABELS: {
    desayuno: 'Desayuno',
    almuerzo: 'Almuerzo',
    cena: 'Cena',
    colacion: 'Colación',
  },
}));

vi.mock('../../porciones/constants', () => ({
  MEALS: [
    { id: 'desayuno', name: 'Desayuno', time: '07:00' },
    { id: 'almuerzo', name: 'Almuerzo', time: '13:00' },
    { id: 'once', name: 'Once', time: '18:30' },
    { id: 'cena', name: 'Cena', time: '21:00' },
  ],
  NUTRITION_GROUPS: [
    { id: 'fru', label: 'Frutas', emoji: '🍎', textBtn: 'text-red-700' },
  ],
}));

vi.mock('../constants/restricciones', () => ({
  RESTRICCIONES_DIETETICAS: ['vegetariano', 'vegano', 'sin_gluten'],
  RESTRICCION_LABELS: {
    vegetariano: 'Vegetariano',
    vegano: 'Vegano',
    sin_gluten: 'Sin gluten',
  },
  derivarRestriccionesDePaciente: () => ['vegetariano'],
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, children, ...rest }: any) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

// ── datos de prueba ───────────────────────────────────────────────────────────
const PREPARACIONES = [
  {
    id: 'p-1',
    nombre: 'Avena con frutas',
    tipo_comida: 'desayuno',
    es_sistema: false,
    imagen_url: null,
    totales: { calorias: 350 },
    ingredientes: [{ id: 'i-1', nombre: 'Avena', cantidad_g: 80 }],
    descripcion: null,
  },
  {
    id: 'p-2',
    nombre: 'Pollo al horno',
    tipo_comida: 'almuerzo',
    es_sistema: true,
    imagen_url: null,
    totales: { calorias: 300 },
    ingredientes: [{ id: 'i-2', nombre: 'Pechuga', cantidad_g: 150 }],
    descripcion: null,
  },
];

const PACIENTES = [
  {
    id: 'pac-1',
    nombre: 'Ana',
    apellido: 'García',
    alergias: ['gluten'],
    preferencias_alimentarias: [],
    enfermedades: [],
  },
];

const RECETA_GENERADA = {
  id: 'm-1',
  nombre: 'Pollo con arroz',
  descripcion: null,
  instrucciones: 'Cocinar el arroz y hornear el pollo.',
  tipo_comida: 'almuerzo',
  imagen_url: null,
  calorias_totales: 420,
  cobertura: 87,
  ingredientes: [{ nombre: 'Pollo', cantidad_g: 150, sin_etiquetar: false }],
  porciones_requeridas: { frutas: 1.5 },
};

// distributions sin porciones → Generar deshabilitado
const DISTRIBUTIONS_EMPTY = {};
// distributions con porciones para 'almuerzo'
const DISTRIBUTIONS_WITH_PORCIONES = { almuerzo: { fru: 2 } };

const storeState = (overrides: Record<string, unknown> = {}) => ({
  distributions: DISTRIBUTIONS_EMPTY,
  activeMeals: ['desayuno', 'almuerzo', 'once', 'cena'],
  sugerenciasComida: {},
  addSugerenciaComida: mockAddSugerenciaComida,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockUseGenerarMenu.mockReturnValue({
    mutate: mockMutate,
    data: undefined,
    isPending: false,
  });
  mockUsePortionsStore.mockReturnValue(storeState());
  mockUsePreparaciones.mockReturnValue({
    data: PREPARACIONES,
    isLoading: false,
  });
  mockUsePacientes.mockReturnValue({ data: PACIENTES });
  mockUseBuscarAlimentos.mockReturnValue({ data: undefined });
});

describe('GeneradorPreparaciones', () => {
  describe('encabezado', () => {
    it('muestra el título "Generador de Preparaciones"', () => {
      render(<GeneradorPreparaciones />);
      expect(screen.getByText('Generador de Preparaciones')).toBeInTheDocument();
    });

    it('muestra el total de preparaciones en el subtítulo', () => {
      render(<GeneradorPreparaciones />);
      expect(screen.getByText(/Biblioteca con 2 preparaciones/)).toBeInTheDocument();
    });
  });

  describe('pestañas', () => {
    it('muestra el botón "Generador Automático"', () => {
      render(<GeneradorPreparaciones />);
      expect(
        screen.getByRole('button', { name: /Generador Automático/i }),
      ).toBeInTheDocument();
    });

    it('muestra el botón de la biblioteca con el total', () => {
      render(<GeneradorPreparaciones />);
      expect(
        screen.getByRole('button', { name: /Mi Biblioteca \(2\)/i }),
      ).toBeInTheDocument();
    });

    it('al clic en "Mi Biblioteca" muestra el buscador de biblioteca', () => {
      render(<GeneradorPreparaciones />);
      fireEvent.click(screen.getByRole('button', { name: /Mi Biblioteca/i }));
      expect(
        screen.getByPlaceholderText('Buscar por nombre o ingrediente...'),
      ).toBeInTheDocument();
    });

    it('vuelve a la pestaña generador al clic en "Generador Automático"', () => {
      render(<GeneradorPreparaciones />);
      fireEvent.click(screen.getByRole('button', { name: /Mi Biblioteca/i }));
      fireEvent.click(screen.getByRole('button', { name: /Generador Automático/i }));
      expect(screen.getByText('Plan de distribución')).toBeInTheDocument();
    });
  });

  describe('pestaña generador', () => {
    it('muestra el selector de comida "Generar para"', () => {
      render(<GeneradorPreparaciones />);
      expect(screen.getByText('Generar para')).toBeInTheDocument();
    });

    it('indica el tipo de preparación que filtra la comida elegida', () => {
      render(<GeneradorPreparaciones />);
      // default = almuerzo → filtra por tipo Almuerzo
      expect(
        screen.getByText(/Solo se sugieren preparaciones de tipo Almuerzo/),
      ).toBeInTheDocument();
    });

    it('el botón "Generar Sugerencias" está deshabilitado sin porciones', () => {
      render(<GeneradorPreparaciones />);
      expect(
        screen.getByRole('button', { name: /Generar Sugerencias/i }),
      ).toBeDisabled();
    });

    it('muestra el aviso de asignar porciones cuando no hay porciones', () => {
      render(<GeneradorPreparaciones />);
      expect(
        screen.getByText('Primero asigna porciones a esta comida.'),
      ).toBeInTheDocument();
    });

    it('el botón "Generar Sugerencias" se habilita cuando hay porciones para la comida', () => {
      mockUsePortionsStore.mockReturnValue(
        storeState({ distributions: DISTRIBUTIONS_WITH_PORCIONES }),
      );
      render(<GeneradorPreparaciones />);
      expect(
        screen.getByRole('button', { name: /Generar Sugerencias/i }),
      ).not.toBeDisabled();
    });

    it('llama a mutate con porciones y tipo_comida al hacer clic en "Generar Sugerencias"', () => {
      mockUsePortionsStore.mockReturnValue(
        storeState({ distributions: DISTRIBUTIONS_WITH_PORCIONES }),
      );
      render(<GeneradorPreparaciones />);
      fireEvent.click(screen.getByRole('button', { name: /Generar Sugerencias/i }));
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          porciones_disponibles: expect.any(Object),
          tipo_comida: 'almuerzo',
          alimentos_rechazados: [],
        }),
      );
    });

    it('muestra "Generando..." en el botón mientras isPending=true', () => {
      mockUseGenerarMenu.mockReturnValue({
        mutate: mockMutate,
        data: undefined,
        isPending: true,
      });
      mockUsePortionsStore.mockReturnValue(
        storeState({ distributions: DISTRIBUTIONS_WITH_PORCIONES }),
      );
      render(<GeneradorPreparaciones />);
      expect(screen.getByRole('button', { name: /Generando/i })).toBeDisabled();
    });

    it('muestra resultados con cobertura y kcal cuando menusGenerados tiene datos', () => {
      mockUseGenerarMenu.mockReturnValue({
        mutate: mockMutate,
        data: { matches_exactos: [RECETA_GENERADA], matches_parciales: [] },
        isPending: false,
      });
      render(<GeneradorPreparaciones />);
      expect(screen.getByText('Pollo con arroz')).toBeInTheDocument();
      expect(screen.getByText('Sugerencias Exactas')).toBeInTheDocument();
      expect(screen.getByText('Cubre 87%')).toBeInTheDocument();
      expect(screen.getByText('420 kcal')).toBeInTheDocument();
    });

    it('expande el detalle de una sugerencia con "Ver detalle"', () => {
      mockUseGenerarMenu.mockReturnValue({
        mutate: mockMutate,
        data: { matches_exactos: [RECETA_GENERADA], matches_parciales: [] },
        isPending: false,
      });
      render(<GeneradorPreparaciones />);
      fireEvent.click(screen.getByRole('button', { name: /Ver detalle/i }));
      expect(
        screen.getByText('Cocinar el arroz y hornear el pollo.'),
      ).toBeInTheDocument();
      expect(screen.getByText('Porciones que utiliza')).toBeInTheDocument();
    });
  });

  describe('usar en pauta', () => {
    beforeEach(() => {
      mockUseGenerarMenu.mockReturnValue({
        mutate: mockMutate,
        data: { matches_exactos: [RECETA_GENERADA], matches_parciales: [] },
        isPending: false,
      });
    });

    it('agrega la sugerencia a la comida elegida', () => {
      render(<GeneradorPreparaciones />);
      fireEvent.click(screen.getByRole('button', { name: /Usar en pauta/i }));
      expect(mockAddSugerenciaComida).toHaveBeenCalledWith('almuerzo', {
        id: 'm-1',
        nombre: 'Pollo con arroz',
        ingredientes: 'Pollo (150g)',
      });
    });

    it('muestra "En la pauta" cuando la sugerencia ya fue agregada', () => {
      mockUsePortionsStore.mockReturnValue(
        storeState({
          sugerenciasComida: {
            almuerzo: [{ id: 'm-1', nombre: 'Pollo con arroz', ingredientes: '' }],
          },
        }),
      );
      render(<GeneradorPreparaciones />);
      expect(screen.getByRole('button', { name: /En la pauta/i })).toBeDisabled();
      expect(screen.getByText(/1 sugerencia\(s\) agregada\(s\)/)).toBeInTheDocument();
    });
  });

  describe('alimentos rechazados', () => {
    it('agrega chips con Enter y los envía en la generación', () => {
      mockUsePortionsStore.mockReturnValue(
        storeState({ distributions: DISTRIBUTIONS_WITH_PORCIONES }),
      );
      render(<GeneradorPreparaciones />);
      const input = screen.getByPlaceholderText(/Escribe y presiona Enter/);
      fireEvent.change(input, { target: { value: 'salmón' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.getByText('salmón')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Generar Sugerencias/i }));
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ alimentos_rechazados: ['salmón'] }),
      );
    });

    it('quita un chip con su botón de cierre', () => {
      render(<GeneradorPreparaciones />);
      const input = screen.getByPlaceholderText(/Escribe y presiona Enter/);
      fireEvent.change(input, { target: { value: 'pan' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      fireEvent.click(screen.getByRole('button', { name: 'Quitar pan' }));
      expect(screen.queryByText('pan')).not.toBeInTheDocument();
    });
  });

  describe('restricciones dietéticas', () => {
    it('muestra los botones de restricción', () => {
      render(<GeneradorPreparaciones />);
      expect(screen.getByRole('button', { name: 'Vegetariano' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Vegano' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sin gluten' })).toBeInTheDocument();
    });

    it('los botones empiezan con aria-pressed=false', () => {
      render(<GeneradorPreparaciones />);
      expect(
        screen.getByRole('button', { name: 'Vegetariano' }),
      ).toHaveAttribute('aria-pressed', 'false');
    });

    it('al clic en una restricción cambia aria-pressed a true', () => {
      render(<GeneradorPreparaciones />);
      fireEvent.click(screen.getByRole('button', { name: 'Vegetariano' }));
      expect(
        screen.getByRole('button', { name: 'Vegetariano' }),
      ).toHaveAttribute('aria-pressed', 'true');
    });

    it('un segundo clic desactiva la restricción (aria-pressed=false)', () => {
      render(<GeneradorPreparaciones />);
      fireEvent.click(screen.getByRole('button', { name: 'Vegetariano' }));
      fireEvent.click(screen.getByRole('button', { name: 'Vegetariano' }));
      expect(
        screen.getByRole('button', { name: 'Vegetariano' }),
      ).toHaveAttribute('aria-pressed', 'false');
    });

    it('muestra el aviso de cobertura de etiquetado al activar una restricción', () => {
      render(<GeneradorPreparaciones />);
      expect(screen.queryByRole('note')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Vegetariano' }));
      expect(screen.getByRole('note')).toHaveTextContent(/etiquetado del catálogo/);
    });

    it('marca los ingredientes sin etiquetar en la sugerencia cuando hay restricciones', () => {
      mockUseGenerarMenu.mockReturnValue({
        mutate: mockMutate,
        data: {
          matches_exactos: [
            {
              ...RECETA_GENERADA,
              ingredientes: [{ nombre: 'Pollo', cantidad_g: 150, sin_etiquetar: true }],
            },
          ],
          matches_parciales: [],
        },
        isPending: false,
      });
      render(<GeneradorPreparaciones />);
      fireEvent.click(screen.getByRole('button', { name: 'Vegetariano' }));
      expect(
        screen.getByText(/Sin etiquetas de restricción: Pollo/),
      ).toBeInTheDocument();
    });
  });

  describe('selector de paciente', () => {
    it('muestra la opción "Sin paciente asociado"', () => {
      render(<GeneradorPreparaciones />);
      expect(
        screen.getByRole('option', { name: 'Sin paciente asociado' }),
      ).toBeInTheDocument();
    });

    it('muestra los pacientes como opciones', () => {
      render(<GeneradorPreparaciones />);
      expect(
        screen.getByRole('option', { name: 'Ana García' }),
      ).toBeInTheDocument();
    });

    it('al seleccionar un paciente muestra su información de alergias', () => {
      render(<GeneradorPreparaciones />);
      fireEvent.change(
        screen.getByDisplayValue('Sin paciente asociado'),
        { target: { value: 'pac-1' } },
      );
      // gluten → deriva restricción sin_gluten, pero la ficha muestra "Alergias: gluten"
      expect(screen.getByText('gluten')).toBeInTheDocument();
    });
  });

  describe('pestaña biblioteca', () => {
    beforeEach(() => {
      render(<GeneradorPreparaciones />);
      fireEvent.click(screen.getByRole('button', { name: /Mi Biblioteca/i }));
    });

    it('muestra las métricas de preparaciones', () => {
      expect(screen.getByText('Total preparaciones')).toBeInTheDocument();
    });

    it('muestra el conteo total de preparaciones', () => {
      // La tarjeta "Total preparaciones" muestra el número 2
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });

    it('muestra las tarjetas de preparaciones', () => {
      expect(screen.getByText('Avena con frutas')).toBeInTheDocument();
      expect(screen.getByText('Pollo al horno')).toBeInTheDocument();
    });

    it('filtra preparaciones por nombre al escribir en el buscador', () => {
      fireEvent.change(
        screen.getByPlaceholderText('Buscar por nombre o ingrediente...'),
        { target: { value: 'Avena' } },
      );
      expect(screen.getByText('Avena con frutas')).toBeInTheDocument();
      expect(screen.queryByText('Pollo al horno')).not.toBeInTheDocument();
    });

    it('filtra preparaciones por ingrediente', () => {
      fireEvent.change(
        screen.getByPlaceholderText('Buscar por nombre o ingrediente...'),
        { target: { value: 'Pechuga' } },
      );
      expect(screen.queryByText('Avena con frutas')).not.toBeInTheDocument();
      expect(screen.getByText('Pollo al horno')).toBeInTheDocument();
    });

    it('muestra "No se encontraron preparaciones" cuando el filtro no coincide', () => {
      fireEvent.change(
        screen.getByPlaceholderText('Buscar por nombre o ingrediente...'),
        { target: { value: 'xyznoexiste' } },
      );
      expect(screen.getByText('No se encontraron preparaciones')).toBeInTheDocument();
    });

    it('muestra el link "Gestionar en Biblioteca"', () => {
      expect(
        screen.getByRole('link', { name: /Gestionar en Biblioteca/i }),
      ).toHaveAttribute('href', '/biblioteca');
    });

    it('filtra por tipo de comida con el select', () => {
      fireEvent.change(
        screen.getByDisplayValue('Todos los tiempos'),
        { target: { value: 'desayuno' } },
      );
      expect(screen.getByText('Avena con frutas')).toBeInTheDocument();
      expect(screen.queryByText('Pollo al horno')).not.toBeInTheDocument();
    });
  });
});
