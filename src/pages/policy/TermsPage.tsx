import React from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { ShieldCheck, FileCheck2, AlertCircle, Building2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Terms & Conditions | Adu Santhai – Ammal Farm"
        description="Terms of Service and Marketplace Rules for Adu Santhai associated with Ammal Farm."
        path="/terms"
      />

      <div className="bg-slate-50 min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-8">
            <div className="border-b border-slate-100 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-100">
                <ShieldCheck className="h-4 w-4" /> Platform Governance
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms & Conditions</h1>
              <p className="text-sm text-slate-500 mt-2">
                Last updated: October 2, 2026 • Adu Santhai (Ammal Farm Platform)
              </p>
            </div>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-emerald-800" /> 1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the Adu Santhai web application, mobile views, or services associated with Ammal Farm, you agree to comply with these Terms and Conditions. If you do not agree with any part, please discontinue use.
              </p>
            </section>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-800" /> 2. Breeder & Farm Regulations
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Verification Requirement:</strong> Partner farms must complete farm registration and admin verification before goat listings become active on the public marketplace.</li>
                <li><strong>Listing Fee Waiving:</strong> Ammal Farm (`FARM-001`, `is_ammal_own_farm`) is the central platform hub and receives automatic listing fee waivers. Partner farms adhere to standard listing fee terms.</li>
                <li><strong>Accurate Livestock Data:</strong> Farm admins guarantee that all goat details (breed, age, weight, health, gender, horn status, price, photos) represent actual animals available for physical inspection and purchase.</li>
              </ul>
            </section>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-emerald-800" /> 3. 24-Hour Hold Reservations
              </h2>
              <p>
                Adu Santhai provides a 24-hour reservation hold mechanism for customers to hold healthy livestock while coordinating farm visits and transportation:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>Reserved goats are temporarily marked as reserved for 24 hours.</li>
                <li>If the reservation expires without completion or cancellation, the goat listing automatically becomes available to other buyers.</li>
                <li>Both buyer and farm admin must maintain respectful direct communication during the hold period.</li>
              </ul>
            </section>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
              <h2 className="text-lg font-extrabold text-slate-900">4. Moderation & Account Suspension</h2>
              <p>
                Super Admins reserve the right to suspend accounts, reject misleading listings, or dismiss non-compliant farm profiles to protect livestock buyers and preserve platform integrity across Tamil Nadu.
              </p>
            </section>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
              <h2 className="text-lg font-extrabold text-slate-900">5. Questions & Support</h2>
              <p>
                For questions regarding platform terms, contact support at:
              </p>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold">Ammal Farm • Adu Santhai Governance</p>
                <p>Email: contact@ammalfarm.dpdns.org | Support: support@ammalfarm.dpdns.org</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};
