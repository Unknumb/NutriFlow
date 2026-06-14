import { Plus, Trash2, Wheat, Milk, Banana, Beef, Carrot } from 'lucide-react';
import type { Meal, FoodItem } from '../types';

// Mapeo dinámico de íconos según el tipo de alimento
const FoodIcon = ({ type }: { type: FoodItem['iconType'] }) => {
    const iconClass = "w-5 h-5 text-ink-soft";
    switch (type) {
        case 'cereal': return <Wheat className={iconClass} />;
        case 'dairy': return <Milk className={iconClass} />;
        case 'fruit': return <Banana className={iconClass} />;
        case 'meat': return <Beef className={iconClass} />;
        case 'vegetable': return <Carrot className={iconClass} />;
        default: return <Wheat className={iconClass} />;
    }
};

// SUB-COMPONENTE: Fila individual de alimento
const FoodItemRow = ({ food }: { food: FoodItem }) => (
    <div className="flex items-center justify-between p-3 bg-white border border-mist/70 rounded-lg hover:border-pine-soft/30 transition-colors group">
        <div className="flex items-center gap-4">
            <div className="bg-porcelain p-2.5 rounded-lg border border-mist/70">
                <FoodIcon type={food.iconType} />
            </div>
            <div>
                <p className="font-semibold text-ink">{food.name}</p>
                <p className="text-xs text-ink-soft">{food.quantity} {food.unit}</p>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className="text-right">
                <p className="font-bold text-ink">{food.kcal} kcal</p>
                <div className="flex gap-2 text-[11px] font-medium mt-0.5">
                    <span className="text-macro-prot">P:{food.macros.prot}g</span>
                    <span className="text-macro-cho">C:{food.macros.cho}g</span>
                    <span className="text-macro-gra">G:{food.macros.fat}g</span>
                </div>
            </div>
            <button className="text-ink-soft/40 hover:text-clinical-red transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    </div>
);

// COMPONENTE PRINCIPAL: Tarjeta de la Comida
interface MealCardProps {
    meal: Meal;
}

export const MealCard = ({ meal }: MealCardProps) => {
    // Calculamos el total de calorías de esta comida en específico
    const totalMealKcal = meal.foods.reduce((acc, food) => acc + food.kcal, 0);

    return (
        <div className="bg-white rounded-card border border-mist shadow-sm overflow-hidden mb-5">
            {/* Header de la Comida */}
            <div className="px-5 py-4 border-b border-mist/70 flex justify-between items-center bg-porcelain/30">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-ink">{meal.name}</h3>
                    <span className="text-sm font-medium text-ink-soft bg-mist/60 px-2 py-0.5 rounded-md">{meal.time}</span>
                </div>
                <div className="font-bold text-pine-soft bg-pine-soft/5 px-3 py-1 rounded-lg border border-pine-soft/20">
                    {totalMealKcal} kcal
                </div>
            </div>

            {/* Lista de Alimentos */}
            <div className="p-5 space-y-3">
                {meal.foods.map(food => (
                    <FoodItemRow key={food.id} food={food} />
                ))}

                {/* Botón Añadir */}
                <button className="w-full py-3 border-2 border-dashed border-mist rounded-lg text-ink-soft font-medium text-sm hover:border-pine-soft hover:text-pine-soft hover:bg-pine-soft/5/50 transition-all flex items-center justify-center gap-2 mt-2">
                    <Plus className="w-4 h-4" /> Agregar Alimento
                </button>
            </div>
        </div>
    );
};