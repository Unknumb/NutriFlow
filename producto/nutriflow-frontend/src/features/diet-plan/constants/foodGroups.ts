export interface FoodGroupDef {
    id: string;
    title: string;
    kcal: number;
    macros: { p: number; c: number; g: number };
    theme: { bgMain: string; bgHeader: string; border: string; text: string };
    isFree?: boolean;
    customColor?: string;
}

export const FOOD_GROUPS: FoodGroupDef[] = [
    { id: 'cer', title: "Cereales", kcal: 70, macros: { p: 2, c: 15, g: 0 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#C98B3D]', border: 'border-[#C98B3D]/40', text: '' } },
    { id: 'fru', title: "Frutas", kcal: 60, macros: { p: 0, c: 15, g: 0 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#E8A063]', border: 'border-[#E8A063]/50', text: '' } },
    { id: 'veg', title: "Verduras en General", kcal: 25, macros: { p: 1, c: 5, g: 0 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#4F7A5A]', border: 'border-[#4F7A5A]/40', text: '' } },
    { id: 'vlb', title: "Verduras Libre Consumo", isFree: true, kcal: 0, macros: { p: 0, c: 0, g: 0 }, theme: { bgMain: 'bg-white', bgHeader: '', border: 'border-[#2E5547]/40', text: 'text-[#2E5547]' } },
    { id: 'cag', title: "Carnes Altas en Grasa", kcal: 75, macros: { p: 7, c: 0, g: 5 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#8C3B2E]', border: 'border-[#8C3B2E]/40', text: '' } },
    { id: 'cbg', title: "Carnes Bajas en Grasa", kcal: 55, macros: { p: 7, c: 0, g: 3 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#B4533A]', border: 'border-[#B4533A]/40', text: '' } },
    { id: 'leg', title: "Leguminosas", kcal: 110, macros: { p: 7, c: 20, g: 0.5 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#A8742F]', border: 'border-[#A8742F]/40', text: '' } },
    { id: 'lag', title: "Lácteos Altos en Grasa", kcal: 150, macros: { p: 8, c: 12, g: 8 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#2F5570]', border: 'border-[#2F5570]/40', text: '' } },
    { id: 'lmg', title: "Lácteos Medios en Grasa", kcal: 95, macros: { p: 8, c: 12, g: 2 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#3E6B8C]', border: 'border-[#3E6B8C]/40', text: '' } },
    { id: 'lbg', title: "Lácteos Bajos en Grasa", kcal: 70, macros: { p: 8, c: 12, g: 0 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#6E94AE]', border: 'border-[#6E94AE]/40', text: '' } },
    { id: 'ace', title: "Aceites y Grasas", kcal: 45, macros: { p: 0, c: 0, g: 5 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#9C7A4D]', border: 'border-[#9C7A4D]/40', text: '' } },
    { id: 'arg', title: "Alim. Ricos en Grasa (ARG)", kcal: 80, macros: { p: 2, c: 2, g: 7 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#7A5C8E]', border: 'border-[#7A5C8E]/40', text: '' } },
    { id: 'azu', title: "Azúcar", kcal: 20, macros: { p: 0, c: 5, g: 0 }, theme: { bgMain: 'bg-white', bgHeader: 'bg-[#B95F7E]', border: 'border-[#B95F7E]/40', text: '' } },
];