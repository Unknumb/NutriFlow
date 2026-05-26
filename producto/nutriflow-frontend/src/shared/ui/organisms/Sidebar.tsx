import { Link } from '@tanstack/react-router';
import { Calculator, PieChart, User, FileText, Grid3x3, BookOpen, Sparkles, Users, LogOut } from 'lucide-react'; // 🚨 Agregamos LogOut

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
                        <div>
                            <p className="text-sm font-medium text-gray-900">Dra. Javiera Silva</p>
                            <p className="text-xs text-gray-500">Nutricionista</p>
                        </div>
                    </div>
                    
                    {/* Botón sutil de Cerrar Sesión que se pone rojo al pasar el mouse */}
                    <button onClick={() => console.log('Cerrando sesión...')} className="p-1">
                        <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                    </button>
                </div>
            </div>
        </aside>
    );
};