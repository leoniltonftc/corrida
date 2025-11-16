import React from 'react';
import { LoadingSpinner } from '../Icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  isLoading?: boolean;
}

export const Input: React.FC<InputProps> = ({ label, id, isLoading = false, ...props }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={`w-full p-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${isLoading ? 'pr-10' : ''}`}
          {...props}
        />
        {isLoading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <LoadingSpinner color="text-teal-400" />
            </div>
        )}
      </div>
    </div>
  );
};