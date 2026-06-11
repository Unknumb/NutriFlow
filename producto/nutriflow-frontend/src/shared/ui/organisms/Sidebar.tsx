import { Link } from '@tanstack/react-router';
import { Calculator, PieChart, User, FileText, Grid3x3, BookOpen, Sparkles, Users, LogOut } from 'lucide-react'; // 🚨 Agregamos LogOut
import { supabase } from '../../utils/supabase';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../../store/useAuthStore';

// 1. Catálogo centralizado de rutas
const MENU_ITEMS = [
    { path: '/dashboard', label: 'Dashboard Clínico', icon: Calculator },
    { path: '/macronutrientes', label: 'Macronutrientes Interactivo', icon: PieChart },
    { path: '/pautas', label: 'Armador de Pautas', icon: FileText },
    { path: '/porciones', label: 'Distribución de Porciones', icon: Grid3x3 },
    { path: '/biblioteca', label: 'Biblioteca de Preparaciones', icon: BookOpen },
    { path: '/generador', label: 'Generador Automático', icon: Sparkles },
    { path: '/pacientes', label: 'Fichas de Pacientes', icon: Users }
] as const;



export const Sidebar = () => {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { user } = useAuthStore();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 h-screen sticky top-0">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-900">NutriFlow</h1>
                <p className="text-sm text-gray-500">Sistema Clínico</p>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <Link 
                                    // 🚨 FIX 1: Bypass de TS para rutas mapeadas dinámicamente
                                    to={item.path as string & {}} 
                                    // 🚨 FIX 2: Evita que se enciendan 2 botones al mismo tiempo
                                    activeOptions={{ exact: true }} 
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                                    inactiveProps={{
                                        className: 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                                    }}
                                    activeProps={{
                                        className: 'bg-teal-50 text-teal-700 shadow-sm font-medium'
                                    }}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-sm">{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-200 mt-auto">
                {/* 🚨 FIX 3: Ajuste de flexbox para poner el botón de Logout a la derecha */}
                <div className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-700" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 truncate" title={user?.user_metadata?.nombre || user?.email || 'Nutricionista'}>
                                {user?.user_metadata?.nombre || user?.email || 'Nutricionista'}
                            </p>
                            <p className="text-xs text-gray-500">Nutricionista</p>
                        </div>
                    </div>
                    
                    {/* Botón sutil de Cerrar Sesión que se pone rojo al pasar el mouse */}
                    <button 
                        onClick={() => setShowLogoutModal(true)} 
                        className="p-1"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                </div>
            </div>

            {/* Modal de confirmación de cierre de sesión renderizado en un Portal para evitar bugs de z-index */}
            {showLogoutModal && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                                <LogOut className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">¿Cerrar sesión?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                ¿Estás seguro de que deseas salir del sistema clínico? Tendrás que volver a ingresar tus credenciales.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                                >
                                    No
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-red-200"
                                >
                                    Sí
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </aside>
    );
};