import React, { ReactNode } from 'react';

export type CalloutVariant = 'info' | 'warning' | 'success' | 'danger';

export interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export const Callout: React.FC<CalloutProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  className = '',
}) => {
  const variantConfig = {
    info: {
      bg: 'bg-blue-50/70 border-blue-200 text-blue-900',
      iconColor: 'text-blue-600',
      defaultIcon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-amber-50/70 border-amber-200 text-amber-900',
      iconColor: 'text-amber-600',
      defaultIcon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    success: {
      bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      iconColor: 'text-emerald-600',
      defaultIcon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    danger: {
      bg: 'bg-rose-50/70 border-rose-200 text-rose-900',
      iconColor: 'text-rose-600',
      defaultIcon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const current = variantConfig[variant];

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${current.bg} ${className}`}>
      <span className={`shrink-0 mt-0.5 ${current.iconColor}`}>
        {icon || current.defaultIcon}
      </span>
      <div className="space-y-0.5 flex-1">
        {title && <h5 className="font-bold text-sm">{title}</h5>}
        <div className="text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  );
};
