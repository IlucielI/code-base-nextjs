import React from 'react';

export interface StatusDotProps {
  status?: 'online' | 'busy' | 'offline' | 'warning';
  pulse?: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({ status = 'online', pulse = true }) => {
  const colorMap = {
    online: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-slate-400',
    warning: 'bg-rose-500',
  };

  return (
    <span className="relative flex h-2 w-2">
      {pulse && status === 'online' && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${colorMap[status]}`} />
    </span>
  );
};
