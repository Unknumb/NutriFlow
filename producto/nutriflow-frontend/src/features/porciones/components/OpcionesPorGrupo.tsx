import { usePortions } from "../hooks/usePortions";
import { GroupOptionCard, type FoodGroupOption } from "./GroupOptionCard";

// Cada grupo de intercambio se asocia a su categoría real de la tabla `alimentos`.
// Las equivalencias se cargan en vivo desde el catálogo (ver GroupOptionCard).
const FOOD_GROUP_OPTIONS: FoodGroupOption[] = [
    { id: 'cer', title: 'Cereales', emoji: '🌾', headerColor: '#C98B3D', categoria: 'Cereales' },
    { id: 'veg', title: 'Verduras', emoji: '🥗', headerColor: '#4F7A5A', categoria: 'Verduras' },
    { id: 'fru', title: 'Frutas', emoji: '🍎', headerColor: '#E8A063', categoria: 'Frutas' },
    { id: 'cag', title: 'Carnes Altas', subtitle: 'Alta grasa', emoji: '🥩', headerColor: '#8C3B2E', categoria: 'Carnes Altas en Grasa' },
    { id: 'cbg', title: 'Carnes Bajas', subtitle: 'Baja grasa', emoji: '🍗', headerColor: '#B4533A', categoria: 'Carnes Bajas en Grasa' },
    { id: 'leg', title: 'Leguminosas', emoji: '🫘', headerColor: '#A8742F', categoria: 'Leguminosas' },
    { id: 'lag', title: 'Lácteos Altos', emoji: '🧀', headerColor: '#2F5570', categoria: 'Lácteos Altos en Grasa' },
    { id: 'lmg', title: 'Lácteos Medios', emoji: '🥛', headerColor: '#3E6B8C', categoria: 'Lácteos Medios en Grasa' },
    { id: 'lbg', title: 'Lácteos Bajos', emoji: '🍼', headerColor: '#6E94AE', categoria: 'Lácteos Bajos en Grasa' },
    { id: 'ace', title: 'Aceites y Grasas', emoji: '🫒', headerColor: '#9C7A4D', categoria: 'Aceites y Grasas' },
    { id: 'arg', title: 'ARG', subtitle: 'Alimentos ricos en grasa', emoji: '🥑', headerColor: '#7A5C8E', categoria: 'Alimentos ricos en grasas' },
    { id: 'gbg', title: 'Galletas Bajas Grasa', emoji: '🍪', headerColor: '#B5835A', categoria: 'Galletas bajas en grasa' },
    { id: 'azu', title: 'Azúcar', emoji: '🍬', headerColor: '#B95F7E', categoria: 'Azúcares' },
];

export const OpcionesPorGrupo = () => {
    const { state, computed } = usePortions();
    const { targets, customFoods } = state;
    const { getGroupTotal } = computed;

    // Convertir customFoods al formato de opciones (sin catálogo asociado)
    const customOptions: FoodGroupOption[] = (customFoods || []).map(cf => ({
        id: cf.id,
        title: cf.label,
        emoji: cf.emoji,
        headerColor: cf.customColor || '#2E5547',
        categoria: null,
    }));

    const COMBINED_OPTIONS = [...FOOD_GROUP_OPTIONS, ...customOptions];

    // Sincronizar con grupos que tienen meta asignada
    const visibleOptions = COMBINED_OPTIONS.filter(group => targets[group.id] && targets[group.id] > 0);

    return (
        <div className="animate-in fade-in duration-300 outline-none flex-1 overflow-auto m-0">
            <div className="p-8 max-w-5xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-ink">Opciones por grupo de alimento</h2>
                    <p className="text-sm text-ink-soft mt-1">Referencia de equivalencias para cada grupo.</p>
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
                    {visibleOptions.length === 0 && (
                        <div className="col-span-1 md:col-span-2 text-center p-8 bg-porcelain border border-dashed border-mist rounded-xl">
                            <p className="text-ink-soft">Aún no has asignado porciones en el Armador de Pautas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
