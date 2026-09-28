import React from 'react';

export interface UserChipProps {
  name?: string;
  role?: string;
  initials?: string;
  className?: string;
}

export const UserChip: React.FC<UserChipProps> = ({
  name = 'Developer',
  role = 'Administrator',
  initials = 'DV',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-200">
        {initials}
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-bold text-slate-900 leading-tight">{name}</span>
        <span className="text-[10px] font-medium text-slate-500 leading-tight">{role}</span>
      </div>
    </div>
  );
};
