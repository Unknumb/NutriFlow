// src/app/layouts/DashboardLayout.tsx
import { Outlet } from '@tanstack/react-router';
import { Sidebar } from '@/shared/ui/organisms/Sidebar';

export const DashboardLayout = () => {
    return (
        <div className="flex">
            <Sidebar /> {/* El Sidebar solo vive aquí */}
            <main className="flex-1">
                <Outlet /> {/* Aquí se renderizarán tus páginas (Pacientes, Pautas, etc.) */}
            </main>
        </div>
    );
};