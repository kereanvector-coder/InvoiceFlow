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
  
  if (invoiceData) {
    return <Navigate to={`/invoice/shared?data=${encodeURIComponent(invoiceData)}`} replace />;
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
        ]
      },
      { path: "/invoice/:id", element: <InvoiceDetail /> }
    ]
  }
]);

export default function App() {
  return (
    <ErrorBoundary>
      <BusinessProvider>
        <RouterProvider router={router} />
      </BusinessProvider>
    </ErrorBoundary>
  );
}
