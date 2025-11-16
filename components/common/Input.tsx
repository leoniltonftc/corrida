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
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className={`w-full p-3 bg-gray-100 border-2 border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${isLoading ? 'pr-10' : ''}`}
          {...props}
        />
        {isLoading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <LoadingSpinner color="text-blue-500" />
            </div>
        )}
      </div>
    </div>
  );
};
