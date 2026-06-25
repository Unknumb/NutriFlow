import React from 'react';

interface PageHeaderProps {
    /** Sección a la que pertenece la página (ej: "Clínica", "Planificación") */
    eyebrow?: string;
    title: string;
    description?: string;
    /** Acción primaria u otros controles alineados a la derecha */
    actions?: React.ReactNode;
}

/**
 * Cabecera de página unificada del sistema de diseño (ver REDISENO.md):
 * eyebrow + título display + acción a la derecha.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, description, actions }) => (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
        <div>
            {eyebrow && (
                <p className="text-[11px] uppercase tracking-[0.14em] text-pine-soft font-medium mb-1">
                    {eyebrow}
                </p>
            )}
            <h1 className="font-display text-[28px] font-semibold text-ink leading-tight">{title}</h1>
            {description && <p className="text-ink-soft mt-1">{description}</p>}
        </div>
        {actions && <div className="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto sm:shrink-0">{actions}</div>}
    </div>
);
