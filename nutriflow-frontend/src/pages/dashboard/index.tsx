import { PatientInfoCard } from "../../features/pacientes/components/PatientInfoCard";
import { TmbCalculatorCard } from "../../features/calculos/components/TmbCalculatorCard";
import { ReferenceWeightsCard } from "../../features/calculos/components/ReferenceWeightsCard";
import { MacrosCard } from "../../features/calculos/components/MacrosCard";

export const DashboardPage = () => {
    return (
        // Reemplazamos el Layout por un contenedor estándar para alinear todo
        <div className="p-4 max-w-[1400px] mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900">Dashboard Clínico</h1>
                <p className="text-gray-600 mt-1">Calculadoras y Planificación Nutricional</p>
            </div>

            <div className="space-y-6">
                {/* Fila 1: Info Paciente */}
                <PatientInfoCard />

                {/* Fila 2: Calculadora TMB */}
                <TmbCalculatorCard />

                {/* Fila 3: Grid de 2 columnas para Pesos y Macros */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ReferenceWeightsCard />
                    <MacrosCard />
                </div>
            </div>
        </div>
    );
};