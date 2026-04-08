import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InvoiceForm from '../components/InvoiceForm';
import { getInvoiceById, Invoice } from '../store/invoiceStore';
import { Skeleton } from '../components/ui';

export default function EditInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = getInvoiceById(id);
      if (data) {
        setInvoice(data);
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

  if (!invoice) return null;

  const isReadOnly = invoice.status === 'paid';

  return (
    <div className="min-h-screen bg-bg pt-8 px-4 sm:px-6 pb-[140px]">
      <InvoiceForm initialData={invoice} isReadOnly={isReadOnly} />
    </div>
  );
}
