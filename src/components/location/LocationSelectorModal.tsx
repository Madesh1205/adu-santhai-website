import React, { useState } from 'react';
import { useLocation } from '@/lib/location/LocationContext';
import { TAMIL_NADU_DISTRICTS, formatDistrictLabel } from '@/lib/location/locationUtils';
import { Button } from '@/components/ui/button';
import { MapPin, X, Search, Check, Globe } from 'lucide-react';

export const LocationSelectorModal: React.FC = () => {
  const {
    userDistrict,
    isSelectorOpen,
    closeSelector,
    selectDistrict,
    clearLocation,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isSelectorOpen) return null;

  const filteredDistricts = TAMIL_NADU_DISTRICTS.filter((d) =>
    d.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-white font-bold shadow-2xs">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Where are you looking from?
              </h3>
              <p className="text-xs text-slate-500">Discover goats and breeder farms in your region</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSelector}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Active District Banner */}
          {userDistrict ? (
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50/80 p-3.5 border border-emerald-200">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Active District Filter
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    {formatDistrictLabel(userDistrict)}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={clearLocation}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 px-2.5"
              >
                All Tamil Nadu
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-slate-400" />
                <span>Showing farms & goats from all locations across Tamil Nadu</span>
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search district or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>

          {/* All Tamil Nadu Option */}
          <button
            type="button"
            onClick={() => selectDistrict(null)}
            className={`w-full flex items-center justify-between rounded-2xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              !userDistrict
                ? 'bg-emerald-800 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>All Tamil Nadu Districts</span>
            </div>
            {!userDistrict && <Check className="h-4 w-4 text-white" />}
          </button>

          {/* District Grid */}
          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1 pb-1">
              Tamil Nadu Districts ({filteredDistricts.length})
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {filteredDistricts.map((district) => {
                const isSelected =
                  userDistrict?.toLowerCase() === district.toLowerCase();

                return (
                  <button
                    key={district}
                    type="button"
                    onClick={() => selectDistrict(district)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                    }`}
                  >
                    <span className="truncate">{district}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Preferences saved automatically</span>
          <Button variant="outline" size="sm" onClick={closeSelector} className="rounded-xl text-xs h-8">
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
