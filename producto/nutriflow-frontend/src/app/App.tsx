import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, lazyRouteComponent } from '@tanstack/react-router';

// 1. LAZY LOADING
import { isAuthenticated } from '../shared/utils/supabase'; 
import { DashboardLayout } from '../shared/ui/organisms/DashboardLayout';

const rootRoute = createRootRoute({
    component: DashboardLayout,
});

// 2. ROUTE GUARD
const protectedLayout = createRoute({
    getParentRoute: () => rootRoute,
    id: 'protected',
    beforeLoad: async () => {
        if (!isAuthenticated()) {
            // Como no tenemos /login todavía, lo mandamos a /dashboard
            throw redirect({ to: '/dashboard' }); 
        }
    },
});

const indexRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/',
    beforeLoad: () => {
        throw redirect({ to: '/dashboard' });
    },
});

const dashboardRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/dashboard',
    component: lazyRouteComponent(() => import('../pages/dashboard/index'), 'DashboardPage'),
    loader: async () => {
        return { message: "ok" }; 
    }
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

// 🚨 1. NUEVO: Creamos la ruta para la página de Porciones
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
    // Apunta al archivo index que actualizamos hace un momento
    component: lazyRouteComponent(() => import('../pages/pacientes/index'), 'PacientesPage'),
});

// 🚨 ÁRBOL DE RUTAS ENSAMBLADO
const routeTree = rootRoute.addChildren([
    protectedLayout.addChildren([
        indexRoute,
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