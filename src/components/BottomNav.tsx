import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart2, Settings } from 'lucide-react';
import { getInvoices } from '../store/invoiceStore';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const invoices = getInvoices();
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const tabs = [
    { id: 'home', path: '/app', icon: Home, label: 'Home' },
    { id: 'invoices', path: '/invoices', icon: FileText, label: 'Invoices', badge: overdueCount },
    { id: 'summary', path: '/summary', icon: BarChart2, label: 'Summary' },
    { id: 'settings', path: '/setup', icon: Settings, label: 'Settings' },
  ];

  const showNav = ['/app', '/invoices', '/summary', '/setup'].includes(location.pathname);
  if (!showNav) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 h-16 z-40 flex items-center justify-around px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {tabs.map(tab => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center w-16 h-full relative"
          >
            <div className="relative">
              <Icon className={`w-6 h-6 ${isActive ? 'text-primary-600' : 'text-neutral-400'}`} />
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-2 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary-600' : 'text-neutral-400'}`}>
              {tab.label}
            </span>
            {isActive && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}
