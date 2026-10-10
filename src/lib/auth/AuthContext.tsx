import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, resolveStorageUrl, BUCKET_GOAT_IMAGES, clearExpiredJwtSession } from '@/lib/supabase/client';
import { getAuthCallbackUrl } from '@/lib/auth/authConfig';
import type { UserProfile, Farm, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  farm: Farm | null;
  isLoading: boolean;
  isCustomer: boolean;
  isFarmAdmin: boolean;
  isSuperAdmin: boolean;
  isEmailVerified: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string,
    role?: UserRole
  ) => Promise<{ data?: any; error: Error | null; needsEmailVerification?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<{ error: Error | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  profile: null,
  farm: null,
  isLoading: true,
  isCustomer: false,
  isFarmAdmin: false,
  isSuperAdmin: false,
  isEmailVerified: false,
  signInWithPassword: async () => ({ error: new Error('AuthProvider not initialized') }),
  signUp: async () => ({ error: new Error('AuthProvider not initialized') }),
  signOut: async () => {},
  refreshProfile: async () => {},
  resendVerificationEmail: async () => ({ error: new Error('AuthProvider not initialized') }),
  sendPasswordResetEmail: async () => ({ error: new Error('AuthProvider not initialized') }),
  updatePassword: async () => ({ error: new Error('AuthProvider not initialized') }),
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfileAndFarm = useCallback(async (userId: string, currentUser?: User | null) => {
    try {
      // 1. Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        if (profileError.code === 'PGRST303' || profileError.message?.includes('JWT expired')) {
          console.warn('Expired session token detected during profile fetch. Clearing stale session...');
          await clearExpiredJwtSession();
          setUser(null);
          setSession(null);
          setProfile(null);
          setFarm(null);
          return;
        }
        console.warn('Profile fetch notice:', profileError.message || profileError);
        setProfile(null);
        setFarm(null);
        return;
      }

      if (profileData) {
        // Find if user owns a farm or has farm association
        let farmData: Farm | null = null;
        const { data: farmResult, error: farmError } = await supabase
          .from('farms')
          .select('*')
          .eq('owner_id', userId)
          .maybeSingle();

        if (!farmError && farmResult) {
          farmData = {
            id: farmResult.id,
            name: farmResult.name,
            ownerId: farmResult.owner_id,
            tagline: farmResult.tagline,
            description: farmResult.description,
            locationDistrict: farmResult.location_district,
            locationState: farmResult.location_state,
            address: farmResult.address,
            latitude: farmResult.latitude ? Number(farmResult.latitude) : null,
            longitude: farmResult.longitude ? Number(farmResult.longitude) : null,
            contactPhone: farmResult.contact_phone,
            contactEmail: farmResult.contact_email,
            status: farmResult.status,
            isAmmalOwnFarm: farmResult.is_ammal_own_farm ?? false,
            verifiedAt: farmResult.verified_at,
            rating: Number((farmResult as any).rating ?? 5.0),
            reviewCount: Number((farmResult as any).review_count ?? 0),
            logoUrl: farmResult.logo_url ? resolveStorageUrl(farmResult.logo_url, BUCKET_GOAT_IMAGES) : null,
            bannerUrl: farmResult.banner_url ? resolveStorageUrl(farmResult.banner_url, BUCKET_GOAT_IMAGES) : null,
            goatListingLimit: Number(farmResult.goat_listing_limit ?? 2),
            farmCode: farmResult.farm_code,
            createdAt: farmResult.created_at,
            updatedAt: farmResult.updated_at,
          };
        }

        const userProfile: UserProfile = {
          id: profileData.id,
          email: profileData.email || currentUser?.email || '',
          name: (profileData as any).full_name || (profileData as any).name || currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || 'User',
          phone: profileData.phone || '',
          role: profileData.role,
          farmId: farmData?.id ?? null,
          avatarUrl: profileData.avatar_url,
          isSuspended: profileData.is_suspended ?? false,
          createdAt: profileData.created_at,
        };

        setProfile(userProfile);
        setFarm(farmData);
      } else if (currentUser) {
        // Profile record not yet created (e.g. fresh from email verification callback)
        const meta = currentUser.user_metadata || {};
        const fallbackProfile: UserProfile = {
          id: currentUser.id,
          email: currentUser.email || '',
          name: meta.name || currentUser.email?.split('@')[0] || 'User',
          phone: meta.phone || '',
          role: (meta.role as UserRole) || 'CUSTOMER',
          farmId: null,
          avatarUrl: null,
          isSuspended: false,
          createdAt: new Date().toISOString(),
        };

        // Keep the payload aligned with the database schema (profiles.full_name).
        // Supabase returns query errors instead of throwing, so inspect the result.
        const { error: profileSyncError } = await supabase.from('profiles').upsert({
          id: fallbackProfile.id,
          email: fallbackProfile.email,
          full_name: fallbackProfile.name,
          phone: fallbackProfile.phone,
          role: fallbackProfile.role,
        });

        if (profileSyncError) {
          console.warn('Profile sync notice:', profileSyncError.message);
        }

        setProfile(fallbackProfile);
      }
    } catch (err) {
      console.error('Failed to load user state:', err);
    }
  }, []);

  useEffect(() => {
    // 0. Auto-redirect if URL hash or search contains password recovery tokens
    const hash = window.location.hash.substring(1);
    const search = window.location.search.substring(1);
    const isRecovery =
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      search.includes('next=/auth/reset-password') ||
      hash.includes('next=/auth/reset-password');

    if (
      isRecovery &&
      !window.location.pathname.includes('/auth/reset-password') &&
      !window.location.pathname.includes('/reset-password')
    ) {
      window.location.href = '/auth/reset-password' + window.location.search + window.location.hash;
      return;
    }

    // Initial active session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndFarm(session.user.id, session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }).catch((err) => {
      console.error('Error getting session:', err);
      setIsLoading(false);
    });

    // Realtime auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        if (
          !window.location.pathname.includes('/auth/reset-password') &&
          !window.location.pathname.includes('/reset-password')
        ) {
          window.location.href = '/auth/reset-password';
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (newSession?.user) {
          await fetchProfileAndFarm(newSession.user.id, newSession.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setFarm(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfileAndFarm]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfileAndFarm(user.id, user);
    }
  }, [user, fetchProfileAndFarm]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) return { error };
      if (data.user) {
        await fetchProfileAndFarm(data.user.id, data.user);
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, [fetchProfileAndFarm]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    name: string,
    phone: string,
    role: UserRole = 'CUSTOMER'
  ) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: name.trim(),
            phone: cleanPhone,
            role,
          },
        },
      });

      if (error) return { error };

      if (data.user) {
        try {
          await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: cleanEmail,
              full_name: name.trim(),
              phone: cleanPhone,
              role,
            });
        } catch (profileErr: any) {
          console.warn('Profile sync notice:', profileErr.message);
        }

        // If session was not automatically provided on signup, perform immediate sign-in
        if (!data.session) {
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (!signInErr) {
            const { data: refreshedSession } = await supabase.auth.getSession();
            if (refreshedSession.session?.user) {
              await fetchProfileAndFarm(refreshedSession.session.user.id, refreshedSession.session.user);
            }
          }
        } else {
          await fetchProfileAndFarm(data.user.id, data.user);
        }
      }

      return { data, error: null, needsEmailVerification: false };
    } catch (err) {
      return { error: err as Error };
    }
  }, [fetchProfileAndFarm]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setFarm(null);
  }, []);

  const resendVerificationEmail = useCallback(async (email: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const callbackUrl = getAuthCallbackUrl();

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: callbackUrl,
        },
      });

      if (error) return { error };
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const resetRedirectUrl = getAuthCallbackUrl('/auth/reset-password');

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: resetRedirectUrl,
      });

      if (error) return { error };
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) return { error };
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const isCustomer = useMemo(() => profile?.role === 'CUSTOMER', [profile]);
  const isFarmAdmin = useMemo(() => profile?.role === 'FARM_ADMIN' || profile?.role === 'SUPER_ADMIN', [profile]);
  const isSuperAdmin = useMemo(() => profile?.role === 'SUPER_ADMIN', [profile]);
  const isEmailVerified = useMemo(() => Boolean(user?.email_confirmed_at), [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        farm,
        isLoading,
        isCustomer,
        isFarmAdmin,
        isSuperAdmin,
        isEmailVerified,
        signInWithPassword,
        signUp,
        signOut,
        refreshProfile,
        resendVerificationEmail,
        sendPasswordResetEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
}
