import React from 'react';
import { cn } from '@/src/lib/utils';

/**
 * EmptyState Component
 * 
 * Props:
 * - icon: React.ReactNode (Custom SVG illustration)
 * - title: string
 * - description: string
 * - action?: React.ReactNode (Usually a Button)
 * - className?: string
 */

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto",
          className
        )}
        {...props}
      >
        <div className="mb-4 text-neutral-400 dark:text-neutral-600 flex justify-center [&>svg]:w-12 [&>svg]:h-12">
          {icon}
        </div>
        <h3 className="text-[16px] font-bold text-neutral-900 dark:text-neutral-50 mb-2">
          {title}
        </h3>
        <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mb-6">
          {description}
        </p>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
