import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Toast Component
 * 
 * Props:
 * - isVisible: boolean
 * - message: string
 * - variant: 'success' | 'error' | 'info'
 * - onClose: () => void
 */

export interface ToastProps {
  isVisible: boolean;
  message: string;
  variant?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ isVisible, message, variant = 'info', onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const shouldAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const variants = {
    success: {
      border: "border-l-4 border-l-success",
      icon: <CheckCircle2 className="w-5 h-5 text-success" />,
    },
    error: {
      border: "border-l-4 border-l-danger",
      icon: <AlertCircle className="w-5 h-5 text-danger" />,
    },
    info: {
      border: "border-l-4 border-l-neutral-400 dark:border-l-neutral-600",
      icon: <Info className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />,
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div 
          className="fixed z-[9999] pointer-events-none"
          style={{ top: '16px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: '400px' }}
        >
          <motion.div
            initial={shouldAnimate ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={shouldAnimate ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              "w-full bg-surface shadow-lg rounded-md p-4 pointer-events-auto flex items-start gap-3",
              variants[variant].border
            )}
            role="alert"
          >
            <div className="shrink-0 mt-0.5">
              {variants[variant].icon}
            </div>
            <p className="flex-1 text-body text-neutral-800 dark:text-neutral-50">
              {message}
            </p>
            <button 
              onClick={onClose}
              className="shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
