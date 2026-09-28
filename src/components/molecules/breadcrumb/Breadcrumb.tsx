import React from 'react';

export interface BreadcrumbProps {
  root?: string;
  current: string;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  root = 'App',
  current,
  className = '',
}) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-xs ${className}`}>
      <span className="font-medium text-slate-500">{root}</span>
      <span className="text-slate-300">/</span>
      <span className="font-bold text-slate-900">{current}</span>
    </nav>
  );
};
