import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
        verified: 'bg-emerald-100/80 text-emerald-900 border border-emerald-300 font-semibold',
        secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
        earth: 'bg-amber-50 text-[#92400E] border border-amber-200/80 font-medium',
        premium: 'bg-amber-50 text-[#92400E] border border-amber-200 font-semibold',
        reserved: 'bg-amber-50 text-amber-900 border border-amber-300 font-semibold',
        sold: 'bg-slate-800 text-slate-100 border border-slate-900 font-semibold',
        discount: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold',
        destructive: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
        outline: 'text-slate-700 border border-slate-200 bg-white',
        slate: 'bg-slate-100 text-slate-700 border border-slate-200',
        blue: 'bg-blue-50 text-blue-800 border border-blue-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
