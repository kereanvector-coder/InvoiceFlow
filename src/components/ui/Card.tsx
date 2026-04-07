import React from 'react';
import { cn } from '@/src/lib/utils';

/**
 * Card Component
 * 
 * Props:
 * - interactive?: boolean (adds hover effect)
 * - className?: string
 * - children: React.ReactNode
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-surface border border-border rounded-md shadow-md p-5",
          interactive && "transition-all duration-250 cursor-pointer hover:-translate-y-[2px] hover:shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
