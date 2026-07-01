import { useEffect } from 'react';
import { useClinicalStore } from '../../../shared/store/useClinicalStore';
import { useDashboardClinico } from '../api/dashboardApi';

/**
 * Garantiza que la TMB del paciente activo se calcule (vía motor matemático)
 * en CUALQUIER pantalla, no solo en el Dashboard.
 *
 * Sin esto, una nutricionista que sigue el FlowStepper (Macronutrientes es el
 * paso 1, omite el Dashboard) planifica sobre una TMB por defecto o arrastrada
 * del paciente anterior. Se monta una sola vez en el layout protegido.
 *
 * Solo escribe cuando todavía no hay TMB para el paciente actual
 * (`tmbPromedio <= 0`), para no pisar un ajuste manual de fórmulas/calorías
 * que la nutricionista haya hecho en el Dashboard o en el header de Macros.
 */
export const useSyncActivePatientTmb = () => {
  const activePatient = useClinicalStore((s) => s.activePatient);
  const tmbPromedio = useClinicalStore((s) => s.tmbPromedio);
  const setTmbPromedio = useClinicalStore((s) => s.setTmbPromedio);

  const { data } = useDashboardClinico(activePatient);

  useEffect(() => {
    if (!activePatient || tmbPromedio > 0) return;

    // Promedio de todas las fórmulas (misma base que muestra por defecto la
    // tarjeta de TMB del Dashboard), para que ambas pantallas coincidan.
    const resultados = data?.tmb?.resultados_individuales;
    const valores = resultados ? Object.values(resultados) : [];
    const promedio = valores.length
      ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
      : data?.tmb?.promedio_calculado ?? 0;

    if (promedio > 0) {
      setTmbPromedio(promedio);
    }
  }, [activePatient, tmbPromedio, data, setTmbPromedio]);
};
