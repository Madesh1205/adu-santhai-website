import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  finalPrice: number;
  hasDiscount?: boolean;
  discountPercentage?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  stacked?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  finalPrice,
  hasDiscount = false,
  discountPercentage = 0,
  size = 'md',
  className,
  stacked = false,
}) => {
  const sizeStyles = {
    sm: {
      final: 'text-base font-bold text-emerald-800',
      original: 'text-xs text-slate-400 line-through',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    md: {
      final: 'text-xl font-extrabold text-emerald-800',
      original: 'text-xs text-slate-400 line-through',
      badge: 'text-[11px] px-2 py-0.5',
    },
    lg: {
      final: 'text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight',
      original: 'text-sm text-slate-400 line-through',
      badge: 'text-xs px-2.5 py-0.5',
    },
    xl: {
      final: 'text-3xl sm:text-4xl font-black text-emerald-950 tracking-tight',
      original: 'text-base text-slate-400 line-through',
      badge: 'text-xs px-2.5 py-1',
    },
  }[size];

  return (
    <div className={cn('flex flex-col', className)}>
      <div className={cn('flex items-baseline gap-2', stacked ? 'flex-col' : 'items-center flex-wrap')}>
        {/* Dominant Final Price */}
        <span className={sizeStyles.final}>
          {formatCurrency(finalPrice)}
        </span>

        {/* Struck-through Original Price & Restrained Discount Badge */}
        {hasDiscount && discountPercentage > 0 && (
          <div className="flex items-center gap-1.5">
            <span className={sizeStyles.original}>
              {formatCurrency(price)}
            </span>
            <Badge variant="discount" className={cn(sizeStyles.badge, 'font-bold')}>
              {discountPercentage}% OFF
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
};
