import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 shadow-sm ${className}`}>
        {children}
    </div>
);

export const CardHeader = ({ title, icon: Icon }: { title: string, icon?: React.ElementType }) => (
    <div className="px-6 pt-6 border-b border-gray-100 pb-4">
        <h4 className="leading-none flex items-center gap-2 font-semibold text-gray-900">
            {Icon && <Icon className="w-5 h-5 text-gray-700" />}
            {title}
        </h4>
    </div>
);

export const CardContent = ({ children }: { children: React.ReactNode }) => (
    <div className="px-6 pb-6">
        {children}
    </div>
);