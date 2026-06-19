import { Link } from '@tanstack/react-router';
import {
    Calculator, PieChart, FileText, Grid3x3, BookOpen, Sparkles,
    Users, LogOut, Apple, Menu,
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../../store/useAuthStore';

const MENU_GROUPS = [
    {
        label: 'Clínica',
        items: [
            { path: '/dashboard', label: 'Dashboard', icon: Calculator },
            { path: '/pacientes', label: 'Fichas de Pacientes', icon: Users },
        ],
    },
    {
        label: 'Planificación',
        items: [
            { path: '/macronutrientes', label: 'Macronutrientes', icon: PieChart },
            { path: '/pautas', label: 'Armador de Pautas', icon: FileText },
            { path: '/porciones', label: 'Distribución de Porciones', icon: Grid3x3 },
        ],
    },
    {
        label: 'Catálogo',
        items: [
            { path: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
            { path: '/generador', label: 'Generador Automático', icon: Sparkles },
            { path: '/alimentos', label: 'Alimentos', icon: Apple },
        ],
    },
] as const;

export const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { user } = useAuthStore();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const closeMobile = () => setIsMobileOpen(false);

    const nombreCompleto =
        [user?.user_metadata?.nombre, user?.user_metadata?.apellido]
            .filter(Boolean)
            .join(' ') ||
        user?.email ||
        'Nutricionista';

    const iniciales = nombreCompleto
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const avatarUrl: string | undefined = user?.user_metadata?.avatar_url || undefined;

    return (
        <>
            {/* Botón hamburguesa flotante — solo visible en móvil cuando el sidebar está cerrado */}
            {!isMobileOpen && typeof document !== 'undefined' && createPortal(
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="md:hidden fixed top-3 left-3 z-[60] p-2 bg-white rounded-md shadow-md text-pine border border-gray-100"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-5 h-5" />
                </button>,
                document.body
            )}

            {/* Overlay oscuro — solo en móvil cuando el sidebar está abierto */}
            {isMobileOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="md:hidden fixed inset-0 bg-ink/60 z-[50] backdrop-blur-sm"
                    onClick={closeMobile}
                />,
                document.body
            )}

            <aside className={`bg-pine text-porcelain flex flex-col h-screen transition-all duration-300 ease-in-out overflow-hidden fixed inset-y-0 left-0 z-[55] ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} md:relative md:sticky md:top-0 md:translate-x-0 md:shadow-none ${isCollapsed ? 'w-20' : 'w-64'}`}>
                {/* ── Header ── */}
                {isCollapsed ? (
                    <div className="flex justify-center pt-6 pb-5">
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="p-1.5 text-porcelain/60 hover:text-porcelain hover:bg-pine-soft/60 rounded-md transition-colors duration-150"
                            aria-label="Expandir menú"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="px-6 pt-7 pb-6 flex items-start justify-between">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.14em] text-porcelain/50 mb-1">
                                Consulta nutricional
                            </p>
                            <h1 className="font-display text-[22px] font-semibold text-porcelain leading-none">
                                NutriFlow
                            </h1>
                        </div>
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1.5 text-porcelain/60 hover:text-porcelain hover:bg-pine-soft/60 rounded-md transition-colors duration-150"
                            aria-label="Colapsar menú"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* ── Navegación ── */}
                <nav className="flex-1 px-3 pb-4 overflow-y-auto space-y-6" onClick={closeMobile}>
                    {MENU_GROUPS.map((group) => (
                        <div key={group.label}>
                            {!isCollapsed && (
                                <p className="px-4 mb-1.5 text-[11px] uppercase tracking-[0.12em] text-porcelain/40 select-none">
                                    {group.label}
                                </p>
                            )}
                            <ul className="space-y-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path as string & {}}
                                                activeOptions={{ exact: true }}
                                                className={`flex items-center rounded-md border-l-[3px] transition-colors duration-150 ${isCollapsed ? 'justify-center py-3 px-2' : 'gap-3 px-4 py-2.5'}`}
                                                inactiveProps={{
                                                    className: 'border-transparent text-porcelain/70 hover:bg-pine-soft/60 hover:text-porcelain',
                                                }}
                                                activeProps={{
                                                    className: 'border-apricot bg-pine-soft text-porcelain font-medium',
                                                }}
                                            >
                                                <Icon className="w-[18px] h-[18px] shrink-0" />
                                                {!isCollapsed && <span className="text-sm">{item.label}</span>}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* ── Footer de perfil ── */}
                <div className="p-3 border-t border-porcelain/10 mt-auto">
                    {isCollapsed ? (
                        <div className="flex justify-center py-2">
                            <Link
                                to={'/perfil' as string & {}}
                                title="Mi perfil"
                                onClick={closeMobile}
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={`Foto de ${nombreCompleto}`}
                                        className="w-9 h-9 rounded-full object-cover"
                                    />
                                ) : (
                                    <span className="w-9 h-9 rounded-full bg-apricot text-pine font-semibold text-sm flex items-center justify-center">
                                        {iniciales}
                                    </span>
                                )}
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-2 px-2 py-2 rounded-md hover:bg-pine-soft/60 transition-colors duration-150">
                            <Link
                                to={'/perfil' as string & {}}
                                className="flex items-center gap-3 min-w-0 flex-1"
                                title="Mi perfil"
                                onClick={closeMobile}
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={`Foto de ${nombreCompleto}`}
                                        className="w-9 h-9 rounded-full object-cover shrink-0"
                                    />
                                ) : (
                                    <span className="w-9 h-9 rounded-full bg-apricot text-pine font-semibold text-sm flex items-center justify-center shrink-0">
                                        {iniciales}
                                    </span>
                                )}
                                <span className="overflow-hidden">
                                    <span
                                        className="block text-sm font-medium text-porcelain truncate"
                                        title={nombreCompleto}
                                    >
                                        {nombreCompleto}
                                    </span>
                                    <span className="block text-xs text-porcelain/50">Nutricionista</span>
                                </span>
                            </Link>

                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="p-1.5 rounded-md text-porcelain/50 hover:text-clinical-red hover:bg-porcelain/10 transition-colors duration-150"
                                title="Cerrar sesión"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal de confirmación de cierre de sesión */}
                {showLogoutModal &&
                    typeof document !== 'undefined' &&
                    createPortal(
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/40 p-4 animate-in fade-in duration-200">
                            <div className="bg-white rounded-card shadow-card w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-12 h-12 rounded-full bg-clinical-red/10 flex items-center justify-center mb-4 text-clinical-red">
                                        <LogOut className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-display text-lg font-semibold text-ink mb-2">
                                        ¿Cerrar sesión?
                                    </h3>
                                    <p className="text-sm text-ink-soft mb-6">
                                        Tendrás que volver a ingresar tus credenciales para entrar al sistema.
                                    </p>
                                    <div className="flex gap-3 w-full">
                                        <button
                                            onClick={() => setShowLogoutModal(false)}
                                            className="flex-1 py-2.5 px-4 bg-mist hover:bg-mist/70 text-ink font-medium rounded-md transition-colors duration-150"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex-1 py-2.5 px-4 bg-clinical-red hover:bg-clinical-red/90 text-white font-medium rounded-md transition-colors duration-150"
                                        >
                                            Cerrar sesión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}
            </aside>
        </>
    );
};
