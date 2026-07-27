import React, { useState, useEffect } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../../shared/hooks/useAuth";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuthStore } from "../../../shared/store/useAuthStore";
import { AuthLayout, authInputClass, authLabelClass, authButtonClass, authErrorClass, authLinkClass } from "./AuthLayout";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export const LoginScreen: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const { login, loginWithGoogle, isLoggingIn, loginError } = useAuth();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  const handleGoogle = async () => {
    setGoogleError(null);
    setIsGoogleLoading(true);
    const result = await loginWithGoogle();
    if (result.error) {
      setGoogleError(result.error);
      setIsGoogleLoading(false);
    }
    // Si no hay error, el navegador redirige a Google; no se llega a la línea siguiente
  };

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Accede a tu panel clínico">
      {(loginError || googleError) && (
        <div className={authErrorClass}>{loginError ?? googleError}</div>
      )}

      {/* OAuth */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isGoogleLoading || isLoggingIn}
          className="w-full flex items-center justify-center gap-3 border border-mist rounded-md py-3 px-4 text-sm font-medium text-ink bg-white hover:bg-mist/30 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-ink-soft" />
          ) : (
            <GoogleIcon />
          )}
          Continuar con Google
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-mist" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-porcelain px-2 text-ink-soft/60 tracking-wider">O con correo</span>
        </div>
      </div>

      <form className="space-y-6 flex flex-col" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className={authLabelClass} htmlFor="email">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/60" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              required
              disabled={isLoggingIn}
              className={authInputClass}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-baseline">
            <label className={authLabelClass} htmlFor="password">
              Contraseña
            </label>
            <Link to="/forgot-password" className="text-xs font-semibold text-pine-soft hover:underline inline-flex items-center min-h-11">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/60" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoggingIn}
              className={authInputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors duration-150 p-3"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-4">
          <button type="submit" disabled={isLoggingIn} className={authButtonClass}>
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Ingresando...
              </>
            ) : (
              <>
                Ingresar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-ink-soft mt-2">
            ¿No tienes una cuenta?{" "}
            <Link to="/register" className={authLinkClass}>
              Crear cuenta
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
