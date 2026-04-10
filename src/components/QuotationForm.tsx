import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useBlocker, useBeforeUnload } from 'react-router-dom';
import { Button, Input, Textarea, Card } from './ui';
import { Plus, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { generateId } from '../utils/generateId';
import { encodeQuotation } from '../utils/encodeQuotation';
import { useBusinessStore } from '../store/businessStore';
import { createQuotation, updateQuotation, getQuotationById, Quotation } from '../store/quotationStore';
import TemplateThumbnail from './TemplateThumbnail';
import { DictationButton } from './ui/DictationButton';

interface QuotationFormProps {
  initialData?: Quotation;
  isReadOnly?: boolean;
}

export default function QuotationForm({ initialData, isReadOnly = false }: QuotationFormProps) {
  const navigate = useNavigate();
  const { state: businessState } = useBusinessStore();
  
  const [quotationId, setQuotationId] = useState<string | undefined>(initialData?.id);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    client_name: initialData?.client_name || '',
    client_phone: initialData?.client_phone || '',
    project_title: initialData?.project_title || '',
    project_description: initialData?.project_description || '',
    template: initialData?.template || localStorage.getItem('quotationflow_default_template') || 'corporate',
    items: initialData?.items.length ? initialData.items.map(i => ({
      id: i.id,
      description: i.description,
      quantity: i.quantity.toString(),
      unit_price_ngn: (i.unit_price / 100).toString()
    })) : [{ id: generateId('ITM'), description: '', quantity: '1', unit_price_ngn: '' }],
    tax_rate: initialData?.tax_rate !== undefined ? (initialData.tax_rate * 100).toString() : '0',
    valid_until: initialData?.valid_until ? initialData.valid_until.split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    terms: initialData?.terms || '',
    notes: initialData?.notes || ''
  });

  // Calculations
  const subtotal = formData.items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.unit_price_ngn) || 0) * 100), 0);
  const tax_amount = Math.round(subtotal * ((Number(formData.tax_rate) || 0) / 100));
  const total_amount = subtotal + tax_amount;

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '+234' + cleaned.substring(1);
    } else if (cleaned.startsWith('234')) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const handleDictation = (field: string, text: string) => {
    if (isReadOnly) return;
    setFormData(prev => ({ 
      ...prev, 
      [field]: prev[field as keyof typeof prev] ? `\${prev[field as keyof typeof prev]} \${text}` : text 
    }));
    setIsDirty(true);
    if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  const handlePhoneBlur = () => {
    if (isReadOnly) return;
    setFormData(prev => ({ ...prev, client_phone: formatPhoneNumber(prev.client_phone) }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    if (isReadOnly) return;
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
    setIsDirty(true);
    
    if (errors.items && errors.items[index] && errors.items[index][field]) {
      const newItemsErrors = [...errors.items];
      newItemsErrors[index] = { ...newItemsErrors[index], [field]: undefined };
      setErrors((prev: any) => ({ ...prev, items: newItemsErrors }));
    }
  };

  const addItem = () => {
    if (isReadOnly) return;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: generateId('ITM'), description: '', quantity: '1', unit_price_ngn: '' }]
    }));
    setIsDirty(true);
  };

  const removeItem = (index: number) => {
    if (isReadOnly) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.client_name) newErrors.client_name = 'Client name is required';
    if (!formData.project_title) newErrors.project_title = 'Project title is required';
    if (!formData.valid_until) newErrors.valid_until = 'Valid until date is required';
    
    const itemsErrors: any[] = [];
    let hasItemErrors = false;
    
    formData.items.forEach((item, index) => {
      const itemError: any = {};
      if (!item.description) { itemError.description = 'Required'; hasItemErrors = true; }
      if (!item.quantity || Number(item.quantity) <= 0) { itemError.quantity = 'Invalid'; hasItemErrors = true; }
      if (!item.unit_price_ngn || Number(item.unit_price_ngn) < 0) { itemError.unit_price_ngn = 'Invalid'; hasItemErrors = true; }
      itemsErrors[index] = itemError;
    });
    
    if (hasItemErrors) newErrors.items = itemsErrors;
    
    if (!businessState.profile?.business_name) {
      newErrors.general = 'Please complete your business profile in Settings first.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildQuotationData = () => {
    return {
      client_name: formData.client_name,
      client_phone: formData.client_phone,
      project_title: formData.project_title,
      project_description: formData.project_description,
      template: formData.template,
      business_snapshot: businessState.profile!,
      items: formData.items.map(i => ({
        id: i.id,
        description: i.description,
        quantity: Number(i.quantity) || 0,
        unit_price: Math.round((Number(i.unit_price_ngn) || 0) * 100)
      })),
      tax_rate: (Number(formData.tax_rate) || 0) / 100,
      valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : new Date().toISOString(),
      terms: formData.terms,
      notes: formData.notes,
      status: initialData?.status || 'draft' as const
    };
  };

  const handleSaveDraft = async (isAuto = false) => {
    if (isReadOnly) return;
    if (!isAuto) setIsSaving(true);
    
    try {
      const data = buildQuotationData();
      if (quotationId) {
        updateQuotation(quotationId, data);
      } else {
        const newInv = createQuotation(data);
        setQuotationId(newInv.id);
        window.history.replaceState(null, '', `/app/quotation/\${newInv.id}/edit`);
      }
      setIsDirty(false);
    } catch (err) {
      console.error(err);
    } finally {
      if (!isAuto) setIsSaving(false);
    }
  };

  const handleReview = () => {
    if (isReadOnly) return;
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      const data = buildQuotationData();
      let savedId = quotationId;
      if (quotationId) {
        updateQuotation(quotationId, data);
      } else {
        const newInv = createQuotation(data);
        savedId = newInv.id;
        setQuotationId(savedId);
      }
      setIsDirty(false);
      
      const fullQuotation = getQuotationById(savedId!);
      if (fullQuotation) {
        navigate(`/app/quotation/\${savedId}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced auto-save
  useEffect(() => {
    if (!isDirty || isReadOnly) return;
    
    const timer = setTimeout(() => {
      // Only auto-save if we have basic client info
      if (formData.client_name.trim()) {
        handleSaveDraft(true);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [formData, isDirty, isReadOnly]);

  // Unsaved changes protection
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        blocker.proceed();
      } else {
        blocker.reset();
      }
    }
  }, [blocker]);

  useBeforeUnload(
    useCallback(
      (event) => {
        if (isDirty) {
          event.preventDefault();
          event.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        }
      },
      [isDirty]
    )
  );

  return (
    <div className="max-w-3xl mx-auto pb-32">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/app')} className="mr-4">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-h2 text-neutral-900 dark:text-neutral-50">
          {isReadOnly ? 'View Quotation' : quotationId ? 'Edit Quotation' : 'Create Quotation'}
        </h1>
      </div>

      {isReadOnly && (
        <div className="mb-6 p-4 bg-info/10 text-info rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          This quotation has been accepted and cannot be edited.
        </div>
      )}

      {errors.general && (
        <div className="mb-6 p-4 bg-danger/10 text-danger rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {errors.general}
        </div>
      )}

      <Card className="space-y-8 p-5">
        {/* Client Details */}
        <section>
          <h2 className="text-h3 mb-4 text-neutral-800 dark:text-neutral-50">Client Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Client Name *" 
              name="client_name"
              value={formData.client_name}
              onChange={handleChange}
              error={errors.client_name}
              disabled={isReadOnly}
            />
            <Input 
              label="Client Phone" 
              name="client_phone"
              type="tel"
              value={formData.client_phone}
              onChange={handleChange}
              onBlur={handlePhoneBlur}
              error={errors.client_phone}
              disabled={isReadOnly}
              placeholder="+234 800 000 0000"
            />
          </div>
        </section>

        {/* Project Details */}
        <section>
          <h2 className="text-h3 mb-4 text-neutral-800 dark:text-neutral-50">Project Details</h2>
          <div className="space-y-4">
            <div className="relative">
              <Input 
                label="Project Title *" 
                name="project_title"
                value={formData.project_title}
                onChange={handleChange}
                error={errors.project_title}
                disabled={isReadOnly}
                style={{ paddingRight: '3rem' }}
              />
              {!isReadOnly && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <DictationButton onResult={(text) => handleDictation('project_title', text)} />
                </div>
              )}
            </div>
            <div className="relative">
              <Textarea 
                label="Project Description" 
                name="project_description"
                value={formData.project_description}
                onChange={handleChange}
                disabled={isReadOnly}
                style={{ paddingRight: '3rem' }}
              />
              {!isReadOnly && (
                <div className="absolute right-2 top-2">
                  <DictationButton onResult={(text) => handleDictation('project_description', text)} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Items */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-h3 text-neutral-800 dark:text-neutral-50">Items</h2>
          </div>
          
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-4 p-4 border border-neutral-200 dark:border-border rounded-md relative bg-neutral-50 dark:bg-neutral-900/50">
                <div className="flex-1 relative">
                  <Input 
                    label="Description" 
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    error={errors.items?.[index]?.description}
                    disabled={isReadOnly}
                    style={{ paddingRight: '3rem' }}
                  />
                  {!isReadOnly && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <DictationButton onResult={(text) => {
                        const newDesc = item.description ? `\${item.description} \${text}` : text;
                        updateItem(index, 'description', newDesc);
                      }} />
                    </div>
                  )}
                </div>
                <div className="w-full md:w-24">
                  <Input 
                    label="Qty" 
                    type="number" 
                    inputMode="numeric"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    error={errors.items?.[index]?.quantity}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="w-full md:w-32">
                  <Input 
                    label="Price (₦)" 
                    type="number" 
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={item.unit_price_ngn}
                    onChange={(e) => updateItem(index, 'unit_price_ngn', e.target.value)}
                    error={errors.items?.[index]?.unit_price_ngn}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="w-full md:w-32 flex flex-col justify-center pt-2 md:pt-0">
                  <span className="text-label text-neutral-400">Line Total</span>
                  <span className="text-body font-medium text-neutral-800 dark:text-neutral-50">
                    {formatCurrency((Number(item.quantity) || 0) * (Number(item.unit_price_ngn) || 0) * 100)}
                  </span>
                </div>
                {!isReadOnly && formData.items.length > 1 && (
                  <button 
                    onClick={() => removeItem(index)} 
                    className="absolute -top-3 -right-3 w-8 h-8 bg-surface border border-border rounded-full flex items-center justify-center text-danger hover:bg-danger/10 shadow-sm transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {!isReadOnly && (
            <Button variant="secondary" className="mt-4 w-full" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          )}
        </section>

        {/* Quotation Details */}
        <section>
          <h2 className="text-h3 mb-4 text-neutral-800 dark:text-neutral-50">Quote Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Valid Until *" 
              type="date" 
              name="valid_until"
              value={formData.valid_until}
              onChange={handleChange}
              error={errors.valid_until}
              disabled={isReadOnly}
            />
            <Input 
              label="Tax Rate (%)" 
              type="number" 
              inputMode="decimal"
              name="tax_rate"
              min="0"
              max="100"
              step="0.1"
              value={formData.tax_rate}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          </div>
          <div className="mt-4 space-y-4">
            <div className="relative">
              <Textarea 
                label="Payment Terms" 
                name="terms"
                value={formData.terms}
                onChange={handleChange}
                disabled={isReadOnly}
                placeholder="e.g. 50% upfront, 50% on delivery."
                style={{ paddingRight: '3rem' }}
              />
              {!isReadOnly && (
                <div className="absolute right-2 top-2">
                  <DictationButton onResult={(text) => handleDictation('terms', text)} />
                </div>
              )}
            </div>
            <div className="relative">
              <Textarea 
                label="Notes (Optional)" 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                disabled={isReadOnly}
                placeholder="Thank you for your business!"
                style={{ paddingRight: '3rem' }}
              />
              {!isReadOnly && (
                <div className="absolute right-2 top-2">
                  <DictationButton onResult={(text) => handleDictation('notes', text)} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Template Selection */}
        <section>
          <h2 className="text-h3 mb-4 text-neutral-800 dark:text-neutral-50">Template</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'corporate', name: 'Corporate', desc: 'Clean and professional' },
              { id: 'modern', name: 'Modern', desc: 'Dark theme, emerald accents' },
              { id: 'tech', name: 'Tech', desc: 'Dark mode, code-inspired' },
              { id: 'classic', name: 'Classic', desc: 'Elegant serif typography' },
              { id: 'creative', name: 'Creative', desc: 'Bold & vibrant' },
              { id: 'ecommerce', name: 'E-Commerce', desc: 'Clean receipt style' },
              { id: 'executive', name: 'Executive', desc: 'Luxury & prestigious' },
              { id: 'wellness', name: 'Wellness', desc: 'Calm & trustworthy' },
              { id: 'trades', name: 'Trades', desc: 'Structured & rugged' },
              { id: 'noir', name: 'Noir', desc: 'Elegant & editorial' },
              { id: 'education', name: 'Education', desc: 'Clear & professional' },
              { id: 'catering', name: 'Catering', desc: 'Warm & appetite-driven' }
            ].map(tpl => (
              <div 
                key={tpl.id}
                onClick={() => !isReadOnly && setFormData(prev => ({ ...prev, template: tpl.id }))}
                className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 \${
                  formData.template === tpl.id 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-border bg-surface hover:border-primary-300'
                } \${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <TemplateThumbnail templateId={tpl.id} />
                <div className="text-center sm:text-left flex-1">
                  <div className="font-bold text-neutral-900 dark:text-neutral-50 mb-1">{tpl.name}</div>
                  <div className="text-xs text-neutral-500">{tpl.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="border-t border-border pt-6">
          <div className="flex justify-between text-body mb-3">
            <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
            <span className="text-neutral-800 dark:text-neutral-50 font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-body mb-4">
            <span className="text-neutral-600 dark:text-neutral-400">Tax ({formData.tax_rate || 0}%)</span>
            <span className="text-neutral-800 dark:text-neutral-50 font-medium">{formatCurrency(tax_amount)}</span>
          </div>
          <div className="flex justify-between text-h2 mt-4 pt-4 border-t border-border">
            <span className="text-neutral-900 dark:text-neutral-50">Total</span>
            <span className="text-primary-500">{formatCurrency(total_amount)}</span>
          </div>
        </section>
      </Card>

      {/* Sticky Bottom Bar */}
      {!isReadOnly && (
        <div 
          className="fixed bottom-0 left-0 right-0 p-4 bg-surface border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40 flex justify-end gap-3 sm:gap-4" 
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <Button variant="secondary" onClick={() => handleSaveDraft(false)} isLoading={isSaving} className="flex-1 sm:flex-none">
            Save as Draft
          </Button>
          <Button onClick={handleReview} isLoading={isSaving} className="flex-1 sm:flex-none">
            Preview Quote
          </Button>
        </div>
      )}
    </div>
  );
}
