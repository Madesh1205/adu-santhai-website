import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword, signOut } = useAuth();

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [isVerifyingSession, setIsVerifyingSession] = useState<boolean>(true);
  const [hasValidSession, setHasValidSession] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Password validation rules
  const isMinLength = password.length >= 6;
  const isMatching = password.length > 0 && password === confirmPassword;
  const isFormValid = isMinLength && isMatching;

  useEffect(() => {
    const verifyRecoverySession = async () => {
      try {
        // 1. Check if PKCE code is in query string
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (!exchangeError && data.session) {
            setHasValidSession(true);
            setIsVerifyingSession(false);
            return;
          }
        }

        // 2. Check if active session exists
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasValidSession(true);
          setIsVerifyingSession(false);
          return;
        }

        // 3. Listen for auth state change in case of implicit hash processing
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED'))) {
            setHasValidSession(true);
            setIsVerifyingSession(false);
          }
        });

        // Give implicit hash a moment to process
        const timer = setTimeout(() => {
          setIsVerifyingSession(false);
        }, 1500);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err) {
        console.error('Session verification exception:', err);
        setIsVerifyingSession(false);
      }
    };

    verifyRecoverySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        throw updateError;
      }

      // Security practice: sign out the recovery session so user logs in cleanly with new credentials
      try {
        await signOut();
      } catch {
        // ignore sign out error
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error('Password reset failure:', err);
      setError(err.message || 'Failed to update password. Your reset link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead title="Set New Password | Adu Santhai" path="/auth/reset-password" />

      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-sm border border-emerald-800/15 hover:border-emerald-800 transition-colors">
                <img
                  src="/logo.jpg"
                  alt="Ammal Farm Adu Santhai"
                  className="h-full w-full object-contain p-1"
                />
              </div>
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Adu Santhai Account Security
            </h1>
          </div>

          <Card className="rounded-3xl border-slate-200 shadow-xs overflow-hidden">
            {isVerifyingSession ? (
              <CardContent className="py-12 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-800 animate-pulse">
                  <Lock className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Verifying Reset Session
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Checking the security token of your password reset request...
                  </CardDescription>
                </div>
              </CardContent>
            ) : isSuccess ? (
              <>
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-black text-slate-900">
                    Password Reset Complete
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 max-w-xs mx-auto mt-1">
                    Your password has been updated successfully.
                  </CardDescription>
                </CardHeader>

                <CardContent className="py-4 text-center">
                  <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 text-xs text-emerald-900">
                    <p className="font-semibold">Security Update Confirmed</p>
                    <p className="text-emerald-700/80 mt-1">
                      You can now sign in to your Ammal Farm account using your new password.
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="pb-8 pt-2">
                  <Button
                    onClick={() => navigate('/login', { replace: true })}
                    className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                  >
                    <span>Continue to Sign In</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </CardFooter>
              </>
            ) : !hasValidSession ? (
              <>
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Invalid or Expired Link
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    This password reset link is invalid, already used, or has expired.
                  </CardDescription>
                </CardHeader>

                <CardContent className="py-4 space-y-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 leading-relaxed">
                    Password reset tokens are single-use and time-limited for the safety of your farm account. Please generate a fresh link.
                  </div>
                </CardContent>

                <CardFooter className="pb-8 pt-2 flex flex-col gap-2.5">
                  <Button
                    asChild
                    variant="default"
                    className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                  >
                    <Link to="/forgot-password">
                      Request New Reset Link
                    </Link>
                  </Button>

                  <Link
                    to="/login"
                    className="text-xs text-center font-semibold text-slate-500 hover:text-slate-800 pt-1"
                  >
                    Back to Sign In
                  </Link>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 text-emerald-800 mb-1">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Account Recovery</span>
                  </div>
                  <CardTitle className="text-xl font-black text-slate-900">
                    Create New Password
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Enter a new strong password for your Adu Santhai account.
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

                    {/* New Password */}
                    <div>
                      <label htmlFor="new-password" className="block text-xs font-bold text-slate-700 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="new-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-11 text-sm rounded-xl"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 pr-10 h-11 text-sm rounded-xl"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Validation Indicators */}
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            isMinLength ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        />
                        <span className={isMinLength ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                          At least 6 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            isMatching ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        />
                        <span className={isMatching ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                          Passwords match
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      isLoading={isSubmitting}
                      className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                    >
                      Update Password
                    </Button>

                    <Link
                      to="/login"
                      className="text-xs text-center font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Cancel and return to Sign In
                    </Link>
                  </CardFooter>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};
