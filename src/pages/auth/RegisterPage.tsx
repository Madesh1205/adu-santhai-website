import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { FarmRepository } from '@/repositories/FarmRepository';
import type { UserRole } from '@/types';
import {
  AlertCircle,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Send,
  Shield,
} from 'lucide-react';

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
  'Chennai',
];

const COOLDOWN_SECONDS = 60;

export const RegisterPage: React.FC = () => {
  const { signUp, resendVerificationEmail } = useAuth();
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

  // Email verification required state
  const [isVerificationSent, setIsVerificationSent] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error: signUpError, needsEmailVerification } = await signUp(
        cleanEmail,
        password,
        name,
        phone,
        accountType
      );

      if (signUpError) {
        throw signUpError;
      }

      // If user registering as Farm Admin, try creating farm record if user id available
      if (accountType === 'FARM_ADMIN') {
        try {
          const farmCode = `FARM-${Math.floor(100 + Math.random() * 900)}`;
          await FarmRepository.registerFarm({
            name: farmName.trim() || `${name}'s Farm`,
            contact_phone: phone.trim(),
            contact_email: cleanEmail,
            location_district: district,
            location_state: 'Tamil Nadu',
            address: address.trim() || null,
            farm_code: farmCode,
            goat_listing_limit: 2,
          });
        } catch (farmErr) {
          console.warn('Deferred farm profile sync:', farmErr);
        }
      }

      // If email verification is required, show verification state
      if (needsEmailVerification) {
        setIsVerificationSent(true);
        setResendCooldown(COOLDOWN_SECONDS);
      } else {
        // Direct sign-in without email confirmation
        if (accountType === 'FARM_ADMIN') {
          navigate('/farm');
        } else {
          navigate('/marketplace');
        }
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Failed to create account. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error: resendError } = await resendVerificationEmail(cleanEmail);

      if (resendError) {
        if (resendError.message?.toLowerCase().includes('rate')) {
          setError('Rate limit reached. Please wait a minute before requesting another email.');
        } else {
          setError(resendError.message || 'Failed to resend verification email.');
        }
        return;
      }

      setResendSuccess(true);
      setResendCooldown(COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <SEOHead
        title={
          isVerificationSent
            ? 'Verify Email | Adu Santhai'
            : accountType === 'FARM_ADMIN'
            ? 'Partner Farm Registration'
            : 'Create Free Account | Adu Santhai'
        }
        path="/register"
      />

      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white font-serif text-2xl font-black shadow-xs">
              ஆ
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isVerificationSent
                ? 'Check Your Inbox'
                : accountType === 'FARM_ADMIN'
                ? 'Register Partner Farm'
                : 'Join Adu Santhai'}
            </h1>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isVerificationSent
                ? "We've sent a verification link to your email address."
                : accountType === 'FARM_ADMIN'
                ? "Join Ammal Farm's verified breeder network and showcase your goats directly to buyers."
                : 'Connect directly with verified breeders and reserve livestock with 24-hour holds.'}
            </p>
          </div>

          {isVerificationSent ? (
            /* Email Verification Notice Screen */
            <Card className="rounded-3xl border-slate-200 shadow-xs overflow-hidden">
              <CardHeader className="text-center pb-2 pt-8">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <Mail className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-black text-slate-900">
                  Verify Your Email
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 max-w-xs mx-auto mt-1">
                  We've sent a verification link to your email address.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 py-4 text-center">
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 text-xs text-emerald-900">
                  <p className="font-semibold text-slate-700">Verification email sent to:</p>
                  <p className="text-emerald-800 font-bold text-sm mt-0.5 break-all">{email}</p>
                </div>

                {resendSuccess && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>A new verification link has been sent to your email.</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 border border-red-200 text-xs text-red-700 text-left">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs text-slate-600 space-y-1.5 text-left">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Shield className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Next Steps:</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-500">
                    <li>Open your email inbox and look for the email from <strong>Adu Santhai</strong>.</li>
                    <li>Click the <strong>Confirm your email</strong> link inside.</li>
                    <li>You will be redirected back to the platform to start browsing or listing livestock.</li>
                  </ol>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pb-8 pt-2">
                <Button
                  onClick={handleResendVerification}
                  disabled={resendCooldown > 0 || isResending}
                  isLoading={isResending}
                  variant="outline"
                  className="w-full h-11 rounded-xl font-bold border-slate-200 hover:bg-slate-50 text-slate-700"
                >
                  {resendCooldown > 0 ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                      <span>Resend verification in {resendCooldown}s</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-emerald-700" />
                      <span>Resend Verification Email</span>
                    </span>
                  )}
                </Button>

                <Button
                  asChild
                  className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  <Link to="/login">
                    <span>Back to Sign In</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ) : (
            /* Registration Form */
            <>
              {/* Account Type Selector Tabs */}
              <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-xs font-bold border border-slate-200">
                <button
                  type="button"
                  onClick={() => setAccountType('CUSTOMER')}
                  className={`rounded-xl py-2.5 transition-all cursor-pointer ${
                    accountType === 'CUSTOMER'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Buyer / Customer
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('FARM_ADMIN')}
                  className={`rounded-xl py-2.5 transition-all cursor-pointer ${
                    accountType === 'FARM_ADMIN'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Breeder / Partner Farm
                </button>
              </div>

              <Card className="rounded-3xl border-slate-200 shadow-xs">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">
                    {accountType === 'FARM_ADMIN' ? 'Breeder Registration' : 'Create Free Account'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Fill out the required information to get started
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    {error && (
                      <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 border border-red-200 text-xs text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Personal Information */}
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="e.g. S. Murugan"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 h-11 text-sm rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Phone Number (WhatsApp Preferred)
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
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-11 text-sm rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Create Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Minimum 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 h-11 text-sm rounded-xl"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    {/* Farm Admin Specific Section */}
                    {accountType === 'FARM_ADMIN' && (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                          <Building2 className="h-4 w-4" />
                          <span>Farm Details</span>
                        </div>

                        <div>
                          <label htmlFor="farmName" className="block text-xs font-bold text-slate-700 mb-1.5">
                            Farm Name
                          </label>
                          <Input
                            id="farmName"
                            type="text"
                            placeholder="e.g. Sri Murugan Goat Farm"
                            value={farmName}
                            onChange={(e) => setFarmName(e.target.value)}
                            className="h-11 text-sm rounded-xl"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="district" className="block text-xs font-bold text-slate-700 mb-1.5">
                            Location District (Tamil Nadu)
                          </label>
                          <select
                            id="district"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-800 h-11"
                            required
                          >
                            {TAMIL_NADU_DISTRICTS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="address" className="block text-xs font-bold text-slate-700 mb-1.5">
                            Village / Full Farm Address
                          </label>
                          <Input
                            id="address"
                            type="text"
                            placeholder="Village, Taluk, Landmark"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="h-11 text-sm rounded-xl"
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <Button
                        type="submit"
                        variant="default"
                        size="default"
                        className="w-full font-bold h-11"
                        isLoading={isLoading}
                      >
                        <span>
                          {accountType === 'FARM_ADMIN' ? 'Register Partner Farm' : 'Create Free Account'}
                        </span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>

                    <div className="text-center pt-2 text-xs text-slate-500">
                      Already have an account?{' '}
                      <Link to="/login" className="font-bold text-emerald-800 hover:underline">
                        Sign in here
                      </Link>
                    </div>
                  </CardContent>
                </form>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  );
};
