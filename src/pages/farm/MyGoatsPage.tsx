import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { useAuth } from '@/lib/auth/AuthContext';
import { GoatRepository } from '@/repositories/GoatRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatAge } from '@/lib/utils';
import type { Goat, GoatStatus } from '@/types';
import {
  PlusCircle,
  Edit,
  Trash2,
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Goat Listings</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage inventory, update prices, and mark sales for {farm?.name}
            </p>
          </div>

          <Link to="/farm/goats/new">
            <Button variant="default" size="default" className="font-bold gap-1.5 shadow-xs">
              <PlusCircle className="h-4 w-4" />
              <span>Add New Goat</span>
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'ALL', label: `All Goats (${goats.length})` },
            { id: 'ACTIVE', label: `Available (${goats.filter((g) => g.status === 'AVAILABLE').length})` },
            { id: 'RESERVED', label: `Reserved (${goats.filter((g) => g.status === 'RESERVED' || g.status === 'BOOKING_PENDING').length})` },
            { id: 'SOLD', label: `Sold (${goats.filter((g) => g.status === 'SOLD' || g.status === 'COMPLETED').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-800 text-white font-bold shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Goats List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredGoats.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No goats found in this tab"
            description="Add your herd listings with pure pedigrees and health records to start receiving buyer reservations."
            actionLabel="List a Goat Now"
            actionHref="/farm/goats/new"
          />
        ) : (
          <div className="space-y-4">
            {filteredGoats.map((goat) => {
              const isReserved = goat.status === 'RESERVED' || goat.status === 'BOOKING_PENDING';
              const isSold = goat.status === 'SOLD' || goat.status === 'COMPLETED';

              return (
                <div
                  key={goat.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all hover:border-emerald-700/30 hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={goat.primaryPhoto}
                      alt={goat.name}
                      className="h-20 w-20 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">{goat.name}</h3>
                        <span className="font-mono text-xs text-slate-400">#{goat.goatCode}</span>
                        <Badge
                          variant={
                            goat.status === 'AVAILABLE'
                              ? 'verified'
                              : isReserved
                              ? 'reserved'
                              : isSold
                              ? 'sold'
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

                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-sm font-extrabold text-emerald-800">
                          {formatCurrency(goat.finalPrice)}
                        </span>
                        {goat.hasDiscount && (
                          <span className="text-xs text-slate-400 line-through">
                            {formatCurrency(goat.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <select
                      value={goat.status}
                      onChange={(e) => handleStatusChange(goat.id, e.target.value as GoatStatus)}
                      aria-label="Change goat status"
                      className="rounded-xl border border-slate-200 bg-white py-1.5 px-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    >
                      <option value="AVAILABLE">Mark Available</option>
                      <option value="RESERVED">Mark Reserved</option>
                      <option value="SOLD">Mark Sold</option>
                    </select>

                    <Link to={`/goats/${goat.id}`} target="_blank">
                      <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1">
                        <span>View</span>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>

                    <Link to={`/farm/goats/${goat.id}/edit`}>
                      <Button variant="secondary" size="sm" className="h-9 px-3 text-xs gap-1 font-bold">
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDelete(goat.id, goat.name)}
                      disabled={deletingId === goat.id}
                      aria-label="Delete goat listing"
                    >
                      <Trash2 className="h-4 w-4" />
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
