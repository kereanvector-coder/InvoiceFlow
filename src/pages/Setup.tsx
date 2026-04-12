import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessStore, BusinessProfile } from '../store/businessStore';
import { Button, Input, Card } from '../components/ui';
import { Upload, Image as ImageIcon, Moon, Sun, Download, Trash2, ChevronDown } from 'lucide-react';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { getInvoices } from '../store/invoiceStore';
import TemplateThumbnail from '../components/TemplateThumbnail';

export default function Setup() {
  const navigate = useNavigate();
  const { state, saveProfile } = useBusinessStore();
  
  const [formData, setFormData] = useState<BusinessProfile>({
    business_name: '',
    owner_name: '',
    phone_number: '',
    bank_name: '',
    account_number: '',
    account_name: '',
    business_logo: ''
  });

  const [darkMode, setDarkMode] = useState(false);
  const [defaultTax, setDefaultTax] = useState('0');
  const [reminderCooldown, setReminderCooldown] = useState('24');
  const [defaultTemplate, setDefaultTemplate] = useState('corporate');
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');

  const [errors, setErrors] = useState<Partial<Record<keyof BusinessProfile, string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.profile) {
      setFormData(state.profile);
    }
    
    // Load preferences
    setDarkMode(safeGetItem('invoiceflow_dark_mode') === 'true');
    setDefaultTax(safeGetItem('invoiceflow_default_tax') || '0');
    setReminderCooldown(safeGetItem('invoiceflow_reminder_cooldown') || '24');
    setDefaultTemplate(safeGetItem('invoiceflow_default_template') || 'corporate');
  }, [state.profile]);

  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '+234' + cleaned.substring(1);
    } else if (cleaned.startsWith('234')) {
      cleaned = '+' + cleaned;
    }
    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof BusinessProfile]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, phone_number: value }));
    if (errors.phone_number) {
      setErrors(prev => ({ ...prev, phone_number: undefined }));
    }
  };

  const handlePhoneBlur = () => {
    setFormData(prev => ({ ...prev, phone_number: formatPhoneNumber(prev.phone_number) }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, business_logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signature: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof BusinessProfile, string>> = {};
    if (!formData.business_name.trim()) newErrors.business_name = 'Business name is required';
    if (!formData.owner_name.trim()) newErrors.owner_name = 'Owner name is required';
    
    const phoneRegex = /^\+234\d{10}$/;
    const formattedPhone = formatPhoneNumber(formData.phone_number);
    if (!formattedPhone) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!phoneRegex.test(formattedPhone)) {
      newErrors.phone_number = 'Must be a valid Nigerian number (e.g. +2348012345678)';
    }

    if (!formData.bank_name.trim()) newErrors.bank_name = 'Bank name is required';
    if (!formData.account_number.trim()) newErrors.account_number = 'Account number is required';
    else if (!/^\d{10}$/.test(formData.account_number)) newErrors.account_number = 'Must be 10 digits';
    
    if (!formData.account_name.trim()) newErrors.account_name = 'Account name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleExportData = () => {
    const invoices = getInvoices();
    const dataStr = JSON.stringify({ profile: formData, invoices }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoiceflow_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (clearConfirmText === 'DELETE') {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData = { ...formData, phone_number: formatPhoneNumber(formData.phone_number) };
    setFormData(finalData);

    if (validate()) {
      saveProfile(finalData);
      
      // Save preferences
      safeSetItem('invoiceflow_dark_mode', darkMode.toString());
      safeSetItem('invoiceflow_default_tax', defaultTax);
      safeSetItem('invoiceflow_reminder_cooldown', reminderCooldown);
      safeSetItem('invoiceflow_default_template', defaultTemplate);
      
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: "Settings saved successfully", variant: "success" } 
      }));
      
      navigate('/app');
    }
  };

  if (!state.isLoaded) return null;

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="bg-white dark:bg-neutral-900 border-b border-border px-4 py-4 sticky top-0 z-30 flex items-center justify-between" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top))' }}>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">Settings</h1>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
          
          {/* Business Identity */}
          <section>
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3 px-1">Business Identity</h2>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-border overflow-hidden divide-y divide-border">
              <div className="p-4 flex flex-col items-center sm:flex-row sm:items-start gap-4">
                <div 
                  className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.business_logo ? (
                    <img src={formData.business_logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-50 mb-1">Business Logo</h3>
                  <p className="text-xs text-neutral-500 mb-2">Optional. Recommended size: 256x256px.</p>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-primary-600 font-medium">Upload Logo</button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </div>
              </div>
              <div className="p-4 flex flex-col items-center sm:flex-row sm:items-start gap-4">
                <div 
                  className="w-32 h-16 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0"
                  onClick={() => signatureInputRef.current?.click()}
                >
                  {formData.signature ? (
                    <img src={formData.signature} alt="Signature" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-xs text-neutral-400 font-medium">No Signature</span>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-sm font-medium text-neutral-800 dark:text-neutral-50 mb-1">Digital Signature</h3>
                  <p className="text-xs text-neutral-500 mb-2">Optional. Will be appended to your invoices.</p>
                  <div className="flex items-center justify-center sm:justify-start gap-3">
                    <button type="button" onClick={() => signatureInputRef.current?.click()} className="text-sm text-primary-600 font-medium">Upload Signature</button>
                    {formData.signature && (
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, signature: undefined }))} className="text-sm text-danger font-medium">Remove</button>
                    )}
                  </div>
                  <input type="file" ref={signatureInputRef} className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                </div>
              </div>
              <div className="p-4 space-y-4">
                <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleChange} error={errors.business_name} placeholder="e.g. Acme Corp" />
                <Input label="Owner Name" name="owner_name" value={formData.owner_name} onChange={handleChange} error={errors.owner_name} placeholder="e.g. Jane Doe" />
                <Input label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handlePhoneChange} onBlur={handlePhoneBlur} error={errors.phone_number} placeholder="+234 800 000 0000" />
              </div>
            </div>
          </section>

          {/* Payment Details */}
          <section>
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3 px-1">Payment Details</h2>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-border overflow-hidden p-4 space-y-4">
              <Input label="Bank Name" name="bank_name" value={formData.bank_name} onChange={handleChange} error={errors.bank_name} placeholder="e.g. Guaranty Trust Bank" />
              <Input label="Account Number" name="account_number" value={formData.account_number} onChange={handleChange} error={errors.account_number} placeholder="10-digit account number" maxLength={10} />
              <Input label="Account Name" name="account_name" value={formData.account_name} onChange={handleChange} error={errors.account_name} placeholder="e.g. Acme Corp" />
            </div>
          </section>

          {/* App Preferences */}
          <section>
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3 px-1">App Preferences</h2>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-border overflow-hidden divide-y divide-border">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Dark Mode</p>
                  <p className="text-xs text-neutral-500">Toggle dark theme</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Default Tax Rate (%)</p>
                  <p className="text-xs text-neutral-500">Applied to new invoices</p>
                </div>
                <input 
                  type="number" 
                  value={defaultTax}
                  onChange={(e) => setDefaultTax(e.target.value)}
                  className="w-20 px-3 py-1.5 text-right border border-border rounded-lg bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50"
                />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Reminder Cooldown</p>
                  <p className="text-xs text-neutral-500">Wait time between reminders</p>
                </div>
                <div className="relative">
                  <select 
                    value={reminderCooldown}
                    onChange={(e) => setReminderCooldown(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 border border-border rounded-lg bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-medium"
                  >
                    <option value="12">12 hours</option>
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div className="p-4">
                <div className="mb-3">
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Default Template</p>
                  <p className="text-xs text-neutral-500">For new invoices</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'corporate', name: 'Corporate' },
                    { id: 'modern', name: 'Modern' },
                    { id: 'tech', name: 'Tech' },
                    { id: 'classic', name: 'Classic' }
                  ].map(tpl => (
                    <div 
                      key={tpl.id}
                      onClick={() => setDefaultTemplate(tpl.id)}
                      className={`p-2 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${
                        defaultTemplate === tpl.id 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                          : 'border-border bg-surface hover:border-primary-300'
                      }`}
                    >
                      <TemplateThumbnail templateId={tpl.id} />
                      <div className="font-bold text-sm text-neutral-900 dark:text-neutral-50">{tpl.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section>
            <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3 px-1">Data Management</h2>
            <div className="bg-white dark:bg-neutral-900 rounded-xl border border-border overflow-hidden divide-y divide-border">
              <button type="button" onClick={handleExportData} className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Export Invoices</p>
                  <p className="text-xs text-neutral-500">Download all invoices and settings</p>
                </div>
                <Download className="w-5 h-5 text-neutral-400" />
              </button>
              <button type="button" onClick={() => {
                const expensesStr = localStorage.getItem('invoiceflow_expenses');
                if (!expensesStr) {
                  window.dispatchEvent(new CustomEvent('app-toast', { 
                    detail: { message: "No expenses to export", variant: "info" } 
                  }));
                  return;
                }
                const expenses = JSON.parse(expensesStr);
                if (expenses.length === 0) {
                  window.dispatchEvent(new CustomEvent('app-toast', { 
                    detail: { message: "No expenses to export", variant: "info" } 
                  }));
                  return;
                }
                
                // Create CSV
                const headers = ['Date', 'Category', 'Description', 'Vendor', 'Amount (NGN)', 'Notes'];
                const csvRows = [headers.join(',')];
                
                expenses.forEach((exp: any) => {
                  if (exp.is_deleted) return;
                  const row = [
                    exp.date,
                    exp.category,
                    `"${exp.description.replace(/"/g, '""')}"`,
                    `"${(exp.vendor || '').replace(/"/g, '""')}"`,
                    exp.amount,
                    `"${(exp.notes || '').replace(/"/g, '""')}"`
                  ];
                  csvRows.push(row.join(','));
                });
                
                const csvString = csvRows.join('\n');
                const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `invoiceflow_expenses_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }} className="w-full p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Export Expenses</p>
                  <p className="text-xs text-neutral-500">Download expenses as CSV</p>
                </div>
                <Download className="w-5 h-5 text-neutral-400" />
              </button>
              <button type="button" onClick={() => setShowClearConfirm(true)} className="w-full p-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                <div>
                  <p className="font-medium text-danger">Clear All Data</p>
                  <p className="text-xs text-danger/80">Permanently delete everything</p>
                </div>
                <Trash2 className="w-5 h-5 text-danger" />
              </button>
            </div>
          </section>

          {/* About */}
          <section className="text-center py-4">
            <p className="font-bold text-neutral-800 dark:text-neutral-200">InvoiceFlow</p>
            <p className="text-xs text-neutral-500">Version 1.0.0 • Get paid faster</p>
          </section>
        </form>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-surface border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <div className="max-w-xl mx-auto">
          <Button type="submit" form="settings-form" className="w-full" size="lg">
            Save Settings
          </Button>
        </div>
      </div>

      {/* Clear Data Confirmation Bottom Sheet */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up relative">
            <div className="w-full flex justify-center absolute top-3 left-0 right-0 sm:hidden">
              <div style={{ width: '36px', height: '4px', borderRadius: '999px', background: '#E5E7EB', margin: '0 auto 16px' }} />
            </div>
            <h3 className="text-xl font-bold text-danger mb-2 mt-2">Clear All Data?</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              This action cannot be undone. All your invoices, settings, and business profile will be permanently deleted from this device.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Type <span className="font-bold text-danger">DELETE</span> to confirm
              </label>
              <input 
                type="text" 
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 focus:ring-2 focus:ring-danger focus:border-danger outline-none"
                placeholder="DELETE"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => { setShowClearConfirm(false); setClearConfirmText(''); }}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="flex-1 bg-danger hover:bg-red-700 text-white border-transparent disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleClearData}
                disabled={clearConfirmText !== 'DELETE'}
              >
                Delete Everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
