import { create } from 'zustand';

export type ToastType = 'error' | 'success' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  notify: (type: ToastType, message: string) => void;
  dismiss: (id: number) => void;
}

let seq = 0;
const AUTO_DISMISS_MS = 5000;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  notify: (type, message) => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, AUTO_DISMISS_MS);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/**
 * Helper para disparar notificaciones desde fuera de React (p.ej. el
 * interceptor de Axios), sin necesidad de un hook.
 */
export const notify = (type: ToastType, message: string) =>
  useToastStore.getState().notify(type, message);
