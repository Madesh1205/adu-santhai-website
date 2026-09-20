import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { AdminRepository } from '@/repositories/AdminRepository';
import { FarmRepository } from '@/repositories/FarmRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { VerifiedBadge } from '@/components/common/VerifiedBadge';
import type { Farm } from '@/types';
import {
  Building2,
  Check,
  Ban,
  PhoneCall,
  ExternalLink,
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

  return (
    <>
      <SEOHead title="Farm Approvals & Quotas | Super Admin" path="/admin/farms" />

      <div className="space-y-8">
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Farm Breeder Verification</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Inspect registration documents, set listing quotas, and grant verified status
              </p>
            </div>
            <Badge variant="earth" className="text-xs">
              {pendingFarms.length} Pending Approval
            </Badge>
          </div>
        </div>

        {/* 1. Pending Approvals Queue */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Pending Farm Applications ({pendingFarms.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : pendingFarms.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="No Pending Farm Applications"
              description="All partner farm registration requests have been processed. New breeder signups will appear here."
            />
          ) : (
            <div className="space-y-4">
              {pendingFarms.map((farm) => (
                <div
                  key={farm.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-[#92400E] border border-amber-200 font-bold">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{farm.name}</h3>
                        <Badge variant="reserved" className="text-[10px]">PENDING</Badge>
                        <span className="font-mono text-xs text-slate-400">#{farm.farmCode}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Location: {farm.locationDistrict}, {farm.locationState || 'Tamil Nadu'}
                      </p>
                      <p className="text-xs text-slate-600">
                        Contact: {farm.contactPhone || 'N/A'} • {farm.contactEmail || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    {farm.contactPhone && (
                      <a
                        href={`tel:${farm.contactPhone}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        <PhoneCall className="h-3.5 w-3.5 text-emerald-800" />
                        <span>Call Breeder</span>
                      </a>
                    )}

                    <Button
                      variant="default"
                      size="sm"
                      className="font-bold text-xs gap-1"
                      onClick={() => handleVerify(farm.id)}
                      disabled={actionId === farm.id}
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Verify & Set Quota</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Active Verified Farms Directory */}
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">
            Active Verified Farms ({allFarms.length})
          </h2>

          <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
            {allFarms.map((farm) => (
              <div key={farm.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{farm.name}</span>
                    <span className="font-mono text-[11px] text-slate-400">#{farm.farmCode}</span>
                    {farm.isAmmalOwnFarm ? (
                      <Badge variant="earth" className="text-[9px] font-bold">CENTRAL HUB</Badge>
                    ) : (
                      <VerifiedBadge label="Verified" variant="subtle" />
                    )}
                  </div>
                  <p className="text-slate-500">
                    {farm.locationDistrict} • Quota: <strong>{farm.isAmmalOwnFarm ? 'Unlimited' : farm.goatListingLimit} goats</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/farms/${farm.id}`} target="_blank">
                    <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1">
                      <span>View Profile</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>

                  {!farm.isAmmalOwnFarm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs text-red-600 hover:bg-red-50"
                      onClick={() => handleSuspend(farm.id)}
                      disabled={actionId === farm.id}
                    >
                      <Ban className="h-3 w-3 mr-1" /> Suspend
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};
