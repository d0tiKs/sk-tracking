import React, { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function Layout({
  title,
  right,
  children
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-10 bg-gradient-to-b from-surface/95 to-surface/70 backdrop-blur border-b border-white/5">
        <div className="container-app flex items-center justify-between py-3">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            Skull King
          </Link>
          <div className="text-sm opacity-80">{title}</div>
          <div className="flex items-center gap-2">{right ?? null}</div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container-app py-4">{children}</div>
      </main>
    </div>
  );
}