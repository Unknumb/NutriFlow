import { useDashboardClinico } from '../../features/calculos/api/dashboardApi';
import { useClinicalStore } from '../../shared/store/useClinicalStore';
import { TmbCalculatorCard } from '../../features/calculos/components/TmbCalculatorCard';
import { MacrosCard } from '../../features/calculos/components/MacrosCard';
import { ReferenceWeightsCard } from '../../features/calculos/components/ReferenceWeightsCard';

export const DashboardPage = () => {
  const { activePatient } = useClinicalStore();
  const { data, isLoading, error } = useDashboardClinico(activePatient?.id || '');

  if (isLoading) return <div>Calculando métricas clínicas...</div>;
  if (error) return <div>Error al obtener datos del motor matemático</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Usamos los datos reales que vienen de FastAPI vía NestJS */}
      <TmbCalculatorCard data={data?.tmb} />
      <MacrosCard data={data?.macros} />
      <ReferenceWeightsCard data={data?.pesos} />
    </div>
  );
};