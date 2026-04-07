import React, { useEffect, useState } from 'react';
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
import { BottomNav } from './components/BottomNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SplashScreen } from './components/SplashScreen';
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
  const [invoiceData, setInvoiceData] = useState<string | null>(null);
  const { state } = useBusinessStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('invoice');
    if (data) {
      setInvoiceData(data);
    }
  }, []);

  if (invoiceData) {
    return <Navigate to={`/invoice/shared?data=${encodeURIComponent(invoiceData)}`} replace />;
  }

  if (state.isLoaded && state.profile) {
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
        ]
      },
      { path: "/invoice/:id", element: <InvoiceDetail /> }
    ]
  }
]);

export default function App() {
  const [splashFinished, setSplashFinished] = useState(false);

  return (
    <ErrorBoundary>
      <BusinessProvider>
        {!splashFinished && <SplashScreen onFinish={() => setSplashFinished(true)} />}
        {splashFinished && (
          <RouterProvider router={router} />
        )}
      </BusinessProvider>
    </ErrorBoundary>
  );
}
