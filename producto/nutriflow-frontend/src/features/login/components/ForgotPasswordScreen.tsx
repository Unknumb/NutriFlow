import React, { useState } from "react";
import { Mail, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../../shared/hooks/useAuth";
import { AuthLayout } from "./AuthLayout";

const inputClass =
  "w-full bg-white/50 backdrop-blur-sm border-b-2 border-transparent focus:border-[#7dd3fc] focus:bg-white focus:ring-0 rounded-t-lg px-3 py-2.5 pl-11 text-base text-[#0b1c30] placeholder-[#bec8ce] transition-all duration-300 outline-none shadow-inner disabled:opacity-50";

export const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await requestPasswordReset(email);
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout title="Revisa tu correo" subtitle="Te enviamos un enlace de recuperación">
        <div className="flex flex-col items-center gap-6 text-center">
          <MailCheck className="w-14 h-14 text-[#7dd3fc]" />
          <p className="text-sm text-[#3f484e]">
            Si existe una cuenta asociada a{" "}
            <span className="font-semibold text-[#0b1c30]">{email}</span>, recibirás un correo
            con un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.
          </p>
          <Link
            to="/login"
            className="w-full bg-[#7dd3fc] text-white font-medium text-[15px] py-3 rounded-xl hover:bg-[#6ecaf4] hover:shadow-[0_0_20px_rgba(125,211,252,0.4)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
          >
            Volver a Iniciar Sesión
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar Contraseña"
      subtitle="Ingresa tu correo y te enviaremos un enlace de recuperación"
    >
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-in fade-in duration-300">
          {error}
        </div>
      )}

      <form className="space-y-6 flex flex-col" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <label
            className="text-xs font-semibold tracking-wide text-[#3f484e] ml-1 uppercase"
            htmlFor="email"
          >
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

        <div className="pt-2 mt-2 flex flex-col gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#7dd3fc] text-white font-medium text-[15px] py-3 rounded-xl hover:bg-[#6ecaf4] hover:shadow-[0_0_20px_rgba(125,211,252,0.4)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                Enviar Enlace
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-[#3f484e] mt-2">
            ¿Recordaste tu contraseña?{" "}
            <Link to="/login" className="text-[#006686] font-medium hover:underline">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
