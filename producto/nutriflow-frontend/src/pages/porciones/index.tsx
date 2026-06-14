import { useState } from 'react';
import { LayoutGrid, FileText, BookOpen, Download, RefreshCw, Save, Loader2, Check } from 'lucide-react';
import { usePortions } from '../../features/porciones/hooks/usePortions';
import { PortionsTable } from '../../features/porciones/components/PortionsTable';
import { VistaPauta } from '../../features/porciones/components/VistaPauta';
import { OpcionesPorGrupo } from '../../features/porciones/components/OpcionesPorGrupo';
import { ExportarPDF } from '../../features/porciones/components/ExportarPDF';
import { PortionsConfigPanel } from '../../features/porciones/components/PortionsConfigPanel';

export const PorcionesPage = () => {
    const { state, actions } = usePortions();
    const { activeTab, isSaving, hayPacienteActivo } = state;
    const { setActiveTab, resetDistributions, guardarPauta } = actions;

    const [aviso, setAviso] = useState<{ ok: boolean; message: string } | null>(null);

    const handleGuardar = async () => {
        const resultado = await guardarPauta();
        setAviso(resultado);
        if (resultado.ok) setTimeout(() => setAviso(null), 4000);
    };

    return (
        <div className="p-4 max-w-[1400px] mx-auto w-full flex flex-col h-full">


            <div className="bg-white rounded-t-card border border-mist border-b-0 px-6 py-4 shrink-0">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-ink">Distribución de Porciones</h1>
                        <p className="text-xs text-ink-soft mt-1">Configura y ajusta la pauta nutricional del paciente activo.</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <button
                            onClick={resetDistributions}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors bg-white border-mist text-ink-soft hover:bg-porcelain font-medium">
                            <RefreshCw className="w-3.5 h-3.5" /> Restablecer
                        </button>
                        <PortionsConfigPanel />
                        <button
                            onClick={handleGuardar}
                            disabled={isSaving || !hayPacienteActivo}
                            title={!hayPacienteActivo ? 'Selecciona un paciente activo primero' : undefined}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-pine hover:bg-pine-soft text-porcelain transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {isSaving ? 'Guardando...' : 'Guardar pauta'}
                        </button>
                    </div>
                </div>
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

            <div className="bg-white px-6 py-3 border-x border-b border-mist rounded-b-card mb-4 shrink-0 shadow-sm">
                <div className="text-ink-soft h-9 w-fit items-center justify-center rounded-xl p-[3px] flex bg-mist/60">
                    <button onClick={() => setActiveTab('tabla')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all ${activeTab === 'tabla' ? 'bg-white text-ink shadow-sm' : 'hover:text-ink'}`}>
                        <LayoutGrid className="w-3.5 h-3.5" /> Tabla
                    </button>
                    <button onClick={() => setActiveTab('pauta')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all ${activeTab === 'pauta' ? 'bg-white text-ink shadow-sm' : 'hover:text-ink'}`}>
                        <FileText className="w-3.5 h-3.5" /> Vista Pauta
                    </button>
                    <button onClick={() => setActiveTab('opciones')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all ${activeTab === 'opciones' ? 'bg-white text-ink shadow-sm' : 'hover:text-ink'}`}>
                        <BookOpen className="w-3.5 h-3.5" /> Opciones por Grupo
                    </button>
                    <button onClick={() => setActiveTab('pdf')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all ${activeTab === 'pdf' ? 'bg-white text-ink shadow-sm' : 'hover:text-ink'}`}>
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