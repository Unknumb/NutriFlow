import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export const Input = ({ label, id, ...props }: InputProps) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
        </label>
        <input
            id={id}
            className="flex h-9 w-full rounded-md border border-gray-300 px-3 py-1 text-sm outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50"
            {...props}
        />
    </div>
);