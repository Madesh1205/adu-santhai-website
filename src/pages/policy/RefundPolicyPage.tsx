import React from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { ShieldCheck, RefreshCw, Calendar, CheckCircle2 } from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Refund & Cancellation Policy | Adu Santhai – Ammal Farm"
        description="Refund, reservation hold, and cancellation terms for livestock bookings on Adu Santhai."
        path="/refund-policy"
      />

      <div className="bg-slate-50 min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-8">
            <div className="border-b border-slate-100 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-100">
                <ShieldCheck className="h-4 w-4" /> Transparent Policy
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Refund & Cancellation Policy</h1>
              <p className="text-sm text-slate-500 mt-2">
                Last updated: October 2, 2026 • Adu Santhai (Ammal Farm Platform)
              </p>
            </div>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-800" /> 1. 24-Hour Hold Cancellations
              </h2>
              <p>
                When a customer creates a reservation hold on a goat, the listing is locked for 24 hours:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Buyer Cancellation:</strong> Buyers may cancel an active reservation hold anytime before farm pickup directly through their "My Reservations" dashboard.</li>
                <li><strong>Farm Admin Rejection:</strong> If a farm admin is unable to fulfill a reservation, they may cancel the booking, releasing the goat back to the public marketplace.</li>
              </ul>
            </section>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-emerald-800" /> 2. Listing Fees & Refunds
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Ammal Farm Listings:</strong> Free listing fee waivers apply for Ammal Farm (`is_ammal_own_farm`) central listings.</li>
                <li><strong>Partner Farm Listing Payments:</strong> Partner farms that pay platform listing fees receive full support for verified listings. If a listing is rejected by moderation prior to approval, listing fees are refunded or credited to the farm account.</li>
              </ul>
            </section>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-800" /> 3. Direct Inspection Upon Delivery
              </h2>
              <p>
                Because livestock health depends on physical inspection, final payment and animal pickup occur directly at the partner farm or upon agreed delivery. Buyers are advised to inspect health records, deworming history, and physical condition before final settlement.
              </p>
            </section>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
              <h2 className="text-lg font-extrabold text-slate-900">4. Reservation Support & Inquiries</h2>
              <p>
                For assistance regarding active reservation holds or refund requests:
              </p>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold">Ammal Farm • Adu Santhai Customer Desk</p>
                <p>Email: support@ammalfarm.dpdns.org | General: contact@ammalfarm.dpdns.org</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};
