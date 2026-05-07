import { Sidebar } from './Sidebar';
import { Outlet } from '@tanstack/react-router'; // <-- Importa Outlet

// Ya no pedimos 'children'
export const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <Sidebar />
            <main className="flex-1 overflow-auto">
                {/* Aquí TanStack inyectará la página dinámica (Dashboard, Pautas, etc) */}
                <Outlet /> 
            </main>
        </div>
    );
};