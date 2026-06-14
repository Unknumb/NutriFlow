import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white text-ink flex flex-col gap-6 rounded-card border border-mist shadow-card ${className}`}>
        {children}
    </div>
);

export const CardHeader = ({ title, icon: Icon }: { title: string, icon?: React.ElementType }) => (
    <div className="px-6 pt-6 border-b border-mist pb-4">
        <h4 className="leading-none flex items-center gap-2 font-display font-semibold text-ink text-[17px]">
            {Icon && <Icon className="w-5 h-5 text-pine-soft" />}
            {title}
        </h4>
    </div>
);

export const CardContent = ({ children }: { children: React.ReactNode }) => (
    <div className="px-6 pb-6">
        {children}
    </div>
);