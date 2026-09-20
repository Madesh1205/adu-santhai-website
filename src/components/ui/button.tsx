import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-emerald-800 text-white shadow-xs hover:bg-emerald-900 active:bg-emerald-950 focus-visible:ring-emerald-800',
        primary:
          'bg-emerald-800 text-white shadow-xs hover:bg-emerald-900 active:bg-emerald-950 focus-visible:ring-emerald-800',
        secondary:
          'border-2 border-emerald-800 bg-white text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 active:bg-emerald-100',
        outline:
          'border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300',
        ghost:
          'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        destructive:
          'bg-red-600 text-white shadow-xs hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500',
        earth:
          'bg-[#B7791F] text-white shadow-xs hover:bg-[#9E6516] active:bg-[#855310]',
        link:
          'text-emerald-800 underline-offset-4 hover:underline p-0 h-auto font-medium',
      },
      size: {
        default: 'h-11 px-5 py-2.5 text-sm',
        sm: 'h-9 rounded-lg px-3.5 text-xs',
        lg: 'h-13 rounded-2xl px-7 text-base font-bold',
        icon: 'h-10 w-10 p-0 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, isLoading, children, disabled, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(buttonVariants({ variant, size, className }), (children.props as any).className),
        ...props,
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
