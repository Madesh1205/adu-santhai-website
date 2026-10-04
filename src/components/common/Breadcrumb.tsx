import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex overflow-x-auto py-1.5 scrollbar-none ${className}`}>
      <ol className="flex items-center gap-1.5 text-xs text-slate-500 font-medium whitespace-nowrap">
        {/* Always include Home as first element if not explicitly provided */}
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-emerald-800 transition-colors text-slate-500 shrink-0"
            title="Home"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-1.5 shrink-0">
              <ChevronRight className="h-3 w-3 text-slate-300 shrink-0" />

              {isLast || !item.href ? (
                <span className="font-semibold text-slate-900 max-w-[180px] sm:max-w-[280px] truncate" aria-current="page">
                  {Icon && <Icon className="h-3.5 w-3.5 inline mr-1 text-emerald-800" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="hover:text-emerald-800 transition-colors text-slate-500 max-w-[140px] sm:max-w-[200px] truncate"
                >
                  {Icon && <Icon className="h-3.5 w-3.5 inline mr-1 text-slate-400" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
