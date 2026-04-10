import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuotationForm from '../components/QuotationForm';
import { getQuotationById, Quotation } from '../store/quotationStore';
import { Skeleton } from '../components/ui';

export default function EditQuotation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = getQuotationById(id);
      if (data) {
        setQuotation(data);
      } else {
        // Handle not found
        navigate('/app');
      }
      setLoading(false);
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg pt-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!quotation) return null;

  const isReadOnly = quotation.status === 'paid';

  return (
    <div className="min-h-screen bg-bg pt-8 px-4 sm:px-6 pb-[140px]">
      <QuotationForm initialData={quotation} isReadOnly={isReadOnly} />
    </div>
  );
}
