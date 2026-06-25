import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GroupOptionCard } from './GroupOptionCard';
import type { FoodGroupOption } from './GroupOptionCard';

// ── hoisted mocks ──────────────────────────────────────────────────────────
const mockUseBuscarAlimentos = vi.hoisted(() => vi.fn());

vi.mock('../../alimentos/hooks/useBuscarAlimentos', () => ({
  useBuscarAlimentos: mockUseBuscarAlimentos,
}));

vi.mock('lucide-react', () => ({
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  ChevronUp: () => <span data-testid="icon-chevron-up" />,
  Loader2: () => <span data-testid="icon-loader" />,
}));

// ── datos de prueba ────────────────────────────────────────────────────────
const GROUP: FoodGroupOption = {
  id: 'lacteos',
  title: 'Lácteos',
  subtitle: 'Leche, yogur, queso',
  emoji: '🥛',
  headerColor: '#4A90D9',
  categoria: 'Lácteos y derivados',
};

const makeAlimento = (i: number) => ({
  id: `a${i}`,
  nombre: `Alimento ${i}`,
  marca: null,
  calorias_100g: 100 + i * 10,
});

// 8 alimentos en items, 10 en total (simula más en el backend)
const ALIMENTOS_8 = Array.from({ length: 8 }, (_, i) => makeAlimento(i + 1));

beforeEach(() => {
  vi.clearAllMocks();
  mockUseBuscarAlimentos.mockReturnValue({ data: { items: ALIMENTOS_8, total: 10 }, isLoading: false });
});

describe('GroupOptionCard', () => {
  describe('displayTarget', () => {
    it('muestra fixedTargetLabel cuando está definido', () => {
      const group = { ...GROUP, fixedTargetLabel: 'Libre' };
      render(<GroupOptionCard group={group} targetValue={5} currentValue={3} />);
      expect(screen.getByText('Libre')).toBeInTheDocument();
    });

    it('muestra "currentValue/targetValue asignado" cuando no hay fixedTargetLabel', () => {
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      expect(screen.getByText('3/5 asignado')).toBeInTheDocument();
    });

    it('muestra 0/0 asignado cuando ambos valores son 0', () => {
      render(<GroupOptionCard group={GROUP} targetValue={0} currentValue={0} />);
      expect(screen.getByText('0/0 asignado')).toBeInTheDocument();
    });
  });

  describe('encabezado del grupo', () => {
    it('muestra el título del grupo', () => {
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      expect(screen.getByText('Lácteos')).toBeInTheDocument();
    });

    it('muestra el subtítulo cuando existe', () => {
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      expect(screen.getByText('Leche, yogur, queso')).toBeInTheDocument();
    });

    it('no muestra subtítulo cuando no se proporciona', () => {
      const group = { ...GROUP, subtitle: undefined };
      render(<GroupOptionCard group={group} targetValue={5} currentValue={3} />);
      expect(screen.queryByText('Leche, yogur, queso')).not.toBeInTheDocument();
    });

    it('muestra el emoji del grupo', () => {
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      expect(screen.getByText('🥛')).toBeInTheDocument();
    });
  });

  describe('sin categoría', () => {
    it('muestra "Sin equivalencias en el catálogo." cuando categoria=null', () => {
      const group = { ...GROUP, categoria: null };
      render(<GroupOptionCard group={group} targetValue={5} currentValue={3} />);
      expect(screen.getByText('Sin equivalencias en el catálogo.')).toBeInTheDocument();
    });

    it('no llama a useBuscarAlimentos con enabled=false cuando categoria=null', () => {
      const group = { ...GROUP, categoria: null };
      render(<GroupOptionCard group={group} targetValue={5} currentValue={3} />);
      expect(mockUseBuscarAlimentos).toHaveBeenCalledWith(
        expect.objectContaining({ enabled: false }),
      );
    });
  });

  describe('estado de carga', () => {
    it('muestra el spinner mientras isLoading=true', () => {
      mockUseBuscarAlimentos.mockReturnValue({ data: undefined, isLoading: true });
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      expect(screen.getByText('Cargando alimentos...')).toBeInTheDocument();
    });
  });

  describe('sin alimentos', () => {
    it('muestra "No hay alimentos registrados en este grupo."', () => {
      mockUseBuscarAlimentos.mockReturnValue({ data: { items: [], total: 0 }, isLoading: false });
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      expect(screen.getByText('No hay alimentos registrados en este grupo.')).toBeInTheDocument();
    });
  });

  describe('lista de alimentos — estado colapsado (COLAPSADO=5)', () => {
    it('muestra solo los primeros 5 alimentos al montar', () => {
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      expect(screen.getByText('Alimento 1')).toBeInTheDocument();
      expect(screen.getByText('Alimento 5')).toBeInTheDocument();
      expect(screen.queryByText('Alimento 6')).not.toBeInTheDocument();
    });

    it('muestra las calorías por 100g de cada alimento visible', () => {
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      // Alimento 1: calorias_100g = 110 → Math.round(110) = 110
      expect(screen.getByText('110 kcal/100g')).toBeInTheDocument();
    });

    it('muestra la marca del alimento cuando existe', () => {
      const conMarca = [{ id: 'a1', nombre: 'Yogur', marca: 'Nestlé', calorias_100g: 80 }];
      mockUseBuscarAlimentos.mockReturnValue({ data: { items: conMarca, total: 1 }, isLoading: false });
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      expect(screen.getByText(/Nestlé/)).toBeInTheDocument();
    });

    it('muestra el botón "Ver X alimentos más" cuando restantes > 0', () => {
      // total=10, visibles=5 → restantes = 10-5 = 5
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      expect(screen.getByText('Ver 5 alimentos más')).toBeInTheDocument();
    });

    it('no muestra botón de expandir cuando todos los alimentos caben en el límite', () => {
      const pocos = Array.from({ length: 3 }, (_, i) => makeAlimento(i + 1));
      mockUseBuscarAlimentos.mockReturnValue({ data: { items: pocos, total: 3 }, isLoading: false });
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      expect(screen.queryByText(/alimentos más/)).not.toBeInTheDocument();
    });
  });

  describe('expand / collapse', () => {
    it('al hacer clic en "Ver más" muestra todos los alimentos cargados', () => {
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      fireEvent.click(screen.getByText('Ver 5 alimentos más'));
      // Con 8 items cargados, todos deben aparecer
      expect(screen.getByText('Alimento 6')).toBeInTheDocument();
      expect(screen.getByText('Alimento 8')).toBeInTheDocument();
    });

    it('al expandir aparece el botón "Ocultar" cuando quedan más en el backend', () => {
      // total=10, items=8 → al expandir: restantes = 10-8 = 2 > 0 → muestra "Ocultar"
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      fireEvent.click(screen.getByText('Ver 5 alimentos más'));
      expect(screen.getByText('Ocultar')).toBeInTheDocument();
    });

    it('al hacer clic en "Ocultar" vuelve al estado colapsado', () => {
      render(<GroupOptionCard group={GROUP} targetValue={5} currentValue={3} />);
      fireEvent.click(screen.getByText('Ver 5 alimentos más'));
      fireEvent.click(screen.getByText('Ocultar'));
      expect(screen.queryByText('Alimento 6')).not.toBeInTheDocument();
    });
  });
});
