import React, { useEffect, useState } from 'react';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

export function PWAHandler() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showIOSBanner, setShowIOSBanner] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);
  const [pendingSends, setPendingSends] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = safeGetItem('invoiceflow_install_dismissed');
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = safeGetItem('invoiceflow_install_dismissed');

    if (isIOS && !isInStandaloneMode && !dismissed && !deferredPrompt) {
      setShowIOSBanner(true);
    }

    // Offline Detection
    const handleOnline = () => {
      setIsOffline(false);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 2000);

      // Check pending sends
      const pending = safeGetItem('invoiceflow_pending_sends');
      if (pending) {
        try {
          const parsed = JSON.parse(pending);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPendingSends(parsed);
          }
        } catch (e) {}
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [deferredPrompt]);

  const dismissInstall = () => {
    safeSetItem('invoiceflow_install_dismissed', 'true');
    setShowInstallBanner(false);
    setShowIOSBanner(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleSendPending = () => {
    if (pendingSends.length > 0) {
      const id = pendingSends[0];
      navigate(`/invoice/${id}`);
      
      // Remove from pending
      const newPending = pendingSends.slice(1);
      if (newPending.length > 0) {
        safeSetItem('invoiceflow_pending_sends', JSON.stringify(newPending));
        setPendingSends(newPending);
      } else {
        safeRemoveItem('invoiceflow_pending_sends');
        setPendingSends([]);
      }
    }
  };

  return (
    <>
      {/* Offline Banner */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 h-9 bg-neutral-800 text-white flex items-center justify-center text-[13px] z-[100]">
          📡 You're offline — your data is safe and syncs when you reconnect
        </div>
      )}
      {showBackOnline && !isOffline && (
        <div className="fixed top-0 left-0 right-0 h-9 bg-emerald-600 text-white flex items-center justify-center text-[13px] z-[100]">
          ✓ Back online
        </div>
      )}

      {/* Pending Sends Banner */}
      {pendingSends.length > 0 && !isOffline && (
        <div className="fixed top-0 left-0 right-0 mt-2 mx-2 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm z-[90] flex justify-between items-center" style={{ top: 'env(safe-area-inset-top)' }}>
          <span className="text-sm text-blue-800">You have {pendingSends.length} invoice(s) ready to send.</span>
          <button onClick={handleSendPending} className="text-sm font-bold text-blue-600 hover:text-blue-800">Send Now</button>
        </div>
      )}

      {/* Install Banners */}
      {showInstallBanner && !isOffline && (
        <div className="fixed top-0 left-0 right-0 mt-2 mx-3 p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm z-[80]" style={{ top: 'env(safe-area-inset-top)' }}>
          <p className="text-sm text-blue-900 mb-3 font-medium">📲 Add InvoiceFlow to your home screen for faster access</p>
          <div className="flex justify-end gap-3">
            <button onClick={dismissInstall} className="text-sm text-blue-600 font-medium px-3 py-1.5 hover:bg-blue-100 rounded-md transition-colors">Not Now</button>
            <button onClick={handleInstall} className="text-sm bg-blue-600 text-white font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">Add to Home Screen</button>
          </div>
        </div>
      )}

      {showIOSBanner && !isOffline && (
        <div className="fixed top-0 left-0 right-0 mt-2 mx-3 p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm z-[80]" style={{ top: 'env(safe-area-inset-top)' }}>
          <p className="text-sm text-blue-900 mb-3 font-medium">📲 Install InvoiceFlow<br/><span className="font-normal">Tap Share then "Add to Home Screen"</span></p>
          <div className="flex justify-end">
            <button onClick={dismissInstall} className="text-sm bg-blue-600 text-white font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors">Got it, thanks</button>
          </div>
        </div>
      )}
    </>
  );
}
