import { usePortions } from '../hooks/usePortions';
import { GroupOptionCard, type FoodGroupOption } from './GroupOptionCard';

const FOOD_GROUP_OPTIONS: FoodGroupOption[] = [
    { id: 'cereales', title: 'Cereales', emoji: '🌾', headerBg: 'bg-amber-500', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Arroz (½ taza cocido / 90gr)', 'Fideos / Pasta (½ taza cocida)', 'Papa cocida (150gr / 1 mediana)'], moreCount: 12 },
    { id: 'frutas', title: 'Frutas', emoji: '🍎', headerBg: 'bg-orange-500', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Fruta a gusto (1 unidad mediana)', 'Plátano (1 unidad / 120gr)', 'Uvas (1 taza / 150gr)'], moreCount: 9 },
    { id: 'carnes', title: 'Carnes', subtitle: 'Animal y vegetal', emoji: '🍗', headerBg: 'bg-red-500', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Pechuga de pollo (100-150gr crudo)', 'Vacuno magro (100-150gr crudo)', 'Salmón al horno (150gr)'], moreCount: 8 },
    { id: 'lacteos', title: 'Lácteos', subtitle: 'Medios en grasa', emoji: '🥛', headerBg: 'bg-teal-500', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Leche cultivada (200cc / 1 taza)', 'Yogurt natural (1 unidad / 150gr)', 'Yogurt proteico (1 unidad, ≥18gr prot)'], moreCount: 5 },
    { id: 'arg', title: 'ARG', subtitle: 'Alimentos Ricos en Grasa', emoji: '🥑', headerBg: 'bg-lime-600', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Palta (90gr / ½ unidad)', 'Frutos secos mix (25gr / 25 unidades)', 'Mantequilla de maní (30gr / 2 cdas)'], moreCount: 6 },
    { id: 'galleton', title: 'Galletón', subtitle: 'Proteína', emoji: '🍪', headerBg: 'bg-fuchsia-500', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Galletón Tika Protein (1 unid / 6gr prot)', 'Mini barras proteína WILD (10gr)', 'Granola Protein (35gr)'], moreCount: 3 },
    { id: 'verduras', title: 'Verduras', emoji: '🥦', headerBg: 'bg-green-800', textColor: 'text-white', badgeBg: 'bg-white/30', badgeText: 'text-white', items: ['Lechuga (libre)', 'Tomate (libre)', 'Pepino (libre)'], moreCount: 11, fixedTargetLabel: 'Libre consumo' },
    { id: 'aceites', title: 'Aceites', subtitle: 'y grasas', emoji: '🫒', headerBg: 'bg-yellow-400', textColor: 'text-gray-900', badgeBg: 'bg-black/10', badgeText: 'text-gray-900', items: ['Aceite de oliva (1 cda = 10ml)', 'Aceite de palta (1 cda = 10ml)', 'Aceite de coco (1 cda = 10ml)'], moreCount: 1, fixedTargetLabel: '10ml/día' },
];

export const OpcionesPorGrupo = () => {
    const { state, computed } = usePortions();
    const { targets } = state;
    const { getGroupTotal } = computed;

    return (
        <div className="animate-in fade-in duration-300 outline-none flex-1 overflow-auto m-0">
            <div className="p-8 max-w-5xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Opciones por grupo de alimento</h2>
                    <p className="text-sm text-gray-500 mt-1">Referencia de equivalencias para cada grupo.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FOOD_GROUP_OPTIONS.map((group) => (
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