import { RouterProvider, createRouter, createRoute, createRootRoute, lazyRouteComponent, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '../shared/store/useAuthStore';

// 1. IMPORTACIONES
import { DashboardLayout } from '../shared/ui/organisms/DashboardLayout';
import { ErrorBoundary } from '../shared/ui/organisms/ErrorBoundary';
import { Toaster } from '../shared/ui/molecules/Toaster';

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

// 4. RUTAS PÚBLICAS DE AUTENTICACIÓN (Acceso libre)
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: lazyRouteComponent(() => import('../pages/login/index'), 'LoginPage'),
});

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/register',
    component: lazyRouteComponent(() => import('../pages/register/index'), 'RegisterPage'),
});

const forgotPasswordRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/forgot-password',
    component: lazyRouteComponent(() => import('../pages/forgot-password/index'), 'ForgotPasswordPage'),
});

// El usuario llega aquí desde el enlace del correo de recuperación de Supabase
const resetPasswordRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/reset-password',
    component: lazyRouteComponent(() => import('../pages/reset-password/index'), 'ResetPasswordPage'),
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

const alimentosRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/alimentos',
    component: lazyRouteComponent(() => import('../pages/alimentos/index'), 'AlimentosPage'),
});

const pacientesRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/pacientes',
    component: lazyRouteComponent(() => import('../pages/pacientes/index'), 'PacientesPage'),
});

const perfilRoute = createRoute({
    getParentRoute: () => protectedLayout,
    path: '/perfil',
    component: lazyRouteComponent(() => import('../pages/perfil/index'), 'PerfilPage'),
});

// 6. ENSAMBLADO DEL ÁRBOL
const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
    protectedLayout.addChildren([
        dashboardRoute, 
        macronutrientesRoute, 
        pautasRoute,
        porcionesRoute,
        bibliotecaRoute,
        generadorRoute,
        alimentosRoute,
        pacientesRoute,
        perfilRoute
    ])
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

export default function App() {
    return (
        <ErrorBoundary>
            <RouterProvider router={router} />
            <Toaster />
        </ErrorBoundary>
    );
}