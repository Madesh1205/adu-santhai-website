import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { sanitizeRedirectUrl } from '@/lib/auth/authConfig';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Mail, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

type CallbackStatus = 'processing' | 'verified' | 'recovery' | 'error';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isFarmAdmin, refreshProfile } = useAuth();

  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [targetDestination, setTargetDestination] = useState<string>('/marketplace');
  const [countdown, setCountdown] = useState<number>(5);
  const processedRef = useRef<boolean>(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      try {
        // 1. Check for error parameters in query string or URL hash
        const urlParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);

        const error = urlParams.get('error') || hashParams.get('error');
        const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
        const errorDesc = urlParams.get('error_description') || hashParams.get('error_description');

        if (error || errorCode || errorDesc) {
          console.error('Auth callback error detected:', { error, errorCode, errorDesc });
          let friendlyMessage = 'The authentication link is invalid or has expired.';

          if (errorCode === 'otp_expired' || errorDesc?.toLowerCase().includes('expired')) {
            friendlyMessage = 'This verification or reset link has expired. Please request a new one.';
          } else if (errorDesc) {
            friendlyMessage = decodeURIComponent(errorDesc.replace(/\+/g, ' '));
          }

          setErrorMessage(friendlyMessage);
          setStatus('error');
          return;
        }

        // 2. Check for PKCE exchange code in query string
        const code = urlParams.get('code');
        const nextParam = urlParams.get('next') || hashParams.get('next');
        const typeParam = urlParams.get('type') || hashParams.get('type');

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Error exchanging PKCE code:', exchangeError);
            setErrorMessage(exchangeError.message || 'Failed to establish authentication session.');
            setStatus('error');
            return;
          }

          if (data.session) {
            // Check if this was a password recovery callback
            if (typeParam === 'recovery' || nextParam?.includes('reset-password')) {
              setStatus('recovery');
              navigate('/auth/reset-password', { replace: true });
              return;
            }
          }
        }

        // 3. Check for recovery in hash (implicit flow)
        if (typeParam === 'recovery' || hashParams.get('type') === 'recovery' || nextParam?.includes('reset-password')) {
          setStatus('recovery');
          navigate('/auth/reset-password', { replace: true });
          return;
        }

        // 4. Check active session state
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await refreshProfile();

          // Trigger celebratory confetti for verified registration
          try {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#166534', '#22c55e', '#b7791f', '#f0fdf4'],
            });
          } catch {
            // ignore confetti error
          }

          const defaultDest = isFarmAdmin ? '/farm' : '/marketplace';
          const destination = sanitizeRedirectUrl(nextParam, defaultDest);
          setTargetDestination(destination);
          setStatus('verified');
        } else {
          // If no session and no explicit error, wait briefly for Supabase onAuthStateChange
          const timeout = setTimeout(() => {
            if (status === 'processing') {
              setStatus('verified');
              setTargetDestination('/login');
            }
          }, 3000);

          return () => clearTimeout(timeout);
        }
      } catch (err: any) {
        console.error('Unhandled callback exception:', err);
        setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
        setStatus('error');
      }
    };

    handleCallback();
  }, [navigate, refreshProfile, isFarmAdmin, status]);

  // Auto redirect countdown on successful verification
  useEffect(() => {
    if (status !== 'verified') return;

    if (countdown <= 0) {
      navigate(targetDestination, { replace: true });
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [status, countdown, navigate, targetDestination]);

  return (
    <>
      <SEOHead title="Authentication Callback | Adu Santhai" path="/auth/callback" />

      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white font-serif text-2xl font-black shadow-xs">
              ஆ
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Adu Santhai Verification
            </h1>
          </div>

          <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden">
            {status === 'processing' && (
              <CardContent className="py-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                  <RefreshCw className="h-7 w-7 animate-spin" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Verifying Authentication
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Securing your credentials and establishing your session...
                  </CardDescription>
                </div>
              </CardContent>
            )}

            {status === 'verified' && (
              <>
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-black text-slate-900">
                    Email Verified Successfully!
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                    Your account has been confirmed. Welcome to Ammal Farm's verified goat marketplace.
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center py-4 space-y-3">
                  <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100 text-xs text-emerald-900">
                    <p className="font-semibold">
                      Account Status: <span className="text-emerald-700 font-bold uppercase tracking-wider">Active</span>
                    </p>
                    {user?.email && (
                      <p className="text-emerald-700/80 mt-0.5 truncate">{user.email}</p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Redirecting automatically in <span className="font-bold text-slate-700">{countdown}s</span>...
                  </p>
                </CardContent>

                <CardFooter className="pb-8 pt-2 flex flex-col gap-2">
                  <Button
                    onClick={() => navigate(targetDestination, { replace: true })}
                    className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                  >
                    <span>Continue to Marketplace</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </CardFooter>
              </>
            )}

            {status === 'error' && (
              <>
                <CardHeader className="text-center pb-2 pt-8">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">
                    Link Expired or Invalid
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    {errorMessage || 'This authentication link cannot be processed or has timed out.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 py-4">
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800">
                    <p className="font-semibold mb-1">What should I do?</p>
                    <p className="text-amber-700 leading-relaxed">
                      For your security, email verification and password reset links expire after a limited time. You can request a fresh link below.
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="pb-8 pt-2 flex flex-col gap-2.5">
                  <Button
                    asChild
                    variant="default"
                    className="w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl"
                  >
                    <Link to="/auth/verify-email">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>Resend Verification Email</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full h-11 rounded-xl font-bold text-slate-700"
                  >
                    <Link to="/forgot-password">
                      <Lock className="h-4 w-4 mr-2" />
                      <span>Request Password Reset</span>
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
            )}
          </Card>
        </div>
      </div>
    </>
  );
};
