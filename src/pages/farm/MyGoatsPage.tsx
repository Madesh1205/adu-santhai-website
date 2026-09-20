import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { useAuth } from '@/lib/auth/AuthContext';
import { GoatRepository } from '@/repositories/GoatRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatAge, formatDate } from '@/lib/utils';
import type { Goat, GoatStatus } from '@/types';
import {
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Layers,
  ExternalLink,
} from 'lucide-react';

export const MyGoatsPage: React.FC = () => {
  const { farm } = useAuth();
  const [goats, setGoats] = useState<Goat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadGoats = useCallback(async () => {
    if (!farm) return;
    setLoading(true);
    try {
      const data = await GoatRepository.getMyFarmGoats(farm.id);
      setGoats(data);
    } catch (err) {
      console.error('Failed to load farm goats:', err);
    } finally {
      setLoading(false);
    }
  }, [farm]);

  useEffect(() => {
    loadGoats();
  }, [loadGoats]);

  const handleStatusChange = async (goatId: string, newStatus: GoatStatus) => {
    try {
      await GoatRepository.updateGoatListing(goatId, { status: newStatus });
      await loadGoats();
    } catch (err) {
      console.error('Failed to change goat status:', err);
      alert('Failed to update goat status.');
    }
  };

  const handleDelete = async (goatId: string, goatName: string) => {
    if (!confirm(`Are you sure you want to permanently delete listing "${goatName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(goatId);
    try {
      await GoatRepository.deleteGoatListing(goatId);
      await loadGoats();
    } catch (err: any) {
      console.error('Failed to delete goat listing:', err);
      alert(err.message || 'Failed to delete listing.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredGoats = goats.filter((g) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACTIVE') return g.status === 'AVAILABLE';
    if (activeTab === 'RESERVED') return g.status === 'RESERVED' || g.status === 'BOOKING_PENDING';
    if (activeTab === 'SOLD') return g.status === 'SOLD' || g.status === 'COMPLETED';
    return true;
  });

  return (
    <>
      <SEOHead title="My Goat Listings | Farm Admin" path="/farm/goats" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Goat Listings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage inventory, update prices, and mark sales for {farm?.name}
            </p>
          </div>

          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs">
            <Link to="/farm/goats/new">
              <PlusCircle className="h-4 w-4" />
              <span>Add New Goat</span>
            </Link>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'ALL', label: `All Goats (${goats.length})` },
            { id: 'ACTIVE', label: `Active (${goats.filter((g) => g.status === 'AVAILABLE').length})` },
            { id: 'RESERVED', label: `Reserved (${goats.filter((g) => g.status === 'RESERVED' || g.status === 'BOOKING_PENDING').length})` },
            { id: 'SOLD', label: `Sold (${goats.filter((g) => g.status === 'SOLD' || g.status === 'COMPLETED').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3.5 py-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Goats Table / Card Grid */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filteredGoats.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
            <Layers className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Goats in this Tab</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your herd listings with pure pedigrees and health records to start receiving buyer reservations.
            </p>
            <Button asChild className="bg-emerald-600 text-white text-xs">
              <Link to="/farm/goats/new">List Your First Goat</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGoats.map((goat) => {
              const isReserved = goat.status === 'RESERVED' || goat.status === 'BOOKING_PENDING';
              const isSold = goat.status === 'SOLD' || goat.status === 'COMPLETED';

              return (
                <div
                  key={goat.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
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
                        <Badge
                          variant={
                            goat.status === 'AVAILABLE'
                              ? 'default'
                              : isReserved
                              ? 'secondary'
                              : isSold
                              ? 'slate'
                              : 'destructive'
                          }
                          className="text-[10px]"
                        >
                          {goat.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500">
                        {goat.breedName} • {goat.gender} • {formatAge(goat.ageMonths)} • {goat.weightKg} kg • {goat.purpose}
                      </p>

                      <div className="flex items-center gap-3 pt-0.5 text-xs">
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(goat.finalPrice)}
                        </span>
                        {goat.hasDiscount && (
                          <span className="text-slate-400 line-through">
                            {formatCurrency(goat.price)} ({goat.discountPercentage}% off)
                          </span>
                        )}
                        <span className="text-slate-400">• Added {formatDate(goat.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <Button size="sm" variant="outline" asChild className="text-xs gap-1">
                      <Link to={`/goats/${goat.id}`}>
                        <ExternalLink className="h-3.5 w-3.5" /> View
                      </Link>
                    </Button>

                    <Button size="sm" variant="outline" asChild className="text-xs gap-1">
                      <Link to={`/farm/goats/${goat.id}/edit`}>
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Link>
                    </Button>

                    {goat.status === 'AVAILABLE' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(goat.id, 'SOLD')}
                        className="text-xs gap-1 text-slate-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Mark Sold
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(goat.id, 'AVAILABLE')}
                        className="text-xs gap-1 text-slate-700"
                      >
                        <Clock className="h-3.5 w-3.5 text-blue-600" /> Set Active
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(goat.id, goat.name)}
                      isLoading={deletingId === goat.id}
                      className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
