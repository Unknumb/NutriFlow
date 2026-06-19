// src/app/layouts/DashboardLayout.tsx
import { Outlet } from '@tanstack/react-router';
import { Sidebar } from '@/shared/ui/organisms/Sidebar';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export const DashboardLayout = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {isMobileOpen && (
                <div className="fixed inset-0 bg-ink/50 z-40 md:hidden transition-opacity" onClick={() => setIsMobileOpen(false)} />
            )}

            <Sidebar
                isOpenMobile={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
                isCollapsed={isDesktopCollapsed}
                onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
                    <h1 className="font-display font-semibold text-pine text-lg">NutriFlow</h1>
                    <button onClick={() => setIsMobileOpen(true)} className="p-2 text-pine hover:bg-gray-100 rounded-md">
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
