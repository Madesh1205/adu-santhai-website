import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import { MainLayout } from '@/layouts/MainLayout';
import { FarmAdminLayout } from '@/layouts/FarmAdminLayout';
import { SuperAdminLayout } from '@/layouts/SuperAdminLayout';

// Route Guards
import { ProtectedRoute, RequireFarmAdmin, RequireSuperAdmin } from '@/lib/auth/RouteGuards';

// Public & Marketplace Pages
import { HomePage } from '@/pages/HomePage';
import { MarketplacePage } from '@/pages/MarketplacePage';
import { GoatDetailPage } from '@/pages/GoatDetailPage';
import { FarmsPage } from '@/pages/FarmsPage';
import { FarmDetailPage } from '@/pages/FarmDetailPage';

// Policy Pages
import { PrivacyPolicyPage } from '@/pages/policy/PrivacyPolicyPage';
import { TermsPage } from '@/pages/policy/TermsPage';
import { RefundPolicyPage } from '@/pages/policy/RefundPolicyPage';

// Auth Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage';

// Customer Pages
import { MyBookingsPage } from '@/pages/customer/MyBookingsPage';
import { WishlistPage } from '@/pages/customer/WishlistPage';
import { NotificationsPage } from '@/pages/customer/NotificationsPage';
import { ProfilePage } from '@/pages/customer/ProfilePage';

// Farm Admin Pages
import { FarmDashboard } from '@/pages/farm/FarmDashboard';
import { MyGoatsPage } from '@/pages/farm/MyGoatsPage';
import { GoatFormPage } from '@/pages/farm/GoatFormPage';
import { FarmBookingsPage } from '@/pages/farm/FarmBookingsPage';
import { FarmSettingsPage } from '@/pages/farm/FarmSettingsPage';

// Super Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { GoatModerationPage } from '@/pages/admin/GoatModerationPage';
import { FarmModerationPage } from '@/pages/admin/FarmModerationPage';
import { ReportsModerationPage } from '@/pages/admin/ReportsModerationPage';
import { AdminBookingsPage } from '@/pages/admin/AdminBookingsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with Main Layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/goats/:id" element={<GoatDetailPage />} />
        <Route path="/farms" element={<FarmsPage />} />
        <Route path="/farms/:id" element={<FarmDetailPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/register-farm" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/verify-email" element={<Navigate to="/login" replace />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Customer Protected Routes */}
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Farm Admin Portal with FarmAdminLayout & Guard */}
      <Route
        path="/farm"
        element={
          <RequireFarmAdmin>
            <FarmAdminLayout />
          </RequireFarmAdmin>
        }
      >
        <Route index element={<Navigate to="/farm/dashboard" replace />} />
        <Route path="dashboard" element={<FarmDashboard />} />
        <Route path="goats" element={<MyGoatsPage />} />
        <Route path="goats/new" element={<GoatFormPage />} />
        <Route path="goats/:id/edit" element={<GoatFormPage />} />
        <Route path="bookings" element={<FarmBookingsPage />} />
        <Route path="settings" element={<FarmSettingsPage />} />
      </Route>

      {/* Super Admin Control Hub with SuperAdminLayout & Guard */}
      <Route
        path="/admin"
        element={
          <RequireSuperAdmin>
            <SuperAdminLayout />
          </RequireSuperAdmin>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="goats" element={<GoatModerationPage />} />
        <Route path="farms" element={<FarmModerationPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="reports" element={<ReportsModerationPage />} />
      </Route>

      {/* Fallback Catch-All Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
