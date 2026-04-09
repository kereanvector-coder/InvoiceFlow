import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getInvoiceById, updateInvoiceStatus, deleteInvoice, updateInvoice, markInvoiceAsPaid, recordReminder, Invoice } from '../store/invoiceStore';
import { decodeInvoice, encodeInvoice } from '../utils/encodeInvoice';
import { cleanPhoneForWhatsApp } from '../utils/phone';
import { generatePDF } from '../utils/pdfGenerator';
import { Button, Badge, Modal, Card, EmptyState, Toast } from '../components/ui';
import TemplatePreview from '../components/TemplatePreview';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { 
  ArrowLeft, Send, Bell, CheckCircle, Edit, Trash2, 
  Printer, Building2, AlertCircle, Loader2, FileText, Check, Download
} from 'lucide-react';

export default function InvoiceDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [errorState, setErrorState] = useState<'not_found' | 'decode_error' | null>(null);
  const [isSenderView, setIsSenderView] = useState(false);
  
  const [showPaidModal, setShowPaidModal] = useState(false);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [validationError, setValidationError] = useState<{ message: string; actionLabel?: string; actionFn?: () => void } | null>(null);
  const [fallbackModal, setFallbackModal] = useState({ isOpen: false, text: '' });
  const [copyLinkText, setCopyLinkText] = useState('📋 Copy Invoice Link');

  const [toast, setToast] = useState<{ isVisible: boolean; message: string; variant: 'success' | 'error' | 'info' }>({
    isVisible: false,
    message: '',
    variant: 'success'
  });

  useEffect(() => {
    const dataParam = searchParams.get('data');
    
    if (dataParam) {
      // Client View
      const decoded = decodeInvoice(dataParam);
      if (decoded) {
        setInvoice(decoded);
        setIsSenderView(false);
      } else {
        setErrorState('decode_error');
      }
    } else if (id) {
      // Sender View
      const rawData = localStorage.getItem('invoiceflow_invoices');
      const rawInvoices = rawData ? JSON.parse(rawData) : [];
      const rawInvoice = rawInvoices.find((i: any) => i.id === id);
      const wasSent = rawInvoice?.status === 'sent';

      const localInvoice = getInvoiceById(id);
      if (localInvoice) {
        // Inject signature for sender view
        const invoiceWithSignature = {
          ...localInvoice,
          business_snapshot: {
            ...localInvoice.business_snapshot
          }
        };
        const businessStr = localStorage.getItem('invoiceflow_business');
        if (businessStr) {
          try {
            const business = JSON.parse(businessStr);
            if (business.signature) {
              invoiceWithSignature.business_snapshot.signature = business.signature;
            }
          } catch (e) {}
        }
        
        setInvoice(invoiceWithSignature);
        setIsSenderView(true);
        
        if (wasSent && localInvoice.status === 'overdue') {
          setTimeout(() => {
            setToast({ isVisible: true, message: '⚠️ Invoice is now overdue', variant: 'error' });
          }, 300);
        }
      } else {
        setErrorState('not_found');
      }
    } else {
      setErrorState('not_found');
    }
  }, [id, searchParams]);

  if (errorState === 'not_found') {
    return (
      <div className="min-h-screen bg-bg p-6 flex flex-col items-center justify-center">
        <EmptyState 
          icon={<AlertCircle className="w-12 h-12 text-danger" />}
          title="Invoice not found"
          description="The invoice you are looking for does not exist or has been deleted."
          action={<Button onClick={() => navigate('/app')}>Back to Dashboard</Button>}
        />
      </div>
    );
  }

  if (errorState === 'decode_error') {
    return (
      <div className="min-h-screen bg-bg p-6 flex flex-col items-center justify-center">
        <EmptyState 
          icon={<AlertCircle className="w-12 h-12 text-danger" />}
          title="This invoice link appears to be broken"
          description="The invoice link appears to be broken or malformed."
          action={<Button onClick={() => navigate('/app')}>Back to Dashboard</Button>}
        />
      </div>
    );
  }

  if (!invoice) return null;

  const handleMarkPaid = () => {
    if (id) {
      const paidAtIso = new Date(paidDate).toISOString();
      markInvoiceAsPaid(id, paidAtIso);
      setInvoice(prev => prev ? { ...prev, status: 'paid', paid_at: paidAtIso } : null);
      setShowPaidModal(false);
      setToast({ isVisible: true, message: `✅ Payment recorded for ${invoice.client_name}`, variant: 'success' });
      setTimeout(() => {
        setToast(prev => ({ ...prev, isVisible: false }));
      }, 3000);
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteInvoice(id);
      setShowDeleteModal(false);
      navigate('/app');
    }
  };

  const getShareLinkAsync = async () => {
    const encoded = await encodeInvoice(invoice);
    return `${window.location.origin}/?invoice=${encoded}`;
  };

  const handleDownloadPDF = async () => {
    if (!invoice || !invoiceRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const filename = `Invoice_${invoice.invoice_number}_${invoice.client_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      await generatePDF(invoiceRef.current, filename);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyLink = async () => {
    const link = await getShareLinkAsync();
    navigator.clipboard.writeText(link);
    setCopyLinkText('✓ Link Copied!');
    setTimeout(() => setCopyLinkText('📋 Copy Invoice Link'), 2000);
  };

  const validateBeforeSend = () => {
    if (!invoice.client_phone) {
      setValidationError({
        message: 'No phone number saved for this client. Edit the invoice to add one.',
        actionLabel: 'Edit Invoice',
        actionFn: () => navigate(`/edit/${invoice.id}`)
      });
      return false;
    }
    
    const businessStr = localStorage.getItem('invoiceflow_business');
    const business = businessStr ? JSON.parse(businessStr) : null;
    if (!business?.bank_name || !business?.account_number || !business?.account_name) {
      setValidationError({
        message: 'Your payment details are incomplete. Add them in Settings.',
        actionLabel: 'Go to Settings',
        actionFn: () => navigate('/setup')
      });
      return false;
    }

    if (!invoice.items || invoice.items.length === 0 || invoice.total_amount === 0) {
      setValidationError({
        message: 'This invoice has no items or a zero total.',
      });
      return false;
    }

    setValidationError(null);
    return true;
  };

  const totalFormatted = (invoice.total_amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dueDateFormatted = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(invoice.due_date));

  const getSendInvoiceMessageAsync = async () => {
    const link = await getShareLinkAsync();
    return `Hi ${invoice.client_name},

Here is your invoice from ${invoice.business_snapshot.business_name}.

🧾 Invoice: ${invoice.invoice_number}
💰 Amount: ₦${totalFormatted}
📅 Due Date: ${dueDateFormatted}

Tap the link below to view your full invoice 
and payment details:
${link}

To pay:
🏦 Bank: ${invoice.business_snapshot.bank_name}
💳 Account: ${invoice.business_snapshot.account_number}
👤 Name: ${invoice.business_snapshot.account_name}

Thank you for your business.
— ${invoice.business_snapshot.business_name}`;
  };

  const getReminderMessageAsync = async () => {
    const link = await getShareLinkAsync();
    return `Hi ${invoice.client_name},

⚠️ Friendly reminder: Invoice ${invoice.invoice_number} 
for ₦${totalFormatted} was due on ${dueDateFormatted}.

Your payment is still outstanding.

View invoice here:
${link}

To pay:
🏦 Bank: ${invoice.business_snapshot.bank_name}
💳 Account: ${invoice.business_snapshot.account_number}
👤 Name: ${invoice.business_snapshot.account_name}

Please make payment at your earliest 
convenience.

Thank you.
— ${invoice.business_snapshot.business_name}`;
  };

  const handleSendWhatsApp = async () => {
    if (!navigator.onLine) {
      setToast({ isVisible: true, message: "You're offline. Connect to the internet to send via WhatsApp.", variant: 'error' });
      
      // Save pending send
      if (id) {
        const pendingStr = localStorage.getItem('invoiceflow_pending_sends');
        let pending = pendingStr ? JSON.parse(pendingStr) : [];
        if (!pending.includes(id)) {
          pending.push(id);
          localStorage.setItem('invoiceflow_pending_sends', JSON.stringify(pending));
        }
      }
      return;
    }

    if (!validateBeforeSend()) return;
    setIsSending(true);

    const phone = cleanPhoneForWhatsApp(invoice.client_phone);
    const message = await getSendInvoiceMessageAsync();
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    const newWindow = window.open(waLink, '_blank');
    
    setTimeout(() => {
      setIsSending(false);
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        setFallbackModal({ isOpen: true, text: message });
      } else {
        if (invoice.status === 'draft' && id) {
          updateInvoiceStatus(id, 'sent');
          setInvoice(prev => prev ? { ...prev, status: 'sent', sent_at: new Date().toISOString() } : null);
        }
        setToast({ isVisible: true, message: '📤 Invoice sent via WhatsApp', variant: 'success' });
      }
    }, 500);
  };

  const handleSendReminder = async () => {
    if (!navigator.onLine) {
      setToast({ isVisible: true, message: "You're offline. Connect to the internet to send via WhatsApp.", variant: 'error' });
      
      // Save pending send
      if (id) {
        const pendingStr = localStorage.getItem('invoiceflow_pending_sends');
        let pending = pendingStr ? JSON.parse(pendingStr) : [];
        if (!pending.includes(id)) {
          pending.push(id);
          localStorage.setItem('invoiceflow_pending_sends', JSON.stringify(pending));
        }
      }
      return;
    }

    if (!id || !validateBeforeSend()) return;
    setIsSending(true);

    const phone = cleanPhoneForWhatsApp(invoice.client_phone);
    const message = await getReminderMessageAsync();
    const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    const newWindow = window.open(waLink, '_blank');
    
    setTimeout(() => {
      setIsSending(false);
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        setFallbackModal({ isOpen: true, text: message });
      } else {
        const updated = recordReminder(id);
        setInvoice(updated);
        setToast({ isVisible: true, message: '🔔 Reminder sent', variant: 'success' });
      }
    }, 500);
  };

  const getReminderCooldown = () => {
    if (!invoice.last_reminder_at) return { canSend: true, hoursAgo: 0, hoursRemaining: 0 };
    const last = new Date(invoice.last_reminder_at).getTime();
    const now = Date.now();
    const hoursElapsed = (now - last) / (1000 * 60 * 60);
    const inCooldown = hoursElapsed < 24;
    const hoursRemaining = Math.ceil(24 - hoursElapsed);
    return { canSend: !inCooldown, hoursAgo: Math.floor(hoursElapsed), hoursRemaining };
  };

  const { canSend: canSendReminder, hoursAgo, hoursRemaining } = getReminderCooldown();

  const isPaid = invoice.status === 'paid';

  // Build timeline events
  const timelineEvents = [];
  
  if (invoice.created_at) {
    timelineEvents.push({
      type: 'created',
      icon: <FileText className="w-4 h-4" />,
      text: 'Invoice created',
      date: invoice.created_at,
      color: 'text-neutral-500'
    });
  }

  if (invoice.sent_at) {
    timelineEvents.push({
      type: 'sent',
      icon: <Send className="w-4 h-4" />,
      text: `Sent to ${invoice.client_name} via WhatsApp`,
      date: invoice.sent_at,
      color: 'text-neutral-500'
    });
  }

  if (invoice.reminder_history && invoice.reminder_history.length > 0) {
    invoice.reminder_history.forEach((remDate, index) => {
      timelineEvents.push({
        type: 'reminder',
        icon: <Bell className="w-4 h-4" />,
        text: `Reminder sent (${index + 1} total)`,
        date: remDate,
        color: 'text-neutral-500'
      });
    });
  }

  if (invoice.status === 'overdue' || (invoice.status === 'paid' && invoice.paid_at && new Date(invoice.paid_at) > new Date(invoice.due_date))) {
    timelineEvents.push({
      type: 'overdue',
      icon: <AlertCircle className="w-4 h-4" />,
      text: 'Invoice became overdue',
      date: invoice.due_date,
      color: 'text-danger'
    });
  }

  if (invoice.paid_at) {
    timelineEvents.push({
      type: 'paid',
      icon: <CheckCircle className="w-4 h-4" />,
      text: 'Payment received',
      date: invoice.paid_at,
      color: 'text-success'
    });
  }

  // Sort newest first
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className={`relative h-[calc(var(--vh,1vh)*100)] overflow-hidden flex flex-col ${isPaid ? 'bg-neutral-50' : 'bg-white'} print:bg-white print:h-auto print:overflow-visible`}>
      <Toast 
        isVisible={toast.isVisible} 
        message={toast.message} 
        variant={toast.variant} 
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
      />

      {/* Top Nav (Sender only, hide on print) */}
      {isSenderView && (
        <div className="bg-surface border-b border-border px-4 py-3 flex items-center print:hidden z-30 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')} className="mr-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-h3 flex-1 text-primary-600">InvoiceFlow</h1>
          <span className="text-neutral-500 font-medium font-mono">{invoice.invoice_number}</span>
        </div>
      )}

      {/* Client View Prominent Box */}
      {!isSenderView && !isPaid && (
        <div className="bg-blue-50 border-b border-blue-100 p-4 text-center print:hidden shrink-0">
          <p className="text-blue-800 font-medium">
            This is your invoice from {invoice.business_snapshot.business_name}
          </p>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 print:pb-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* PAID BANNER */}
        {isPaid && (
          <div className="bg-emerald-600 text-white p-6 text-center print:hidden shadow-sm">
            <div className="flex justify-center mb-2">
              <CheckCircle className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold tracking-widest mb-1">PAID</h2>
            <p className="text-emerald-100 text-sm">Received on {formatDate(invoice.paid_at || invoice.created_at)}</p>
          </div>
        )}

        <div className="max-w-2xl mx-auto p-4 sm:p-6 print:p-0 mt-4 print:mt-0 relative overflow-hidden">
          
          {/* PAID WATERMARK */}
          {isPaid && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
              <div className="text-[150px] font-black text-emerald-600 opacity-[0.06] -rotate-12 select-none">
                PAID
              </div>
            </div>
          )}

          <div className="print:shadow-none print:border-none print:p-0 relative z-10">
            <div ref={invoiceRef}>
              <TemplatePreview invoice={invoice} />
            </div>

            {/* Activity Timeline */}
            {isSenderView && timelineEvents.length > 0 && (
              <div className="mt-12 mb-8">
                <h3 className="text-h3 text-neutral-900 dark:text-neutral-50 mb-6">Activity</h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-neutral-200 before:to-transparent">
                  {timelineEvents.map((event, i) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-neutral-900 bg-white dark:bg-neutral-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${event.color}`}>
                        {event.icon}
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-white dark:bg-neutral-900 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className={`font-bold text-sm ${event.color}`}>{event.text}</div>
                        </div>
                        <div className="text-xs text-neutral-500">{formatDate(event.date)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Sender Actions Bottom Bar */}
      {isSenderView && (
        <div className="shrink-0 bg-surface border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] print:hidden flex flex-col gap-3 w-full">
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-3">
            {isPaid ? (
              <div className="flex flex-col gap-3 w-full">
                <Button 
                  variant="secondary" 
                  onClick={handleCopyLink}
                  className="w-full text-sm py-2"
                >
                  {copyLinkText}
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="w-full text-sm py-2"
                >
                  {isGeneratingPDF ? (
                    <span className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating PDF...</span>
                  ) : (
                    <><Download className="w-4 h-4 mr-2" /> Download PDF</>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/app')}
                  className="w-full text-sm py-2"
                >
                  ← Back to Dashboard
                </Button>
              </div>
            ) : (
              <>
                {validationError && (
                  <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-1">
                    <p className="text-red-600 dark:text-red-400 text-sm mb-2 font-medium">{validationError.message}</p>
                    {validationError.actionLabel && validationError.actionFn && (
                      <Button variant="secondary" size="sm" onClick={validationError.actionFn} className="w-full text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/40">
                        {validationError.actionLabel}
                      </Button>
                    )}
                  </div>
                )}

                {/* Row 1: Send via WhatsApp */}
                <Button 
                  variant="primary" 
                  onClick={invoice.status === 'overdue' ? handleSendReminder : handleSendWhatsApp}
                  disabled={isSending || (invoice.status === 'overdue' && !canSendReminder)}
                  className={`w-full h-[52px] text-white border-transparent ${invoice.status === 'overdue' ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {isSending ? (
                    <span className="flex items-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Opening WhatsApp...</span>
                  ) : (
                    <>
                      {invoice.status === 'overdue' ? <Bell className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                      {invoice.status === 'overdue' ? 'Send Overdue Notice' : invoice.status === 'sent' ? 'Resend Invoice' : 'Send via WhatsApp'}
                    </>
                  )}
                </Button>
                
                {invoice.status === 'overdue' && !canSendReminder && (
                  <p className="text-center text-xs text-neutral-500 -mt-1">Reminder sent {hoursAgo}h ago. You can send another in {hoursRemaining} hours.</p>
                )}
                {invoice.status === 'sent' && (
                  <p className="text-center text-xs text-neutral-500 -mt-1">Sent on {formatDate(invoice.sent_at || invoice.created_at)}</p>
                )}

                {/* Row 2: Copy, PDF, Edit */}
                <div className={`grid ${invoice.status === 'paid' ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
                  <Button 
                    variant="secondary" 
                    onClick={handleCopyLink}
                    className="h-[44px] text-sm px-2"
                  >
                    📋 Copy
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="h-[44px] text-sm px-2"
                  >
                    {isGeneratingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : '📄 PDF'}
                  </Button>
                  {invoice.status !== 'paid' && (
                    <Button 
                      variant="secondary" 
                      onClick={() => navigate(`/edit/${invoice.id}`)}
                      className="h-[44px] text-sm px-2"
                    >
                      ✏️ Edit
                    </Button>
                  )}
                </div>

                {/* Row 3: Mark as Paid & Delete */}
                {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowPaidModal(true)}
                    className="w-full border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 mt-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark as Paid
                  </Button>
                )}

                {invoice.status !== 'paid' && (
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full text-danger hover:bg-red-50 dark:hover:bg-red-900/20 text-sm mt-1"
                  >
                    Delete Invoice
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Mark as Paid Bottom Sheet */}
      {showPaidModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowPaidModal(false)}>
          <div 
            className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-t-[20px] p-6 shadow-xl transform transition-transform duration-300 translate-y-0 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex justify-center absolute top-3 left-0 right-0">
              <div style={{ width: '36px', height: '4px', borderRadius: '999px', background: '#E5E7EB', margin: '0 auto 16px' }} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 mt-2 text-center">Confirm Payment</h3>
            <div className="text-center mb-6">
              <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                Mark {invoice.invoice_number} from <span className="font-bold text-neutral-900 dark:text-neutral-50">{invoice.client_name}</span> as paid?
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
                ₦{totalFormatted}
              </p>
              
              <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg text-left mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  When was this paid?
                </label>
                <input 
                  type="date" 
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  min={invoice.created_at.split('T')[0]}
                  className="w-full p-2 border border-border rounded-md bg-white dark:bg-neutral-900"
                />
                <p className="text-xs text-neutral-500 mt-1">Leave as today if paid right now</p>
              </div>

              <p className="text-sm text-danger flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1" /> ⚠️ This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowPaidModal(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent" onClick={handleMarkPaid}>Yes, Mark as Paid</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Bottom Sheet */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowDeleteModal(false)}>
          <div 
            className="bg-white dark:bg-neutral-900 w-full max-w-2xl rounded-t-[20px] p-6 shadow-xl transform transition-transform duration-300 translate-y-0 relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex justify-center absolute top-3 left-0 right-0">
              <div style={{ width: '36px', height: '4px', borderRadius: '999px', background: '#E5E7EB', margin: '0 auto 16px' }} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-50 mb-4 mt-2 text-center">
              Delete {invoice.invoice_number}?
            </h3>
            <div className="text-center mb-6">
              {invoice.status === 'draft' ? (
                <p className="text-neutral-600 dark:text-neutral-400">
                  This draft will be permanently removed.
                </p>
              ) : (
                <p className="text-danger flex flex-col items-center justify-center gap-2">
                  <span className="flex items-center"><AlertCircle className="w-5 h-5 mr-1" /> Warning</span>
                  <span className="text-sm">This invoice has been sent to <span className="font-bold">{invoice.client_name}</span>. Deleting it will not unsend the WhatsApp message.</span>
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button 
                variant="danger" 
                className="flex-1" 
                onClick={handleDelete}
              >
                {invoice.status === 'draft' ? 'Delete' : 'Delete Anyway'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal 
        isOpen={fallbackModal.isOpen} 
        onClose={() => setFallbackModal({ isOpen: false, text: '' })}
      >
        <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">
          Your browser blocked WhatsApp from opening. You can copy the message below or try opening it again.
        </p>
        <textarea 
          readOnly 
          value={fallbackModal.text} 
          className="w-full h-48 p-3 border border-border rounded-md text-sm mb-4 bg-neutral-50 dark:bg-neutral-900"
        />
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => {
            navigator.clipboard.writeText(fallbackModal.text);
            setToast({ isVisible: true, message: '✓ Message copied', variant: 'success' });
          }}>
            Copy Message
          </Button>
          <Button variant="primary" onClick={() => {
            const phone = cleanPhoneForWhatsApp(invoice.client_phone);
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(fallbackModal.text)}`, '_blank');
            setFallbackModal({ isOpen: false, text: '' });
            
            if (invoice.status === 'draft' && id && fallbackModal.text.includes('Here is your invoice')) {
              updateInvoiceStatus(id, 'sent');
              setInvoice(prev => prev ? { ...prev, status: 'sent', sent_at: new Date().toISOString() } : null);
            } else if (id && fallbackModal.text.includes('Friendly reminder')) {
              const updated = recordReminder(id);
              setInvoice(updated);
            }
          }}>
            Open WhatsApp
          </Button>
        </div>
      </Modal>

      {/* Client Actions Bottom Bar */}
      {!isSenderView && (
        <div className="shrink-0 bg-surface border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] print:hidden flex flex-col gap-3 w-full">
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-3">
            <Button 
              variant="primary" 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="w-full text-sm py-2 bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
            >
              {isGeneratingPDF ? (
                <span className="flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating PDF...</span>
              ) : (
                <><Download className="w-4 h-4 mr-2" /> Download PDF</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
