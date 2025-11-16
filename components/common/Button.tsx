import React from 'react';
import { LoadingSpinner } from '../Icons';

type ButtonVariant = 'primary' | 'success' | 'warning' | 'danger' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-teal-600 hover:bg-teal-500 text-white focus:ring-teal-400 hover:shadow-[0_0_15px_theme(colors.teal.500/0.6)]",
  success: "bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-400 hover:shadow-[0_0_15px_theme(colors.emerald.500/0.6)]",
  warning: "bg-amber-500 hover:bg-amber-400 text-white focus:ring-amber-300",
  danger: "bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-400",
  secondary: "bg-slate-600 hover:bg-slate-500 text-white focus:ring-slate-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <LoadingSpinner />}
      <span className={isLoading ? 'ml-2' : ''}>{children}</span>
    </button>
  );
};