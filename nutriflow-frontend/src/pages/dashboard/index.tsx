import { DashboardLayout } from "../../shared/ui/organisms/DashboardLayout";
import { PatientInfoCard } from "../../features/pacientes/components/PatientInfoCard";
import { TmbCalculatorCard } from "../../features/calculos/components/TmbCalculatorCard";
import { ReferenceWeightsCard } from "../../features/calculos/components/ReferenceWeightsCard";
import { MacrosCard } from "../../features/calculos/components/MacrosCard";

export const DashboardPage = () => {
    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-900">Dashboard Clínico</h1>
                <p className="text-gray-600 mt-1">Calculadoras y Planificación Nutricional</p>
            </div>

            {/* Fila 1: Info Paciente */}
            <PatientInfoCard />

            {/* Fila 2: Calculadora TMB */}
            <TmbCalculatorCard />

            {/* Fila 3: Grid de 2 columnas para Pesos y Macros */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ReferenceWeightsCard />

                <MacrosCard />


            </div>
        </DashboardLayout>
    );
};