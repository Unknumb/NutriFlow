import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
}

const VARIANTES: Record<Variant, string> = {
    primary: 'bg-pine text-porcelain hover:bg-pine-soft',
    secondary: 'bg-white text-ink border border-mist hover:border-pine-soft hover:text-pine-soft',
    ghost: 'bg-transparent text-ink-soft hover:bg-mist/60 hover:text-ink',
    danger: 'bg-clinical-red text-white hover:bg-clinical-red/90',
};

/**
 * Botón del sistema de diseño (ver REDISENO.md). Una sola forma, cuatro variantes;
 * la acción primaria de cada pantalla usa `primary`, todo lo demás queda quieto.
 */
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => (
    <button
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTES[variant]} ${className}`}
        {...props}
    >
        {children}
    </button>
);
