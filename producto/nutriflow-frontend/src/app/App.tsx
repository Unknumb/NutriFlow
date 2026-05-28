import { RouterProvider, createRouter, createRoute, createRootRoute, lazyRouteComponent, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../shared/store/useAuthStore';

// 1. IMPORTACIONES
import { DashboardLayout } from '../shared/ui/organisms/DashboardLayout';

// 2. ROOT NEUTRO
const rootRoute = createRootRoute({
    component: () => <Outlet />, 
});

// 3. LAYOUT PROTEGIDO (Requiere autenticación)
const protectedLayout = createRoute({
    getParentRoute: () => rootRoute,
    id: 'protected',
    component: DashboardLayout,
    beforeLoad: async () => {
        // Obtenemos la sesión actual en caso de que el store aún esté cargando
        const state = useAuthStore.getState();
        if (state.isLoading) {
            const { supabase } = await import('../shared/utils/supabase');
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                throw redirect({ to: '/login' });
            }
        } else if (!state.isAuthenticated) {
            throw redirect({ to: '/login' });
        }
    },
});

// 4. LOGIN (Acceso libre)
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: lazyRouteComponent(() => import('../pages/login/index'), 'LoginPage'),
});

// 5. RUTAS HIJAS DEL DASHBOARD
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
        throw redirect({ to: '/login' });
    },
});

const dashboardRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/dashboard',
    component: lazyRouteComponent(() => import('../pages/dashboard/index'), 'DashboardPage'),
});

const macronutrientesRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/macronutrientes',
    component: lazyRouteComponent(() => import('../pages/macronutrientes'), 'MacronutrientesPage'),
});

const pautasRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/pautas',
    component: lazyRouteComponent(() => import('../pages/pautas'), 'PautasPage'),
});

const porcionesRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/porciones',
    component: lazyRouteComponent(() => import('../pages/porciones'), 'PorcionesPage'),
});

const bibliotecaRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/biblioteca',
    component: lazyRouteComponent(() => import('../pages/biblioteca/index'), 'BibliotecaPage'),
});

const generadorRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/generador',
    component: lazyRouteComponent(() => import('../pages/generador/index'), 'GeneradorPage'),
});

const pacientesRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/pacientes',
    component: lazyRouteComponent(() => import('../pages/pacientes/index'), 'PacientesPage'),
});

// 6. ENSAMBLADO DEL ÁRBOL
const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute, 
    protectedLayout.addChildren([
        dashboardRoute, 
        macronutrientesRoute, 
        pautasRoute,
        porcionesRoute,
        bibliotecaRoute,
        generadorRoute,
        pacientesRoute
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