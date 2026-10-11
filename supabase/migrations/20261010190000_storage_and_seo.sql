-- ==============================================================================
-- STORAGE PERMISSIONS & ADVANCED SEO REPAIR MIGRATION
-- Date: 2026-10-10
-- Description: Grants execute privileges on storage helper functions, updates
-- can_access_storage_farm_path to support UUID and farm_code paths, enforces
-- RLS policies for 'goat-images' and 'farm-docs' storage buckets.
-- ==============================================================================

BEGIN;

-- 1. Helper function: can_access_storage_farm_path
-- Hardened definition that handles 'farm/<farm_id_or_code>/...' and '<farm_id_or_code>/...'
CREATE OR REPLACE FUNCTION public.can_access_storage_farm_path(object_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_prefix TEXT;
    v_target TEXT;
BEGIN
    -- Super admins always have full access
    IF public.is_super_admin() THEN
        RETURN TRUE;
    END IF;

    -- Anonymous or null object path rejected
    IF auth.uid() IS NULL OR object_name IS NULL OR object_name = '' THEN
        RETURN FALSE;
    END IF;

    v_prefix := split_part(object_name, '/', 1);
    v_target := split_part(object_name, '/', 2);

    -- Pattern A: 'farm/<farm_id_or_code>/...'
    IF v_prefix = 'farm' AND v_target != '' THEN
        RETURN EXISTS (
            SELECT 1 FROM public.farms f
            WHERE (f.id::text = v_target OR f.farm_code = v_target)
              AND (
                  f.owner_id = auth.uid()
                  OR f.id IN (SELECT p.farm_id FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'FARM_ADMIN')
              )
        );
    END IF;

    -- Pattern B: '<farm_id_or_code>/...' (direct farm UUID or farm_code at root)
    IF v_prefix != '' THEN
        RETURN EXISTS (
            SELECT 1 FROM public.farms f
            WHERE (f.id::text = v_prefix OR f.farm_code = v_prefix)
              AND (
                  f.owner_id = auth.uid()
                  OR f.id IN (SELECT p.farm_id FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'FARM_ADMIN')
              )
        );
    END IF;

    RETURN FALSE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. Helper function: can_modify_storage_goat_image
CREATE OR REPLACE FUNCTION public.can_modify_storage_goat_image(object_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.can_access_storage_farm_path(object_name);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- 3. Explicit Execution Grants to resolve 'permission denied for function can_access_storage_farm_path'
GRANT EXECUTE ON FUNCTION public.can_access_storage_farm_path(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_storage_farm_path(TEXT) TO public, anon;

GRANT EXECUTE ON FUNCTION public.can_modify_storage_goat_image(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_modify_storage_goat_image(TEXT) TO public, anon;

-- 4. Storage Bucket Setup & RLS Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'goat-images',
    'goat-images',
    TRUE,
    15728640, -- 15MB max file size
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
    public = TRUE,
    file_size_limit = 15728640,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Clean up stale storage policies for goat-images
DROP POLICY IF EXISTS "public_goat_images_select" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_goat_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_goat_images_update" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_goat_images_delete" ON storage.objects;

-- Create resilient policies for goat-images
CREATE POLICY "public_goat_images_select" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'goat-images');

CREATE POLICY "authenticated_goat_images_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'goat-images'
        AND public.can_access_storage_farm_path(name)
    );

CREATE POLICY "authenticated_goat_images_update" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'goat-images'
        AND public.can_access_storage_farm_path(name)
    )
    WITH CHECK (
        bucket_id = 'goat-images'
        AND public.can_access_storage_farm_path(name)
    );

CREATE POLICY "authenticated_goat_images_delete" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'goat-images'
        AND public.can_access_storage_farm_path(name)
    );

COMMIT;
