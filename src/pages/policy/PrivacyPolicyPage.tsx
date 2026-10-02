import React from 'react';
import { SEOHead } from '@/components/common/SEOHead';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Privacy Policy | Adu Santhai – Ammal Farm"
        description="Privacy policy and data protection guidelines for Adu Santhai marketplace associated with Ammal Farm."
        path="/privacy"
      />

      <div className="bg-slate-50 min-h-screen py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-8">
            <div className="border-b border-slate-100 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-100">
                <ShieldCheck className="h-4 w-4" /> Data Protection & Privacy
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-slate-500 mt-2">
                Last updated: October 2, 2026 • Adu Santhai (Ammal Farm Platform)
              </p>
            </div>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-emerald-800" /> 1. Information We Collect
              </h2>
              <p>
                Adu Santhai collects personal details necessary to facilitate direct livestock sales and farm reservations across Tamil Nadu:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li><strong>Account Data:</strong> Name, email address, phone number, and account role (Customer, Farm Admin, Super Admin).</li>
                <li><strong>Farm Listing Data:</strong> Farm name, district, location address, contact phone, goat breed specifications, age, weight, health/deworming status, and uploaded livestock images.</li>
                <li><strong>Booking & Reservation Records:</strong> Goat reservation timestamp, booking status, 24-hour hold window tracking, and farm contact records.</li>
              </ul>
            </section>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Eye className="h-5 w-5 text-emerald-800" /> 2. How We Use Your Information
              </h2>
              <p>Your information is processed strictly for platform operations:</p>
              <ul className="list-disc pl-6 space-y-2 text-slate-600">
                <li>Connecting verified livestock buyers directly with farm breeders in Tamil Nadu.</li>
                <li>Facilitating the 24-hour hold reservation process and booking status updates.</li>
                <li>Verifying partner farms and moderating marketplace listings.</li>
                <li>Sending transactional email notifications regarding reservations, verification, and support.</li>
              </ul>
            </section>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-800" /> 3. Data Storage & Security
              </h2>
              <p>
                All account data, goat listings, and reservation records are stored securely in Supabase PostgreSQL with strict Row Level Security (RLS) policies. We do not sell, rent, or lease personal user data to third parties.
              </p>
            </section>

            <section className="space-y-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-6">
              <h2 className="text-lg font-extrabold text-slate-900">4. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or your personal data, contact Ammal Farm administration at:
              </p>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold">Ammal Farm • Adu Santhai Support</p>
                <p>Address: Rusha Post, Kollimedu, Chennangkuppam, K.V. Kuppam Taluk, Vellore District, Tamil Nadu - 632209, India</p>
                <p>Google Maps: <a href="https://maps.app.goo.gl/qL8nLnxKZcsyj7xm8" target="_blank" rel="noopener noreferrer" className="underline font-semibold text-emerald-800">View Ammal Farm Location</a></p>
                <p>Email: contact@ammalfarm.dpdns.org (Support: support@ammalfarm.dpdns.org) | Phone: +91 63808 98358</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};
