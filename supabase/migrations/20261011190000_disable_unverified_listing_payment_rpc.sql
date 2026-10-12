-- Security hotfix: prevent browser clients from declaring Razorpay payments verified.
-- The existing SECURITY DEFINER RPC stores caller-supplied IDs/signatures but does not
-- cryptographically verify the Razorpay signature or fetch payment status from Razorpay.
-- Re-enable only after a trusted Edge Function performs order creation and signature
-- verification with server-only RAZORPAY_KEY_SECRET.
BEGIN;
REVOKE EXECUTE ON FUNCTION public.verify_listing_payment_atomic(uuid, text, text, text, numeric, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_listing_payment_atomic(uuid, text, text, text, numeric, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.verify_listing_payment_atomic(uuid, text, text, text, numeric, text) FROM authenticated;
COMMIT;
