import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSent, setIsSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${appUrl}/reset-password`,
      });

      if (resetError) throw resetError;
      setIsSent(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead title="Forgot Password | Adu Santhai" path="/forgot-password" />

      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg">Reset Your Password</CardTitle>
              <CardDescription className="text-xs">
                Enter your account email and we'll send you a secure link to reset your password.
              </CardDescription>
            </CardHeader>

            {isSent ? (
              <CardContent className="py-6 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Check Your Inbox</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We have sent password reset instructions to <strong>{email}</strong>.
                </p>
                <Button asChild className="mt-4 w-full bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl h-11 font-bold">
                  <Link to="/login">Back to Sign In</Link>
                </Button>
              </CardContent>
            ) : (
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
                      Registered Email
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
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold h-11 rounded-xl shadow-sm"
                    isLoading={isLoading}
                  >
                    Send Reset Link
                  </Button>

                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium"
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
