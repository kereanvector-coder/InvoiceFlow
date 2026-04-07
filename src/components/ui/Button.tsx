import React from 'react';
import { cn } from '@/src/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * Button Component
 * 
 * Props:
 * - variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
 * - size: 'sm' | 'md' | 'lg'
 * - isLoading: boolean
 * - disabled: boolean
 * - children: React.ReactNode
 * - className: string
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700",
      secondary: "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-surface dark:text-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-border",
      ghost: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
      danger: "bg-danger text-white hover:bg-red-600 active:bg-red-700",
      link: "text-primary-500 hover:text-primary-600 underline-offset-4 hover:underline active:scale-100 p-0",
    };

    const sizes = {
      sm: "h-[36px] px-3 text-small",
      md: "h-[44px] px-4 text-body",
      lg: "h-[52px] px-6 text-body-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          variant !== 'link' && sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
