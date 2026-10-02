import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, MapPin, Mail, Award, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 pb-24 md:pb-14 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Direct Breeder Sourcing</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Zero middlemen. Buy directly from verified goat breeders across Tamil Nadu.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-xs">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">24-Hour Reservation Hold</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Hold your chosen goat for 24 hours while you coordinate farm inspection or transport.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-xs">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Verified Health & Specs</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Transparent vaccination records, deworming history, and verified breeder profiles.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-xs border border-slate-200">
                <img
                  src="/logo.jpg"
                  alt="Ammal Farm Adu Santhai"
                  className="h-full w-full object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-900 text-lg tracking-tight leading-none">ADU SANTHAI</span>
                <span className="text-[10px] font-bold text-emerald-800 tracking-wider uppercase mt-0.5">Ammal Farm</span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Tamil Nadu's premier direct marketplace for verified goats, associated with <strong>Ammal Farm</strong>. Connecting breeders, farmers, and buyers with complete transparency.
            </p>
            <div className="pt-2 text-xs space-y-2.5 text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-800 shrink-0" />
                <a
                  href="https://maps.app.goo.gl/qL8nLnxKZcsyj7xm8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-800 transition-colors"
                  title="View Farm Location on Google Maps"
                >
                  Rusha Post, Kollimedu, Chennangkuppam, K.V. Kuppam, Vellore - 632209, TN
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-800 shrink-0" />
                <a href="tel:+916380898358" className="hover:text-emerald-800 font-semibold transition-colors">
                  +91 63808 98358
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-800 shrink-0" />
                <a href="mailto:contact@ammalfarm.dpdns.org" className="hover:text-emerald-800 transition-colors">
                  contact@ammalfarm.dpdns.org
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Featured Breeds */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4">
              Featured Breeds
            </h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <Link to="/marketplace?breed=Boer" className="hover:text-emerald-800 transition-colors">
                  Boer (Heavy Meat Sires)
                </Link>
              </li>
              <li>
                <Link to="/marketplace?breed=Sirohi" className="hover:text-emerald-800 transition-colors">
                  Sirohi (Hardy Commercial Breed)
                </Link>
              </li>
              <li>
                <Link to="/marketplace?breed=Tellicherry" className="hover:text-emerald-800 transition-colors">
                  Tellicherry / Malabari
                </Link>
              </li>
              <li>
                <Link to="/marketplace?breed=Jamnapari" className="hover:text-emerald-800 transition-colors">
                  Jamnapari (Dual Purpose)
                </Link>
              </li>
              <li>
                <Link to="/marketplace?breed=Kanni" className="hover:text-emerald-800 transition-colors">
                  Kanni Adu & Native Breeds
                </Link>
              </li>
              <li>
                <Link to="/marketplace?breed=Barbari" className="hover:text-emerald-800 transition-colors">
                  Barbari (Stall-fed Dairy)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4">
              Marketplace
            </h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li>
                <Link to="/marketplace" className="hover:text-emerald-800 transition-colors">
                  Browse All Goats
                </Link>
              </li>
              <li>
                <Link to="/farms" className="hover:text-emerald-800 transition-colors">
                  Verified Breeder Directory
                </Link>
              </li>
              <li>
                <Link to="/register-farm" className="hover:text-emerald-800 transition-colors">
                  Partner Farm Registration
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-emerald-800 transition-colors">
                  My Reservations
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-emerald-800 transition-colors">
                  Saved Goats
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Operations & Trust */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-4">
              Verified Operations
            </h5>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Every goat is backed by real breeder identification, transparent pricing, and direct farmer communication.
            </p>
            <Link
              to="/farms"
              className="block rounded-2xl bg-white p-4 border border-slate-200 shadow-xs hover:border-emerald-700/50 hover:shadow-sm transition-all group"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Primary Partner Hub
              </span>
              <h6 className="font-extrabold text-slate-900 text-sm mt-0.5 group-hover:text-emerald-800 transition-colors">
                Ammal Farm (FARM-001) →
              </h6>
              <p className="text-xs text-slate-500 mt-0.5">K.V. Kuppam, Vellore - 632209</p>
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Adu Santhai • Ammal Farm. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-medium">
            <Link to="/privacy" className="hover:text-emerald-800 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-emerald-800 transition-colors">Terms & Conditions</Link>
            <Link to="/refund-policy" className="hover:text-emerald-800 transition-colors">Refund & Cancellation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
