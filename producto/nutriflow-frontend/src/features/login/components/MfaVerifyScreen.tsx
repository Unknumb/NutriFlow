import React, { useState, useEffect } from 'react';
import { Shield, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../../../shared/utils/supabase';
import { useRouter } from '@tanstack/react-router';
import { AuthLayout, authErrorClass } from './AuthLayout';

export const MfaVerifyScreen: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.find((f) => f.status === 'verified');
      if (totp) setFactorId(totp.id);
    });
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    setError(null);
    setIsVerifying(true);

    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError || !challenge) {
        setError('No se pudo iniciar el desafío de verificación.');
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) {
        setError('Código incorrecto. Verifica tu app autenticadora e intenta de nuevo.');
        setCode('');
        return;
      }

      router.navigate({ to: '/dashboard' });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <AuthLayout title="Verificación en dos pasos" subtitle="Ingresa el código de tu app autenticadora">
      {error && <div className={authErrorClass}>{error}</div>}

      <form onSubmit={handleVerify} className="space-y-6 flex flex-col">
        <div className="flex flex-col gap-1.5">
          <label
            className="text-xs font-semibold tracking-wide text-ink-soft uppercase"
            htmlFor="mfa-code"
          >
            Código de verificación
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-soft/60" />
            <input
              id="mfa-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
              disabled={isVerifying || !factorId}
              autoFocus
              className="w-full bg-white border border-mist rounded-md px-3 py-2.5 pl-11 text-[15px] text-ink placeholder:text-ink-soft/50 outline-none transition-colors duration-150 focus:border-pine-soft focus:ring-1 focus:ring-pine-soft disabled:opacity-50 tracking-[0.3em] text-center"
            />
          </div>
          <p className="text-xs text-ink-soft/70">
            Código de 6 dígitos de Google Authenticator u otra app TOTP.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isVerifying || !factorId || code.length !== 6}
            className="w-full bg-pine text-porcelain font-medium text-[15px] py-3 rounded-md hover:bg-pine-soft transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                Verificar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};
