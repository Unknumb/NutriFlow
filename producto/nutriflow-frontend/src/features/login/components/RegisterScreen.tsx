import React, { useState, useEffect } from "react";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "../../../shared/hooks/useAuth";
import { useAuthStore } from "../../../shared/store/useAuthStore";
import { AuthLayout } from "./AuthLayout";

const inputClass =
  "w-full bg-white/50 backdrop-blur-sm border-b-2 border-transparent focus:border-[#7dd3fc] focus:bg-white focus:ring-0 rounded-t-lg px-3 py-2.5 pl-11 pr-11 text-base text-[#0b1c30] placeholder-[#bec8ce] transition-all duration-300 outline-none shadow-inner disabled:opacity-50";

const labelClass = "text-xs font-semibold tracking-wide text-[#3f484e] ml-1 uppercase";

export const RegisterScreen: React.FC = () => {
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

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    const result = await signUp({ email, password });
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
          <MailCheck className="w-14 h-14 text-[#7dd3fc]" />
          <p className="text-sm text-[#3f484e]">
            Enviamos un correo de confirmación a{" "}
            <span className="font-semibold text-[#0b1c30]">{email}</span>. Haz clic en el enlace
            del correo para activar tu cuenta y luego inicia sesión.
          </p>
          <Link
            to="/login"
            className="w-full bg-[#7dd3fc] text-white font-medium text-[15px] py-3 rounded-xl hover:bg-[#6ecaf4] hover:shadow-[0_0_20px_rgba(125,211,252,0.4)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
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
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-in fade-in duration-300">
          {error}
        </div>
      )}

      <form className="space-y-6 flex flex-col" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <label className={labelClass} htmlFor="email">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              required
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <label className={labelClass} htmlFor="password">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
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
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6f787e] hover:text-black transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Confirmar password */}
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <label className={labelClass} htmlFor="confirmPassword">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
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
              className={inputClass}
            />
          </div>
        </div>

        <div className="pt-2 mt-2 flex flex-col gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#7dd3fc] text-white font-medium text-[15px] py-3 rounded-xl hover:bg-[#6ecaf4] hover:shadow-[0_0_20px_rgba(125,211,252,0.4)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
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

          <p className="text-center text-sm text-[#3f484e] mt-2">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="text-[#006686] font-medium hover:underline">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
