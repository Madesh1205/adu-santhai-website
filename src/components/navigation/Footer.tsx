import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Phone, MapPin, Mail, Award, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-400 pb-20 md:pb-12 pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Direct Farm Sourcing</h4>
              <p className="text-xs text-slate-400 mt-1">
                Zero middlemen. Buy directly from verified goat breeders across Tamil Nadu & India.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">24-Hour Zero-Risk Hold</h4>
              <p className="text-xs text-slate-400 mt-1">
                Lock your desired goat for 24 hours while you inspect the farm or arrange logistics.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Verified Health & Lineage</h4>
              <p className="text-xs text-slate-400 mt-1">
                Transparent vaccination records, deworming dates, weight data, and parent tags.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-black">
                AS
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">ADU SANTHAI</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              An enterprise platform powered by <strong>Ammal Farm</strong>, connecting goat farmers, commercial meat buyers, and stud breeders nationwide.
            </p>
            <div className="pt-2 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Tiruvannamalai, Tamil Nadu, India</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <a href="tel:+916380898358" className="hover:text-white transition-colors">
                  +91 63808 98358
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <a href="mailto:madesh1205@gmail.com" className="hover:text-white transition-colors">
                  contact@ammalfarm.live
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Popular Breeds */}
          <div>
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Featured Breeds
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/marketplace?breed=Boer" className="hover:text-white transition-colors">
                  Boer (Heavy Meat Sires)
                </Link>
              </li>
              <li>
                <Link to="/marketplace?breed=Sirohi" className="hover:text-white transition-colors">
                  Sirohi (Hardy Commercial Breed)
                </Link>
              </li>
              <li>
                <Link to="/marketplace?breed=Tellicherry" className="hover:text-white transition-colors">
                  Tellicherry / Malabari
                </Link>
              </li>
              <li>
                <Link to="/marketplace?breed=Jamnapari" className="hover:text-white transition-colors">
                  Jamnapari (Dual Purpose)
                </Link>
              </li>
              <li>
                <Link to="/marketplace?breed=Kanni" className="hover:text-white transition-colors">
                  Kanni Adu & Kodi Adu
                </Link>
              </li>
              <li>
                <Link to="/marketplace?breed=Barbari" className="hover:text-white transition-colors">
                  Barbari (Stall-fed Dairy)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Marketplace
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/marketplace" className="hover:text-white transition-colors">
                  Browse All Goats
                </Link>
              </li>
              <li>
                <Link to="/farms" className="hover:text-white transition-colors">
                  Verified Goat Farms
                </Link>
              </li>
              <li>
                <Link to="/register-farm" className="hover:text-white transition-colors">
                  Become a Partner Farm
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-white transition-colors">
                  Manage Reservations
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Operations & Security */}
          <div>
            <h5 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
              Platform & Security
            </h5>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Adu Santhai runs on high-availability Cloudflare edge network with Supabase PostgreSQL security, end-to-end data validation, and automated listing audits.
            </p>
            <div className="rounded-xl bg-slate-900 p-3 border border-slate-800 text-xs">
              <span className="font-semibold text-white">Central Operations Hub</span>
              <p className="text-emerald-400 mt-0.5">Ammal Farm (FARM-001)</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Adu Santhai • Ammal Farm. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Powered by Supabase & Cloudflare Pages</span>
            <span>Production Host: adusanthai.ammalfarm.dpdns.org</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
