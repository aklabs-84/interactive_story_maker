import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => {
    return twMerge(clsx(inputs));
};

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
        primary: 'bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 dark:shadow-cyan-500/20',
        secondary: 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white',
        outline: 'bg-transparent border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white',
        ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
        danger: 'bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30',
        success: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-bold',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
});

export const Card = ({ className, variant = 'default', children, ...props }) => {
    const variants = {
        default: 'bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-none backdrop-blur-sm',
        soft: 'bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5',
        glass: 'bg-white/70 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-md shadow-lg dark:shadow-none',
    };

    return (
        <div
            className={cn('rounded-2xl p-6', variants[variant], className)}
            {...props}
        >
            {children}
        </div>
    );
};

export const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={cn(
                    'w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:focus:ring-cyan-500/50 focus:border-cyan-500 dark:focus:border-cyan-500/50 transition-all',
                    error && 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1 ml-1">{error}</p>}
        </div>
    );
});

export const Textarea = React.forwardRef(({ className, label, error, ...props }, ref) => {
    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-1">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                className={cn(
                    'w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:focus:ring-cyan-500/50 focus:border-cyan-500 dark:focus:border-cyan-500/50 transition-all resize-none',
                    error && 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50',
                    className
                )}
                {...props}
            />
            {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1 ml-1">{error}</p>}
        </div>
    );
});
