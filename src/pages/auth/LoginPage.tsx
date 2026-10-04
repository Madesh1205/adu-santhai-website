import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { SEOHead } from '@/components/common/SEOHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertCircle, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await signInWithPassword(email, password);

    if (signInError) {
      setIsLoading(false);
      const errMsg = signInError.message || '';
      setError(errMsg || 'Invalid email or password. Please try again.');
    } else {
      navigate(redirectUrl, { replace: true });
    }
  };

  return (
    <>
      <SEOHead title="Sign In | Adu Santhai" path="/login" />

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
              Welcome to Adu Santhai
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Sign in to manage your 24h reservations, saved goats, or farm listings.
            </p>
          </div>

          <Card className="rounded-3xl border-slate-200 shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sign In</CardTitle>
              <CardDescription className="text-xs">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-xl bg-red-50 p-3.5 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

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
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-emerald-800 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 text-sm rounded-xl"
                      required
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

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="default"
                    size="default"
                    className="w-full font-bold h-11"
                    isLoading={isLoading}
                  >
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="text-center pt-2 text-xs text-slate-500">
                  <div>
                    Don't have an account?{' '}
                    <Link to="/register" className="font-bold text-emerald-800 hover:underline">
                      Create free account
                    </Link>
                  </div>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};
