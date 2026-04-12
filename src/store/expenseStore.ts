import { safeGetItem, safeSetItem } from '../utils/storage';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  vendor?: string;
  date: string;
  created_at: string;
  receipt?: string | null;
  notes?: string;
  is_deleted: boolean;
}

export const EXPENSE_CATEGORIES = [
  { id: 'transport', label: 'Transport', emoji: '🚗', color: '#3B82F6' },
  { id: 'food', label: 'Food & Meals', emoji: '🍽', color: '#F59E0B' },
  { id: 'tools', label: 'Tools & Equipment', emoji: '🛠', color: '#6B7280' },
  { id: 'software', label: 'Software & Subscriptions', emoji: '💻', color: '#8B5CF6' },
  { id: 'marketing', label: 'Marketing & Ads', emoji: '📣', color: '#EC4899' },
  { id: 'data', label: 'Data & Airtime', emoji: '📱', color: '#06B6D4' },
  { id: 'rent', label: 'Rent & Space', emoji: '🏠', color: '#84CC16' },
  { id: 'salary', label: 'Staff & Salaries', emoji: '👥', color: '#F97316' },
  { id: 'utilities', label: 'Utilities & Bills', emoji: '💡', color: '#EAB308' },
  { id: 'materials', label: 'Materials & Supplies', emoji: '📦', color: '#14B8A6' },
  { id: 'professional', label: 'Professional Services', emoji: '🤝', color: '#6366F1' },
  { id: 'other', label: 'Other', emoji: '📝', color: '#9CA3AF' },
];

const STORAGE_KEY = 'invoiceflow_expenses';

let expenseCache: Expense[] | null = null;
let cacheTimestamp: number | null = null;

export const invalidateExpenseCache = () => {
  expenseCache = null;
  cacheTimestamp = null;
};

const readExpenses = (): Expense[] => {
  try {
    const data = safeGetItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];
    
    return parsed;
  } catch (error) {
    console.error('Failed to read expenses', error);
    return [];
  }
};

const writeExpenses = (expenses: Expense[]) => {
  safeSetItem(STORAGE_KEY, JSON.stringify(expenses));
  invalidateExpenseCache();
};

export const getExpenses = (): Expense[] => {
  if (expenseCache && cacheTimestamp && (Date.now() - cacheTimestamp < 5000)) {
    return expenseCache;
  }

  try {
    const expenses = readExpenses();
    const activeExpenses = expenses
      .filter(exp => !exp.is_deleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    expenseCache = activeExpenses;
    cacheTimestamp = Date.now();
    return activeExpenses;
  } catch (error) {
    console.error('Failed to get expenses', error);
    return [];
  }
};

export const getExpenseById = (id: string): Expense | null => {
  const expenses = getExpenses();
  return expenses.find(exp => exp.id === id) || null;
};

export const createExpense = (data: Partial<Expense>): Expense => {
  try {
    const expenses = readExpenses();
    
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount: data.amount || 0,
      category: data.category || 'other',
      description: data.description || '',
      vendor: data.vendor || '',
      date: data.date || new Date().toISOString(),
      created_at: new Date().toISOString(),
      receipt: data.receipt || null,
      notes: data.notes || '',
      is_deleted: false,
    };

    expenses.push(newExpense);
    writeExpenses(expenses);
    return newExpense;
  } catch (error) {
    console.error('Failed to create expense', error);
    throw error;
  }
};

export const updateExpense = (id: string, updates: Partial<Expense>): Expense => {
  try {
    const expenses = readExpenses();
    const index = expenses.findIndex(exp => exp.id === id && !exp.is_deleted);
    
    if (index === -1) throw new Error('Expense not found');

    const updatedExpense = {
      ...expenses[index],
      ...updates,
    };

    expenses[index] = updatedExpense;
    writeExpenses(expenses);
    return updatedExpense;
  } catch (error) {
    console.error('Failed to update expense', error);
    throw error;
  }
};

export const deleteExpense = (id: string): void => {
  try {
    const expenses = readExpenses();
    const index = expenses.findIndex(exp => exp.id === id && !exp.is_deleted);
    
    if (index === -1) throw new Error('Expense not found');

    expenses[index].is_deleted = true;
    writeExpenses(expenses);
  } catch (error) {
    console.error('Failed to delete expense', error);
    throw error;
  }
};

export const getExpensesByMonth = (month: number, year: number): Expense[] => {
  const expenses = getExpenses();
  return expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });
};

export const getExpensesByCategory = (category: string): Expense[] => {
  const expenses = getExpenses();
  return expenses.filter(exp => exp.category === category);
};

export const getTotalExpenses = (month: number, year: number): number => {
  const expenses = getExpensesByMonth(month, year);
  return expenses.reduce((sum, exp) => sum + exp.amount, 0);
};
