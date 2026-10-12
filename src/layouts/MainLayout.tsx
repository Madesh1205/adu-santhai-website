import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { MobileNav } from '@/components/navigation/MobileNav';
import { Footer } from '@/components/navigation/Footer';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-clip bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      <Navbar />
      <main className="min-w-0 flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
};
