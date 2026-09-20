import React, { useState } from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { useAuth } from '@/lib/auth/AuthContext';
import { FarmRepository } from '@/repositories/FarmRepository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

export const FarmSettingsPage: React.FC = () => {
  const { farm, refreshProfile } = useAuth();

  const [name, setName] = useState<string>(farm?.name || '');
  const [tagline, setTagline] = useState<string>(farm?.tagline || '');
  const [description, setDescription] = useState<string>(farm?.description || '');
  const [contactPhone, setContactPhone] = useState<string>(farm?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState<string>(farm?.contactEmail || '');
  const [locationDistrict, setLocationDistrict] = useState<string>(farm?.locationDistrict || 'Tiruvannamalai');
  const [address, setAddress] = useState<string>(farm?.address || '');

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!farm) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await FarmRepository.updateFarm(farm.id, {
        name: name.trim(),
        tagline: tagline.trim() || null,
        description: description.trim() || null,
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim() || null,
        location_district: locationDistrict.trim(),
        address: address.trim() || null,
      });

      await refreshProfile();
      setSuccessMsg('Farm profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Failed to update farm settings:', err);
      setErrorMsg(err.message || 'Failed to update farm details.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SEOHead title="Farm Profile Settings | Adu Santhai" path="/farm/settings" />

      <div className="mx-auto max-w-3xl space-y-6">
        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">Farm Profile & Contact</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Public information displayed to buyers across the Adu Santhai marketplace
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="rounded-3xl border-slate-200 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Public Farm Details</CardTitle>
                  <CardDescription className="text-xs">
                    Farm Code: <span className="font-mono font-bold text-slate-800">{farm.farmCode}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {successMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Farm Name
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Tagline / Specialization
                </label>
                <Input
                  placeholder="e.g. Certified Pure Boer & Sirohi Stud Breeders"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Contact Phone (For Buyer Calls & WhatsApp)
                  </label>
                  <Input
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    District
                  </label>
                  <Input
                    required
                    value={locationDistrict}
                    onChange={(e) => setLocationDistrict(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Farm Address / Village
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  About Farm & Facilities
                </label>
                <Textarea
                  rows={4}
                  placeholder="Describe your breeding shed, grazing area, quarantine practices, and visiting hours..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter className="pt-2 flex justify-end">
              <Button
                type="submit"
                isLoading={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                Save Farm Settings
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  );
};
