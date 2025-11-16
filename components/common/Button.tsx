
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

const baseClasses = "inline-flex items-center justify-center font-semibold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
  success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
  warning: "bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-400",
  danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
  secondary: "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500",
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
   