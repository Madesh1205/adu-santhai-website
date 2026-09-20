import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { SEOHead } from '@/components/common/SEOHead';
import { useAuth } from '@/lib/auth/AuthContext';
import { GoatRepository } from '@/repositories/GoatRepository';
import { StorageService } from '@/services/StorageService';
import { RazorpayService } from '@/services/RazorpayService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { Breed, GoatGender, GoatPurpose, GoatStatus } from '@/types';
import { calculateFinalPrice } from '@/types';
import {
  Upload,
  X,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export const GoatFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { farm, user } = useAuth();

  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [goatCode, setGoatCode] = useState<string>(`GT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [breedName, setBreedName] = useState<string>('Boer');
  const [breedId, setBreedId] = useState<string | null>(null);
  const [gender, setGender] = useState<GoatGender>('MALE');
  const [ageMonths, setAgeMonths] = useState<number>(12);
  const [weightKg, setWeightKg] = useState<number>(35);
  const [purpose, setPurpose] = useState<GoatPurpose>('BREEDING');
  const [price, setPrice] = useState<number>(25000);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [vaccinationStatus, setVaccinationStatus] = useState<string>('Fully Vaccinated (ET, PPR, FMD)');
  const [dewormedDate, setDewormedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [parentageFatherTag, setParentageFatherTag] = useState<string>('');
  const [parentageMotherTag, setParentageMotherTag] = useState<string>('');
  const [status, setStatus] = useState<GoatStatus>('AVAILABLE');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    async function initForm() {
      setLoading(true);
      try {
        const breedList = await GoatRepository.getBreeds();
        setBreeds(breedList);

        if (isEditMode && id) {
          const goat = await GoatRepository.getGoatById(id);
          if (goat) {
            setName(goat.name);
            setGoatCode(goat.goatCode);
            setBreedName(goat.breedName);
            setBreedId(goat.breedId);
            setGender(goat.gender);
            setAgeMonths(goat.ageMonths);
            setWeightKg(goat.weightKg);
            setPurpose(goat.purpose);
            setPrice(goat.price);
            setDiscountPercentage(goat.discountPercentage);
            setDescription(goat.description || '');
            setVaccinationStatus(goat.vaccinationStatus || '');
            setDewormedDate(goat.dewormedDate || '');
            setParentageFatherTag(goat.parentageFatherTag || '');
            setParentageMotherTag(goat.parentageMotherTag || '');
            setStatus(goat.status);
            setPhotos(goat.photos);
          }
        }
      } catch (err) {
        console.error('Error initializing form:', err);
      } finally {
        setLoading(false);
      }
    }
    initForm();
  }, [id, isEditMode]);

  const handleBreedChange = (selectedName: string) => {
    setBreedName(selectedName);
    const found = breeds.find((b) => b.name === selectedName);
    setBreedId(found?.id || null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !farm) return;

    setUploadingPhotos(true);
    setErrorMsg(null);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await StorageService.uploadGoatPhoto(
          file,
          farm.farmCode,
          goatCode,
          photos.length + i
        );
        uploadedUrls.push(url);
      }
      setPhotos((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      console.error('Photo upload failed:', err);
      setErrorMsg(err.message || 'Failed to upload photo. Please try smaller image files.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm) return;

    if (photos.length === 0) {
      setErrorMsg('Please upload at least one photo of the goat.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      if (isEditMode && id) {
        await GoatRepository.updateGoatListing(
          id,
          {
            name: name.trim(),
            breed_name: breedName,
            breed_id: breedId,
            gender,
            age_months: Number(ageMonths),
            weight_kg: Number(weightKg),
            purpose,
            price: Number(price),
            discount_percentage: Number(discountPercentage),
            description: description.trim() || null,
            vaccination_status: vaccinationStatus.trim() || null,
            dewormed_date: dewormedDate || null,
            parentage_father_tag: parentageFatherTag.trim() || null,
            parentage_mother_tag: parentageMotherTag.trim() || null,
            status,
            updated_at: new Date().toISOString(),
          },
          photos
        );
        navigate('/farm/goats');
      } else {
        // Create new listing
        const newGoatId = await GoatRepository.createGoatListing(
          {
            farm_id: farm.id,
            name: name.trim(),
            goat_code: goatCode,
            breed_name: breedName,
            breed_id: breedId,
            gender,
            age_months: Number(ageMonths),
            weight_kg: Number(weightKg),
            purpose,
            price: Number(price),
            discount_percentage: Number(discountPercentage),
            description: description.trim() || null,
            vaccination_status: vaccinationStatus.trim() || null,
            dewormed_date: dewormedDate || null,
            parentage_father_tag: parentageFatherTag.trim() || null,
            parentage_mother_tag: parentageMotherTag.trim() || null,
            status: 'AVAILABLE',
            is_approved_by_admin: farm.isAmmalOwnFarm ? true : false,
          },
          photos
        );

        // Partner farms: prompt for ₹100 listing fee if required
        if (!farm.isAmmalOwnFarm) {
          try {
            const payRes = await RazorpayService.payListingFee({
              goatId: newGoatId,
              goatName: name.trim(),
              customerEmail: user?.email,
              farmName: farm.name,
            });

            if (!payRes.success) {
              console.warn('Listing fee payment skipped or cancelled:', payRes.error);
            }
          } catch (pErr) {
            console.warn('Razorpay checkout trigger skipped:', pErr);
          }
        }

        navigate('/farm/goats');
      }
    } catch (err: any) {
      console.error('Failed to save goat listing:', err);
      setErrorMsg(err.message || 'Failed to save goat listing.');
      setIsSubmitting(false);
    }
  };

  const finalPricePreview = calculateFinalPrice(Number(price || 0), Number(discountPercentage || 0));

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-12 space-y-6">
        <div className="h-10 w-1/3 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-96 bg-slate-200 animate-pulse rounded-3xl" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={isEditMode ? `Edit ${name} | Farm Admin` : 'List New Goat | Farm Admin'}
        path="/farm/goats/new"
      />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back Link */}
        <Link
          to="/farm/goats"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Goat Inventory
        </Link>

        <div className="pb-4 border-b border-slate-200">
          <h1 className="text-2xl font-black text-slate-900">
            {isEditMode ? `Edit Listing: ${name}` : 'List a New Goat'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Provide transparent weight, health, and pedigree records to maximize buyer confidence
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Photos */}
          <Card className="rounded-3xl border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Livestock Photos</CardTitle>
              <CardDescription className="text-xs">
                Upload clear side-profile and face pictures. Images are automatically compressed to WebP for fast mobile loading.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo Upload Zone */}
              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-6 text-center cursor-pointer hover:bg-emerald-50/80 transition-colors">
                <Upload className="h-8 w-8 text-emerald-600 mb-2" />
                <span className="text-xs font-bold text-emerald-900">
                  {uploadingPhotos ? 'Compressing and uploading...' : 'Click to Upload Photos'}
                </span>
                <span className="text-[11px] text-slate-500 mt-1">
                  JPG, PNG, WebP up to 15MB each
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhotos}
                  className="hidden"
                />
              </label>

              {/* Photos Preview Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {photos.map((url, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs"
                    >
                      <img src={url} alt={`Goat preview ${idx + 1}`} className="h-full w-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          PRIMARY
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute right-1 top-1 rounded-full bg-slate-900/80 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: General Specs */}
          <Card className="rounded-3xl border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Goat Specifications</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Goat Name / Title
                </label>
                <Input
                  required
                  placeholder="e.g. Pure Boer Stud Buck 14M"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Breed
                </label>
                <select
                  value={breedName}
                  onChange={(e) => handleBreedChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {breeds.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                  <option value="Crossbreed">Crossbreed</option>
                  <option value="Native Tamil Nadu">Native Tamil Nadu</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as GoatGender)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="MALE">MALE (Buck / Ram)</option>
                  <option value="FEMALE">FEMALE (Doe / Ewe)</option>
                  <option value="CASTRATED">CASTRATED (Wether)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Age (in Months)
                </label>
                <Input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Current Live Weight (Kg)
                </label>
                <Input
                  type="number"
                  required
                  min={5}
                  max={250}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Primary Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as GoatPurpose)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="BREEDING">BREEDING (Stud Stock & Foundation Does)</option>
                  <option value="MEAT">MEAT (Commercial / Festival / Santhai)</option>
                  <option value="MILK">MILK (Dairy Goat)</option>
                  <option value="SHOW">SHOW (Exhibition / Beauty)</option>
                  <option value="PET">PET (Farm Pet)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Pricing & Discount */}
          <Card className="rounded-3xl border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pricing & Discounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Base Price (₹)
                  </label>
                  <Input
                    type="number"
                    required
                    min={1000}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Discount (%)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={90}
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Price Preview Banner */}
              <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 font-medium">Buyer Final Price:</span>
                  <div className="text-xl font-black text-emerald-900">
                    {formatCurrency(finalPricePreview)}
                  </div>
                </div>
                {discountPercentage > 0 && (
                  <span className="text-xs font-bold text-rose-600 bg-white px-2.5 py-1 rounded-full border border-rose-200">
                    {discountPercentage}% Discount Applied
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Health & Lineage */}
          <Card className="rounded-3xl border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Health & Pedigree Lineage</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Vaccination Status
                </label>
                <Input
                  placeholder="e.g. PPR, ET, Goat Pox done"
                  value={vaccinationStatus}
                  onChange={(e) => setVaccinationStatus(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Last Dewormed Date
                </label>
                <Input
                  type="date"
                  value={dewormedDate}
                  onChange={(e) => setDewormedDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Sire (Father Tag #)
                </label>
                <Input
                  placeholder="Optional ear tag ID"
                  value={parentageFatherTag}
                  onChange={(e) => setParentageFatherTag(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Dam (Mother Tag #)
                </label>
                <Input
                  placeholder="Optional ear tag ID"
                  value={parentageMotherTag}
                  onChange={(e) => setParentageMotherTag(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Breeder Description / Detailed Notes
                </label>
                <Textarea
                  placeholder="Describe bloodline, temperament, feeding regimen, milk yield, or mating history..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/farm/goats')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
              >
                {isEditMode ? 'Update Listing' : 'Publish Goat Listing'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </>
  );
};
