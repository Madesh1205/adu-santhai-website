# Android-to-Website Feature Parity Audit

Date: 2026-10-11
Scope: `Madesh1205/Goat-livestock-App` compared with `Madesh1205/adu-santhai-website`.

## Goal

Make the website a reliable web client for the same Adu Santhai platform and Supabase backend as the Android app. Preserve working app features, data integrity, role checks, Row Level Security, SEO, accessibility, and responsive layouts. Do not delete database records or remove public/legal pages as part of UI cleanup.

## Current navigation inventory

### Android navigation routes found in `AppNavigation.kt`

- Authentication: Login, Register, Forgot Password, Profile, Account
- Customer/common: Marketplace, Goat Detail, Farm Detail, Orders, My Bookings, Wishlist, Notifications
- Legal: Privacy Policy, Terms & Conditions
- Farm Admin: Farm Dashboard, Add Goat, Farm Bookings
- Super Admin: Super Admin Dashboard, Pending Approvals, Manage Farms, All Goat Listings

The Android app also has deeper feature screens/components and repository-driven workflows; these must be audited separately rather than inferred from route names alone.

### Website routes found in `src/routes/AppRouter.tsx`

- Public: Home, Marketplace, Goat Detail, Farms, Farm Detail
- Legal: Privacy, Terms, Refund Policy
- Auth: Login, Register, Forgot Password, Reset Password, Auth Callback
- Customer: My Bookings, Wishlist, Notifications, Profile
- Farm Admin: Dashboard, My Goats, Create/Edit Goat, Bookings, Farm Settings
- Super Admin: Dashboard, Goat Moderation, Farm Moderation, Reports, Bookings, Users

## Initial parity gaps to verify

- [x] Account deletion: website now calls the server-authoritative `delete_user_account(p_user_id)` RPC instead of deleting profile/wishlist rows directly; website UI blocks self-deletion for SUPER_ADMIN. Build/runtime verification and deployed-RPC availability still need checking.
- [ ] Remaining Account screen parity: compare theme selection, refresh profile, logout confirmation, and role-specific navigation.
- [ ] Android Orders and My Bookings versus website My Bookings: compare their actual semantics and statuses; do not merge them until confirmed.
- [ ] Android Pending Approvals / Manage Farms / All Goat Listings versus website admin pages: compare every action, filter, state, and approval/payment rule.
- [ ] Android goat listing details and image gallery versus website create/edit forms: compare every field, validation, upload/replacement/deletion, and listing status.
- [x] Customer reservations: added search by goat/farm/booking code/status and filters for pending, reserved, confirmed, completed, cancelled, and expired records.
- [x] Booking status changes in both Farm Admin and Super Admin repositories now use server-side `confirm_booking`, `complete_booking`, and `cancel_booking` RPCs instead of direct browser updates to `bookings` and `goats`; database authorization, lifecycle triggers, and notifications remain authoritative.
- [ ] Customer booking lifecycle, 24-hour holds/expiry, cancellation, and farm/admin updates: verify end-to-end with customer and farm accounts.
- [x] Notification center: added live Supabase notification updates, mark-all-read error handling, mark-as-read actions, and safe navigation for recognized goat/farm/booking/report/user links. Still needs browser testing and role-specific deep-link validation.
- [x] Notification center now has All/Unread/Bookings/Approvals/Payments/System filters, per-notification delete, clear-all with confirmation, role-aware approvals visibility, real-time inserts, mark-as-read actions, and role-aware workflow links.
- [ ] Validate notification category mapping and deep links against every deployed notification event type using test accounts.
- [ ] Reviews, reports, and moderation workflows: verify availability and permissions across both clients.
- [ ] Farm verification documents, listing quotas/fees, approval/payment workflow, and Ammal Farm fee exemption.
- [ ] Wishlist consistency, sorting/filtering, location relevance, and goat availability synchronization.
- [ ] Auth parity: immediate sign-in after registration, password reset redirect, session restoration, and role refresh.
- [ ] Image storage path compatibility across web and Android, including legacy paths; never delete files merely because a path looks old.
- [ ] SEO and legal routes remain public and functional; remove duplicate marketing/visual sections only after checking navigation and conversion needs.

## Cleanup rules

1. Remove duplicate or dead UI/routes only after searching all imports, links, deep links, and tests.
2. Do not remove useful web-only SEO, sitemap, structured data, legal pages, or public listing pages.
3. Do not alter production database schema or RLS as a side effect of frontend cleanup.
4. Keep role authorization enforced server-side/RLS; hiding a button is not authorization.
5. Do not remove or overwrite Storage objects as part of website feature cleanup.
6. Avoid changing business rules just to make the website look similar; confirm the Android repository and Supabase implementation first.

## Validation checklist

- [x] Add GitHub Actions CI workflow to run TypeScript check and production build on feature branches, main pushes, and pull requests.
- [ ] Confirm CI workflow passes: `bun run lint` and `bun run build`
- [ ] Customer auth, marketplace, details, wishlist, booking, cancellation, notifications
- [x] Farm Admin booking list: added search by goat/customer/booking code/status and filters for cancelled and expired reservations.
- [ ] Farm Admin CRUD, images, booking management, settings and quota behavior
- [ ] Super Admin approvals, moderation, users, reports, booking oversight and payment workflow
- [ ] Responsive mobile and desktop navigation
- [ ] Confirm no service-role credentials are present in browser code
- [ ] Verify no unrelated database or Storage records are changed

## Status

Initial route inventory completed. Functional changes made on this branch: account deletion delegates to the server-side RPC and protects the SUPER_ADMIN account in the UI; the notification center now supports real-time updates, mark-as-read actions, and recognized deep links; customer reservations and Farm Admin bookings now have search and status filters; booking status transitions now use secure database RPCs in both Farm Admin and Super Admin repositories. CI passed on the earlier baseline, but the newest notification changes are awaiting fresh CI results. Detailed screen-by-screen comparison and build/runtime verification are still pending. This document is an audit checklist, not a claim that feature parity has already been implemented.
