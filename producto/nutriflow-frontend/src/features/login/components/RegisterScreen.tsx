import React, { useState, useEffect } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, MailCheck, User } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "../../../shared/hooks/useAuth";
import { useAuthStore } from "../../../shared/store/useAuthStore";
import { AuthLayout, authInputClass, authLabelClass, authButtonClass, authErrorClass, authLinkClass } from "./AuthLayout";

export const RegisterScreen: React.FC = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Si ya está autenticado (o el registro creó sesión directa), ir al dashboard
  useEffect(() => {
    if (isAuthenticated && !registered) {
      router.navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, registered, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim() || !apellido.trim()) {
      setError("El nombre y el apellido son obligatorios.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    const result = await signUp({ email, password, nombre, apellido });
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.needsEmailConfirmation) {
      setRegistered(true);
    } else {
      // Confirmación deshabilitada en Supabase: la sesión ya está activa
      router.navigate({ to: "/dashboard" });
    }
  };

  if (registered) {
    return (
      <AuthLayout title="Revisa tu correo" subtitle="Te enviamos un enlace de confirmación">
        <div className="flex flex-col items-center gap-6 text-center">
          <MailCheck className="w-14 h-14 text-pine-soft" />
          <p className="text-sm text-ink-soft">
            Enviamos un correo de confirmación a{" "}
            <span className="font-semibold text-ink">{email}</span>. Haz clic en el enlace
            del correo para activar tu cuenta y luego inicia sesión.
          </p>
          <Link
            to="/login"
            className={authButtonClass}
          >
            Ir a Iniciar Sesión
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Crear Cuenta" subtitle="Regístrate para acceder a tu panel clínico">
      {error && (
        <div className={authErrorClass}>
          {error}
        </div>
      )}

      <form className="space-y-6 flex flex-col" onSubmit={handleSubmit}>
        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className={authLabelClass} htmlFor="nombre">
              Nombre
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/60" />
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Javiera"
                required
                maxLength={60}
                disabled={isSubmitting}
                className={authInputClass}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={authLabelClass} htmlFor="apellido">
              Apellido
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/60" />
              <input
                id="apellido"
                name="apellido"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Pérez"
                required
                maxLength={60}
                disabled={isSubmitting}
                className={authInputClass}
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className={authLabelClass} htmlFor="email">
            Correo Electrónico
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
              disabled={isSubmitting}
              className={authInputClass}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className={authLabelClass} htmlFor="password">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/60" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
              minLength={8}
              disabled={isSubmitting}
              className={authInputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink transition-colors duration-150"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirmar password */}
        <div className="flex flex-col gap-1.5">
          <label className={authLabelClass} htmlFor="confirmPassword">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/60" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
              minLength={8}
              disabled={isSubmitting}
              className={authInputClass}
            />
          </div>
        </div>

        <div className="pt-2 mt-2 flex flex-col gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={authButtonClass}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              <>
                Crear Cuenta
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-ink-soft mt-2">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className={authLinkClass}>
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
