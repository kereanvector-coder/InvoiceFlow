import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { cn } from '@/src/lib/utils';

/**
 * FAB (Floating Action Button) Component
 * 
 * Props:
 * - onClick: () => void
 * - isCloseMode?: boolean (Rotates icon to X)
 * - className?: string
 */

export interface FABProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  isCloseMode?: boolean;
}

export const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ className, onClick, isCloseMode = false, ...props }, ref) => {
    const [isFirstVisit, setIsFirstVisit] = useState(false);
    const shouldAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    useEffect(() => {
      // Check if it's the first visit to pulse the FAB
      const hasVisited = localStorage.getItem('invoiceflow_fab_seen');
      if (!hasVisited) {
        setIsFirstVisit(true);
        localStorage.setItem('invoiceflow_fab_seen', 'true');
      }
    }, []);

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        whileTap={shouldAnimate ? { scale: 0.95 } : {}}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-primary-500 text-white shadow-xl shadow-glow transition-colors hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
          isFirstVisit && "animate-[pulse_2s_ease-in-out_3]",
          className
        )}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}
        aria-label={isCloseMode ? "Close" : "Add new"}
        {...props}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isCloseMode ? 45 : 0 }}
          transition={{ duration: 0.15 }}
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
        </motion.div>
      </motion.button>
    );
  }
);

FAB.displayName = 'FAB';
