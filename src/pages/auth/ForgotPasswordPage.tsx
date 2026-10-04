import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, RefreshCw, Send, Shield } from 'lucide-react';

const COOLDOWN_SECONDS = 60;
const STORAGE_PREFIX = 'adu_santhai_forgot_cooldown_';

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordResetEmail } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || cooldown > 0 || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Check if user exists in the database profiles
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (profileError) {
        console.warn('Profile existence check note:', profileError);
      }

      if (!userProfile) {
        setError('No registered account was found with this email address. Please check your spelling or sign up for a new account.');
        setIsLoading(false);
        return;
      }

      // 2. User exists: send password reset link
      const { error: resetError } = await sendPasswordResetEmail(cleanEmail);

      if (resetError) {
        if (resetError.message?.toLowerCase().includes('rate')) {
          setError('Rate limit reached. Please wait a minute before requesting another reset email.');
        } else {
          setError(resetError.message || 'Failed to send password reset email. Please try again.');
        }
        return;
      }

      const expiry = Date.now() + COOLDOWN_SECONDS * 1000;
      localStorage.setItem(`${STORAGE_PREFIX}${cleanEmail}`, expiry.toString());
      setCooldown(COOLDOWN_SECONDS);
      setIsSent(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Forgot Password | Adu Santhai" path="/forgot-password" />

      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl overflow-hidden bg-white shadow-sm border border-emerald-800/15 hover:border-emerald-800 transition-colors">
                <img
                  src="/logo.png"
                  alt="Ammal Farm Adu Santhai"
                  className="h-full w-full object-contain p-1"
                />
              </div>
            </Link>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Password Recovery
            </h1>
          </div>

          <Card className="rounded-3xl border-slate-200 shadow-xs overflow-hidden">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg font-bold">Reset Your Password</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Enter your account email and we'll send you a secure link to reset your password.
              </CardDescription>
            </CardHeader>

            {isSent ? (
              <>
                <CardContent className="py-6 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-base">Check Your Inbox</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      If an account exists for <strong className="text-slate-800">{email}</strong>, you will receive password reset instructions.
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-600 text-left space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Shield className="h-3.5 w-3.5 text-emerald-700" />
                      <span>Security Notice:</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-500">
                      <li>The reset link expires after 15 minutes.</li>
                      <li>Never share this link with anyone.</li>
                      <li>Check your spam or junk folder if you don't receive it shortly.</li>
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2.5 pb-8 pt-0">
                  <Button
                    onClick={handleSubmit}
                    disabled={cooldown > 0 || isLoading}
                    variant="outline"
                    className="w-full h-11 rounded-xl font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    {cooldown > 0 ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-slate-400" />
                        <span>Resend in {cooldown}s</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-emerald-700" />
                        <span>Resend Reset Link</span>
                      </span>
                    )}
                  </Button>

                  <Button asChild className="w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl h-11 font-bold">
                    <Link to="/login">Back to Sign In</Link>
                  </Button>
                </CardFooter>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 border border-red-200 text-xs text-red-700">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="reset-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 text-sm rounded-xl"
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2 pb-8">
                  <Button
                    type="submit"
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-11 rounded-xl"
                    isLoading={isLoading}
                    disabled={!email || cooldown > 0}
                  >
                    {cooldown > 0 ? `Please wait ${cooldown}s` : 'Send Reset Link'}
                  </Button>

                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                  </Link>
                </CardFooter>
              </form>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};
