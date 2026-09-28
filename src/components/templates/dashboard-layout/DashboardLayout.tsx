import React from 'react';
import { Sidebar, SidebarProps } from '@/components/organisms/sidebar';
import { Topbar, TopbarProps } from '@/components/organisms/topbar';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarProps?: SidebarProps;
  topbarProps?: TopbarProps;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarProps,
  topbarProps,
}) => {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <Sidebar {...sidebarProps} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar {...topbarProps} />
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
