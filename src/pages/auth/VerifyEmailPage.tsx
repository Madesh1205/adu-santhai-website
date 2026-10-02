import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Send, Shield } from 'lucide-react';

const COOLDOWN_SECONDS = 60;
const STORAGE_PREFIX = 'adu_santhai_resend_cooldown_';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const { user, resendVerificationEmail } = useAuth();

  const [email, setEmail] = useState<string>(initialEmail || user?.email || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  // Initialize and check cooldown from localStorage
  useEffect(() => {
    if (!email) return;
    const key = `${STORAGE_PREFIX}${email.trim().toLowerCase()}`;
    const storedExpiry = localStorage.getItem(key);

    if (storedExpiry) {
      const remainingSeconds = Math.ceil((parseInt(storedExpiry, 10) - Date.now()) / 1000);
      if (remainingSeconds > 0) {
        setCooldown(remainingSeconds);
      } else {
        localStorage.removeItem(key);
      }
    }
  }, [email]);

  // Countdown timer loop
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (email) {
            localStorage.removeItem(`${STORAGE_PREFIX}${email.trim().toLowerCase()}`);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown, email]);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || cooldown > 0 || isLoading) return;

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error: resendError } = await resendVerificationEmail(cleanEmail);

      if (resendError) {
        // Handle common Supabase rate limit error
        if (resendError.message?.toLowerCase().includes('rate') || resendError.message?.toLowerCase().includes('seconds')) {
          setError('Too many requests. Please wait a few moments before requesting another email.');
        } else {
          setError(resendError.message || 'Failed to send verification email. Please check the address and try again.');
        }
        return;
      }

      // Set client-side cooldown
      const expiry = Date.now() + COOLDOWN_SECONDS * 1000;
      localStorage.setItem(`${STORAGE_PREFIX}${cleanEmail}`, expiry.toString());
      setCooldown(COOLDOWN_SECONDS);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Verification resend exception:', err);
      setError('An unexpected error occurred. Please try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Verify Email | Adu Santhai" path="/auth/verify-email" />

      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white font-serif text-2xl font-black shadow-xs">
              ஆ
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Email Verification
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Confirm your email address to access verified buyer reservations and farm features.
            </p>
          </div>

          <Card className="rounded-3xl border-slate-200 shadow-xs overflow-hidden">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                <Mail className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-bold">Check Your Email</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                We send secure verification links to activate your Adu Santhai account.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleResend}>
              <CardContent className="space-y-4">
                {isSuccess && (
                  <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3.5 border border-emerald-200 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700 mt-0.5" />
                    <div>
                      <p className="font-bold">Verification email sent!</p>
                      <p className="text-emerald-700/90 mt-0.5">
                        Please check your inbox (and spam folder) for the verification link.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 border border-red-200 text-xs text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="verify-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="verify-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 text-sm rounded-xl"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Shield className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Important Information:</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-500">
                    <li>The verification link is valid for 24 hours.</li>
                    <li>If you don't see the email, please check your Promotions or Spam folder.</li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
                <Button
                  type="submit"
                  disabled={!email || cooldown > 0 || isLoading}
                  isLoading={isLoading}
                  className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                >
                  {cooldown > 0 ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Resend in {cooldown}s</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      <span>Resend Verification Email</span>
                    </span>
                  )}
                </Button>

                <div className="flex items-center justify-between w-full px-1 text-xs text-slate-500">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1 hover:text-slate-800 font-semibold"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </Link>

                  <Link
                    to="/register"
                    className="text-emerald-800 hover:underline font-semibold"
                  >
                    Create new account
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};
