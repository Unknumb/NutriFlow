import React, { useState, useEffect } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../../shared/hooks/useAuth";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuthStore } from "../../../shared/store/useAuthStore";
import { AuthLayout, authInputClass, authLabelClass, authButtonClass, authErrorClass, authLinkClass } from "./AuthLayout";

export const LoginScreen: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoggingIn, loginError } = useAuth();
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
    // La redirección ocurre automáticamente vía el useEffect de isAuthenticated
  };

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Accede a tu panel clínico">
      {loginError && <div className={authErrorClass}>{loginError}</div>}

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
            <Link to="/forgot-password" className="text-xs font-semibold text-pine-soft hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/60" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors duration-150"
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
