import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function FinancialSummary() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/app')} className="p-2 -ml-2 hover:bg-bg rounded-lg text-text-secondary transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-text">Financial Summary</h1>
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center py-12">
          <p className="text-text-secondary">Financial Summary is coming soon.</p>
        </div>
      </div>
    </div>
  );
}
