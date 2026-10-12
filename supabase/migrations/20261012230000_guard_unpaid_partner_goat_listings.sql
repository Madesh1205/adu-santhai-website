-- Defense in depth: block partner-farm goat creation until a trusted Razorpay
-- order-creation/signature-verification Edge Function is deployed.
-- The old create_goat_listing_secure RPC incorrectly marked partner listings paid
-- and approved for ₹0. Ammal Farm remains exempt; Super Admin can still manage listings.
BEGIN;

CREATE OR REPLACE FUNCTION public.guard_partner_goat_listing_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_ammal boolean := false;
  v_role text;
BEGIN
  SELECT COALESCE(f.is_ammal_own_farm, false)
         OR f.id = '00000000-0000-0000-0000-000000000001'::uuid
    INTO v_is_ammal
  FROM public.farms f
  WHERE f.id = NEW.farm_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Farm not found for goat listing.';
  END IF;

  IF v_is_ammal THEN
    RETURN NEW;
  END IF;

  SELECT p.role INTO v_role
  FROM public.profiles p
  WHERE p.id = auth.uid();

  IF v_role = 'SUPER_ADMIN' THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Partner goat listings are temporarily paused until secure server-side listing payment verification is available. No listing was created.';
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_partner_goat_listing_payment ON public.goats;
CREATE TRIGGER trg_guard_partner_goat_listing_payment
BEFORE INSERT ON public.goats
FOR EACH ROW
EXECUTE FUNCTION public.guard_partner_goat_listing_payment();

REVOKE ALL ON FUNCTION public.guard_partner_goat_listing_payment() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.guard_partner_goat_listing_payment() FROM anon;
REVOKE ALL ON FUNCTION public.guard_partner_goat_listing_payment() FROM authenticated;

COMMIT;
