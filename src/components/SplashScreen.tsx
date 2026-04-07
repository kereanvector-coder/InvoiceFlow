import React, { useEffect, useState } from 'react';
import { safeGetItem } from '../utils/storage';

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const hasProfile = safeGetItem('invoiceflow_business');
    const displayTime = hasProfile ? 100 : 300;

    const timer = setTimeout(() => {
      setOpacity(0);
      setTimeout(() => {
        setIsVisible(false);
        onFinish();
      }, 300); // fade out duration
    }, displayTime);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-opacity duration-300 ease-out"
      style={{ opacity }}
    >
      <h1 className="text-4xl font-bold text-primary-600 tracking-tight mb-2">InvoiceFlow</h1>
      <p className="text-neutral-500 font-medium">Get paid faster</p>
    </div>
  );
}
