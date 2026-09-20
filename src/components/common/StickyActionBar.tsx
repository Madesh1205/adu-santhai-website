import React from 'react';
import { cn } from '@/lib/utils';

interface StickyActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export const StickyActionBar: React.FC<StickyActionBarProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-lg lg:hidden safe-area-pb transition-all',
        className
      )}
    >
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        {children}
      </div>
    </div>
  );
};
