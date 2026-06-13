import { Sidebar } from './Sidebar';
import { Outlet } from '@tanstack/react-router';
import { useClinicalStore } from '../../store/useClinicalStore';

export const DashboardLayout = () => {
    const { activePatient, tmbPromedio } = useClinicalStore();

    return (
        <div className="flex h-screen bg-porcelain overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Barra de paciente activo */}
                {activePatient && (
                    <div className="bg-white border-b border-mist px-6 py-2.5 text-sm flex items-center gap-3 z-10">
                        <span className="text-[11px] uppercase tracking-[0.12em] text-pine-soft font-medium">Paciente activo</span>
                        <span className="font-semibold text-ink">{activePatient.nombre}</span>
                        <span className="text-mist">|</span>
                        <span className="text-ink-soft tnum">{activePatient.edad} años</span>
                        <span className="text-mist">|</span>
                        <span className="text-ink-soft tnum">{activePatient.peso} kg</span>
                        {tmbPromedio > 0 && (
                            <>
                                <span className="text-mist">|</span>
                                <span className="text-ink-soft tnum">{tmbPromedio} kcal/día</span>
                            </>
                        )}
                    </div>
                )}

                <main className="flex-1 overflow-auto page-enter">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
