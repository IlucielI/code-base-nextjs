'use client';

import React from 'react';
import { Breadcrumb } from '@/components/molecules/breadcrumb';
import { StatusPill } from '@/components/molecules/status-pill';
import { UserChip } from '@/components/molecules/user-chip';

export interface TopbarProps {
  breadcrumbTitle?: string;
  breadcrumbRoot?: string;
  statusText?: string;
  userName?: string;
  userRole?: string;
  userInitials?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  breadcrumbTitle = 'System Dashboard',
  breadcrumbRoot = 'Portal',
  statusText = 'Online',
  userName = 'Developer',
  userRole = 'Admin',
  userInitials = 'DV',
  actions,
  className = '',
}) => {
  return (
    <header
      className={`h-[68px] bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30 ${className}`}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center">
        <Breadcrumb root={breadcrumbRoot} current={breadcrumbTitle} />
      </div>

      {/* Right: Controls & Profile */}
      <div className="flex items-center gap-3.5">
        <StatusPill label={statusText} status="online" />

        {actions}

        <div className="pl-2 border-l border-slate-200">
          <UserChip name={userName} role={userRole} initials={userInitials} />
        </div>
      </div>
    </header>
  );
};
