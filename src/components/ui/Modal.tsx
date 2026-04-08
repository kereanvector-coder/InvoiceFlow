import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

/**
 * Modal / Bottom Sheet Component
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - children: React.ReactNode
 * - className?: string
 */

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const shouldAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[4px]"
            onClick={onClose}
          />
          
          {/* Modal Content - Bottom Sheet on Mobile, Centered on Desktop (optional, but prompt says "Appears from bottom on mobile (not center)") */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            <motion.div
              initial={shouldAnimate ? { y: '100%' } : { y: 0 }}
              animate={{ y: 0 }}
              exit={shouldAnimate ? { y: '100%' } : { y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={cn(
                "w-full max-w-lg bg-surface rounded-t-lg sm:rounded-lg shadow-lg pointer-events-auto",
                "flex flex-col max-h-[90vh]",
                className
              )}
              // Simple drag to dismiss could be added here with framer-motion drag props
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                if (info.offset.y > 100) {
                  onClose();
                }
              }}
            >
              {/* Handle bar */}
              <div className="w-full flex justify-center pt-3 pb-2 sm:hidden cursor-grab active:cursor-grabbing">
                <div style={{ width: '36px', height: '4px', borderRadius: '999px', background: '#E5E7EB', margin: '0 auto 16px' }} />
              </div>
              
              <div className="p-5 overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
