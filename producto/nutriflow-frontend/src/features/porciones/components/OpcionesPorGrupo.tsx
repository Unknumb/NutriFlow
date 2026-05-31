import { usePortions } from "../hooks/usePortions";
import { GroupOptionCard, type FoodGroupOption } from "./GroupOptionCard";

const FOOD_GROUP_OPTIONS: FoodGroupOption[] = [
  { id: "cer", title: "Cereales", emoji: "🌾", headerBg: "bg-amber-500", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Arroz (½ taza cocido / 90gr)", "Fideos / Pasta (½ taza cocida)", "Papa cocida (150gr / 1 mediana)"], moreCount: 12 },
  { id: "fru", title: "Frutas", emoji: "🍎", headerBg: "bg-orange-500", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Fruta a gusto (1 unidad mediana)", "Plátano (1 unidad / 120gr)", "Uvas (1 taza / 150gr)"], moreCount: 9 },
  { id: "veg", title: "Verduras Generales", emoji: "🥦", headerBg: "bg-green-600", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Zanahoria (1 taza cruda)", "Zapallo italiano (1 taza)", "Brócoli (1 taza)"], moreCount: 11 },
  { id: "vlb", title: "Verd. Libre Consumo", emoji: "🥗", headerBg: "bg-emerald-500", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Lechuga (libre)", "Apio (libre)", "Pepino (libre)"], fixedTargetLabel: "Libre consumo" },
  { id: "cag", title: "Carnes Altas en Grasa", subtitle: "Animal y vegetal", emoji: "🥓", headerBg: "bg-red-700", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Carne de cerdo (100gr)", "Salchichas (1 unidad)"], moreCount: 5 },
  { id: "cbg", title: "Carnes Bajas en Grasa", subtitle: "Animal y vegetal", emoji: "🍗", headerBg: "bg-red-500", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Pechuga de pollo (100-150gr)", "Vacuno magro (100-150gr)", "Pescado blanco (150gr)"], moreCount: 8 },
  { id: "leg", title: "Leguminosas", emoji: "🫘", headerBg: "bg-yellow-600", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Lentejas (¾ taza cocida)", "Porotos (¾ taza cocida)", "Garbanzos (¾ taza cocida)"], moreCount: 4 },
  { id: "lag", title: "Lácteos Altos en Grasa", emoji: "🧀", headerBg: "bg-purple-700", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Queso amarillo (1 lámina / 30gr)"], moreCount: 3 },
  { id: "lmg", title: "Lácteos Medios en Grasa", emoji: "🥛", headerBg: "bg-teal-500", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Leche entera (200cc / 1 taza)", "Yogurt natural entero (150gr)"], moreCount: 5 },
  { id: "lbg", title: "Lácteos Bajos en Grasa", emoji: "🥛", headerBg: "bg-blue-500", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Leche descremada (200cc / 1 taza)", "Yogurt descremado/proteico (150gr)"], moreCount: 5 },
  { id: "ace", title: "Aceites y Grasas", emoji: "🫒", headerBg: "bg-yellow-400", textColor: "text-gray-900", badgeBg: "bg-black/10", badgeText: "text-gray-900", items: ["Aceite de oliva (1 cda = 10ml)", "Aceite de maravilla (1 cda = 10ml)"], fixedTargetLabel: "10ml/día" },
  { id: "arg", title: "Alim. Ricos en Grasa", subtitle: "ARG", emoji: "🥑", headerBg: "bg-lime-600", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Palta (90gr / ½ unidad)", "Frutos secos (30gr / 1 puñado)", "Mantequilla de maní (2 cdas)"], moreCount: 6 },
  { id: "azu", title: "Azúcar", emoji: "🍯", headerBg: "bg-pink-500", textColor: "text-white", badgeBg: "bg-white/30", badgeText: "text-white", items: ["Azúcar blanca (1 cdta)", "Miel (1 cdta)"], moreCount: 2 }
];

export const OpcionesPorGrupo = () => {
  const { state, computed } = usePortions();
  const { targets } = state;
  const { getGroupTotal } = computed;

  const visibleGroups = FOOD_GROUP_OPTIONS.filter(group => targets[group.id] && targets[group.id] > 0);

  return (
    <div className="animate-in fade-in duration-300 outline-none flex-1 overflow-auto m-0">
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Opciones por grupo de alimento
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Referencia de equivalencias para los grupos seleccionados en tu pauta.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleGroups.map((group) => (
            <GroupOptionCard
              key={group.id}
              group={group}
              targetValue={targets[group.id] || 0}
              currentValue={getGroupTotal(group.id)} // 🚨 Inyectamos el total actual
            />
          ))}
          {visibleGroups.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
               <p className="text-gray-500">Aún no has asignado porciones en el Armador de Pautas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
