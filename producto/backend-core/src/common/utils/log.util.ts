/**
 * Sanea un valor controlado por el usuario antes de interpolarlo en un log
 * (OWASP A05 — Log Injection). Elimina saltos de línea (CR/LF) para que un
 * atacante no pueda falsificar entradas de log inyectando líneas nuevas.
 */
export function sanitizeForLog(value: string | undefined | null): string {
  if (value == null) return '';
  return value.replace(/[\r\n]+/g, ' ');
}
