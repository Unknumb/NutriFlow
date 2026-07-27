import { Link } from '@tanstack/react-router';
import { Check } from 'lucide-react';

/**
 * Stepper del flujo de planificación. Codifica el orden correcto:
 * 1) Macronutrientes → 2) Armador de Pautas → 3) Distribución de Porciones.
 * No bloquea la navegación (sigue siendo libre por el sidebar), pero deja
 * explícito que el armado va ANTES que la distribución de porciones.
 */
const STEPS = [
    { n: 1, label: 'Macronutrientes', to: '/macronutrientes' },
    { n: 2, label: 'Armador de Pautas', to: '/pautas' },
    { n: 3, label: 'Distribución de Porciones', to: '/porciones' },
] as const;

export const FlowStepper = ({ current }: { current: 1 | 2 | 3 }) => {
    return (
        <nav aria-label="Flujo de planificación" className="mb-4 sm:mb-5">
            <ol className="flex items-center gap-0.5 sm:gap-1 rounded-card border border-mist bg-white px-2 sm:px-3 py-2 shadow-sm overflow-x-auto">
                {STEPS.map((step, i) => {
                    const estado = step.n < current ? 'done' : step.n === current ? 'active' : 'todo';
                    return (
                        <li key={step.n} className="flex items-center shrink-0">
                            <Link
                                to={step.to}
                                className={`group inline-flex items-center gap-1.5 sm:gap-2 rounded-lg px-2 sm:px-3 py-1.5 text-xs font-medium transition-colors ${
                                    estado === 'active'
                                        ? 'bg-pine text-porcelain'
                                        : 'text-ink-soft hover:bg-porcelain'
                                }`}
                            >
                                <span
                                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                                        estado === 'active'
                                            ? 'bg-porcelain text-pine'
                                            : estado === 'done'
                                                ? 'bg-pine-soft text-porcelain'
                                                : 'bg-mist text-ink-soft'
                                    }`}
                                >
                                    {estado === 'done' ? <Check className="h-3 w-3" /> : step.n}
                                </span>
                                <span className="hidden sm:inline whitespace-nowrap">{step.label}</span>
                            </Link>
                            {i < STEPS.length - 1 && (
                                <span className="mx-0.5 sm:mx-1 h-px w-3 sm:w-8 bg-mist" aria-hidden="true" />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};
