import { useDashboardClinico } from '../../features/calculos/api/dashboardApi';
import { useClinicalStore } from '../../shared/store/useClinicalStore';
import { PatientInfoCard } from '../../features/calculos/components/PatientInfoCard';
import { TmbCalculatorCard } from '../../features/calculos/components/TmbCalculatorCard';
import { MacrosCard } from '../../features/calculos/components/MacrosCard';
import { ReferenceWeightsCard } from '../../features/calculos/components/ReferenceWeightsCard';

export const DashboardPage = () => {
  const { activePatient } = useClinicalStore();

  const { data, isLoading, error } = useDashboardClinico(activePatient);

  return (
    <div className="p-6">
      {/* Nuevo componente para seleccionar/ver paciente */}
      <PatientInfoCard />

      {activePatient ? (
        <>
          {isLoading ? (
            <div className="p-4 mb-4 text-teal-600 font-medium">Calculando métricas clínicas...</div>
          ) : error ? (
            <div className="p-4 mb-4 text-red-600">Error al obtener datos del motor matemático</div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TmbCalculatorCard data={data?.tmb} />
            <MacrosCard data={data?.macros} />
            <ReferenceWeightsCard data={data?.pesos} />
          </div>
        </>
      ) : (
        <div className="text-center p-10 bg-white rounded-lg border border-gray-200 mt-6">
          <p className="text-gray-500">Seleccione un paciente para ver sus cálculos y métricas clínicas.</p>
        </div>
      )}
    </div>
  );
};