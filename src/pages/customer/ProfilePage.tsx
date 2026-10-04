import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Breadcrumb } from '@/components/common/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, CheckCircle2, AlertCircle, Trash2, ShieldAlert, X } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, signOut } = useAuth();

  const [name, setName] = useState<string>(profile?.name || '');
  const [phone, setPhone] = useState<string>(profile?.phone || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Account Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name.trim(),
          phone: phone.trim(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.message || 'Failed to update profile details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || confirmText.trim().toUpperCase() !== 'DELETE') return;

    setIsDeleting(true);
    setErrorMsg(null);

    try {
      // 1. Delete user wishlist entries
      await supabase.from('wishlist').delete().eq('user_id', user.id);

      // 2. Delete user profile record
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileDeleteError) {
        console.warn('Profile record removal note:', profileDeleteError);
      }

      // 3. Sign out session
      await signOut();

      // 4. Navigate to home
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Account deletion error:', err);
      setErrorMsg(err.message || 'Failed to delete account. Please contact ammalfarm@gmail.com for assistance.');
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <SEOHead title="My Account Profile | Adu Santhai" path="/profile" />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <Breadcrumb items={[{ label: 'Account Profile' }]} />

        <div className="pb-6 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Account Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your contact numbers and identity for booking coordination with breeders.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Strip */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 font-bold text-xl border border-emerald-100">
              {profile?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {profile?.name || 'Adu Santhai Member'}
              </h2>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge variant="verified" className="text-[10px]">
                  Role: {profile?.role || 'Customer'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 text-sm rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address (Account Login)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-10 h-11 text-sm rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Your email is linked to Supabase authentication and cannot be changed here.
              </span>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                Phone Number (Required for Breeder Call / WhatsApp)
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-11 text-sm rounded-xl"
                />
              </div>
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 text-xs font-semibold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-800 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs font-semibold text-red-700">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="default"
                size="default"
                className="w-full sm:w-auto font-bold px-6"
                isLoading={isSaving}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Danger Zone: Delete Account */}
        <div className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-800">
            <Trash2 className="h-5 w-5 shrink-0" />
            <h3 className="text-base font-bold text-slate-900">Danger Zone: Delete Account</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Permanently delete your Adu Santhai account. This action removes your user profile, saved wishlist items, and session history permanently.
          </p>
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmText('');
                setShowDeleteModal(true);
              }}
              className="border-rose-300 bg-white text-rose-700 hover:bg-rose-100/80 hover:text-rose-900 font-bold text-xs rounded-xl h-10 px-4"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Confirm Account Deletion</h3>
                <p className="text-xs text-slate-500">This action is permanent & irreversible</p>
              </div>
            </div>

            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-900 leading-relaxed space-y-2">
              <p className="font-bold">Are you sure you want to delete your account?</p>
              <ul className="list-disc pl-4 space-y-1 text-rose-800">
                <li>Your profile credentials and phone number will be erased.</li>
                <li>Your saved wishlist goats will be cleared.</li>
                <li>You will be logged out immediately.</li>
              </ul>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Type <span className="font-mono text-rose-600 font-extrabold uppercase">DELETE</span> to confirm:
                </label>
                <Input
                  type="text"
                  placeholder="DELETE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="h-11 text-sm rounded-xl font-mono uppercase"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="rounded-xl font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={confirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
                  isLoading={isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-5"
                >
                  Confirm Delete Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
