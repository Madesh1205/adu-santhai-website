import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
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
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string, phone: string, role?: UserRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfileAndFarm = useCallback(async (userId: string) => {
    try {
      // 1. Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
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
            rating: Number(farmResult.rating ?? 5.0),
            reviewCount: Number(farmResult.review_count ?? 0),
            logoUrl: farmResult.logo_url,
            bannerUrl: farmResult.banner_url,
            goatListingLimit: Number(farmResult.goat_listing_limit ?? 2),
            farmCode: farmResult.farm_code,
            createdAt: farmResult.created_at,
            updatedAt: farmResult.updated_at,
          };
        }

        const userProfile: UserProfile = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          phone: profileData.phone,
          role: profileData.role,
          farmId: farmData?.id ?? null,
          avatarUrl: profileData.avatar_url,
          isSuspended: profileData.is_suspended ?? false,
          createdAt: profileData.created_at,
        };

        setProfile(userProfile);
        setFarm(farmData);
      }
    } catch (err) {
      console.error('Failed to load user state:', err);
    }
  }, []);

  useEffect(() => {
    // Initial active session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndFarm(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Realtime auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (newSession?.user) {
          await fetchProfileAndFarm(newSession.user.id);
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
      await fetchProfileAndFarm(user.id);
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
        await fetchProfileAndFarm(data.user.id);
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
        // Insert or upsert to profiles table to ensure record is synced
        const { error: profileErr } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: cleanEmail,
            name: name.trim(),
            phone: cleanPhone,
            role,
          });

        if (profileErr) {
          console.warn('Profile sync warning:', profileErr.message);
        }
        await fetchProfileAndFarm(data.user.id);
      }

      return { error: null };
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

  const isCustomer = useMemo(() => profile?.role === 'CUSTOMER', [profile]);
  const isFarmAdmin = useMemo(() => profile?.role === 'FARM_ADMIN' || profile?.role === 'SUPER_ADMIN', [profile]);
  const isSuperAdmin = useMemo(() => profile?.role === 'SUPER_ADMIN', [profile]);

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
        signInWithPassword,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
