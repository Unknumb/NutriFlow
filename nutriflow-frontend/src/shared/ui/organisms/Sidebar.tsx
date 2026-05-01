import { Link } from 'react-router-dom';
import { Calculator, PieChart, User, FileText } from 'lucide-react';

export const Sidebar = () => {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-semibold text-black-900">NutriFlow</h1>
                <p className="text-sm text-black-500">Sistema Clínico</p>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                <ul className="space-y-1">
                    <li>
                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors bg-teal-50 text-teal-700">
                            <Calculator className="w-5 h-5" />
                            <span className="text-sm font-medium">Dashboard Clínico</span>
                        </Link>
                    </li>
                    {/* Puedes agregar los demás Links aquí luego */}
                    <li>
                        <Link to="/macronutrientes" className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                            <PieChart className="w-5 h-5" />
                            <span className="text-sm font-medium">Macronutrientes Interactivo</span>
                        </Link>
                    </li>
                    <li>
                        {/* 3. Nuevo Link para la nueva página */}
                        <Link to="/pautas" className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-teal-50 hover:text-teal-700">
                            <FileText className="w-5 h-5" />
                            <span className="text-sm font-medium">Armador de Pautas</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 cursor-pointer">
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