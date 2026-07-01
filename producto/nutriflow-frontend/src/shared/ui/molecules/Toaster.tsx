import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, type ToastType } from '../../store/useToastStore';

const ESTILOS: Record<ToastType, { icon: typeof Info; barra: string; texto: string }> = {
  error: { icon: AlertTriangle, barra: 'bg-clinical-red', texto: 'text-clinical-red' },
  success: { icon: CheckCircle2, barra: 'bg-pine', texto: 'text-pine' },
  info: { icon: Info, barra: 'bg-pine-soft', texto: 'text-pine-soft' },
};

/**
 * Contenedor global de notificaciones. Se monta una vez en la raíz de la app
 * y muestra los toasts del store (errores 5xx/red surgidos del apiClient,
 * confirmaciones de guardado, etc.). Accesible vía role="status"/aria-live.
 */
export const Toaster = () => {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const { icon: Icon, barra, texto } = ESTILOS[t.type];
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 bg-white border border-mist rounded-card shadow-card overflow-hidden animate-in slide-in-from-right-4 fade-in duration-200"
          >
            <span className={`w-1 self-stretch ${barra}`} aria-hidden="true" />
            <Icon className={`w-5 h-5 mt-3 shrink-0 ${texto}`} aria-hidden="true" />
            <p className="flex-1 py-3 text-sm text-ink pr-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar notificación"
              className="p-2 m-1 text-ink-soft/60 hover:text-ink-soft hover:bg-mist/60 rounded-md transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
};
