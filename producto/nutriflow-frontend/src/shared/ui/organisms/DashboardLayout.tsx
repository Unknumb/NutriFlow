import { Sidebar } from './Sidebar';
import { Outlet } from '@tanstack/react-router';
import { useClinicalStore } from '../../store/useClinicalStore';

export const DashboardLayout = () => {
    const { activePatient, tmbPromedio } = useClinicalStore();

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TOP BAR */}
                {activePatient && (
                    <div className="bg-teal-700 text-white px-6 py-2.5 text-sm font-medium flex items-center shadow-sm z-10">
                        <span className="opacity-80 mr-2 uppercase tracking-wide text-xs">PACIENTE ACTIVO:</span>
                        <span className="font-semibold">{activePatient.nombre}</span>
                        <span className="mx-3 opacity-40">•</span>
                        <span>{activePatient.edad} años</span>
                        <span className="mx-3 opacity-40">•</span>
                        <span>{activePatient.peso} kg</span>
                        {tmbPromedio > 0 && (
                            <>
                                <span className="mx-3 opacity-40">•</span>
                                <span>{tmbPromedio} kcal/día</span>
                            </>
                        )}
                    </div>
                )}

                <main className="flex-1 overflow-auto">
                    <Outlet /> 
                </main>
            </div>
        </div>
    );
};