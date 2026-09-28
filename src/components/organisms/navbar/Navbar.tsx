'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StatusPill } from '@/components/molecules/status-pill';

export interface NavLinkItem {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavbarProps {
  brandName?: string;
  brandHref?: string;
  brandTag?: string;
  links?: NavLinkItem[];
  currentPath?: string;
  showStatus?: boolean;
  statusLabel?: string;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

const defaultLinks: NavLinkItem[] = [
  { label: 'Documentation', href: '#' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Design System', href: '#components' },
  { label: 'Health API', href: '/api/health' },
];

export const Navbar: React.FC<NavbarProps> = ({
  brandName = 'NextBase',
  brandHref = '/',
  brandTag = 'Starter',
  links = defaultLinks,
  currentPath = '/',
  showStatus = true,
  statusLabel = 'API Online',
  ctaText = 'Get Started',
  ctaHref = '#components',
  className = '',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={brandHref} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm tracking-tighter shadow-sm group-hover:bg-primary-hover transition-colors">
            NB
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              {brandName}
            </span>
            {brandTag && (
              <span className="text-[10px] font-bold text-primary bg-primary-subtle px-2 py-0.5 rounded-full border border-primary/20">
                {brandTag}
              </span>
            )}
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const isActive = link.active ?? currentPath === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-primary bg-primary-subtle'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {showStatus && (
            <Link href="/health">
              <StatusPill label={statusLabel} status="online" />
            </Link>
          )}

          {ctaText && (
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center font-bold text-xs py-2 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm shadow-primary/20 transition-all active:scale-95"
            >
              {ctaText}
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label="Toggle mobile menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {showStatus && (
              <Link href="/health" onClick={() => setMobileMenuOpen(false)}>
                <StatusPill label={statusLabel} status="online" />
              </Link>
            )}
            {ctaText && (
              <Link
                href={ctaHref}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm"
              >
                {ctaText}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
