import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useBlocker, useBeforeUnload } from 'react-router-dom';
import { Button, Input, Textarea, Card } from './ui';
import { Plus, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { generateId } from '../utils/generateId';
import { encodeInvoice } from '../utils/encodeInvoice';
import { useBusinessStore } from '../store/businessStore';
import { createInvoice, updateInvoice, getInvoiceById, Invoice } from '../store/invoiceStore';

interface InvoiceFormProps {
  initialData?: Invoice;
  isReadOnly?: boolean;
}

export default function InvoiceForm({ initialData, isReadOnly = false }: InvoiceFormProps) {
  const navigate = useNavigate();
  const { state: businessState } = useBusinessStore();
  
  const [invoiceId, setInvoiceId] = useState<string | undefined>(initialData?.id);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const [formData, setFormData] = useState({
    client_name: initialData?.client_name || '',
    client_phone: initialData?.client_phone || '',
    template: initialData?.template || localStorage.getItem('invoiceflow_default_template') || 'corporate',
    items: initialData?.items.length ? initialData.items.map(i => ({
      id: i.id,
      description: i.description,
      quantity: i.quantity.toString(),
      unit_price_ngn: (i.unit_price / 100).toString()
    })) : [{ id: generateId('ITM'), description: '', quantity: '1', unit_price_ngn: '' }],
    tax_rate: initialData?.tax_rate !== undefined ? (initialData.tax_rate * 100).toString() : '0',
    due_date: initialData?.due_date ? initialData.due_date.split('T')[0] : '',
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
    if (!formData.client_name.trim()) newErrors.client_name = 'Required';
    
    const phoneRegex = /^\+234\d{10}$/;
    const formattedPhone = formatPhoneNumber(formData.client_phone);
    if (!formattedPhone) newErrors.client_phone = 'Required';
    else if (!phoneRegex.test(formattedPhone)) newErrors.client_phone = 'Must be +234XXXXXXXXXX';

    if (!formData.due_date) newErrors.due_date = 'Required';
    else {
      // Allow today or future
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.due_date = 'Cannot be in the past';
      }
    }

    const itemsErrors: any[] = [];
    let hasItemError = false;
    formData.items.forEach((item, index) => {
      const itemErr: any = {};
      if (!item.description.trim()) itemErr.description = 'Required';
      if (!item.quantity || Number(item.quantity) < 1) itemErr.quantity = 'Min 1';
      if (!item.unit_price_ngn || Number(item.unit_price_ngn) < 0) itemErr.unit_price_ngn = 'Required';
      itemsErrors[index] = itemErr;
      if (Object.keys(itemErr).length > 0) hasItemError = true;
    });

    if (hasItemError) newErrors.items = itemsErrors;
    if (formData.items.length === 0) newErrors.general = 'At least 1 item required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildInvoiceData = (): Partial<Invoice> => {
    return {
      business_snapshot: businessState.profile!,
      client_name: formData.client_name,
      client_phone: formatPhoneNumber(formData.client_phone),
      template: formData.template,
      items: formData.items.map(i => ({
        id: i.id,
        description: i.description,
        quantity: Number(i.quantity) || 0,
        unit_price: Math.round((Number(i.unit_price_ngn) || 0) * 100)
      })),
      tax_rate: (Number(formData.tax_rate) || 0) / 100,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : new Date().toISOString(),
      notes: formData.notes,
      status: initialData?.status || 'draft'
    };
  };

  const handleSaveDraft = async (isAuto = false) => {
    if (isReadOnly) return;
    if (!isAuto) setIsSaving(true);
    
    try {
      const data = buildInvoiceData();
      if (invoiceId) {
        updateInvoice(invoiceId, data);
      } else {
        const newInv = createInvoice(data);
        setInvoiceId(newInv.id);
        window.history.replaceState(null, '', `/edit/${newInv.id}`);
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
      const data = buildInvoiceData();
      let savedId = invoiceId;
      if (invoiceId) {
        updateInvoice(invoiceId, data);
      } else {
        const newInv = createInvoice(data);
        savedId = newInv.id;
        setInvoiceId(savedId);
      }
      setIsDirty(false);
      
      const fullInvoice = getInvoiceById(savedId!);
      if (fullInvoice) {
        navigate(`/invoice/${savedId}`);
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
          {isReadOnly ? 'View Invoice' : invoiceId ? 'Edit Invoice' : 'Create Invoice'}
        </h1>
      </div>

      {isReadOnly && (
        <div className="mb-6 p-4 bg-info/10 text-info rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          This invoice has been paid and cannot be edited.
        </div>
      )}

      {errors.general && (
        <div className="mb-6 p-4 bg-danger/10 text-danger rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {errors.general}
        </div>
      )}

      <Card className="space-y-8">
        {/* Client Details */}
        <section>
          <h2 className="text-h3 mb-4 text-neutral-800 dark:text-neutral-50">Client Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Client Name" 
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

        {/* Items */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-h3 text-neutral-800 dark:text-neutral-50">Items</h2>
          </div>
          
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-4 p-4 border border-neutral-200 dark:border-border rounded-md relative bg-neutral-50 dark:bg-neutral-900/50">
                <div className="flex-1">
                  <Input 
                    label="Description" 
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    error={errors.items?.[index]?.description}
                    disabled={isReadOnly}
                  />
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

        {/* Invoice Details */}
        <section>
          <h2 className="text-h3 mb-4 text-neutral-800 dark:text-neutral-50">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Due Date" 
              type="date" 
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              error={errors.due_date}
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
          <div className="mt-4">
            <Textarea 
              label="Notes (Optional)" 
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isReadOnly}
              placeholder="Thank you for your business!"
            />
          </div>
        </section>

        {/* Template Selection */}
        <section>
          <h2 className="text-h3 mb-4 text-neutral-800 dark:text-neutral-50">Template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'corporate', name: 'Corporate', desc: 'Clean and professional' },
              { id: 'modern', name: 'Modern', desc: 'Dark theme, emerald accents' },
              { id: 'tech', name: 'Tech', desc: 'Dark mode, code-inspired' },
              { id: 'classic', name: 'Classic', desc: 'Elegant serif typography' }
            ].map(tpl => (
              <div 
                key={tpl.id}
                onClick={() => !isReadOnly && setFormData(prev => ({ ...prev, template: tpl.id }))}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.template === tpl.id 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-border bg-surface hover:border-primary-300'
                } ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <div className="font-bold text-neutral-900 dark:text-neutral-50 mb-1">{tpl.name}</div>
                <div className="text-xs text-neutral-500">{tpl.desc}</div>
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
            Review Invoice
          </Button>
        </div>
      )}
    </div>
  );
}
