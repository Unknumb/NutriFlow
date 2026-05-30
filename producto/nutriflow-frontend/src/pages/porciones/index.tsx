import { LayoutGrid, FileText, BookOpen, Download, User, Pen, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { usePortions } from '../../features/porciones/hooks/usePortions';
import { PortionsTable } from '../../features/porciones/components/PortionsTable';
import { VistaPauta } from '../../features/porciones/components/VistaPauta';
import { OpcionesPorGrupo } from '../../features/porciones/components/OpcionesPorGrupo';
import { ExportarPDF } from '../../features/porciones/components/ExportarPDF';
import { PortionsConfigPanel } from '../../features/porciones/components/PortionsConfigPanel';

export const PorcionesPage = () => {
    const { state, actions } = usePortions();
    const { activeTab, patientContext, hideEmpty } = state;
    const { setActiveTab, resetDistributions, toggleHideEmpty } = actions;

    return (
        <div className="p-4 max-w-[1400px] mx-auto w-full flex flex-col h-full">
            
            <div className="bg-teal-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm mb-4 shrink-0">
                <div className="w-2 h-2 rounded-full bg-teal-300 animate-pulse"></div>
                <span className="text-xs text-teal-200 font-medium uppercase tracking-wide mr-1">Paciente activo:</span>
                <span className="text-sm font-semibold truncate max-w-[160px]">{patientContext.name}</span>
                <span className="text-teal-400 mx-1">·</span>
                <span className="text-sm">{patientContext.age} años</span>
                <span className="text-teal-400 mx-1">·</span>
                <span className="text-sm">{patientContext.weight} kg</span>
                <span className="text-teal-400 mx-1">·</span>
                <span className="text-sm font-semibold text-teal-100">{patientContext.kcal} kcal/día</span>
            </div>

            <div className="bg-white rounded-t-2xl border border-gray-200 border-b-0 px-6 py-4 shrink-0">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Distribución de Porciones</h1>
                        <p className="text-xs text-gray-500 mt-1">Configura y ajusta la pauta nutricional del paciente activo.</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <button 
                            onClick={() => !hideEmpty && toggleHideEmpty()}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors font-medium ${!hideEmpty ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            <Eye className="w-3.5 h-3.5" /> Vista normal
                        </button>
                        <button 
                            onClick={() => hideEmpty && toggleHideEmpty()}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors font-medium ${hideEmpty ? 'bg-teal-50 border-teal-300 text-teal-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            <EyeOff className="w-3.5 h-3.5" /> Ocultar vacías
                        </button>
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