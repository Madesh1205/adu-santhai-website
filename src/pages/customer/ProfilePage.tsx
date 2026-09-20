import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [name, setName] = useState<string>(profile?.name || '');
  const [phone, setPhone] = useState<string>(profile?.phone || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  return (
    <>
      <SEOHead title="My Account Profile | Adu Santhai" path="/profile" />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
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
      </div>
    </>
  );
};
