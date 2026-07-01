import { Plus, X } from 'lucide-react';

import { useState, useEffect } from 'react';
import { NutritionTargetsPanel } from '../../features/diet-plan/components/NutritionTargetsPanel';
import { FoodGroupCard } from '../../features/diet-plan/components/FoodGroupCard';
import { useDietPlanBuilder } from '../../features/diet-plan/hooks/useDietPlanBuilder';
import { FOOD_GROUPS } from '../../features/diet-plan/constants/foodGroups';
import { useMacronutrientsSetup } from '../../features/macronutrients/hooks/useMacronutrientsSetup';
import { useClinicalStore } from '../../shared/store/useClinicalStore';
import { usePortionsStore } from '../../features/porciones/store/usePortionsStore';
import { FlowStepper } from '../../shared/ui/organisms/FlowStepper';
import { PlanificacionSelector } from '../../features/planificaciones/components/PlanificacionSelector';

// THEMES removed

export const PautasPage = () => {
    // Obtenemos los valores desde el setup de macronutrientes (y context global del paciente)
    const { context, totals } = useMacronutrientsSetup();
    useClinicalStore();
    const { customFoods, addCustomFood, updateCustomFood, removeCustomFood } = usePortionsStore();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // Grupo personalizado en edición (null = creando uno nuevo).
    const [editingGroup, setEditingGroup] = useState<(typeof customFoods)[number] | null>(null);

    const cerrarModal = () => {
        setIsAddModalOpen(false);
        setEditingGroup(null);
    };

    // Cierra el modal de "Agregar grupo" con Escape.
    useEffect(() => {
        if (!isAddModalOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') cerrarModal();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isAddModalOpen]);

    const MAX_NOMBRE_GRUPO = 30;
    // Libre consumo configurable por grupo (ad libitum); vive en el store para
    // reflejarse también en Distribución de Porciones.
    const libreConsumoIds = usePortionsStore((s) => s.libreConsumoIds);
    const toggleLibreConsumo = usePortionsStore((s) => s.toggleLibreConsumo);

    // Instanciamos el Cerebro (Custom Hook)
    const { 
        portions, 
        targets, 
        currentTotals, 
        actions 
    } = useDietPlanBuilder({ 
        pesoActivo: context.pesoActivo, 
        tmbPromedio: context.tmbPromedio, 
        kcal: totals.summary.percent === 100 ? totals.prot.kcal + totals.cho.kcal + totals.fat.kcal : context.tmbPromedio, 
        prot: totals.prot.g, 
        cho: totals.cho.g, 
        fat: totals.fat.g 
    });


    const abrirCrear = () => {
        setEditingGroup(null);
        setIsAddModalOpen(true);
    };

    const abrirEditar = (grupo: (typeof customFoods)[number]) => {
        setEditingGroup(grupo);
        setIsAddModalOpen(true);
    };

    const handleSubmitCustomFood = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const title = ((formData.get('title') as string) || '').trim().slice(0, MAX_NOMBRE_GRUPO);
        const kcal = Number(formData.get('kcal'));
        const p = Number(formData.get('p'));
        const c = Number(formData.get('c'));
        const g = Number(formData.get('g'));
        const customColor = formData.get('color') as string;

        if (editingGroup) {
            updateCustomFood(editingGroup.id, {
                title,
                kcal,
                macros: { p, c, g },
                label: title.substring(0, 10),
                customColor,
            });
        } else {
            addCustomFood({
                id: 'custom-' + Date.now(),
                title,
                kcal,
                macros: { p, c, g },
                theme: { bgMain: 'bg-white', bgHeader: '', border: '', text: '' },
                emoji: '🍽️',
                label: title.substring(0, 10),
                headerBg: '',
                targetBg: '',
                cellBg: 'bg-white',
                textBtn: 'text-ink',
                customColor
            });
        }
        cerrarModal();
    };

    const ALL_GROUPS = [...FOOD_GROUPS, ...customFoods];

    return (
        <div className="w-full max-w-[1400px] mx-auto overflow-x-hidden p-3 sm:p-4 md:p-6">
            <FlowStepper current={2} />
            <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight break-words">Armador de Pautas Alimentarias</h1>
                    <p className="text-ink-soft mt-1 font-medium text-sm sm:text-base">{ALL_GROUPS.length} grupos de alimentos · Sistema de intercambio por porciones</p>
                    <div className="mt-3">
                        <PlanificacionSelector />
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={abrirCrear}
                        className="inline-flex items-center gap-2 bg-white border-2 border-pine text-pine-soft hover:bg-pine-soft/5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-card text-sm font-bold transition-colors shadow-sm w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4" /> Agregar grupo de alimento
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* PANEL IZQUIERDO */}
                <NutritionTargetsPanel 
                    targets={targets} 
                    current={currentTotals} 
                    onSuggest={actions.suggestDistribution}
                    onReset={actions.resetPlan}
                />

                {/* PANEL DERECHO (Renderizado Dinámico) */}
                <div className="col-span-full lg:col-span-9">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ALL_GROUPS.map((group) => (
                            <FoodGroupCard
                                key={group.id}
                                group={group}
                                portions={portions[group.id] || 0}
                                onIncrement={() => actions.incrementPortion(group.id)}
                                onDecrement={() => actions.decrementPortion(group.id)}
                                onEdit={group.id.startsWith('custom-') ? () => abrirEditar(group as (typeof customFoods)[number]) : undefined}
                                onDelete={group.id.startsWith('custom-') ? () => removeCustomFood(group.id) : undefined}
                                esLibre={libreConsumoIds.includes(group.id)}
                                onToggleLibre={() => toggleLibreConsumo(group.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL AÑADIR / EDITAR GRUPO */}
            {isAddModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={cerrarModal}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="agregar-grupo-titulo"
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-card shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200"
                    >
                        <button
                            onClick={cerrarModal}
                            aria-label="Cerrar"
                            className="absolute top-4 right-4 text-ink-soft/60 hover:text-ink-soft"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 id="agregar-grupo-titulo" className="text-xl font-bold text-ink mb-1">
                            {editingGroup ? 'Editar grupo de alimento' : 'Agregar grupo de alimento'}
                        </h2>
                        <p className="text-sm text-ink-soft mb-4">Se reflejará en Distribución de Porciones</p>
                        <form key={editingGroup?.id ?? 'nuevo'} onSubmit={handleSubmitCustomFood} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-ink-soft mb-1">Nombre del grupo</label>
                                <input required name="title" type="text" maxLength={MAX_NOMBRE_GRUPO} defaultValue={editingGroup?.title ?? ''} placeholder="Ej: Suplementos" className="w-full border-mist rounded-lg shadow-sm focus:ring-pine-soft focus:border-pine-soft border p-2" />
                                <p className="text-xs text-ink-soft/70 mt-1">Máximo {MAX_NOMBRE_GRUPO} caracteres</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-ink-soft mb-1">Calorías (kcal)</label>
                                    <input required name="kcal" type="number" step="0.1" min="0" defaultValue={editingGroup?.kcal ?? ''} placeholder="0" className="w-full border-mist rounded-lg shadow-sm focus:ring-pine-soft focus:border-pine-soft border p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-ink-soft mb-1">Proteínas (g)</label>
                                    <input required name="p" type="number" step="0.1" min="0" defaultValue={editingGroup?.macros.p ?? ''} placeholder="0" className="w-full border-mist rounded-lg shadow-sm focus:ring-pine-soft focus:border-pine-soft border p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-ink-soft mb-1">Carbohidratos (g)</label>
                                    <input required name="c" type="number" step="0.1" min="0" defaultValue={editingGroup?.macros.c ?? ''} placeholder="0" className="w-full border-mist rounded-lg shadow-sm focus:ring-pine-soft focus:border-pine-soft border p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-ink-soft mb-1">Grasas (g)</label>
                                    <input required name="g" type="number" step="0.1" min="0" defaultValue={editingGroup?.macros.g ?? ''} placeholder="0" className="w-full border-mist rounded-lg shadow-sm focus:ring-pine-soft focus:border-pine-soft border p-2" />
                                </div>
                            </div>

                            <div className="mt-2">
                                <label className="block text-sm font-semibold text-ink-soft mb-2">Color Personalizado</label>
                                <input type="color" name="color" defaultValue={editingGroup?.customColor ?? '#1F3D33'} className="w-full h-10 rounded-lg cursor-pointer p-1 bg-white border border-mist" />
                            </div>
                            <button type="submit" className="mt-4 w-full bg-pine text-white font-bold py-2.5 rounded-card hover:bg-pine-soft transition-colors">
                                {editingGroup ? 'Guardar cambios' : 'Guardar Alimento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};