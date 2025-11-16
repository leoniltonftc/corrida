import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className, actions }) => {
  return (
    <div className={`bg-white/95 text-gray-800 rounded-xl p-6 shadow-lg ${className || ''}`}>
      <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-blue-200">
        <h2 className="text-xl font-bold text-blue-900">
          {title}
        </h2>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div className="text-gray-900">
        {children}
      </div>
    </div>
  );
};
