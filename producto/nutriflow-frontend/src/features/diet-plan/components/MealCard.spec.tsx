import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MealCard } from './MealCard';

vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="icon-plus" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Wheat: () => <span data-testid="icon-wheat" />,
  Milk: () => <span data-testid="icon-milk" />,
  Banana: () => <span data-testid="icon-banana" />,
  Beef: () => <span data-testid="icon-beef" />,
  Carrot: () => <span data-testid="icon-carrot" />,
}));

const FOOD_BASE = {
  id: 'f-1',
  name: 'Avena',
  quantity: 80,
  unit: 'g',
  kcal: 300,
  macros: { prot: 10, cho: 55, fat: 5 },
  iconType: 'cereal' as const,
};

const MEAL_BASE = {
  id: 'm-1',
  name: 'Desayuno',
  time: '08:00',
  foods: [
    FOOD_BASE,
    {
      id: 'f-2',
      name: 'Leche',
      quantity: 200,
      unit: 'ml',
      kcal: 120,
      macros: { prot: 6, cho: 10, fat: 4 },
      iconType: 'dairy' as const,
    },
  ],
};

describe('MealCard', () => {
  describe('cabecera', () => {
    it('muestra el nombre de la comida', () => {
      render(<MealCard meal={MEAL_BASE} />);
      expect(screen.getByText('Desayuno')).toBeInTheDocument();
    });

    it('muestra el horario de la comida', () => {
      render(<MealCard meal={MEAL_BASE} />);
      expect(screen.getByText('08:00')).toBeInTheDocument();
    });

    it('muestra la suma de kcal de todos los alimentos (300+120=420)', () => {
      render(<MealCard meal={MEAL_BASE} />);
      expect(screen.getByText('420 kcal')).toBeInTheDocument();
    });

    it('muestra 0 kcal cuando no hay alimentos', () => {
      render(<MealCard meal={{ ...MEAL_BASE, foods: [] }} />);
      expect(screen.getByText('0 kcal')).toBeInTheDocument();
    });
  });

  describe('filas de alimentos', () => {
    it('muestra el nombre de cada alimento', () => {
      render(<MealCard meal={MEAL_BASE} />);
      expect(screen.getByText('Avena')).toBeInTheDocument();
      expect(screen.getByText('Leche')).toBeInTheDocument();
    });

    it('muestra la cantidad y unidad de cada alimento', () => {
      render(<MealCard meal={MEAL_BASE} />);
      expect(screen.getByText('80 g')).toBeInTheDocument();
      expect(screen.getByText('200 ml')).toBeInTheDocument();
    });

    it('muestra las kcal individuales de cada alimento', () => {
      render(<MealCard meal={MEAL_BASE} />);
      expect(screen.getByText('300 kcal')).toBeInTheDocument();
      expect(screen.getByText('120 kcal')).toBeInTheDocument();
    });

    it('muestra los macros en formato P:Xg C:Xg G:Xg', () => {
      render(<MealCard meal={MEAL_BASE} />);
      expect(screen.getByText('P:10g')).toBeInTheDocument();
      expect(screen.getByText('C:55g')).toBeInTheDocument();
      expect(screen.getByText('G:5g')).toBeInTheDocument();
    });
  });

  describe('íconos por tipo de alimento', () => {
    it('renderiza Wheat para iconType="cereal"', () => {
      render(<MealCard meal={{ ...MEAL_BASE, foods: [FOOD_BASE] }} />);
      expect(screen.getByTestId('icon-wheat')).toBeInTheDocument();
    });

    it('renderiza Milk para iconType="dairy"', () => {
      render(<MealCard meal={MEAL_BASE} />);
      expect(screen.getByTestId('icon-milk')).toBeInTheDocument();
    });

    it('renderiza Banana para iconType="fruit"', () => {
      const meal = { ...MEAL_BASE, foods: [{ ...FOOD_BASE, iconType: 'fruit' as const }] };
      render(<MealCard meal={meal} />);
      expect(screen.getByTestId('icon-banana')).toBeInTheDocument();
    });

    it('renderiza Beef para iconType="meat"', () => {
      const meal = { ...MEAL_BASE, foods: [{ ...FOOD_BASE, iconType: 'meat' as const }] };
      render(<MealCard meal={meal} />);
      expect(screen.getByTestId('icon-beef')).toBeInTheDocument();
    });

    it('renderiza Carrot para iconType="vegetable"', () => {
      const meal = { ...MEAL_BASE, foods: [{ ...FOOD_BASE, iconType: 'vegetable' as const }] };
      render(<MealCard meal={meal} />);
      expect(screen.getByTestId('icon-carrot')).toBeInTheDocument();
    });

    it('renderiza Wheat por defecto para iconType desconocido', () => {
      const meal = { ...MEAL_BASE, foods: [{ ...FOOD_BASE, iconType: 'unknown' as any }] };
      render(<MealCard meal={meal} />);
      expect(screen.getByTestId('icon-wheat')).toBeInTheDocument();
    });
  });

  describe('botón de agregar', () => {
    it('muestra el botón "Agregar Alimento"', () => {
      render(<MealCard meal={MEAL_BASE} />);
      expect(screen.getByRole('button', { name: /Agregar Alimento/i })).toBeInTheDocument();
    });
  });
});
