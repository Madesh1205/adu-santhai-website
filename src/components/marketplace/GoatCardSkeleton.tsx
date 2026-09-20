import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const GoatCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Photo Placeholder */}
      <Skeleton className="aspect-4/3 w-full rounded-none" />

      {/* Body Details */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>

        <Skeleton className="h-5 w-3/4 rounded-md" />

        {/* Chips */}
        <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-slate-50 p-2">
          <Skeleton className="h-7 w-full rounded-md" />
          <Skeleton className="h-7 w-full rounded-md" />
          <Skeleton className="h-7 w-full rounded-md" />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
