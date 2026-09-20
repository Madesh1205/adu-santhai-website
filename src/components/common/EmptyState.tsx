import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onActionClick,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center sm:p-12',
        className
      )}
    >
      {Icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-xs">
          <Icon className="h-7 w-7" />
        </div>
      )}

      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-500 leading-relaxed">{description}</p>

      {actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Link to={actionHref}>
              <Button variant="default" size="default">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="default" size="default" onClick={onActionClick}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
};
