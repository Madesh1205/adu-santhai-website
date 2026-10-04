import React from 'react';
import { LocationRelevance } from '@/lib/location/locationUtils';

interface LocationRelevanceBadgeProps {
  relevance: LocationRelevance;
  className?: string;
}

export const LocationRelevanceBadge: React.FC<LocationRelevanceBadgeProps> = ({
  relevance,
  className = '',
}) => {
  if (relevance === 'IN_DISTRICT') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200/80 ${className}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
        <span>In your district</span>
      </span>
    );
  }

  if (relevance === 'NEARBY_DISTRICT') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/60 ${className}`}
      >
        <span>Nearby district</span>
      </span>
    );
  }

  if (relevance === 'OTHER_LOCATION') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-500 ${className}`}
      >
        <span>Other location</span>
      </span>
    );
  }

  return null;
};
