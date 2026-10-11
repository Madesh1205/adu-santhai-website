# Implementation Plan - Goat Image Upload, Storage Permissions & Advanced SEO

Fix the `permission denied for function can_access_storage_farm_path` storage error, enhance the multi-image upload experience, audit goat listing workflows, and implement advanced technical SEO, structured data, and Google Images optimization.

---

## User Review Required

> [!IMPORTANT]
> **Key Selections & Architectural Choices**:
> 1. **Storage Path Pattern**:
>    - `farm/<farm_id>/<goat_code>/<timestamp>_<index>.webp` (e.g., `farm/d3b07384-d113-44f2-a270-b186b5103a8a/GOAT-008/174208000_0.webp`).
> 2. **SQL Permissions Delivery**:
>    - SQL script generated at `/supabase/migrations/20261010190000_storage_and_seo.sql` for manual execution in the Supabase Dashboard SQL Editor.
> 3. **Google Shopping Policy Finding**:
>    - Live livestock (live goats) are strictly prohibited from Google Merchant Center / Google Shopping ad feeds according to official policy. We will maximize discovery on **Google Search** and **Google Images** via rich `Product`, `Offer`, and `BreadcrumbList` JSON-LD structured data.

---

## Proposed Changes

### Priority 1: Fix Storage Permissions & Goat Photo Upload Workflow

#### A. Supabase Database Permissions & RLS (`/supabase/migrations/20261010190000_storage_and_seo.sql`)
- **Grant Execute Privileges**:
  - `GRANT EXECUTE ON FUNCTION public.can_access_storage_farm_path(TEXT) TO authenticated;`
  - `GRANT EXECUTE ON FUNCTION public.can_access_storage_farm_path(TEXT) TO public, anon;`
  - `GRANT EXECUTE ON FUNCTION public.can_modify_storage_goat_image(TEXT) TO authenticated;`
- **Harden Storage Helper Functions**:
  - Update `public.can_access_storage_farm_path(object_name TEXT)` with `SECURITY DEFINER` and `SET search_path = public, pg_temp`.
  - Ensure path resolution supports `farm/<farm_id>/...`, `<farm_id>/...`, and `farm_code` prefixes (checking both `f.id::text` and `f.farm_code`).
- **Storage Bucket RLS Policies (`storage.objects`)**:
  - `goat-images` SELECT policy: Allow public read access for all objects (`bucket_id = 'goat-images'`).
  - `goat-images` INSERT/UPDATE/DELETE policy: Require `auth.role() = 'authenticated'` and `public.can_access_storage_farm_path(name)`.

#### B. Client-Side Upload Service & Form UI (`src/services/StorageService.ts` & `src/pages/farm/GoatFormPage.tsx`)
- **Path Pattern Update**:
  - Modify `StorageService.uploadGoatPhoto()` to use `farm/${farmId}/${cleanGoatCode}/${timestamp}_${index}.webp`.
- **Image Validation & WebP Compression**:
  - Validate file types (JPG, PNG, WebP) and enforce a max file size limit ($15\text{ MB}$).
  - Compress images in canvas to high-quality WebP ($1920\times 1080\text{ max}$).
- **Interactive UI Feedback**:
  - Display instant local object previews (`URL.createObjectURL`) before uploading.
  - Show per-image upload progress indicators, clear error alerts, and retry buttons for failed uploads.
  - Support smooth photo removal and replacement without orphaned storage paths.

---

### Priority 2: End-to-End Goat Listing Audit

- **Data Integrity & DTO Compatibility**:
  - Verify fields (`name`, `goat_code`, `breed_id`, `gender`, `age_months`, `weight_kg`, `price`, `discount_percentage`, `description`) across database constraints, React repositories, and Android DTOs.
  - Confirm listing approval/rejection moderation flows and quota limits.

---

### Priority 3: Technical SEO, Structured Data & Google Images

#### A. Structured Data (JSON-LD)
- **`Product` & `Offer` Schema (`src/pages/GoatDetailPage.tsx`)**:
  - Embed JSON-LD structured data for public goat listings with canonical URL, image URLs, price (`INR`), availability (`InStock`), breed, and seller details (`Ammal Farm`).
- **`BreadcrumbList` & `WebSite` Schema**:
  - Ensure breadcrumb hierarchies and site name signals (`Ammal Farm Adu Santhai`) are rendered in page heads.

#### B. Sitemaps & Metadata (`public/sitemap.xml` & `public/robots.txt`)
- Update `public/sitemap.xml` to include image schema extensions (`xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`).
- Ensure `robots.txt` explicitly allows public crawling of goat listings and images while disallowing `/admin`, `/farm`, and `/auth` routes.

---

### Priority 4: Local SEO & Geographic Discoverability

- Embed verified business identity, address (K.V. Kuppam, Vellore, Tamil Nadu - 632209), and contact phone (`+91 63808 98358`) in schema and footers.

---

## Verification Plan

### Automated Verification
- Run `npm run lint` (`tsc --noEmit`) to verify zero TypeScript errors.
- Run `npm run build` (`compile_applet`) to verify production bundle output.

### Manual Verification
1. Test uploading goat photos in **List a New Goat** form as a Farm Admin:
   - Verify local previews appear immediately.
   - Verify upload completes without `permission denied for function can_access_storage_farm_path`.
   - Verify uploaded images persist and display on refresh.
2. Inspect `sitemap.xml` and HTML heads for valid JSON-LD `Product` and `Offer` schema.
