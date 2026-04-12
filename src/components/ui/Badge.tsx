import React from 'react';
import { cn } from '@/src/lib/utils';

/**
 * Badge Component
 * 
 * Props:
 * - variant: 'draft' | 'sent' | 'paid' | 'overdue'
 * - className?: string
 * - children: React.ReactNode
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: 'draft' | 'sent' | 'paid' | 'overdue' | 'accepted' | 'declined' | 'expired';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, children, ...props }, ref) => {
    const variants = {
      draft: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
      sent: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      declined: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      expired: "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-[999px] px-[10px] py-[3px] text-[12px] font-[600] uppercase tracking-wider",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
