import React, { useState } from "react";
import { Mail, ArrowRight, Loader2, MailCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../../shared/hooks/useAuth";
import { AuthLayout, authInputClass, authButtonClass, authErrorClass, authLinkClass } from "./AuthLayout";

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
          <MailCheck className="w-14 h-14 text-pine-soft" />
          <p className="text-sm text-ink-soft">
            Si existe una cuenta asociada a{" "}
            <span className="font-semibold text-ink">{email}</span>, recibirás un correo
            con un enlace para restablecer tu contraseña. Revisa también tu carpeta de spam.
          </p>
          <Link
            to="/login"
            className={authButtonClass}
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
        <div className={authErrorClass}>
          {error}
        </div>
      )}

      <form className="space-y-6 flex flex-col" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold tracking-wide text-ink-soft ml-1 uppercase"
            htmlFor="email"
          >
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

        <div className="pt-2 mt-2 flex flex-col gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={authButtonClass}
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

          <p className="text-center text-sm text-ink-soft mt-2">
            ¿Recordaste tu contraseña?{" "}
            <Link to="/login" className={authLinkClass}>
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};
