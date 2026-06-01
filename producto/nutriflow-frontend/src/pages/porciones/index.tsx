import { LayoutGrid, FileText, BookOpen, Download, RefreshCw } from 'lucide-react';
import { usePortions } from '../../features/porciones/hooks/usePortions';
import { PortionsTable } from '../../features/porciones/components/PortionsTable';
import { VistaPauta } from '../../features/porciones/components/VistaPauta';
import { OpcionesPorGrupo } from '../../features/porciones/components/OpcionesPorGrupo';
import { ExportarPDF } from '../../features/porciones/components/ExportarPDF';
import { PortionsConfigPanel } from '../../features/porciones/components/PortionsConfigPanel';

export const PorcionesPage = () => {
    const { state, actions } = usePortions();
    const { activeTab } = state;
    const { setActiveTab, resetDistributions } = actions;

    return (
        <div className="p-4 max-w-[1400px] mx-auto w-full flex flex-col h-full">
            

            <div className="bg-white rounded-t-2xl border border-gray-200 border-b-0 px-6 py-4 shrink-0">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Distribución de Porciones</h1>
                        <p className="text-xs text-gray-500 mt-1">Configura y ajusta la pauta nutricional del paciente activo.</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <button 
                            onClick={resetDistributions}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors bg-white border-gray-200 text-gray-600 hover:bg-gray-50 font-medium">
                            <RefreshCw className="w-3.5 h-3.5" /> Restablecer
                        </button>
                        <button
                            onClick={actions.savePortions}
                            disabled={state.isSaving}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-transparent text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors ml-2"
                        >
                            {state.isSaving ? 'Guardando...' : 'Guardar'}
                        </button>
                        <PortionsConfigPanel />
                    </div>
                </div>
            </div>

            <div className="bg-white px-6 py-3 border-x border-b border-gray-200 rounded-b-2xl mb-4 shrink-0 shadow-sm">
                <div className="text-gray-500 h-9 w-fit items-center justify-center rounded-xl p-[3px] flex bg-gray-100">
                    <button onClick={() => setActiveTab('tabla')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all ${activeTab === 'tabla' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'}`}>
                        <LayoutGrid className="w-3.5 h-3.5" /> Tabla
                    </button>
                    <button onClick={() => setActiveTab('pauta')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all ${activeTab === 'pauta' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'}`}>
                        <FileText className="w-3.5 h-3.5" /> Vista Pauta
                    </button>
                    <button onClick={() => setActiveTab('opciones')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all ${activeTab === 'opciones' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'}`}>
                        <BookOpen className="w-3.5 h-3.5" /> Opciones por Grupo
                    </button>
                    <button onClick={() => setActiveTab('pdf')} className={`inline-flex h-full items-center justify-center rounded-lg px-3 py-1 font-medium gap-1.5 text-xs transition-all ${activeTab === 'pdf' ? 'bg-white text-gray-900 shadow-sm' : 'hover:text-gray-900'}`}>
                        <Download className="w-3.5 h-3.5" /> Exportar PDF
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                {activeTab === 'tabla' && <PortionsTable />}
                
                {activeTab === 'pauta' && <VistaPauta />}

                {activeTab === 'opciones' && <OpcionesPorGrupo />}

                {activeTab === 'pdf' && <ExportarPDF />}
            </div>
        </div>
    );
};