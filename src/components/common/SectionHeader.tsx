import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  badge?: string;
  badgeVariant?: 'default' | 'earth';
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
  align?: 'left' | 'center';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  badgeVariant = 'default',
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  className,
  align = 'left',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10',
        align === 'center' ? 'text-center sm:text-center sm:justify-center' : '',
        className
      )}
    >
      <div className={cn(align === 'center' ? 'mx-auto max-w-2xl' : '')}>
        {badge && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2',
              badgeVariant === 'earth'
                ? 'bg-amber-50 text-[#92400E] border border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            )}
          >
            {badge}
          </span>
        )}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actionLabel && (
        <div className="shrink-0">
          {actionHref ? (
            <Link
              to={actionHref}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-950 transition-colors group"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-950 transition-colors group cursor-pointer"
            >
              <span>{actionLabel}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
