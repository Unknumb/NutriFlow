// ❌ Eliminamos la importación de DashboardLayout
import { MacronutrientSetupCard } from "../../features/macronutrients/components/MacronutrientSetupCard";
import { MacronutrientsChartsColumn } from "../../features/macronutrients/components/MacronutrientsChartsColumn";
import { MacronutrientsHeader } from "../../features/macronutrients/components/MacronutrientsHeader";
import { useMacronutrientsSetup } from "../../features/macronutrients/hooks/useMacronutrientsSetup";
import { useClinicalStore } from "../../shared/store/useClinicalStore";
import { PageHeader } from "../../shared/ui/organisms/PageHeader";

export const MacronutrientesPage = () => {
    // 1. Extraemos las acciones globales aquí arriba
    const setPesoActivo = useClinicalStore((state) => state.setPesoActivo);
    const setTmbPromedio = useClinicalStore((state) => state.setTmbPromedio);
    
    // 2. Ejecutamos nuestra lógica de cálculos
    const setup = useMacronutrientsSetup();

    return (
        // Reemplazamos el Layout por el contenedor estándar de nuestra arquitectura
        <div className="p-8 max-w-[1400px] mx-auto w-full">
            <PageHeader
                eyebrow="Planificación"
                title="Macronutrientes"
                description="Ajuste manual y visualización en tiempo real"
                actions={
                    <button
                        onClick={setup.actions.handleSave}
                        disabled={setup.isSaving}
                        className="px-6 py-2.5 bg-pine hover:bg-pine-soft disabled:opacity-60 text-porcelain font-medium rounded-md transition-colors duration-150"
                    >
                        {setup.isSaving ? 'Guardando...' : 'Guardar planificación'}
                    </button>
                }
            />

            {/* 3. Inyectamos las dependencias hacia abajo (DIP) */}
            <MacronutrientsHeader 
                context={setup.context} 
                totals={setup.totals} 
                onPesoChange={setPesoActivo} 
                onTmbChange={setTmbPromedio} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                <div className="lg:col-span-7">
                    {/* Alerta: En MacronutrientSetupCard debes cambiar el { ...: any } por los tipos que creamos */}
                    <MacronutrientSetupCard {...setup} />
                </div>
                <div className="lg:col-span-5">
                    <MacronutrientsChartsColumn totals={setup.totals} context={setup.context} />
                </div>
            </div>
        </div>
    );
};