// Define exactamente qué tiene un alimento
export interface FoodItem {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    kcal: number;
    macros: {
        prot: number;
        cho: number;
        fat: number;
    };
    iconType: 'cereal' | 'dairy' | 'fruit' | 'meat' | 'vegetable';
}

// Define qué es una comida (Desayuno, Almuerzo, etc.)
export interface Meal {
    id: string;
    name: string;
    time: string;
    foods: FoodItem[];
}

// Contrato para los totales actuales de la pauta que se está armando
export interface DietPlanTotals {
    kcal: number;
    prot: number;
    cho: number;
    fat: number;
}

// Contrato estricto para los temas de colores
export interface ThemeClass {
    bgMain: string;
    bgHeader: string;
    border: string;
    text: string;
}

// Contrato para la estructura de un Grupo de Alimentos
export interface FoodGroup {
    id: string; // Crucial para los 'keys' en React
    title: string;
    kcal: number;
    macros: { p: number; c: number; g: number };
    theme: ThemeClass;
    isFree?: boolean; // Opcional, solo para verduras de libre consumo
}