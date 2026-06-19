import { useState } from 'react';
import { LayoutGrid, FileText, BookOpen, Download, RefreshCw, Save, Loader2, Check, Plus, AlertTriangle } from 'lucide-react';
import { usePortions } from '../../features/porciones/hooks/usePortions';
import { PortionsTable } from '../../features/porciones/components/PortionsTable';
import { VistaPauta } from '../../features/porciones/components/VistaPauta';
import { OpcionesPorGrupo } from '../../features/porciones/components/OpcionesPorGrupo';
import { ExportarPDF } from '../../features/porciones/components/ExportarPDF';
import { PortionsConfigPanel } from '../../features/porciones/components/PortionsConfigPanel';
import { SavePautaModal } from '../../features/porciones/components/SavePautaModal';
import { FlowStepper } from '../../shared/ui/organisms/FlowStepper';
import { PlanificacionSelector } from '../../features/planificaciones/components/PlanificacionSelector';

export const PorcionesPage = () => {
    const { state, actions } = usePortions();
    const {
        activeTab, isSaving, hayPacienteActivo, hayPlanificacionActiva,
        pautas, selectedPautaId, pautaSeleccionada, nombrePautaSugerido,
    } = state;
    const { setActiveTab, resetDistributions, guardarPauta, setSelectedPautaId, nuevaPauta } = actions;

    const [aviso, setAviso] = useState<{ ok: boolean; message: string } | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const puedeGuardar = hayPacienteActivo && hayPlanificacionActiva;
    const tituloGuardar = !hayPacienteActivo
        ? 'Selecciona un paciente activo primero'
        : !hayPlanificacionActiva
            ? 'Crea una planificación de macronutrientes antes de guardar la pauta'
            : undefined;

    const handleGuardar = async (nombre: string) => {
        const resultado = await guardarPauta(nombre);
        setAviso(resultado);
        setModalOpen(false);
        if (resultado.ok) setTimeout(() => setAviso(null), 4000);
    };

    const onSelectorChange = (value: string) => {
        if (value === 'nueva') {
            nuevaPauta();
        } else {
            setSelectedPautaId(value);
        }
    };

    return (
        <div className="p-4 max-w-[1400px] mx-auto w-full flex flex-col h-full">

            <SavePautaModal
                open={modalOpen}
                defaultName={pautaSeleccionada?.nombre || nombrePautaSugerido}
                isEditing={!!selectedPautaId}
                isSaving={isSaving}
                onClose={() => setModalOpen(false)}
                onConfirm={handleGuardar}
            />

            <FlowStepper current={3} />

            <div className="bg-white rounded-t-card border border-mist border-b-0 px-4 sm:px-6 py-4 shrink-0">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-ink">Distribución de Porciones</h1>
                        <p className="text-xs text-ink-soft mt-1">Configura y ajusta la pauta nutricional del paciente activo.</p>
                        <div className="mt-2">
                            <PlanificacionSelector />
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        {/* Selector de pautas de la planificación activa */}
                        <select
                            value={selectedPautaId ?? 'nueva'}
                            onChange={(e) => onSelectorChange(e.target.value)}
                            disabled={!puedeGuardar}
                            aria-label="Pauta"
                            className="px-3 py-1.5 rounded-lg border border-mist bg-white text-xs text-ink font-medium outline-none focus:border-pine-soft disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:max-w-[180px]"
                        >
                            {pautas.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nombre || 'Pauta sin nombre'}
                                </option>
                            ))}
                            {!selectedPautaId && <option value="nueva">Pauta nueva (sin guardar)</option>}
                        </select>
                        <button
                            onClick={nuevaPauta}
                            disabled={!puedeGuardar}
                            title="Empezar una pauta nueva"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors bg-white border-mist text-ink-soft hover:bg-porcelain font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                            <Plus className="w-3.5 h-3.5" /> Nueva
                        </button>
                        <button
                            onClick={resetDistributions}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors bg-white border-mist text-ink-soft hover:bg-porcelain font-medium">
                            <RefreshCw className="w-3.5 h-3.5" /> Restablecer
                        </button>
                        <PortionsConfigPanel />
                        <button
                            onClick={() => setModalOpen(true)}
                            disabled={isSaving || !puedeGuardar}
                            title={tituloGuardar}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-pine hover:bg-pine-soft text-porcelain transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {isSaving ? 'Guardando...' : 'Guardar pauta'}
                        </button>
                    </div>
                </div>

                {/* P7: aviso si el paciente no tiene planificación de macros activa */}
                {hayPacienteActivo && !hayPlanificacionActiva && (
                    <div className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-md border bg-apricot/10 border-apricot/40 text-[#8a5a2a]" role="alert">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Este paciente no tiene una planificación de macronutrientes activa. Crea una en <strong>Macronutrientes</strong> antes de guardar la pauta.
                    </div>
                )}
                {aviso && (
                    <div
                        className={`mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-md border ${
                            aviso.ok
                                ? 'bg-pine-soft/5 border-pine-soft/30 text-pine-soft'
                                : 'bg-clinical-red/5 border-clinical-red/30 text-clinical-red'
                        }`}
                        role="alert"
                    >
                        {aviso.ok && <Check className="w-3.5 h-3.5" />}
                        {aviso.message}
                    </div>
                )}
            </div>

            <div className="bg-white px-4 sm:px-6 py-3 border-x border-b border-mist rounded-b-card mb-4 shrink-0 shadow-sm overflow-x-auto scrollbar-hide">
                <div className="text-ink-soft h-9 w-fit min-w-full items-center justify-center rounded-xl p-[3px] flex bg-mist/60">
                    <button onClick={() => setActiveTab('tabla')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all whitespace-nowrap ${activeTab === 'tabla' ? 'bg-white text-ink shadow-sm' : 'hover:text-ink'}`}>
                        <LayoutGrid className="w-3.5 h-3.5" /> Tabla
                    </button>
                    <button onClick={() => setActiveTab('pauta')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all whitespace-nowrap ${activeTab === 'pauta' ? 'bg-white text-ink shadow-sm' : 'hover:text-ink'}`}>
                        <FileText className="w-3.5 h-3.5" /> Vista Pauta
                    </button>
                    <button onClick={() => setActiveTab('opciones')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all whitespace-nowrap ${activeTab === 'opciones' ? 'bg-white text-ink shadow-sm' : 'hover:text-ink'}`}>
                        <BookOpen className="w-3.5 h-3.5" /> Opciones por Grupo
                    </button>
                    <button onClick={() => setActiveTab('pdf')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all whitespace-nowrap ${activeTab === 'pdf' ? 'bg-white text-ink shadow-sm' : 'hover:text-ink'}`}>
                        <Download className="w-3.5 h-3.5" /> Exportar PDF
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-white rounded-card border border-mist p-4 shadow-sm">
                {activeTab === 'tabla' && <PortionsTable />}
                
                {activeTab === 'pauta' && <VistaPauta />}

                {activeTab === 'opciones' && <OpcionesPorGrupo />}

                {activeTab === 'pdf' && <ExportarPDF />}
            </div>
        </div>
    );
};