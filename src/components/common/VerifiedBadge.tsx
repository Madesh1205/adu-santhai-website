import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  label?: string;
  variant?: 'default' | 'subtle' | 'prominent' | 'earth';
  className?: string;
  iconOnly?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  label = 'Verified',
  variant = 'default',
  className,
  iconOnly = false,
}) => {
  const variantStyles = {
    default: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    subtle: 'bg-white/90 text-emerald-900 border border-emerald-200/60 backdrop-blur-xs shadow-xs',
    prominent: 'bg-emerald-800 text-white border border-emerald-900 shadow-xs',
    earth: 'bg-amber-50 text-[#92400E] border border-amber-200 shadow-xs',
  }[variant];

  const iconStyles = {
    default: 'text-emerald-700',
    subtle: 'text-emerald-700',
    prominent: 'text-emerald-200',
    earth: 'text-[#B7791F]',
  }[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide select-none',
        variantStyles,
        className
      )}
    >
      <ShieldCheck className={cn('h-3.5 w-3.5 shrink-0', iconStyles)} />
      {!iconOnly && <span>{label}</span>}
    </span>
  );
};
