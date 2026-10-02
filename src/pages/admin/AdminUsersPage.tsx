import React, { useEffect, useState, useCallback } from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { AdminRepository } from '@/repositories/AdminRepository';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDateTime } from '@/lib/utils';
import type { UserProfile, UserRole } from '@/types';
import {
  Users,
  Search,
  Mail,
  Phone,
  UserX,
  UserCheck,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AdminRepository.getAllProfiles();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleSuspension = async (userId: string, currentSuspended: boolean) => {
    const action = currentSuspended ? 'unsuspend' : 'suspend';
    if (!confirm(`Are you sure you want to ${action} this user account?`)) {
      return;
    }
    setUpdatingId(userId);
    try {
      await AdminRepository.toggleUserSuspension(userId, !currentSuspended);
      await loadUsers();
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
      alert(`Failed to ${action} user account.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').includes(q);
      return matchName || matchEmail || matchPhone;
    }

    return true;
  });

  return (
    <>
      <SEOHead title="User Management | Super Admin" path="/admin/users" />

      <div className="space-y-6">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Platform User Accounts</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage registered customers, partner farm administrators, and security suspensions
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
            {[
              { id: 'ALL', label: `All Users (${users.length})` },
              { id: 'CUSTOMER', label: `Buyers (${users.filter((u) => u.role === 'CUSTOMER').length})` },
              { id: 'FARM_ADMIN', label: `Breeders (${users.filter((u) => u.role === 'FARM_ADMIN').length})` },
              { id: 'SUPER_ADMIN', label: `Admins (${users.filter((u) => u.role === 'SUPER_ADMIN').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id as any)}
                className={`rounded-xl px-3.5 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === tab.id
                    ? 'bg-emerald-800 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
          </div>
        </div>

        {/* Users Table / Cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users match criteria"
            description="Try adjusting your role filter or search query."
          />
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((u) => {
              const isSuper = u.role === 'SUPER_ADMIN';
              const isFarmAdmin = u.role === 'FARM_ADMIN';

              return (
                <div
                  key={u.id}
                  className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                    u.isSuspended
                      ? 'border-red-200 bg-red-50/40'
                      : 'border-slate-200 bg-white shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {u.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">{u.name}</h3>
                          <Badge
                            variant={
                              isSuper
                                ? 'default'
                                : isFarmAdmin
                                ? 'earth'
                                : 'verified'
                            }
                            className="text-[10px]"
                          >
                            {u.role}
                          </Badge>
                          {u.isSuspended && (
                            <Badge variant="destructive" className="text-[10px]">
                              SUSPENDED
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                          <span>Joined {formatDateTime(u.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isSuper && (
                        <Button
                          size="sm"
                          variant={u.isSuspended ? 'default' : 'outline'}
                          onClick={() => handleToggleSuspension(u.id, u.isSuspended)}
                          disabled={updatingId === u.id}
                          className="text-xs font-bold gap-1.5"
                        >
                          {u.isSuspended ? (
                            <>
                              <UserCheck className="h-3.5 w-3.5" />
                              <span>Unsuspend</span>
                            </>
                          ) : (
                            <>
                              <UserX className="h-3.5 w-3.5 text-red-600" />
                              <span>Suspend Account</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
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
