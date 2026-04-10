import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { BusinessProvider, useBusinessStore } from './store/businessStore';
import Landing from './pages/Landing';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import CreateInvoice from './pages/CreateInvoice';
import EditInvoice from './pages/EditInvoice';
import InvoiceDetail from './pages/InvoiceDetail';
import FinancialSummary from './pages/FinancialSummary';
import InvoiceHistory from './pages/InvoiceHistory';
import QuotationsList from './pages/QuotationsList';
import CreateQuotation from './pages/CreateQuotation';
import EditQuotation from './pages/EditQuotation';
import QuotationDetail from './pages/QuotationDetail';
import { BottomNav } from './components/BottomNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PWAHandler } from './components/PWAHandler';

function ProtectedLayout() {
  const { state } = useBusinessStore();
  
  if (!state.isLoaded) return null;
  
  if (!state.profile) {
    return <Navigate to="/setup" replace />;
  }
  
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
}

function RootHandler() {
  const { state } = useBusinessStore();

  // Synchronous check for invoice data in URL
  const params = new URLSearchParams(window.location.search);
  const invoiceData = params.get('invoice');
  const quoteData = params.get('quote');
  
  if (invoiceData) {
    return <Navigate to={`/invoice/shared?data=${encodeURIComponent(invoiceData)}`} replace />;
  }
  if (quoteData) {
    return <Navigate to={`/app/quotation/shared?quote=${encodeURIComponent(quoteData)}`} replace />;
  }

  if (!state.isLoaded) return null;

  if (state.profile && state.profile.business_name) {
    return <Navigate to="/app" replace />;
  }

  return <Landing />;
}

const router = createBrowserRouter([
  {
    element: (
      <>
        <PWAHandler />
        <Outlet />
      </>
    ),
    children: [
      { path: "/", element: <RootHandler /> },
      { 
        path: "/setup", 
        element: (
          <>
            <Setup />
            <BottomNav />
          </>
        ) 
      },
      { 
        element: <ProtectedLayout />, 
        children: [
          { path: "/app", element: <Dashboard /> },
          { path: "/create", element: <CreateInvoice /> },
          { path: "/edit/:id", element: <EditInvoice /> },
          { path: "/summary", element: <FinancialSummary /> },
          { path: "/invoices", element: <InvoiceHistory /> },
          { path: "/app/quotations", element: <QuotationsList /> },
          { path: "/app/quotation/new", element: <CreateQuotation /> },
          { path: "/app/quotation/:id/edit", element: <EditQuotation /> },
        ]
      },
      { path: "/invoice/:id", element: <InvoiceDetail /> },
      { path: "/app/quotation/:id", element: <QuotationDetail /> }
    ]
  }
]);

export default function App() {
  React.useEffect(() => {
    // Remove splash screen smoothly
    const removeSplash = () => {
      const splash = 
        document.getElementById('invoiceflow-splash') || 
        (window as any).__invoiceFlowSplash
      
      if (splash) {
        // Fade out
        splash.style.opacity = '0'
        splash.style.pointerEvents = 'none'
        
        // Remove from DOM after fade
        setTimeout(() => {
          if (splash.parentNode) {
            splash.parentNode.removeChild(splash)
          }
          (window as any).__invoiceFlowSplash = null
        }, 400)
      }
    }
    
    // Minimum splash display time: 800ms
    // This prevents a jarring flash
    // if the app loads very quickly
    const minDisplayTime = 800
    const startTime = (window as any).__splashStartTime || Date.now()
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, minDisplayTime - elapsed)
    
    setTimeout(removeSplash, remaining)
  }, []);

  return (
    <ErrorBoundary>
      <BusinessProvider>
        <RouterProvider router={router} />
      </BusinessProvider>
    </ErrorBoundary>
  );
}
