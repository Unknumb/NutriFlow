import { Link } from '@tanstack/react-router';
import { Calculator, PieChart, User, FileText, Grid3x3 } from 'lucide-react'; // 🚨 Importamos el nuevo icono

// 1. Catálogo centralizado de rutas (Clean Code)
const MENU_ITEMS = [
    { path: '/dashboard', label: 'Dashboard Clínico', icon: Calculator },
    { path: '/macronutrientes', label: 'Macronutrientes Interactivo', icon: PieChart },
    { path: '/pautas', label: 'Armador de Pautas', icon: FileText },
    // 🚨 Agregamos tu nueva pantalla aquí:
    { path: '/porciones', label: 'Distribución de Porciones', icon: Grid3x3 } 
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
                    {/* 2. Dibujamos los botones dinámicamente con su estado Activo/Inactivo */}
                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <Link 
                                    to={item.path} 
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                                    // Estado inactivo: Gris sutil cuando estás en otra pantalla
                                    inactiveProps={{
                                        className: 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                                    }}
                                    // Estado activo: Fondo verde cuando es la pantalla actual
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
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <User className="w-5 h-5 text-gray-700" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Dra. Javiera Silva</p>
                        <p className="text-xs text-gray-500">Nutricionista</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};