export const NUTRITION_GROUPS = [
    { id: 'cer', label: 'Cereales', emoji: '🌾', headerBg: 'bg-[#C98B3D]', targetBg: 'bg-[#C98B3D] border-[#A8742F]', cellBg: 'bg-[#C98B3D]/15', textBtn: 'text-[#7a5526]', options: 'Arroz / Fideos / Pasta / Papa cocida / Choclo / Tortilla XL' },
    { id: 'veg', label: 'Verduras', emoji: '🥗', headerBg: 'bg-[#4F7A5A]', targetBg: 'bg-[#4F7A5A] border-[#3D6147]', cellBg: 'bg-[#4F7A5A]/15', textBtn: 'text-[#2E5547]', options: 'Lechuga / Tomate / Zapallo italiano / Espinaca / Acelga / Brócoli' },
    { id: 'fru', label: 'Frutas', emoji: '🍎', headerBg: 'bg-[#E8A063]', targetBg: 'bg-[#E8A063] border-[#C9854C]', cellBg: 'bg-[#E8A063]/20', textBtn: 'text-[#8a5a2a]', options: 'Fruta a gusto / Plátano / Uvas / Frutillas / Berries / Mix frutas rojas' },
    { id: 'cag', label: 'Carnes Alta Grasa', emoji: '🥩', headerBg: 'bg-[#8C3B2E]', targetBg: 'bg-[#8C3B2E] border-[#6E2E24]', cellBg: 'bg-[#8C3B2E]/15', textBtn: 'text-[#6E2E24]', options: 'Carne de cerdo / Cordero / Embutidos / Costillar' },
    { id: 'cbg', label: 'Carnes Baja Grasa', emoji: '🍗', headerBg: 'bg-[#B4533A]', targetBg: 'bg-[#B4533A] border-[#8C3B2E]', cellBg: 'bg-[#B4533A]/12', textBtn: 'text-[#8C3B2E]', options: 'Pechuga de pollo / Vacuno magro / Salmón al horno / Atún al agua' },
    { id: 'leg', label: 'Leguminosas', emoji: '🫘', headerBg: 'bg-[#A8742F]', targetBg: 'bg-[#A8742F] border-[#8a5a2a]', cellBg: 'bg-[#A8742F]/15', textBtn: 'text-[#7a5526]', options: 'Lentejas / Porotos / Garbanzos / Arvejas' },
    { id: 'lag', label: 'Lácteos Altos', emoji: '🧀', headerBg: 'bg-[#2F5570]', targetBg: 'bg-[#2F5570] border-[#24435a]', cellBg: 'bg-[#2F5570]/15', textBtn: 'text-[#24435a]', options: 'Queso mantecoso / Queso crema / Leche entera' },
    { id: 'lmg', label: 'Lácteos Medios', emoji: '🥛', headerBg: 'bg-[#3E6B8C]', targetBg: 'bg-[#3E6B8C] border-[#2F5570]', cellBg: 'bg-[#3E6B8C]/12', textBtn: 'text-[#2F5570]', options: 'Leche semi descremada / Yogurt normal' },
    { id: 'lbg', label: 'Lácteos Bajos', emoji: '🍼', headerBg: 'bg-[#6E94AE]', targetBg: 'bg-[#6E94AE] border-[#3E6B8C]', cellBg: 'bg-[#6E94AE]/15', textBtn: 'text-[#2F5570]', options: 'Leche cultivada / Yogurt natural / Yogurt proteico / Quesillo / Queso fresco' },
    { id: 'ace', label: 'Aceites y Grasas', emoji: '🫒', headerBg: 'bg-[#9C7A4D]', targetBg: 'bg-[#9C7A4D] border-[#7d6240]', cellBg: 'bg-[#9C7A4D]/15', textBtn: 'text-[#6b5436]', options: 'Aceite de oliva / Aceite de palta / Mantequilla' },
    { id: 'arg', label: 'Alimentos Ricos Grasa', emoji: '🥑', headerBg: 'bg-[#7A5C8E]', targetBg: 'bg-[#7A5C8E] border-[#5f4671]', cellBg: 'bg-[#7A5C8E]/12', textBtn: 'text-[#5f4671]', options: 'Palta / Frutos secos mix / Mantequilla de maní / Chía / Nueces' },
    { id: 'gbg', label: 'Galletas Bajas Grasa', emoji: '🍪', headerBg: 'bg-[#B5835A]', targetBg: 'bg-[#B5835A] border-[#92683f]', cellBg: 'bg-[#B5835A]/15', textBtn: 'text-[#6e4f30]', options: 'Galletas de agua / soda / Champaña / Coco / Limón' },
    { id: 'azu', label: 'Azúcar', emoji: '🍬', headerBg: 'bg-[#B95F7E]', targetBg: 'bg-[#B95F7E] border-[#964a64]', cellBg: 'bg-[#B95F7E]/12', textBtn: 'text-[#964a64]', options: 'Azúcar rubia / Miel / Mermelada normal' },
];

// Horario en formato HH:MM (input type="time"). Las comidas se ordenan por hora.
export const MEALS = [
    { id: 'desayuno', time: '07:00', name: 'Desayuno' },
    { id: 'colacion_am', time: '10:30', name: 'Colación AM' },
    { id: 'almuerzo', time: '13:00', name: 'Almuerzo' },
    { id: 'colacion_pm', time: '16:00', name: 'Colación PM' },
    { id: 'once', time: '18:30', name: 'Once' },
    { id: 'cena', time: '21:00', name: 'Cena' },
];

export interface ComidaDef { id: string; name: string; time: string }

/** Lista completa de tiempos de comida disponibles (predefinidos + personalizados). */
export function todasLasComidas(customMeals: ComidaDef[] = []): ComidaDef[] {
    return [...MEALS, ...customMeals];
}

/** Resuelve {id, name, time} de una comida aplicando el override de horario. */
export function resolverComida(
    mealId: string,
    customMeals: ComidaDef[] = [],
    mealTimes: Record<string, string> = {},
): ComidaDef {
    const base = MEALS.find((m) => m.id === mealId) || customMeals.find((m) => m.id === mealId);
    const name = base?.name || mealId.charAt(0).toUpperCase() + mealId.slice(1).replace(/_/g, ' ');
    const time = mealTimes[mealId] ?? base?.time ?? '';
    return { id: mealId, name, time };
}

/**
 * Resuelve y ORDENA por horario (HH:MM) los ids de comida dados. Las comidas sin
 * horario quedan al final, en su orden original.
 */
export function comidasOrdenadas(
    mealIds: string[],
    customMeals: ComidaDef[] = [],
    mealTimes: Record<string, string> = {},
): ComidaDef[] {
    return mealIds
        .map((id) => resolverComida(id, customMeals, mealTimes))
        .sort((a, b) => {
            const ta = a.time || '99:99';
            const tb = b.time || '99:99';
            return ta.localeCompare(tb);
        });
}
