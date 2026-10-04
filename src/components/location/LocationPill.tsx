import React from 'react';
import { useLocation } from '@/lib/location/LocationContext';
import { MapPin, ChevronDown } from 'lucide-react';

interface LocationPillProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const LocationPill: React.FC<LocationPillProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { userDistrictLabel, openSelector, userDistrict } = useLocation();

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={openSelector}
        className={`flex items-center gap-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 hover:bg-emerald-100/80 px-3.5 py-2 text-xs transition-colors cursor-pointer text-left ${className}`}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-2xs">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="truncate">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-900">
            Location Filter
          </span>
          <span className="block font-bold text-slate-900 truncate">
            {userDistrict ? userDistrictLabel : 'All Tamil Nadu Districts'}
          </span>
        </div>
        <ChevronDown className="h-4 w-4 text-emerald-800 shrink-0 ml-auto" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openSelector}
      title="Change location district"
      className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/90 px-2.5 py-1.5 text-xs font-semibold text-slate-800 transition-colors cursor-pointer ${className}`}
    >
      <MapPin className="h-3.5 w-3.5 text-emerald-800 shrink-0" />
      <span className="truncate max-w-[140px] sm:max-w-[200px] font-bold">
        {userDistrictLabel}
      </span>
      <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
    </button>
  );
};
