import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, lazyRouteComponent } from '@tanstack/react-router';

// 1. LAZY LOADING: Importamos solo la estructura base, no las vistas pesadas.
// (Asumimos que tienes un archivo auth.ts que revisa si el usuario está logueado)
import { isAuthenticated } from '../shared/utils/auth'; 
import { DashboardLayout } from '../shared/ui/organisms/DashboardLayout';

const rootRoute = createRootRoute({
    component: DashboardLayout,
});

// 2. ROUTE GUARD: Protegemos todas las rutas internas de un plumazo
const protectedLayout = createRoute({
    getParentRoute: () => rootRoute,
    id: 'protected',
    beforeLoad: async () => {
        // Si no hay sesión, lo pateamos al login instantáneamente a nivel de red
        if (!isAuthenticated()) {
            throw redirect({ to: '/login' });
        }
    },
});

const dashboardRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/dashboard',
    // LAZY LOADING en acción: solo descarga este JS si entra aquí
    component: lazyRouteComponent(() => import('../pages/dashboard/index'), 'DashboardPage'),
    // 3. LOADER: Pre-cargamos los pacientes ANTES de renderizar la vista
    loader: async () => {
        return fetch('/api/resumen-dashboard').then(res => res.json());
    }
});

const pautasRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/pautas',
    component: lazyRouteComponent(() => import('../pages/pautas'), 'PautasPage'),
});

// Ensamblaje modular
const routeTree = rootRoute.addChildren([
    protectedLayout.addChildren([
        dashboardRoute, 
        pautasRoute
    ])
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

export default function App() {
    return <RouterProvider router={router} />;
}