import { usePortions } from '../hooks/usePortions';
import { GroupOptionCard, type FoodGroupOption } from './GroupOptionCard';

// Actualizado a los nuevos IDs dinámicos
const FOOD_GROUP_OPTIONS: FoodGroupOption[] = [
    { id: 'cereales', title: 'Cereales', emoji: '🌾', headerBg: 'bg-amber-500', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Arroz (½ taza cocido / 90gr)', 'Fideos / Pasta (½ taza cocida)', 'Papa cocida (150gr / 1 mediana)'], moreCount: 12 },
    { id: 'verduras_general', title: 'Verd. General', emoji: '🥗', headerBg: 'bg-emerald-500', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Lechuga (libre)', 'Tomate (libre)', 'Pepino (libre)'], moreCount: 11 },
    { id: 'verduras_libre', title: 'Verd. Libre', emoji: '🥬', headerBg: 'bg-green-600', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Espinaca', 'Acelga', 'Champiñones libres'], moreCount: 5, fixedTargetLabel: 'Libre consumo' },
    { id: 'frutas', title: 'Frutas', emoji: '🍎', headerBg: 'bg-orange-500', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Fruta a gusto (1 unidad mediana)', 'Plátano (1 unidad / 120gr)', 'Uvas (1 taza / 150gr)'], moreCount: 9 },
    { id: 'carnes_altas', title: 'Carnes Altas', subtitle: 'Alta Grasa', emoji: '🥩', headerBg: 'bg-red-700', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Cordero', 'Cerdo', 'Embutidos'], moreCount: 4 },
    { id: 'carnes_bajas', title: 'Carnes Bajas', subtitle: 'Baja Grasa', emoji: '🍗', headerBg: 'bg-red-500', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Pechuga de pollo (100-150gr)', 'Vacuno magro', 'Atún al agua'], moreCount: 8 },
    { id: 'leguminosas', title: 'Leguminosas', emoji: '🫘', headerBg: 'bg-yellow-700', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Lentejas', 'Porotos', 'Garbanzos'], moreCount: 3 },
    { id: 'lacteos_altos', title: 'Lácteos Altos', emoji: '🧀', headerBg: 'bg-cyan-600', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Queso mantecoso', 'Queso crema', 'Leche entera'], moreCount: 3 },
    { id: 'lacteos_medios', title: 'Lácteos Medios', emoji: '🥛', headerBg: 'bg-cyan-500', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Leche semi descremada', 'Yogurt normal'], moreCount: 4 },
    { id: 'lacteos_bajos', title: 'Lácteos Bajos', emoji: '🍼', headerBg: 'bg-cyan-400', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Leche cultivada', 'Yogurt natural', 'Quesillo'], moreCount: 5 },
    { id: 'aceites_grasas', title: 'Aceites y Grasas', emoji: '🫒', headerBg: 'bg-yellow-500', textColor: 'text-yellow-900', badgeBg: 'bg-black/10', badgeText: 'text-yellow-900', items: ['Aceite de oliva (10ml)', 'Aceite de palta', 'Mantequilla'], moreCount: 1, fixedTargetLabel: '10ml/día' },
    { id: 'arg', title: 'ARG', subtitle: 'Alimentos Ricos en Grasa', emoji: '🥑', headerBg: 'bg-lime-600', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Palta (90gr / ½ unidad)', 'Frutos secos mix', 'Mantequilla de maní'], moreCount: 6 },
    { id: 'azucar', title: 'Azúcar', emoji: '🍬', headerBg: 'bg-pink-500', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Azúcar rubia', 'Miel', 'Mermelada normal'], moreCount: 3 },
];

export const OpcionesPorGrupo = () => {
    const { state, computed } = usePortions();
    const { targets, activeGroups } = state;
    const { getGroupTotal } = computed;

    // Sincronizar con grupos activos
    const visibleOptions = FOOD_GROUP_OPTIONS.filter(group => activeGroups.includes(group.id));

    return (
        <div className="animate-in fade-in duration-300 outline-none flex-1 overflow-auto m-0">
            <div className="p-8 max-w-5xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Opciones por grupo de alimento</h2>
                    <p className="text-sm text-gray-500 mt-1">Referencia de equivalencias para cada grupo.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleOptions.map((group) => (
                        <GroupOptionCard 
                            key={group.id} 
                            group={group} 
                            targetValue={targets[group.id] || 0} 
                            currentValue={getGroupTotal(group.id)} // 🚨 Inyectamos el total actual
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};