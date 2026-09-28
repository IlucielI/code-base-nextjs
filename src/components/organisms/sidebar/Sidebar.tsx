'use client';

import React from 'react';
import Link from 'next/link';

export interface SidebarNavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string | number;
  active?: boolean;
}

export interface SidebarProps {
  brandName?: string;
  brandSubtitle?: string;
  brandInitials?: string;
  items?: SidebarNavItem[];
  currentPath?: string;
  userName?: string;
  userRole?: string;
  userInitials?: string;
  systemStatusText?: string;
  className?: string;
}

const defaultSidebarItems: SidebarNavItem[] = [
  { label: 'Overview', href: '/', icon: '📊', active: true },
  { label: 'Design System', href: '#components', icon: '🎨' },
  { label: 'Architecture', href: '#architecture', icon: '⚙️' },
  { label: 'System Health', href: '/health', icon: '🩺', badge: 'Live' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  brandName = 'NextBase Admin',
  brandSubtitle = 'Core Backoffice',
  brandInitials = 'NB',
  items = defaultSidebarItems,
  currentPath = '/',
  userName = 'Developer',
  userRole = 'Lead Engineer',
  userInitials = 'DE',
  systemStatusText = 'Core API • Online',
  className = '',
}) => {
  return (
    <aside
      className={`w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none ${className}`}
    >
      {/* Top Section */}
      <div className="p-5 flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-sm tracking-tight text-white shadow-lg shadow-blue-500/20">
            {brandInitials}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-white tracking-tight">{brandName}</span>
            <span className="text-[11px] text-slate-400 font-medium">{brandSubtitle}</span>
          </div>
        </div>

        {/* Telemetry Badge */}
        {systemStatusText && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]">
            <span className="flex items-center gap-2 text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {systemStatusText}
            </span>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-2 mb-1">
            Menu Navigation
          </span>
          {items.map((item) => {
            const isActive = item.active ?? currentPath === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <span className="text-sm">{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-blue-600' : 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User Profile Card */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-700">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">{userName}</span>
            <span className="text-[10px] font-medium text-slate-400 truncate">{userRole}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
