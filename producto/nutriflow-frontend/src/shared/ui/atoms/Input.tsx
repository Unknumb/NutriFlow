import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input = ({ label, id, ...props }: InputProps) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-ink-soft mb-1.5">
            {label}
        </label>
        <input
            id={id}
            className="flex h-9 w-full rounded-md border border-mist bg-white px-3 py-1 text-sm text-ink placeholder:text-ink-soft/50 outline-none transition-colors duration-150 focus:border-pine-soft focus:ring-1 focus:ring-pine-soft disabled:opacity-50"
            {...props}
        />
    </div>
);