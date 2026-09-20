import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { FarmRepository } from '@/repositories/FarmRepository';
import type { UserRole } from '@/types';
import { AlertCircle, Lock, Mail, User, Phone, Building2, MapPin, ArrowRight } from 'lucide-react';

const TAMIL_NADU_DISTRICTS = [
  'Tiruvannamalai',
  'Vellore',
  'Salem',
  'Dharmapuri',
  'Krishnagiri',
  'Madurai',
  'Tiruchirappalli',
  'Coimbatore',
  'Erode',
  'Tirunelveli',
  'Thanjavur',
  'Dindigul',
  'Namakkal',
  'Villupuram',
  'Cuddalore',
  'Kallakurichi',
  'Karur',
  'Theni',
  'Virudhunagar',
  'Ramanathapuram',
  'Sivaganga',
  'Thoothukudi',
  'Kanchipuram',
  'Chengalpattu',
  'Tiruvallur',
  'Chennai',
];

export const RegisterPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFarmModeDefault = searchParams.get('type') === 'farm' || window.location.pathname === '/register-farm';

  const [accountType, setAccountType] = useState<UserRole>(isFarmModeDefault ? 'FARM_ADMIN' : 'CUSTOMER');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Farm-specific fields
  const [farmName, setFarmName] = useState<string>('');
  const [district, setDistrict] = useState<string>('Tiruvannamalai');
  const [address, setAddress] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await signUp(
        email,
        password,
        name,
        phone,
        accountType
      );

      if (signUpError) {
        throw signUpError;
      }

      // If registering as a Farm Admin, create farm record
      if (accountType === 'FARM_ADMIN') {
        const farmCode = `FARM-${Math.floor(100 + Math.random() * 900)}`;
        // We will insert farm for this owner
        await FarmRepository.registerFarm({
          name: farmName.trim() || `${name}'s Farm`,
          contact_phone: phone.trim(),
          contact_email: email.trim().toLowerCase(),
          location_district: district,
          location_state: 'Tamil Nadu',
          address: address.trim() || null,
          farm_code: farmCode,
          goat_listing_limit: 2,
        });

        navigate('/farm/dashboard');
      } else {
        navigate('/marketplace');
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Failed to create account. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title={accountType === 'FARM_ADMIN' ? 'Partner Farm Registration' : 'Create Customer Account'}
        path="/register"
      />

      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-md shadow-emerald-200">
              AS
            </div>
            <h1 className="text-2xl font-black text-slate-900">
              {accountType === 'FARM_ADMIN' ? 'Register Partner Farm' : 'Join Adu Santhai'}
            </h1>
            <p className="text-xs text-slate-500">
              {accountType === 'FARM_ADMIN'
                ? 'Join Ammal Farm\'s verified network and showcase your livestock to thousands of buyers'
                : 'Connect with verified goat farmers and reserve livestock with 24-hour holds'}
            </p>
          </div>

          {/* Account Type Selector Tabs */}
          <div className="grid grid-cols-2 rounded-2xl bg-slate-200/80 p-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setAccountType('CUSTOMER')}
              className={`rounded-xl py-2 transition-all cursor-pointer ${
                accountType === 'CUSTOMER'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Buyer / Customer
            </button>
            <button
              type="button"
              onClick={() => setAccountType('FARM_ADMIN')}
              className={`rounded-xl py-2 transition-all cursor-pointer ${
                accountType === 'FARM_ADMIN'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Goat Farmer / Breeder
            </button>
          </div>

          <Card className="rounded-3xl border-slate-200 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {accountType === 'FARM_ADMIN' ? 'Farm & Farmer Details' : 'Account Information'}
              </CardTitle>
              <CardDescription className="text-xs">
                Fill in your accurate details for platform verification
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Madesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Additional Fields for Farm Admin */}
                {accountType === 'FARM_ADMIN' && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Farm Name
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          type="text"
                          required
                          placeholder="e.g. Madesh Goat Breeding Farm"
                          value={farmName}
                          onChange={(e) => setFarmName(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          District
                        </label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {TAMIL_NADU_DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                          Farm Address / Village
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="e.g. Kilpennathur Road"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-md shadow-emerald-700/20"
                  isLoading={isLoading}
                >
                  {accountType === 'FARM_ADMIN' ? 'Register Farm & Sign Up' : 'Create Customer Account'}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>

                <p className="text-center text-xs text-slate-500">
                  Already registered?{' '}
                  <Link to="/login" className="font-bold text-emerald-700 hover:underline">
                    Sign in here
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};
