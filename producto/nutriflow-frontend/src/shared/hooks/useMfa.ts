import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';

interface TotpFactor {
  id: string;
  friendly_name?: string;
  status: 'verified' | 'unverified';
}

interface EnrollData {
  factorId: string;
  qrCode: string;
  secret: string;
}

export function useMfa() {
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [isLoadingFactors, setIsLoadingFactors] = useState(true);
  const [enrollData, setEnrollData] = useState<EnrollData | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUnenrolling, setIsUnenrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFactors = useCallback(async () => {
    setIsLoadingFactors(true);
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as TotpFactor[]);
    setIsLoadingFactors(false);
  }, []);

  useEffect(() => {
    loadFactors();
  }, [loadFactors]);

  const startEnroll = async () => {
    setError(null);
    setIsEnrolling(true);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    setIsEnrolling(false);
    if (enrollError || !data) {
      console.error('[MFA] enroll error:', enrollError);
      setError(
        enrollError?.message
          ? `No se pudo iniciar la configuración: ${enrollError.message}`
          : 'No se pudo iniciar la configuración. Intenta de nuevo.',
      );
      return;
    }
    setEnrollData({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
  };

  const verifyEnrollment = async (code: string): Promise<boolean> => {
    if (!enrollData) return false;
    setError(null);
    setIsVerifying(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollData.factorId,
      });
      if (challengeError || !challenge) {
        setError('Error al iniciar la verificación.');
        return false;
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollData.factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) {
        setError('Código incorrecto. Intenta de nuevo.');
        return false;
      }
      setEnrollData(null);
      await loadFactors();
      return true;
    } finally {
      setIsVerifying(false);
    }
  };

  const cancelEnroll = async () => {
    if (!enrollData) return;
    await supabase.auth.mfa.unenroll({ factorId: enrollData.factorId });
    setEnrollData(null);
    setError(null);
  };

  const unenroll = async (factorId: string) => {
    setError(null);
    setIsUnenrolling(true);
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    setIsUnenrolling(false);
    if (unenrollError) {
      setError('No se pudo desactivar la verificación en dos pasos. Intenta de nuevo.');
      return;
    }
    await loadFactors();
  };

  const verifiedFactor = factors.find((f) => f.status === 'verified') ?? null;

  return {
    factors,
    verifiedFactor,
    isLoadingFactors,
    enrollData,
    isEnrolling,
    isVerifying,
    isUnenrolling,
    error,
    startEnroll,
    verifyEnrollment,
    cancelEnroll,
    unenroll,
  };
}
