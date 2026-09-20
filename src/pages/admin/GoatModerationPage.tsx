import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { AdminRepository } from '@/repositories/AdminRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatAge } from '@/lib/utils';
import type { Goat } from '@/types';
import {
  CheckSquare,
  Check,
  X,
  Star,
  ExternalLink,
} from 'lucide-react';

export const GoatModerationPage: React.FC = () => {
  const [goats, setGoats] = useState<Goat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadGoats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminRepository.getPendingGoats();
      setGoats(data);
    } catch (err) {
      console.error('Failed to load pending goats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGoats();
  }, [loadGoats]);

  const handleApprove = async (goatId: string) => {
    setActionId(goatId);
    try {
      await AdminRepository.approveGoat(goatId);
      await loadGoats();
    } catch (err) {
      console.error('Failed to approve goat:', err);
      alert('Failed to approve listing.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (goatId: string) => {
    const reason = prompt('Please enter rejection reason for breeder:', 'Does not meet photo or price clarity standards');
    if (reason === null) return;

    setActionId(goatId);
    try {
      await AdminRepository.rejectGoat(goatId, reason);
      await loadGoats();
    } catch (err) {
      console.error('Failed to reject goat:', err);
      alert('Failed to reject listing.');
    } finally {
      setActionId(null);
    }
  };

  const handleToggleFeatured = async (goatId: string, currentStatus: boolean) => {
    try {
      await AdminRepository.toggleFeatureGoat(goatId, !currentStatus);
      await loadGoats();
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
      alert('Failed to update featured flag.');
    }
  };

  return (
    <>
      <SEOHead title="Goat Listings Moderation | Super Admin" path="/admin/goats" />

      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Goat Moderation Queue</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Review partner farm listings for health records, accurate photos, and fair pricing
              </p>
            </div>
            <Badge variant="verified" className="text-xs">
              {goats.length} Pending Review
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : goats.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="Moderation Queue Clear"
            description="All partner farm listings have been moderated and verified. New submissions will appear here automatically."
          />
        ) : (
          <div className="space-y-4">
            {goats.map((goat) => (
              <div
                key={goat.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-700/30 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={goat.primaryPhoto}
                    alt={goat.name}
                    className="h-20 w-20 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{goat.name}</h3>
                      <span className="font-mono text-xs text-slate-400">#{goat.goatCode}</span>
                      <Badge variant="reserved" className="text-[10px]">
                        STATUS: {goat.status}
                      </Badge>
                      {goat.isFeatured && (
                        <Badge variant="earth" className="text-[10px] font-bold">
                          FEATURED
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-500">
                      Breed: <strong className="text-slate-700">{goat.breedName}</strong> • {goat.gender} • {formatAge(goat.ageMonths)} • {goat.weightKg} kg
                    </p>

                    <p className="text-xs text-slate-600">
                      Farm: <strong className="text-emerald-800">{goat.farmName}</strong> ({goat.farmLocation || 'Tamil Nadu'})
                    </p>

                    <div className="pt-1">
                      <span className="text-sm font-extrabold text-emerald-800">
                        {formatCurrency(goat.finalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Moderation Controls */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link to={`/goats/${goat.id}`} target="_blank">
                    <Button variant="outline" size="sm" className="text-xs gap-1">
                      <span>Inspect</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => handleToggleFeatured(goat.id, goat.isFeatured)}
                  >
                    <Star className={`h-3.5 w-3.5 ${goat.isFeatured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                    <span>{goat.isFeatured ? 'Unfeature' : 'Feature'}</span>
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    className="font-bold text-xs gap-1"
                    onClick={() => handleApprove(goat.id)}
                    disabled={actionId === goat.id}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Approve</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-red-600 hover:bg-red-50 gap-1"
                    onClick={() => handleReject(goat.id)}
                    disabled={actionId === goat.id}
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Reject</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
