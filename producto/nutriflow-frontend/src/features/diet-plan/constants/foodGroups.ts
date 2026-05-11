export interface FoodGroupDef {
    id: string;
    title: string;
    kcal: number;
    macros: { p: number; c: number; g: number };
    theme: { bgMain: string; bgHeader: string; border: string; text: string };
    isFree?: boolean;
}

export const FOOD_GROUPS: FoodGroupDef[] = [
    { id: 'cer', title: "Cereales", kcal: 70, macros: { p: 2, c: 15, g: 0 }, theme: { bgMain: 'bg-amber-50', bgHeader: 'bg-amber-400', border: 'border-amber-300', text: '' } },
    { id: 'fru', title: "Frutas", kcal: 60, macros: { p: 0, c: 15, g: 0 }, theme: { bgMain: 'bg-orange-50', bgHeader: 'bg-orange-400', border: 'border-orange-300', text: '' } },
    { id: 'veg', title: "Verduras en General", kcal: 25, macros: { p: 1, c: 5, g: 0 }, theme: { bgMain: 'bg-green-50', bgHeader: 'bg-green-500', border: 'border-green-300', text: '' } },
    { id: 'vlb', title: "Verduras Libre Consumo", isFree: true, kcal: 0, macros: { p: 0, c: 0, g: 0 }, theme: { bgMain: 'bg-emerald-50', bgHeader: '', border: 'border-emerald-300', text: 'text-emerald-800' } },
    { id: 'cag', title: "Carnes Altas en Grasa", kcal: 75, macros: { p: 7, c: 0, g: 5 }, theme: { bgMain: 'bg-red-50', bgHeader: 'bg-red-600', border: 'border-red-400', text: '' } },
    { id: 'cbg', title: "Carnes Bajas en Grasa", kcal: 55, macros: { p: 7, c: 0, g: 3 }, theme: { bgMain: 'bg-rose-50', bgHeader: 'bg-rose-500', border: 'border-rose-300', text: '' } },
    { id: 'leg', title: "Leguminosas", kcal: 110, macros: { p: 7, c: 20, g: 0.5 }, theme: { bgMain: 'bg-yellow-50', bgHeader: 'bg-yellow-600', border: 'border-yellow-400', text: '' } },
    { id: 'lag', title: "Lácteos Altos en Grasa", kcal: 150, macros: { p: 8, c: 12, g: 8 }, theme: { bgMain: 'bg-purple-50', bgHeader: 'bg-purple-700', border: 'border-purple-400', text: '' } },
    { id: 'lmg', title: "Lácteos Medios en Grasa", kcal: 95, macros: { p: 8, c: 12, g: 2 }, theme: { bgMain: 'bg-violet-50', bgHeader: 'bg-violet-500', border: 'border-violet-300', text: '' } },
    { id: 'lbg', title: "Lácteos Bajos en Grasa", kcal: 70, macros: { p: 8, c: 12, g: 0 }, theme: { bgMain: 'bg-blue-50', bgHeader: 'bg-blue-500', border: 'border-blue-300', text: '' } },
    { id: 'ace', title: "Aceites y Grasas", kcal: 45, macros: { p: 0, c: 0, g: 5 }, theme: { bgMain: 'bg-yellow-50', bgHeader: 'bg-yellow-400', border: 'border-yellow-300', text: '' } },
    { id: 'arg', title: "Alim. Ricos en Grasa (ARG)", kcal: 80, macros: { p: 2, c: 2, g: 7 }, theme: { bgMain: 'bg-lime-50', bgHeader: 'bg-lime-600', border: 'border-lime-400', text: '' } },
    { id: 'azu', title: "Azúcar", kcal: 20, macros: { p: 0, c: 5, g: 0 }, theme: { bgMain: 'bg-pink-50', bgHeader: 'bg-pink-500', border: 'border-pink-300', text: '' } },
];