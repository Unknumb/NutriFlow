import React from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

/* Clases compartidas de las pantallas de autenticación (sistema "Consulta moderna", ver REDISENO.md) */
export const authInputClass =
  "w-full bg-white border border-mist rounded-md px-3 py-2.5 pl-11 pr-11 text-[15px] text-ink placeholder:text-ink-soft/50 outline-none transition-colors duration-150 focus:border-pine-soft focus:ring-1 focus:ring-pine-soft disabled:opacity-50";

export const authLabelClass = "text-xs font-semibold tracking-wide text-ink-soft uppercase";

export const authButtonClass =
  "w-full bg-pine text-porcelain font-medium text-[15px] py-3 rounded-md hover:bg-pine-soft transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed";

export const authErrorClass =
  "mb-6 p-3 bg-clinical-red/5 border border-clinical-red/30 rounded-md text-sm text-clinical-red";

export const authLinkClass = "text-pine-soft font-medium hover:underline inline-flex items-center min-h-11";

/**
 * Layout compartido para las pantallas de autenticación (login, registro,
 * recuperación): panel de marca en verde pino + formulario sobre porcelana.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen flex font-sans bg-porcelain text-ink">
      {/* Panel de marca */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] bg-pine text-porcelain p-12">
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-porcelain/50 mb-1">
            Consulta nutricional
          </p>
          <p className="font-display text-2xl font-semibold">NutriFlow</p>
        </div>

        <div>
          <h2 className="font-display text-[40px] leading-[1.15] font-semibold text-porcelain max-w-100">
            La consulta nutricional, ordenada.
          </h2>
          <p className="text-porcelain/60 mt-4 max-w-95">
            Fichas, cálculos y pautas de tus pacientes en un solo lugar.
          </p>
        </div>

        <p className="text-xs text-porcelain/40">
          Panel clínico para profesionales de la nutrición
        </p>
      </div>

      {/* Formulario */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 page-enter">
        <div className="w-full max-w-105">
          {/* Marca visible solo cuando el panel izquierdo está oculto */}
          <p className="lg:hidden font-display text-xl font-semibold text-pine mb-8">NutriFlow</p>

          <div className="mb-8">
            <h1 className="font-display text-[28px] font-semibold text-ink mb-1.5">{title}</h1>
            <p className="text-sm text-ink-soft">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};
