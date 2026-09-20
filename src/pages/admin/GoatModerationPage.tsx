import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { AdminRepository } from '@/repositories/AdminRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const handleToggleFeatured = async (goatId: string, currentFeatured: boolean) => {
    try {
      await AdminRepository.toggleFeatureGoat(goatId, !currentFeatured);
      await loadGoats();
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
    }
  };

  return (
    <>
      <SEOHead title="Goat Moderation Queue | Super Admin" path="/admin/goats" />

      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">
            Goat Listings Pending Moderation ({goats.length})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review photos, pedigrees, pricing, and health claims before making listings publicly visible
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : goats.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <CheckSquare className="h-10 w-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Moderation Queue Clear!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All submitted goat listings have been inspected and approved.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {goats.map((goat) => (
              <div
                key={goat.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={goat.primaryPhoto}
                    alt={goat.name}
                    className="h-20 w-20 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{goat.name}</h3>
                      <span className="font-mono text-xs text-slate-400">#{goat.goatCode}</span>
                      <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-800">
                        PENDING APPROVAL
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600">
                      Breed: <strong>{goat.breedName}</strong> • {goat.gender} • {formatAge(goat.ageMonths)} • {goat.weightKg} kg
                    </p>

                    <p className="text-xs text-slate-500">
                      Farm: <strong className="text-slate-800">{goat.farmName}</strong> ({goat.farmLocation})
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <span className="font-extrabold text-emerald-800">
                        {formatCurrency(goat.finalPrice)}
                      </span>
                      {goat.hasDiscount && (
                        <span className="text-slate-400 line-through">
                          {formatCurrency(goat.price)}
                        </span>
                      )}
                      <span className="text-slate-400 font-medium">
                        Vaccination: {goat.vaccinationStatus || 'Not specified'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleFeatured(goat.id, goat.isFeatured)}
                    className={`text-xs gap-1 ${goat.isFeatured ? 'bg-amber-50 text-amber-900 border-amber-300' : ''}`}
                  >
                    <Star className={`h-3.5 w-3.5 ${goat.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                    <span>{goat.isFeatured ? 'Featured' : 'Feature'}</span>
                  </Button>

                  <Button size="sm" variant="outline" asChild className="text-xs gap-1">
                    <Link to={`/goats/${goat.id}`} target="_blank">
                      <ExternalLink className="h-3.5 w-3.5" /> Preview
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                    isLoading={actionId === goat.id}
                    onClick={() => handleApprove(goat.id)}
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="text-xs gap-1"
                    isLoading={actionId === goat.id}
                    onClick={() => handleReject(goat.id)}
                  >
                    <X className="h-3.5 w-3.5" /> Reject
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
