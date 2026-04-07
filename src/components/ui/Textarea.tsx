import React, { useState } from 'react';
import { cn } from '@/src/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, disabled, value, defaultValue, onChange, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    const hasValue = value !== undefined ? String(value).length > 0 : defaultValue !== undefined ? String(defaultValue).length > 0 : false;
    const isFloating = isFocused || hasValue;

    return (
      <div className={cn("relative w-full", className)}>
        <div className="relative">
          <textarea
            ref={ref}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "peer w-full min-h-[100px] rounded-md border-[1.5px] bg-transparent px-4 pt-6 pb-2 text-body text-neutral-800 dark:text-neutral-50 outline-none transition-all duration-150 resize-y",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50 dark:disabled:bg-neutral-900",
              error 
                ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]" 
                : "border-neutral-200 dark:border-border focus:border-primary-500 focus:shadow-glow"
            )}
            {...props}
          />
          <label
            className={cn(
              "absolute left-4 top-4 text-body text-neutral-400 transition-all duration-150 pointer-events-none",
              isFloating && "top-2 text-label text-neutral-600 dark:text-neutral-400",
              error && isFloating && "text-danger"
            )}
          >
            {label}
          </label>
        </div>
        {error && (
          <p className="mt-1.5 text-label text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
