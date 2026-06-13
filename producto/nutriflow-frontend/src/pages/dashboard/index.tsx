import { useDashboardClinico } from '../../features/calculos/api/dashboardApi';
import { PageHeader } from '../../shared/ui/organisms/PageHeader';
import { useClinicalStore } from '../../shared/store/useClinicalStore';
import { PatientInfoCard } from '../../features/calculos/components/PatientInfoCard';
import { TmbCalculatorCard } from '../../features/calculos/components/TmbCalculatorCard';
import { MacrosCard } from '../../features/calculos/components/MacrosCard';
import { ReferenceWeightsCard } from '../../features/calculos/components/ReferenceWeightsCard';

export const DashboardPage = () => {
  const { activePatient } = useClinicalStore();

  const { data, isLoading, error } = useDashboardClinico(activePatient);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        eyebrow="Clínica"
        title="Dashboard Clínico"
        description="Cálculos y métricas del paciente activo"
      />
      <PatientInfoCard />

      {activePatient ? (
        <>
          {isLoading ? (
            <div className="p-4 mb-4 text-pine-soft font-medium">Calculando métricas clínicas...</div>
          ) : error ? (
            <div className="p-4 mb-4 text-clinical-red">Error al obtener datos del motor matemático</div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TmbCalculatorCard data={data?.tmb} />
            <MacrosCard />
            <ReferenceWeightsCard data={data?.pesos} />
          </div>
        </>
      ) : (
        <div className="text-center p-10 bg-white rounded-card border border-mist mt-6">
          <p className="text-ink-soft">Selecciona un paciente para ver sus cálculos y métricas clínicas.</p>
        </div>
      )}
    </div>
  );
};