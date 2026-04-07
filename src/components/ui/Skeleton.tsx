import React from 'react';
import { cn } from '@/src/lib/utils';

/**
 * Skeleton Component
 * 
 * Props:
 * - className?: string
 * - ...all standard div props
 */

export const Skeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 bg-[length:200%_100%] rounded-md",
          className
        )}
        style={{
          animation: 'shimmer 2s infinite linear'
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// Add this to globals.css or tokens.css
// @keyframes shimmer {
//   0% { background-position: 200% 0; }
//   100% { background-position: -200% 0; }
// }
