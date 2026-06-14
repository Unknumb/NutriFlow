export interface FoodGroupDef {
    id: string;
    title: string;
    kcal: number;
    macros: { p: number; c: number; g: number };
    theme: { bgMain: string; bgHeader: string; border: string; text: string };
    isFree?: boolean;
    customColor?: string;
}

// Valores por porción de intercambio según el libro de porciones de Javiera
// ("PORCIONES MORADO", tabla págs. 2-3). Estos valores DEBEN coincidir con
// backend-math/core/valores_porciones.py (el generador usa esa copia).
// macros: p = proteínas, c = hidratos de carbono, g = lípidos (gramos por porción).
export const FOOD_GROUPS: FoodGroupDef[] = [
    { id: 'cer', title: "Cereales", kcal: 140, macros: { p: 3, c: 30, g: 1 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#C98B3D]', border: 'border-[#C98B3D]/40', text: '' } },
    { id: 'fru', title: "Frutas", kcal: 65, macros: { p: 1, c: 15, g: 0 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#E8A063]', border: 'border-[#E8A063]/50', text: '' } },
    { id: 'veg', title: "Verduras", kcal: 30, macros: { p: 2, c: 5, g: 0 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#4F7A5A]', border: 'border-[#4F7A5A]/40', text: '' } },
    { id: 'cag', title: "Carnes Altas en Grasa", kcal: 120, macros: { p: 11, c: 1, g: 8 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#8C3B2E]', border: 'border-[#8C3B2E]/40', text: '' } },
    { id: 'cbg', title: "Carnes Bajas en Grasa", kcal: 65, macros: { p: 11, c: 1, g: 2 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#B4533A]', border: 'border-[#B4533A]/40', text: '' } },
    { id: 'leg', title: "Leguminosas", kcal: 170, macros: { p: 11, c: 30, g: 1 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#A8742F]', border: 'border-[#A8742F]/40', text: '' } },
    { id: 'lag', title: "Lácteos Altos en Grasa", kcal: 110, macros: { p: 5, c: 9, g: 6 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#2F5570]', border: 'border-[#2F5570]/40', text: '' } },
    { id: 'lmg', title: "Lácteos Medios en Grasa", kcal: 85, macros: { p: 5, c: 9, g: 3 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#3E6B8C]', border: 'border-[#3E6B8C]/40', text: '' } },
    { id: 'lbg', title: "Lácteos Bajos en Grasa", kcal: 70, macros: { p: 7, c: 10, g: 0 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#6E94AE]', border: 'border-[#6E94AE]/40', text: '' } },
    { id: 'ace', title: "Aceites y Grasas", kcal: 180, macros: { p: 0, c: 0, g: 20 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#9C7A4D]', border: 'border-[#9C7A4D]/40', text: '' } },
    { id: 'arg', title: "Alim. Ricos en Grasa (ARG)", kcal: 175, macros: { p: 5, c: 5, g: 15 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#7A5C8E]', border: 'border-[#7A5C8E]/40', text: '' } },
    { id: 'gbg', title: "Galletas Bajas en Grasa", kcal: 185, macros: { p: 3, c: 30, g: 6 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#B5835A]', border: 'border-[#B5835A]/40', text: '' } },
    { id: 'azu', title: "Azúcar", kcal: 20, macros: { p: 0, c: 5, g: 0 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#B95F7E]', border: 'border-[#B95F7E]/40', text: '' } },
];
