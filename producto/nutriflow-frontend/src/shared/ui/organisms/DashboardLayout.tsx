import { Sidebar } from './Sidebar';
import { Outlet } from '@tanstack/react-router';
import { useClinicalStore } from '../../store/useClinicalStore';

export const DashboardLayout = () => {
    const { activePatient, tmbPromedio } = useClinicalStore();

    return (
        <div className="flex h-screen bg-porcelain overflow-hidden font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {/* Barra de paciente activo */}
                {activePatient && (
                    <div className="bg-white border-b border-mist pl-14 pr-4 md:px-6 py-2 text-sm flex flex-wrap items-center gap-x-3 gap-y-1 z-10 min-w-0">
                        <span className="text-[11px] uppercase tracking-[0.12em] text-pine-soft font-medium shrink-0">Paciente activo</span>
                        <span className="font-semibold text-ink truncate max-w-[140px] sm:max-w-none">{activePatient.nombre}</span>
                        <span className="text-mist hidden sm:inline">|</span>
                        <span className="text-ink-soft tnum shrink-0">{activePatient.edad} años</span>
                        <span className="text-mist hidden sm:inline">|</span>
                        <span className="text-ink-soft tnum shrink-0">{activePatient.peso} kg</span>
                        {tmbPromedio > 0 && (
                            <>
                                <span className="text-mist hidden sm:inline">|</span>
                                <span className="text-ink-soft tnum shrink-0">{tmbPromedio} kcal/día</span>
                            </>
                        )}
                    </div>
                )}

                <main className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden min-h-0 pt-12 md:pt-0 page-enter">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
