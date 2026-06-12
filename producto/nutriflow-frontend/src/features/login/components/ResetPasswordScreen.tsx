import React, { useState } from "react";
import { Lock, ArrowRight, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "../../../shared/hooks/useAuth";
import { useAuthStore } from "../../../shared/store/useAuthStore";
import { AuthLayout } from "./AuthLayout";

const inputClass =
  "w-full bg-white/50 backdrop-blur-sm border-b-2 border-transparent focus:border-[#7dd3fc] focus:bg-white focus:ring-0 rounded-t-lg px-3 py-2.5 pl-11 pr-11 text-base text-[#0b1c30] placeholder-[#bec8ce] transition-all duration-300 outline-none shadow-inner disabled:opacity-50";

const labelClass = "text-xs font-semibold tracking-wide text-[#3f484e] ml-1 uppercase";

/**
 * Pantalla a la que llega el usuario desde el enlace del correo de recuperación.
 * Supabase procesa el token del enlace automáticamente (detectSessionInUrl)
 * y crea una sesión de recuperación; con ella podemos llamar a updateUser.
 */
export const ResetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { updatePassword } = useAuth();
  const router = useRouter();
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

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
    const result = await updatePassword(password);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setDone(true);
  };

  // Esperando a que Supabase procese el token del enlace de recuperación
  if (isAuthLoading) {
    return (
      <AuthLayout title="Restablecer Contraseña" subtitle="Verificando enlace de recuperación...">
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#7dd3fc]" />
        </div>
      </AuthLayout>
    );
  }

  // Sin sesión de recuperación: enlace inválido o expirado
  if (!isAuthenticated && !done) {
    return (
      <AuthLayout title="Enlace Inválido" subtitle="No pudimos verificar tu enlace de recuperación">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm text-[#3f484e]">
            El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo para
            restablecer tu contraseña.
          </p>
          <Link
            to="/forgot-password"
            className="w-full bg-[#7dd3fc] text-white font-medium text-[15px] py-3 rounded-xl hover:bg-[#6ecaf4] hover:shadow-[0_0_20px_rgba(125,211,252,0.4)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
          >
            Solicitar Nuevo Enlace
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout title="Contraseña Actualizada" subtitle="Tu contraseña fue restablecida con éxito">
        <div className="flex flex-col items-center gap-6 text-center">
          <CheckCircle2 className="w-14 h-14 text-[#7dd3fc]" />
          <p className="text-sm text-[#3f484e]">
            Ya puedes usar tu nueva contraseña. Te llevaremos a tu panel clínico.
          </p>
          <button
            type="button"
            onClick={() => router.navigate({ to: "/dashboard" })}
            className="w-full bg-[#7dd3fc] text-white font-medium text-[15px] py-3 rounded-xl hover:bg-[#6ecaf4] hover:shadow-[0_0_20px_rgba(125,211,252,0.4)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
          >
            Ir al Panel
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Restablecer Contraseña" subtitle="Define tu nueva contraseña">
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-in fade-in duration-300">
          {error}
        </div>
      )}

      <form className="space-y-6 flex flex-col" onSubmit={handleSubmit}>
        {/* Nueva contraseña */}
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <label className={labelClass} htmlFor="password">
            Nueva Contraseña
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

        {/* Confirmar contraseña */}
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
              placeholder="Repite tu nueva contraseña"
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
                Guardando...
              </>
            ) : (
              <>
                Guardar Contraseña
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
