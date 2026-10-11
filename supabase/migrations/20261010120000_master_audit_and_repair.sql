-- ==============================================================================
-- MASTER AUDIT & REPAIR MIGRATION FOR ADU SANTHAI ECOSYSTEM
-- Date: 2026-10-10
-- Description: Idempotent migration addressing notification insertion safeguards,
-- payment_status enum extensions ('PAID'), profile name synchronization,
-- and RLS/function security hardening.
-- ==============================================================================

BEGIN;

-- 1. Ensure 'PAID' exists in public.payment_status enum
DO $$ 
BEGIN
    ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'PAID';
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Harden create_system_notification function to safely handle null recipients and trap exceptions
CREATE OR REPLACE FUNCTION public.create_system_notification(
    p_user_id UUID,
    p_title TEXT,
    p_body TEXT,
    p_link_type TEXT DEFAULT 'GENERAL',
    p_link_id TEXT DEFAULT NULL,
    p_event_key TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_notification_id UUID := gen_random_uuid();
BEGIN
    -- Do not attempt insert if recipient user_id is null
    IF p_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    INSERT INTO public.notifications (
        id, user_id, title, body, link_type, link_id, event_key, is_read, created_at
    ) VALUES (
        v_notification_id, p_user_id, p_title, p_body, p_link_type, p_link_id, p_event_key, FALSE, NOW()
    )
    ON CONFLICT (user_id, event_key) WHERE event_key IS NOT NULL
    DO NOTHING;

    RETURN v_notification_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Prevent notification failures from aborting primary transactions (bookings, listings, moderation)
        RAISE WARNING 'create_system_notification failed gracefully: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION public.create_system_notification(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) SET search_path = public, pg_temp;

-- 3. Secure is_super_admin function search_path and execution grants
DO $$
BEGIN
    ALTER FUNCTION public.is_super_admin() SET search_path = public, pg_temp;
    REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon;
    GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;
EXCEPTION
    WHEN undefined_function THEN NULL;
END $$;

-- 4. Ensure fcm_device_tokens table and secure RLS policies exist
CREATE TABLE IF NOT EXISTS public.fcm_device_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    platform TEXT DEFAULT 'android',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.fcm_device_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fcm_tokens_select_policy" ON public.fcm_device_tokens;
DROP POLICY IF EXISTS "fcm_tokens_insert_policy" ON public.fcm_device_tokens;
DROP POLICY IF EXISTS "fcm_tokens_update_policy" ON public.fcm_device_tokens;
DROP POLICY IF EXISTS "fcm_tokens_delete_policy" ON public.fcm_device_tokens;

CREATE POLICY "fcm_tokens_select_policy" ON public.fcm_device_tokens
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "fcm_tokens_insert_policy" ON public.fcm_device_tokens
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "fcm_tokens_update_policy" ON public.fcm_device_tokens
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "fcm_tokens_delete_policy" ON public.fcm_device_tokens
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- 5. Harmonize profile signup trigger to support both full_name and name metadata
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_phone TEXT;
    v_role TEXT;
    v_farm_name TEXT;
BEGIN
    v_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        split_part(NEW.email, '@', 1),
        'Ammal User'
    );
    
    v_phone := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''),
        NULLIF(TRIM(NEW.phone), ''),
        '+910000000000'
    );
    
    v_role := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''),
        'CUSTOMER'
    );

    INSERT INTO public.profiles (
        id, email, full_name, phone, role, created_at, updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        v_full_name,
        v_phone,
        v_role,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION public.handle_new_user_signup() SET search_path = public, pg_temp;

COMMIT;
