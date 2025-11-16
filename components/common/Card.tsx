import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className, actions }) => {
  return (
    <div className={`bg-slate-800/50 backdrop-blur-lg border border-slate-700 text-slate-200 rounded-xl p-6 shadow-lg ${className || ''}`}>
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
        <h2 className="text-xl font-bold text-teal-400">
          {title}
        </h2>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div className="text-slate-300">
        {children}
      </div>
    </div>
  );
};