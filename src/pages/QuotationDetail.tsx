import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { getQuotationById, updateQuotationStatus, deleteQuotation, convertQuotationToInvoice, Quotation } from '../store/quotationStore';
import { decodeQuotation, encodeQuotation } from '../utils/encodeQuotation';
import { cleanPhoneForWhatsApp } from '../utils/phone';
import { generatePDF } from '../utils/pdfGenerator';
import { Button, Badge, Modal, Card, EmptyState, Toast } from '../components/ui';
import TemplatePreview from '../components/TemplatePreview';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { 
  ArrowLeft, Send, Bell, CheckCircle, Edit, Trash2, 
  Printer, Building2, AlertCircle, Loader2, FileText, Check, Download, Zap
} from 'lucide-react';

export default function QuotationDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [errorState, setErrorState] = useState<'not_found' | 'decode_error' | null>(null);
  const [isSenderView, setIsSenderView] = useState(false);
  
  const [showAcceptedModal, setShowAcceptedModal] = useState(false);
  const [showDeclinedModal, setShowDeclinedModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const quotationRef = useRef<HTMLDivElement>(null);
  const [validationError, setValidationError] = useState<{ message: string; actionLabel?: string; actionFn?: () => void } | null>(null);
  const [fallbackModal, setFallbackModal] = useState({ isOpen: false, text: '' });
  const [copyLinkText, setCopyLinkText] = useState('📋 Copy Quote Link');

  const [toast, setToast] = useState<{ isVisible: boolean; message: string; variant: 'success' | 'error' | 'info' }>({
    isVisible: false,
    message: '',
    variant: 'success'
  });

  useEffect(() => {
    const dataParam = searchParams.get('quote');
    
    if (dataParam) {
      // Client View
      const decoded = decodeQuotation(dataParam);
      if (decoded) {
        setQuotation(decoded);
        setIsSenderView(false);
      } else {
        setErrorState('decode_error');
      }
    } else if (id) {
      // Sender View
      const localQuotation = getQuotationById(id);
      if (localQuotation) {
        // Inject signature for sender view
        const quotationWithSignature = {
          ...localQuotation,
          business_snapshot: {
            ...localQuotation.business_snapshot
          }
        };
        const businessStr = localStorage.getItem('invoiceflow_business');
        if (businessStr) {
          try {
            const business = JSON.parse(businessStr);
            if (business.signature) {
              quotationWithSignature.business_snapshot.signature = business.signature;
            }
          } catch (e) {}
        }
        
        setQuotation(quotationWithSignature);
        setIsSenderView(true);
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
          title="Quotation not found"
          description="The quotation you are looking for does not exist or has been deleted."
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
          title="This quotation link appears to be broken"
          description="The quotation link appears to be broken or malformed."
          action={<Button onClick={() => navigate('/app')}>Back to Dashboard</Button>}
        />
      </div>
    );
  }

  if (!quotation) return null;

  const handleMarkAccepted = () => {
    if (id) {
      updateQuotationStatus(id, 'accepted');
      setQuotation(prev => prev ? { ...prev, status: 'accepted', accepted_at: new Date().toISOString() } : null);
      setShowAcceptedModal(false);
      setToast({ isVisible: true, message: `✅ Quotation marked as accepted by ${quotation.client_name}`, variant: 'success' });
      setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
    }
  };

  const handleMarkDeclined = () => {
    if (id) {
      updateQuotationStatus(id, 'declined');
      setQuotation(prev => prev ? { ...prev, status: 'declined', declined_at: new Date().toISOString() } : null);
      setShowDeclinedModal(false);
      setToast({ isVisible: true, message: `Quotation marked as declined`, variant: 'info' });
      setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000);
    }
  };

  const handleConvertToInvoice = () => {
    if (id) {
      const newInvoiceId = convertQuotationToInvoice(id);
      if (newInvoiceId) {
        setShowConvertModal(false);
        setToast({ isVisible: true, message: `✓ Invoice created from ${quotation.quote_number}`, variant: 'success' });
        setTimeout(() => {
          navigate(`/app/invoice/${newInvoiceId}`);
        }, 1500);
      }
    }
  };

  const handleDelete = () => {
    if (id) {
      deleteQuotation(id);
      setShowDeleteModal(false);
      navigate('/app');
    }
  };

  const getShareLinkAsync = async () => {
    const encoded = await encodeQuotation(quotation);
    return `${window.location.origin}/?quote=${encoded}`;
  };

  const handleDownloadPDF = async () => {
    if (!quotation || !quotationRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const filename = `Quotation_${quotation.quote_number}_${quotation.client_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      await generatePDF(quotationRef.current, filename);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyLink = async () => {
    const link = await getShareLinkAsync();
    navigator.clipboard.writeText(link);
    setCopyLinkText('✓ Link Copied!');
    setTimeout(() => setCopyLinkText('📋 Copy Quote Link'), 2000);
  };

  const validateBeforeSend = () => {
    if (!quotation.client_phone) {
      setValidationError({
        message: 'No phone number saved for this client. Edit the quotation to add one.',
        actionLabel: 'Edit Quotation',
        actionFn: () => navigate(`/app/quotation/${quotation.id}/edit`)
      });
      return false;
    }
    
    if (!quotation.items || quotation.items.length === 0 || quotation.total_amount === 0) {
      setValidationError({
        message: 'This quotation has no items or a zero total.',
      });
      return false;
    }

    setValidationError(null);
    return true;
  };

  const totalFormatted = (quotation.total_amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const validUntilFormatted = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(quotation.valid_until));

  const getSendQuotationMessageAsync = async () => {
    const link = await getShareLinkAsync();
    return `Hi ${quotation.client_name},

Please find your project quotation below.

📋 Quote: ${quotation.quote_number}
🏗 Project: ${quotation.project_title}
💰 Estimated Value: ₦${totalFormatted}
📅 Valid Until: ${validUntilFormatted}

View full quotation here:
${link}

To proceed, simply reply 'ACCEPTED' or let me know if you have any questions.

Payment Terms: ${quotation.terms || 'To be discussed'}

Thank you.
— ${quotation.business_snapshot.business_name}`;
  };

  const getReminderMessageAsync = async () => {
    const link = await getShareLinkAsync();
    return `Hi ${quotation.client_name},

Just a quick follow-up on the quotation I sent for:

🏗 ${quotation.project_title}
💰 ₦${totalFormatted}
📅 Valid Until: ${validUntilFormatted}

Have you had a chance to review it?
I'd love to move forward when you're ready.

View quotation: ${link}

— ${quotation.business_snapshot.business_name}`;
  };

  const handleSendWhatsApp = async () => {
    if (!validateBeforeSend()) return;
    
    setIsSending(true);
    try {
      const message = await getSendQuotationMessageAsync();
      const encodedMessage = encodeURIComponent(message);
      const phone = cleanPhoneForWhatsApp(quotation.client_phone);
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const whatsappUrl = isMobile 
        ? `whatsapp://send?phone=${phone}&text=${encodedMessage}`
        : `https://wa.me/${phone}?text=${encodedMessage}`;

      if (id && quotation.status === 'draft') {
        updateQuotationStatus(id, 'sent');
        setQuotation(prev => prev ? { ...prev, status: 'sent', sent_at: new Date().toISOString() } : null);
      }

      window.open(whatsappUrl, '_blank');
    } catch (error) {
      const message = await getSendQuotationMessageAsync();
      setFallbackModal({ isOpen: true, text: message });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendReminder = async () => {
    if (!validateBeforeSend()) return;
    
    setIsSending(true);
    try {
      const message = await getReminderMessageAsync();
      const encodedMessage = encodeURIComponent(message);
      const phone = cleanPhoneForWhatsApp(quotation.client_phone);
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const whatsappUrl = isMobile 
        ? `whatsapp://send?phone=${phone}&text=${encodedMessage}`
        : `https://wa.me/${phone}?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');
    } catch (error) {
      const message = await getReminderMessageAsync();
      setFallbackModal({ isOpen: true, text: message });
    } finally {
      setIsSending(false);
    }
  };

  const isExpired = new Date() > new Date(quotation.valid_until);
  const daysUntilExpiry = Math.ceil((new Date(quotation.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-bg pb-24">
      {toast.isVisible && (
        <Toast 
          message={toast.message} 
          variant={toast.variant} 
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSenderView && (
              <button onClick={() => navigate('/app')} className="p-2 -ml-2 text-text-secondary hover:text-text rounded-full hover:bg-bg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="font-bold text-text flex items-center gap-2">
                {quotation.quote_number}
                <Badge variant={
                  quotation.status === 'accepted' ? 'success' :
                  quotation.status === 'declined' ? 'danger' :
                  quotation.status === 'expired' ? 'warning' :
                  quotation.status === 'sent' ? 'info' : 'neutral'
                }>
                  {quotation.status}
                </Badge>
              </h1>
              {isSenderView && <p className="text-xs text-text-secondary">{quotation.client_name}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="p-2 text-text-secondary hover:text-text rounded-full hover:bg-bg transition-colors disabled:opacity-50"
              title="Download PDF"
            >
              {isGeneratingPDF ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Client View Banner */}
      {!isSenderView && (
        <div className="max-w-3xl mx-auto px-4 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-full text-green-600 shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">
                This is a quotation from {quotation.business_snapshot.business_name} for: {quotation.project_title}
              </h3>
              {isExpired ? (
                <p className="text-sm text-red-600 mt-1 font-medium">
                  This quotation has expired. Please contact {quotation.business_snapshot.business_name} for an updated quote.
                </p>
              ) : (
                <p className="text-sm text-green-700 mt-1">
                  Valid for {daysUntilExpiry} more days
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sender View Converted Banner */}
      {isSenderView && quotation.converted_to_invoice_id && (
        <div className="max-w-3xl mx-auto px-4 mt-6">
          <div 
            className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-green-100 transition-colors"
            onClick={() => navigate(`/app/invoice/${quotation.converted_to_invoice_id}`)}
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Converted to Invoice</h3>
                <p className="text-sm text-green-700">This quotation was accepted and converted.</p>
              </div>
            </div>
            <ArrowLeft className="w-5 h-5 text-green-600 rotate-180" />
          </div>
        </div>
      )}

      {/* Template Preview */}
      <div className="max-w-3xl mx-auto px-4 mt-6">
        <div ref={quotationRef} className="bg-white rounded-xl shadow-sm overflow-hidden border border-border">
          <TemplatePreview invoice={quotation as any} templateId={quotation.template} />
        </div>
      </div>

      {/* Sender Actions */}
      {isSenderView && !quotation.converted_to_invoice_id && (
        <div className="max-w-3xl mx-auto px-4 mt-8 space-y-4">
          <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider px-1">Actions</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(quotation.status === 'draft' || quotation.status === 'sent') && (
              <Button 
                onClick={handleSendWhatsApp} 
                className="w-full justify-center py-3.5 text-base shadow-sm"
                disabled={isSending}
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                Send via WhatsApp
              </Button>
            )}

            {(quotation.status === 'sent' || quotation.status === 'expired') && (
              <Button 
                onClick={() => setShowAcceptedModal(true)} 
                variant="primary"
                className="w-full justify-center py-3.5 text-base shadow-sm bg-green-600 hover:bg-green-700 border-green-600"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Mark as Accepted
              </Button>
            )}

            {quotation.status === 'accepted' && (
              <Button 
                onClick={() => setShowConvertModal(true)} 
                variant="primary"
                className="w-full justify-center py-3.5 text-base shadow-sm bg-green-600 hover:bg-green-700 border-green-600 sm:col-span-2"
              >
                <Zap className="w-5 h-5 mr-2" />
                Convert to Invoice →
              </Button>
            )}

            {quotation.status === 'sent' && (
              <Button 
                onClick={handleSendReminder} 
                variant="outline"
                className="w-full justify-center py-3.5 shadow-sm"
                disabled={isSending}
              >
                {isSending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Bell className="w-5 h-5 mr-2" />}
                Send Reminder
              </Button>
            )}

            {quotation.status === 'sent' && (
              <Button 
                onClick={() => setShowDeclinedModal(true)} 
                variant="outline"
                className="w-full justify-center py-3.5 shadow-sm text-red-600 border-red-200 hover:bg-red-50"
              >
                Mark as Declined
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
              onClick={handleCopyLink} 
              variant="outline"
              className="w-full justify-center bg-white"
            >
              {copyLinkText}
            </Button>
            
            {(quotation.status === 'draft' || quotation.status === 'sent' || quotation.status === 'declined') && (
              <Button 
                onClick={() => navigate(`/app/quotation/${quotation.id}/edit`)} 
                variant="outline"
                className="w-full justify-center bg-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Quote
              </Button>
            )}
          </div>

          <div className="pt-6 pb-8 flex justify-center">
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="text-danger hover:text-red-700 text-sm font-medium flex items-center transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Quotation
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={showAcceptedModal} onClose={() => setShowAcceptedModal(false)} title="Mark as Accepted">
        <div className="p-6">
          <p className="text-text mb-6">
            Mark this quotation as accepted by <span className="font-semibold">{quotation.client_name}</span>?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowAcceptedModal(false)}>Cancel</Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700 border-green-600" onClick={handleMarkAccepted}>Mark as Accepted</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeclinedModal} onClose={() => setShowDeclinedModal(false)} title="Mark as Declined">
        <div className="p-6">
          <p className="text-text mb-6">
            Mark this quotation as declined by <span className="font-semibold">{quotation.client_name}</span>?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeclinedModal(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleMarkDeclined}>Mark as Declined</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showConvertModal} onClose={() => setShowConvertModal(false)} title="Create Invoice from Quote">
        <div className="p-6">
          <div className="bg-bg rounded-lg p-4 mb-6 border border-border">
            <h4 className="font-semibold text-text mb-3">New Invoice Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Client:</span> <span className="font-medium">{quotation.client_name}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Project:</span> <span className="font-medium">{quotation.project_title}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Amount:</span> <span className="font-medium">₦{totalFormatted}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Due Date:</span> <span className="font-medium">7 days from today</span></div>
            </div>
          </div>
          <p className="text-sm text-text-secondary mb-6">
            A new invoice will be created with all the same details. You can edit it before sending.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowConvertModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleConvertToInvoice}>Create Invoice →</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Quotation">
        <div className="p-6">
          <p className="text-text mb-6">
            Are you sure you want to delete this quotation? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!validationError} onClose={() => setValidationError(null)} title="Missing Information">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
            <p className="text-text">{validationError?.message}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setValidationError(null)}>Cancel</Button>
            {validationError?.actionLabel && (
              <Button className="flex-1" onClick={() => {
                setValidationError(null);
                validationError.actionFn?.();
              }}>
                {validationError.actionLabel}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={fallbackModal.isOpen} onClose={() => setFallbackModal({ isOpen: false, text: '' })} title="WhatsApp Unavailable">
        <div className="p-6">
          <p className="text-text mb-4">
            We couldn't open WhatsApp automatically. You can copy the message below and paste it into WhatsApp manually.
          </p>
          <div className="bg-bg p-4 rounded-lg text-sm whitespace-pre-wrap font-mono text-text-secondary mb-6 border border-border max-h-60 overflow-y-auto">
            {fallbackModal.text}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setFallbackModal({ isOpen: false, text: '' })}>Close</Button>
            <Button className="flex-1" onClick={() => {
              navigator.clipboard.writeText(fallbackModal.text);
              setToast({ isVisible: true, message: 'Message copied to clipboard', variant: 'success' });
              setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 2000);
            }}>
              Copy Message
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
