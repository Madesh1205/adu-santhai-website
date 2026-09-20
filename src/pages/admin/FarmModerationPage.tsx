import React, { useEffect, useState, useCallback } from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { AdminRepository } from '@/repositories/AdminRepository';
import { FarmRepository } from '@/repositories/FarmRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Farm } from '@/types';
import {
  Check,
  Ban,
  PhoneCall,
} from 'lucide-react';

export const FarmModerationPage: React.FC = () => {
  const [pendingFarms, setPendingFarms] = useState<Farm[]>([]);
  const [allFarms, setAllFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadFarms = useCallback(async () => {
    setLoading(true);
    try {
      const [pending, approved] = await Promise.all([
        AdminRepository.getPendingFarms(),
        FarmRepository.getApprovedFarms(),
      ]);
      setPendingFarms(pending);
      setAllFarms(approved);
    } catch (err) {
      console.error('Failed to load farms for moderation:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  const handleVerify = async (farmId: string) => {
    const limitStr = prompt('Enter active goat listing limit for this farm:', '2');
    if (limitStr === null) return;
    const limit = parseInt(limitStr, 10) || 2;

    setActionId(farmId);
    try {
      await AdminRepository.verifyFarm(farmId, limit);
      await loadFarms();
    } catch (err) {
      console.error('Failed to verify farm:', err);
      alert('Failed to verify farm.');
    } finally {
      setActionId(null);
    }
  };

  const handleSuspend = async (farmId: string) => {
    if (!confirm('Are you sure you want to suspend this farm? Their listings will be hidden from the marketplace.')) {
      return;
    }

    setActionId(farmId);
    try {
      await AdminRepository.suspendFarm(farmId);
      await loadFarms();
    } catch (err) {
      console.error('Failed to suspend farm:', err);
      alert('Failed to suspend farm.');
    } finally {
      setActionId(null);
    }
  };

  const handleUpdateLimit = async (farmId: string, currentLimit: number) => {
    const limitStr = prompt('Enter new active goat listing limit:', currentLimit.toString());
    if (limitStr === null) return;
    const limit = parseInt(limitStr, 10);
    if (isNaN(limit) || limit < 1) return;

    try {
      await AdminRepository.updateFarmListingLimit(farmId, limit);
      await loadFarms();
    } catch (err) {
      console.error('Failed to update farm quota:', err);
      alert('Failed to update listing quota.');
    }
  };

  return (
    <>
      <SEOHead title="Partner Farm Verification | Super Admin" path="/admin/farms" />

      <div className="space-y-8">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">
            Partner Farm Verification & Limits
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify breeder applications, establish quotas, and monitor partner activity
          </p>
        </div>

        {/* Section 1: Pending Verification Applications */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Pending Farm Applications</span>
            <Badge variant="secondary" className="text-xs">
              {pendingFarms.length}
            </Badge>
          </h2>

          {loading ? (
            <div className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
          ) : pendingFarms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
              No new partner farm applications awaiting review.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingFarms.map((farm) => (
                <div
                  key={farm.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{farm.name}</h3>
                      <span className="font-mono text-xs text-slate-400">#{farm.farmCode}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        PENDING REVIEW
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">
                      Location: {farm.locationDistrict}, {farm.locationState} • Contact: {farm.contactPhone}
                    </p>
                    {farm.address && (
                      <p className="text-xs text-slate-400">Address: {farm.address}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${farm.contactPhone}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Call Farmer</span>
                    </a>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                      isLoading={actionId === farm.id}
                      onClick={() => handleVerify(farm.id)}
                    >
                      <Check className="h-3.5 w-3.5" /> Verify Farm
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Verified Farms */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Active Verified Farms</span>
            <Badge variant="default" className="text-xs bg-emerald-100 text-emerald-800">
              {allFarms.length}
            </Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allFarms.map((farm) => (
              <div
                key={farm.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-base">{farm.name}</h4>
                      {farm.isAmmalOwnFarm ? (
                        <Badge variant="default" className="text-[10px] bg-emerald-600 text-white font-bold">
                          AMMAL FARM HUB
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px] bg-emerald-100 text-emerald-800">
                          VERIFIED
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {farm.locationDistrict} • Phone: {farm.contactPhone}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-slate-400">#{farm.farmCode}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Quota:</span>
                    <strong className="text-slate-800">
                      {farm.isAmmalOwnFarm ? 'Unlimited' : `${farm.goatListingLimit} listings`}
                    </strong>
                    {!farm.isAmmalOwnFarm && (
                      <button
                        onClick={() => handleUpdateLimit(farm.id, farm.goatListingLimit)}
                        className="text-emerald-700 hover:underline text-[11px] font-semibold"
                      >
                        (Edit)
                      </button>
                    )}
                  </div>

                  {!farm.isAmmalOwnFarm && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSuspend(farm.id)}
                      isLoading={actionId === farm.id}
                      className="text-[11px] text-rose-600 border-rose-200 hover:bg-rose-50 h-7"
                    >
                      <Ban className="h-3 w-3 mr-1" /> Suspend
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
