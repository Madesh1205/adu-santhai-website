-- ==============================================================================
-- SAFE USER REGISTRATION TRIGGER & PROFILE SYNC REPAIR
-- Date: 2026-10-13
-- Description: Harden handle_new_user_signup() trigger function against nulls,
-- enum type casting failures, and unhandled exceptions during Auth signUp.
-- ==============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_phone TEXT;
    v_role_str TEXT;
    v_role public.user_role;
BEGIN
    -- Extract full name safely with fallback
    v_full_name := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
        split_part(NEW.email, '@', 1),
        'Ammal User'
    );
    
    -- Extract phone safely with fallback
    v_phone := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'phone'), ''),
        NULLIF(TRIM(NEW.phone), ''),
        '+910000000000'
    );
    
    -- Extract role string and safely map/cast to user_role enum
    v_role_str := UPPER(COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''),
        'CUSTOMER'
    ));

    IF v_role_str = 'FARM_ADMIN' THEN
        v_role := 'FARM_ADMIN'::public.user_role;
    ELSIF v_role_str = 'SUPER_ADMIN' THEN
        v_role := 'SUPER_ADMIN'::public.user_role;
    ELSE
        v_role := 'CUSTOMER'::public.user_role;
    END IF;

    -- Safely upsert profile without aborting auth.users transaction
    BEGIN
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
            role = COALESCE(EXCLUDED.role, public.profiles.role),
            updated_at = NOW();
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'handle_new_user_signup profile upsert notice: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION public.handle_new_user_signup() SET search_path = public, pg_temp;

-- Ensure trigger is correctly bound to auth.users if not already bound
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
    END IF;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

COMMIT;
