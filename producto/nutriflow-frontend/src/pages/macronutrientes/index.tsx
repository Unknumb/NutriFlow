// ❌ Eliminamos la importación de DashboardLayout
import { useMemo, useState } from "react";
import { MacronutrientSetupCard } from "../../features/macronutrients/components/MacronutrientSetupCard";
import { MacronutrientsChartsColumn } from "../../features/macronutrients/components/MacronutrientsChartsColumn";
import { MacronutrientsHeader } from "../../features/macronutrients/components/MacronutrientsHeader";
import { SavePlanificacionModal, SaveDecision } from "../../features/macronutrients/components/SavePlanificacionModal";
import { useMacronutrientsSetup } from "../../features/macronutrients/hooks/useMacronutrientsSetup";
import { usePlanificaciones } from "../../features/planificaciones/hooks/usePlanificaciones";
import { useClinicalStore } from "../../shared/store/useClinicalStore";
import { PageHeader } from "../../shared/ui/organisms/PageHeader";
import { FlowStepper } from "../../shared/ui/organisms/FlowStepper";

export const MacronutrientesPage = () => {
    // 1. Extraemos las acciones globales aquí arriba
    const setPesoActivo = useClinicalStore((state) => state.setPesoActivo);
    const setTmbPromedio = useClinicalStore((state) => state.setTmbPromedio);
    const activePatient = useClinicalStore((state) => state.activePatient);

    // 2. Ejecutamos nuestra lógica de cálculos
    const setup = useMacronutrientsSetup();

    // 3. Modal de guardado: crear nueva ("Planificación N" sugerido) o
    //    sobrescribir una de las planificaciones existentes del paciente.
    const [modalOpen, setModalOpen] = useState(false);
    const { data: planificaciones } = usePlanificaciones();
    const planificacionesDelPaciente = useMemo(
        () => (planificaciones || []).filter((p) => p.paciente_id === activePatient?.id),
        [planificaciones, activePatient?.id],
    );
    const suggestedName = `Planificación ${planificacionesDelPaciente.length + 1}`;

    const handleConfirmSave = (decision: SaveDecision) => {
        if (decision.mode === "overwrite") {
            setup.actions.handleOverwrite(decision.planificacionId);
        } else {
            setup.actions.handleSave(decision.nombre);
        }
        setModalOpen(false);
    };

    const openSaveModal = () => {
        if (!activePatient?.id) {
            alert('Selecciona un paciente primero');
            return;
        }
        if (!setup.canSave) {
            alert('Aún no se ha calculado la TMB del paciente. Espera unos segundos o revísala en el Dashboard antes de guardar.');
            return;
        }
        setModalOpen(true);
    };

    return (
        // Reemplazamos el Layout por el contenedor estándar de nuestra arquitectura
        <div className="w-full max-w-[1400px] mx-auto overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
            <FlowStepper current={1} />
            <PageHeader
                eyebrow="Planificación"
                title="Macronutrientes"
                description="Ajuste manual y visualización en tiempo real"
                actions={
                    <button
                        onClick={openSaveModal}
                        disabled={setup.isSaving || !setup.canSave}
                        title={!setup.canSave ? 'Calculando la TMB del paciente…' : undefined}
                        className="px-6 py-2.5 bg-pine hover:bg-pine-soft disabled:opacity-60 disabled:cursor-not-allowed text-porcelain font-medium rounded-md transition-colors duration-150 w-full sm:w-auto"
                    >
                        {setup.isSaving ? 'Guardando...' : 'Guardar planificación'}
                    </button>
                }
            />

            <SavePlanificacionModal
                open={modalOpen}
                suggestedName={suggestedName}
                planificaciones={planificacionesDelPaciente.map((p) => ({
                    id: p.id,
                    nombre: p.nombre,
                    calorias_totales: p.calorias_totales,
                    activa: p.activa,
                }))}
                isSaving={setup.isSaving}
                onClose={() => setModalOpen(false)}
                onConfirm={handleConfirmSave}
            />

            {/* 3. Inyectamos las dependencias hacia abajo (DIP) */}
            <MacronutrientsHeader
                context={setup.context}
                totals={setup.totals}
                isBalanced={setup.isBalanced}
                onPesoChange={setPesoActivo}
                onTmbChange={setTmbPromedio}
                onAutoBalance={setup.actions.autoBalance}
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