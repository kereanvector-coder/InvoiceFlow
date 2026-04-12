import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { createExpense, updateExpense, getExpenseById, deleteExpense, EXPENSE_CATEGORIES } from '../store/expenseStore';

export default function LogExpenseScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode && id) {
      const expense = getExpenseById(id);
      if (expense) {
        setAmount((expense.amount / 100).toString()); // assuming amount is stored in kobo, wait, the prompt says "Amount (number input, required): Placeholder: "0.00", ₦ prefix visible". Let's store it in kobo like invoices to be consistent, or just raw Naira? Let's use kobo to be consistent with invoiceStore.
        setCategory(expense.category);
        setDescription(expense.description);
        setVendor(expense.vendor || '');
        setDate(expense.date.split('T')[0]);
        setNotes(expense.notes || '');
        setReceipt(expense.receipt || null);
      }
    }
  }, [id, isEditMode]);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setReceipt(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!category) newErrors.category = 'Category is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!date) newErrors.date = 'Date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const amountInKobo = Math.round(Number(amount) * 100);

    const expenseData = {
      amount: amountInKobo,
      category,
      description: description.trim(),
      vendor: vendor.trim(),
      date: new Date(date).toISOString(),
      notes: notes.trim(),
      receipt,
    };

    if (isEditMode && id) {
      updateExpense(id, expenseData);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Expense updated ✓', variant: 'success' } }));
    } else {
      createExpense(expenseData);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Expense logged ✓', variant: 'success' } }));
    }

    navigate(-1);
  };

  const handleDelete = () => {
    if (isEditMode && id) {
      if (window.confirm('Are you sure you want to delete this expense?')) {
        deleteExpense(id);
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Expense deleted', variant: 'success' } }));
        navigate(-1);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="flex items-center justify-between h-14 px-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-[16px] font-bold text-gray-900">{isEditMode ? 'Edit Expense' : 'Log Expense'}</h1>
          <div className="w-9"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-500 text-2xl font-bold">₦</span>
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`block w-full pl-10 pr-4 py-4 text-3xl font-bold text-gray-900 bg-white border rounded-xl focus:ring-2 focus:ring-[#059669] focus:border-transparent ${errors.amount ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
          {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-colors ${
                  category === cat.id
                    ? 'bg-[#059669] border-[#059669] text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl mb-1">{cat.emoji}</span>
                <span className="text-[11px] font-medium text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this for?"
            className={`block w-full px-4 py-3 text-gray-900 bg-white border rounded-xl focus:ring-2 focus:ring-[#059669] focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Vendor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor (Optional)</label>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="Who did you pay?"
            className="block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] focus:border-transparent"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">When did this happen?</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`block w-full px-4 py-3 text-gray-900 bg-white border rounded-xl focus:ring-2 focus:ring-[#059669] focus:border-transparent ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
        </div>

        {/* Receipt Photo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Photo (Optional)</label>
          {receipt ? (
            <div className="relative inline-block">
              <img src={receipt} alt="Receipt" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
              <button
                onClick={() => setReceipt(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-[#059669] hover:text-[#059669] cursor-pointer transition-colors"
            >
              <Camera className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Add Receipt Photo</span>
              <span className="text-xs mt-1">(optional)</span>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleReceiptUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional notes..."
            rows={3}
            className="block w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#059669] focus:border-transparent resize-none"
          />
        </div>
        
        {isEditMode && (
          <div className="pt-4">
            <button
              onClick={handleDelete}
              className="w-full py-3 text-red-600 font-bold text-[15px] bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
            >
              Delete Expense
            </button>
          </div>
        )}
      </div>

      {/* Sticky Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3 z-10 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3.5 text-gray-700 font-bold text-[15px] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3.5 text-white font-bold text-[15px] bg-[#059669] rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-[#047857] transition-colors"
        >
          {isEditMode ? 'Save Changes' : 'Save Expense'}
        </button>
      </div>
    </div>
  );
}
