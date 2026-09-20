import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        secondary: 'bg-amber-100 text-amber-900 border border-amber-200',
        destructive: 'bg-red-100 text-red-800 border border-red-200',
        outline: 'text-slate-700 border border-slate-300 bg-white',
        slate: 'bg-slate-100 text-slate-700 border border-slate-200',
        blue: 'bg-blue-100 text-blue-800 border border-blue-200',
        purple: 'bg-purple-100 text-purple-800 border border-purple-200',
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
