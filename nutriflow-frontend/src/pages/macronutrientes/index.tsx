import { DashboardLayout } from "../../shared/ui/organisms/DashboardLayout";
import { MacronutrientSetupCard } from "../../features/macronutrients/components/MacronutrientSetupCard";
import { MacronutrientsChartsColumn } from "../../features/macronutrients/components/MacronutrientsChartsColumn";
import { MacronutrientsHeader } from "../../features/macronutrients/components/MacronutrientsHeader";
import { useMacronutrientsSetup } from "../../features/macronutrients/hooks/useMacronutrientsSetup";
import { useClinicalStore } from "../../shared/store/useClinicalStore";

export const MacronutrientesPage = () => {
    // 1. Extraemos las acciones globales aquí arriba
    const setPesoActivo = useClinicalStore((state) => state.setPesoActivo);
    const setTmbPromedio = useClinicalStore((state) => state.setTmbPromedio);
    
    // 2. Ejecutamos nuestra lógica de cálculos
    const setup = useMacronutrientsSetup();

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-semibold text-gray-900">Planificación de Macronutrientes</h1>
                <p className="text-gray-600 mt-1">Ajuste manual y visualización en tiempo real</p>
            </div>

            {/* 3. Inyectamos las dependencias hacia abajo (DIP) */}
            <MacronutrientsHeader 
                context={setup.context} 
                totals={setup.totals} 
                onPesoChange={setPesoActivo} 
                onTmbChange={setTmbPromedio} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7">
                    {/* Alerta: En MacronutrientSetupCard debes cambiar el { ...: any } por los tipos que creamos */}
                    <MacronutrientSetupCard {...setup} />
                </div>
                <div className="lg:col-span-5">
                    <MacronutrientsChartsColumn totals={setup.totals} context={setup.context} />
                </div>
            </div>
        </DashboardLayout>
    );
};